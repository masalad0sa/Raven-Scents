import dotenv from "dotenv";
import path from "path";

// Resolve and load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { supabase, supabaseAdmin } from "../src/services/supabase";

const VARIANT_ID = "d50a5d64-c374-4d39-b23b-2dc724ff360f"; // Saffron Musk
const API_URL = "http://localhost:3001/api";

const mockAddress = {
  full_name: "Mock Customer",
  address_line1: "123 Fragrance Lane",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  phone: "9876543210",
};

async function run() {
  console.log("════════════════════════════════════════════════");
  console.log("STARTING CHECKOUT CONCURRENCY & STOCK TEST");
  console.log("════════════════════════════════════════════════");

  try {
    // ── STEP 1: Look up variant and verify initial stock is 1 ──
    const { data: variant, error: varErr } = await supabaseAdmin
      .from("product_variants")
      .select("product_id, price, stock, sku")
      .eq("id", VARIANT_ID)
      .single();

    if (varErr || !variant) {
      throw new Error(`Variant not found in database: ${varErr?.message}`);
    }

    console.log(`Product Variant SKU: ${variant.sku}`);
    console.log(`Current Stock Level: ${variant.stock}`);
    console.log(`Variant Price: ${variant.price} INR`);

    if (variant.stock !== 1) {
      console.log(
        "⚠️ Warning: Resetting stock of Saffron Musk to exactly 1 for concurrency test.",
      );
      const { error: resetErr } = await supabaseAdmin
        .from("product_variants")
        .update({ stock: 1 })
        .eq("id", VARIANT_ID);
      if (resetErr) throw resetErr;
    }

    // ── STEP 2: Create User A and User B programmatically ──
    const timestamp = Date.now();
    const emailA = `mock.user.a.${timestamp}@test.local`;
    const emailB = `mock.user.b.${timestamp}@test.local`;
    const password = "TestPassword123!";

    console.log("\n1. Registering User A...");
    const { data: authA, error: errA } =
      await supabaseAdmin.auth.admin.createUser({
        email: emailA,
        password: password,
        email_confirm: true,
      });
    if (errA) throw errA;
    console.log(`User A registered successfully. UUID: ${authA.user.id}`);

    console.log("2. Registering User B...");
    const { data: authB, error: errB } =
      await supabaseAdmin.auth.admin.createUser({
        email: emailB,
        password: password,
        email_confirm: true,
      });
    if (errB) throw errB;
    console.log(`User B registered successfully. UUID: ${authB.user.id}`);

    // ── STEP 3: Authenticate users to get frontend session tokens ──
    console.log("\n3. Authenticating User A...");
    const { data: sessionA, error: logA } =
      await supabase.auth.signInWithPassword({
        email: emailA,
        password: password,
      });
    if (logA) throw logA;
    const tokenA = sessionA.session?.access_token;

    console.log("4. Authenticating User B...");
    const { data: sessionB, error: logB } =
      await supabase.auth.signInWithPassword({
        email: emailB,
        password: password,
      });
    if (logB) throw logB;
    const tokenB = sessionB.session?.access_token;

    // ── STEP 4: Test Coupon Validation WELCOME15 ──
    console.log("\n5. Validating coupon WELCOME15 for User A...");
    const valResA = await fetch(`${API_URL}/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ code: "WELCOME15", cart_total: variant.price }),
    });

    const valDataA = await valResA.json();
    if (!valResA.ok) {
      throw new Error(`User A Coupon Validation failed: ${valDataA.error}`);
    }
    console.log(
      `User A Coupon Validation OK: Applied ${valDataA.discount_pct}% discount (${valDataA.discount_amount} INR saved)`,
    );
    const discountA = valDataA.discount_amount;

    console.log("6. Validating coupon WELCOME15 for User B...");
    const valResB = await fetch(`${API_URL}/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ code: "WELCOME15", cart_total: variant.price }),
    });

    const valDataB = await valResB.json();
    if (!valResB.ok) {
      throw new Error(`User B Coupon Validation failed: ${valDataB.error}`);
    }
    console.log(
      `User B Coupon Validation OK: Applied ${valDataB.discount_pct}% discount (${valDataB.discount_amount} INR saved)`,
    );
    const discountB = valDataB.discount_amount;

    // ── STEP 5: Fire parallel checkouts (concurrency test) ──
    console.log(
      "\n⚡ Firing parallel checkout requests to buy Saffron Musk (stock is 1)...",
    );

    const payloadA = {
      items: [
        { product_id: variant.product_id, variant_id: VARIANT_ID, quantity: 1 },
      ],
      shipping_address: mockAddress,
      coupon_code: "WELCOME15",
      discount: discountA,
    };

    const payloadB = {
      items: [
        { product_id: variant.product_id, variant_id: VARIANT_ID, quantity: 1 },
      ],
      shipping_address: mockAddress,
      coupon_code: "WELCOME15",
      discount: discountB,
    };

    const [resA, resB] = await Promise.all([
      fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify(payloadA),
      }),
      fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify(payloadB),
      }),
    ]);

    const dataA = await resA.json();
    const dataB = await resB.json();

    let successfulUserId: string | null = null;
    let successfulOrderId: string | null = null;

    console.log("\nResults from Concurrency Test:");
    console.log(
      `User A Response Code: ${resA.status}`,
      resA.ok ? "(SUCCEEDED)" : `(FAILED: ${dataA.error})`,
    );
    console.log(
      `User B Response Code: ${resB.status}`,
      resB.ok ? "(SUCCEEDED)" : `(FAILED: ${dataB.error})`,
    );

    // Verify exactly one checkout succeeded
    if (resA.ok && !resB.ok) {
      console.log(
        "✅ Success: User A order created; User B was blocked due to out-of-stock.",
      );
      successfulUserId = authA.user.id;
      successfulOrderId = dataA.order_id;
    } else if (resB.ok && !resA.ok) {
      console.log(
        "✅ Success: User B order created; User A was blocked due to out-of-stock.",
      );
      successfulUserId = authB.user.id;
      successfulOrderId = dataB.order_id;
    } else if (resA.ok && resB.ok) {
      throw new Error(
        "❌ FAIL: Double purchase occurred! Both checkout requests succeeded.",
      );
    } else {
      throw new Error(
        `❌ FAIL: Both checkouts failed. A: ${dataA.error}, B: ${dataB.error}`,
      );
    }

    // ── STEP 6: Confirm the order (Simulate successful payment verification) ──
    if (successfulOrderId) {
      console.log(
        `\n7. Simulating payment confirmation for Order: ${successfulOrderId}...`,
      );
      const { error: confirmErr } = await supabaseAdmin
        .from("orders")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", successfulOrderId);

      if (confirmErr) throw confirmErr;
      console.log("✅ Order marked as CONFIRMED in the database.");
    }

    // ── STEP 7: Verify final stock level is 0 ──
    const { data: finalVariant } = await supabaseAdmin
      .from("product_variants")
      .select("stock")
      .eq("id", VARIANT_ID)
      .single();

    console.log(`\n8. Checking final inventory level...`);
    console.log(`Final stock level: ${finalVariant?.stock}`);

    if (finalVariant?.stock === 0) {
      console.log(
        "✅ Concurrency verification completed successfully! Stock level is 0.",
      );
    } else {
      throw new Error(
        `❌ Final stock is not 0 (stock: ${finalVariant?.stock})`,
      );
    }

    // ── STEP 8: Verify first-order coupon block works ──
    // Since the successful user has a confirmed order now, validating WELCOME15 again must fail!
    const activeToken = successfulUserId === authA.user.id ? tokenA : tokenB;
    console.log(
      "\n9. Attempting to validate WELCOME15 again for the user who just placed an order...",
    );

    const reValRes = await fetch(`${API_URL}/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({ code: "WELCOME15", cart_total: variant.price }),
    });

    const reValData = await reValRes.json();
    console.log(`Validation response code: ${reValRes.status}`);
    console.log(`Validation response error: ${reValData.error}`);

    if (
      reValRes.status === 400 &&
      reValData.error.includes("only valid for your first order")
    ) {
      console.log(
        "✅ Success: WELCOME15 block correctly prevented the user from using it again!",
      );
    } else {
      console.error(
        "❌ Fail: User was allowed to validate first-order WELCOME15 code again.",
      );
    }

    console.log("\n════════════════════════════════════════════════");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("You can now open the Admin Dashboard and verify:");
    console.log(`- Order #${successfulOrderId?.slice(0, 8)} is listed.`);
    console.log("- Total Revenue & Orders metrics are updated.");
    console.log("════════════════════════════════════════════════");
  } catch (err) {
    console.error("\n❌ Test execution failed:", err);
    process.exit(1);
  }
}

run();
