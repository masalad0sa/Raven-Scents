import { Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { supabaseAdmin } from "../services/supabase";
import { handleError, AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

// ── Razorpay Instance ─────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ── Validation Schemas ────────────────────────────────────
// NOTE: unit_price is intentionally removed — prices are fetched
//       server-side from product_variants to prevent price tampering.
const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        variant_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
  shipping_address: z.object({
    full_name: z.string().min(1),
    address_line1: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^[0-9]{6}$/),
    phone: z.string().regex(/^[0-9]{10}$/),
  }),
  coupon_code: z.string().optional().nullable(),
  discount: z.number().int().min(0).default(0),
});

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  order_id: z.string().uuid(),
});

const cancelSchema = z.object({
  order_id: z.string().uuid(),
});

// ── POST /api/payments/create-order ───────────────────────
// Atomically creates the order, reserves stock, then opens Razorpay.
// Stock is decremented HERE (before payment) so the user is blocked
// up front if stock is unavailable — not after they've already paid.
export async function createPaymentOrder(req: AuthRequest, res: Response) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message || "Invalid request body",
      });
    }

    const { items, shipping_address, coupon_code, discount } = parsed.data;

    // Validate if WELCOME15 first order rule is met
    if (coupon_code && coupon_code.toUpperCase().trim() === "WELCOME15") {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          error: "Please log in to apply the first-order discount code.",
          code: "INVALID_COUPON",
        });
      }
      const { count, error: countErr } = await supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("status", "in", '("cancelled","pending_payment")');

      if (countErr) throw countErr;
      if (count && count > 0) {
        return res.status(400).json({
          error: "This welcome code is only valid for your first order.",
          code: "INVALID_COUPON",
        });
      }
    }

    // 1. Atomically create the order + insert items + decrement stock (single DB transaction).
    //    Prices are fetched from product_variants server-side — frontend prices are ignored.
    //    If any variant has insufficient stock, the RPC raises an exception and the entire
    //    transaction rolls back — no order is created, no payment is attempted.
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      "create_order_atomic",
      {
        p_user_id: req.userId ?? null,
        p_shipping_addr: shipping_address,
        p_coupon_code: coupon_code ?? null,
        p_discount: discount,
        p_items: items,
      },
    );

    if (rpcError) {
      // P0001 = insufficient stock (raised by our PL/pgSQL function)
      if (rpcError.code === "P0001") {
        return res.status(409).json({
          error: "One or more items in your order are out of stock.",
          code: "OUT_OF_STOCK",
        });
      }
      // P0002 = variant not found
      if (rpcError.code === "P0002") {
        return res.status(404).json({
          error: "One or more product variants could not be found.",
          code: "VARIANT_NOT_FOUND",
        });
      }
      // P0004 = invalid or expired coupon
      if (rpcError.code === "P0004") {
        return res.status(400).json({
          error: rpcError.message || "Invalid or expired coupon code.",
          code: "INVALID_COUPON",
        });
      }
      throw rpcError;
    }

    const { order_id, total } = rpcResult as {
      order_id: string;
      total: number;
    };
    const totalPaise = total * 100; // Razorpay expects amount in paise

    // 2. Create the Razorpay order using the server-computed total
    const razorpayOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: order_id,
      notes: {
        order_id,
        customer: shipping_address.full_name,
      },
    });

    // 3. Store the Razorpay order ID against our order for later verification
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order_id);

    if (updateError) {
      throw updateError;
    }

    res.status(201).json({
      order_id,
      razorpay_order_id: razorpayOrder.id,
      amount: totalPaise,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// ── POST /api/payments/verify ─────────────────────────────
// Verifies the Razorpay HMAC signature and marks the order as confirmed.
// Stock was already decremented at order creation — nothing to do here for stock.
export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Missing payment verification data" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = parsed.data;

    // 1. Verify the Razorpay HMAC signature to ensure this callback is genuine
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — restore stock and cancel the order
      await supabaseAdmin.rpc("cancel_order_and_restore_stock", {
        p_order_id: order_id,
        p_user_id: req.userId ?? null,
      });
      throw new AppError(
        400,
        "Payment verification failed — invalid signature",
      );
    }

    // 2. Verify that this Razorpay order belongs to our database order
    const { data: existingOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (orderError || !existingOrder) {
      throw new AppError(400, "Invalid order/payment relationship");
    }

    // 3. Mark the order as confirmed and store the Razorpay payment ID
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "confirmed",
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Increment coupon usage counter if a coupon was applied
    if (updated.coupon_code) {
      await supabaseAdmin.rpc("increment_coupon_usage", {
        coupon_code_param: updated.coupon_code,
      });
    }

    res.json({
      success: true,
      order_id: updated.id,
      status: updated.status,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// ── POST /api/payments/cancel ─────────────────────────────
// Called by the frontend when the user closes the Razorpay modal
// or when payment.failed fires. Restores reserved stock and cancels
// the pending_payment order so inventory is not permanently held.
export async function cancelOrder(req: AuthRequest, res: Response) {
  try {
    const parsed = cancelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "order_id is required" });
    }

    const { order_id } = parsed.data;

    const { error } = await supabaseAdmin.rpc(
      "cancel_order_and_restore_stock",
      {
        p_order_id: order_id,
        p_user_id: req.userId ?? null,
      },
    );

    if (error) {
      // P0003 = order not found or cannot be cancelled
      if (error.code === "P0003") {
        return res
          .status(404)
          .json({ error: "Order not found or already processed." });
      }
      throw error;
    }

    res.json({ success: true, message: "Order cancelled and stock restored." });
  } catch (err) {
    handleError(err, res);
  }
}

// ── POST /api/payments/mock-checkout ──────────────────────
// Mock checkout endpoint to bypass Razorpay for local debugging/testing.
export async function mockCheckout(req: AuthRequest, res: Response) {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        error: "Mock checkout is disabled in production environments.",
        code: "FORBIDDEN",
      });
    }

    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message || "Invalid request body",
      });
    }

    const { items, shipping_address, coupon_code, discount } = parsed.data;

    // 1. Validate if WELCOME15 first order rule is met
    if (coupon_code && coupon_code.toUpperCase().trim() === "WELCOME15") {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          error: "Please log in to apply the first-order discount code.",
          code: "INVALID_COUPON",
        });
      }
      const { count, error: countErr } = await supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("status", "in", '("cancelled","pending_payment")');

      if (countErr) throw countErr;
      if (count && count > 0) {
        return res.status(400).json({
          error: "This welcome code is only valid for your first order.",
          code: "INVALID_COUPON",
        });
      }
    }

    // 2. Create the order atomically and reserve stock
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      "create_order_atomic",
      {
        p_user_id: req.userId ?? null,
        p_shipping_addr: shipping_address,
        p_coupon_code: coupon_code ?? null,
        p_discount: discount,
        p_items: items,
      },
    );

    if (rpcError) {
      if (rpcError.code === "P0001") {
        return res.status(409).json({
          error: "One or more items in your order are out of stock.",
          code: "OUT_OF_STOCK",
        });
      }
      if (rpcError.code === "P0002") {
        return res.status(404).json({
          error: "One or more product variants could not be found.",
          code: "VARIANT_NOT_FOUND",
        });
      }
      if (rpcError.code === "P0004") {
        return res.status(400).json({
          error: rpcError.message || "Invalid or expired coupon code.",
          code: "INVALID_COUPON",
        });
      }
      throw rpcError;
    }

    const { order_id } = rpcResult as { order_id: string; total: number };
    const mockPaymentId = `pay_mock_${crypto.randomBytes(8).toString("hex")}`;

    // 3. Immediately mark the order as confirmed and store mock payment ID
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "confirmed",
        razorpay_payment_id: mockPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) throw updateError;

    res.status(201).json({
      success: true,
      order_id,
      status: "confirmed",
    });
  } catch (err) {
    handleError(err, res);
  }
}

// ── GET /api/payments/key ─────────────────────────────────
// Returns the Razorpay publishable key to the frontend
export function getRazorpayKey(_req: AuthRequest, res: Response) {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID });
}

// ── POST /api/payments/webhook ────────────────────────────
// Asynchronous Razorpay Webhook listener for payment confirmation.
// Protects users & sellers if browser crashes or network drops post-payment.
export async function handleRazorpayWebhook(req: AuthRequest, res: Response) {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !webhookSecret) {
      return res
        .status(400)
        .json({ error: "Missing webhook signature or secret" });
    }

    const bodyString = req.rawBody
      ? req.rawBody.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyString)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = req.body?.event;
    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId =
        paymentEntity?.notes?.order_id ||
        req.body.payload?.order?.entity?.receipt;

      if (orderId) {
        const { data: updated, error } = await supabaseAdmin
          .from("orders")
          .update({
            status: "confirmed",
            razorpay_payment_id: paymentEntity?.id || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("status", "pending_payment")
          .select()
          .single();

        if (!error && updated?.coupon_code) {
          await supabaseAdmin.rpc("increment_coupon_usage", {
            coupon_code_param: updated.coupon_code,
          });
        }
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    handleError(err, res);
  }
}
