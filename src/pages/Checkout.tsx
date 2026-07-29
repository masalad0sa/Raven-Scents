import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { paymentsApi } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import {
  ShippingStep,
  ReviewStep,
  CheckoutSummary,
} from "../components/checkout";
import s from "./styles/Checkout.module.css";

type Step = "shipping" | "review";
const STEPS: Step[] = ["shipping", "review"];

const stepLabel: Record<Step, string> = {
  shipping: "Shipping",
  review: "Review & Pay",
};

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("shipping");
  const [shipping, setShipping] = useState<ShippingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const savedCoupon = (() => {
    try {
      const raw = sessionStorage.getItem("raven_coupon");
      return raw ? (JSON.parse(raw) as { code: string; pct: number }) : null;
    } catch {
      return null;
    }
  })();

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 299;
  const discount = savedCoupon
    ? Math.round((subtotal * savedCoupon.pct) / 100)
    : 0;
  const total = subtotal + shippingFee - discount;

  const validateShipping = () => {
    const e: Record<string, string> = {};
    if (!shipping.firstName.trim()) e.firstName = "Required";
    if (!shipping.lastName.trim()) e.lastName = "Required";
    if (!shipping.email.match(/^\S+@\S+\.\S+$/))
      e.email = "Valid email required";
    if (!shipping.phone.match(/^[0-9]{10}$/))
      e.phone = "10-digit number required";
    if (!shipping.address.trim()) e.address = "Required";
    if (!shipping.city.trim()) e.city = "Required";
    if (!shipping.state) e.state = "Required";
    if (!shipping.pincode.match(/^[0-9]{6}$/))
      e.pincode = "6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === "shipping" && validateShipping()) setStep("review");
  };

  // ── Razorpay Payment Flow ──────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant.id || "",
          quantity: item.quantity,
          // NOTE: unit_price intentionally omitted — the backend fetches
          // canonical prices from product_variants to prevent tampering.
        })),
        shipping_address: {
          full_name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          address_line1: shipping.address,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          phone: shipping.phone,
        },
        discount,
        coupon_code: savedCoupon?.code || null,
      };

      // 1. Create order on backend + Razorpay
      const paymentOrder = await paymentsApi.createOrder(payload);

      // 2. Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: paymentOrder.key_id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Raven Scents",
        description: `Order #${paymentOrder.order_id.slice(0, 8)}`,
        order_id: paymentOrder.razorpay_order_id,
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: {
          color: "#d4af37",
          backdrop_color: "rgba(13, 13, 13, 0.85)",
        },
        modal: {
          confirm_close: true,
          escape: false,
          ondismiss: async () => {
            // User closed the modal — cancel the order and restore the reserved stock
            try {
              await paymentsApi.cancelOrder(paymentOrder.order_id);
            } catch (e) {
              console.warn("Failed to cancel order on dismiss:", e);
            }
            setPlacing(false);
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // 3. Verify payment on backend
            await paymentsApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: paymentOrder.order_id,
            });

            // 4. Save address for next time (if logged in)
            const user = useAuthStore.getState().user;
            if (user) {
              const fullName = `${shipping.firstName} ${shipping.lastName}`.trim();
              // Check if address already saved (by street + pincode)
              const { data: existing } = await supabase
                .from("user_addresses")
                .select("id")
                .eq("user_id", user.id)
                .eq("street", shipping.address)
                .eq("postal_code", shipping.pincode)
                .maybeSingle();

              if (!existing) {
                await supabase.from("user_addresses").insert({
                  user_id: user.id,
                  full_name: fullName,
                  phone: shipping.phone,
                  street: shipping.address,
                  city: shipping.city,
                  state: shipping.state,
                  postal_code: shipping.pincode,
                  country: "India",
                });
              }
            }

            // 5. Success — clear cart & navigate
            sessionStorage.removeItem("raven_coupon");
            clearCart();
            navigate("/order-confirmation");
          } catch (verifyErr: unknown) {
            console.error("Payment verification failed:", verifyErr);
            alert(
              "Payment was received but verification failed. Please contact support with your order ID: " +
                paymentOrder.order_id,
            );
            setPlacing(false);
          }
        },
      };

      if (typeof window.Razorpay === "undefined") {
        throw new Error(
          "Razorpay SDK not loaded. Please refresh the page and try again.",
        );
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: unknown) => {
        console.error("Payment failed:", response);
        // Cancel the order and restore reserved stock
        try {
          await paymentsApi.cancelOrder(paymentOrder.order_id);
        } catch (e) {
          console.warn("Failed to cancel order after payment failure:", e);
        }
        alert("Payment failed. Your cart is unchanged — please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error("Failed to initiate payment:", err);
      // Show a user-friendly message for out-of-stock errors
      const message =
        err instanceof Error && err.message.includes("OUT_OF_STOCK")
          ? "Sorry, one or more items in your cart are out of stock. Please update your cart."
          : (err instanceof Error ? err.message : null) ??
            "Failed to initiate payment. Please try again.";
      alert(message);
      setPlacing(false);
    }
  };

  const inputGroup = (
    label: string,
    field: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { type?: string; placeholder?: string; half?: boolean },
  ) => (
    <div className={opts?.half ? s.inputGroupHalf : s.inputGroupFull}>
      <label className={s.inputLabel}>{label}</label>
      <input
        type={opts?.type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={opts?.placeholder}
        className="input"
        style={{
          borderColor: errors[field] ? "var(--color-error)" : undefined,
        }}
      />
      {errors[field] && <p className={s.inputError}>{errors[field]}</p>}
    </div>
  );

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <>
      <SEO
        title="Checkout"
        description="Complete your purchase at Raven Scents."
      />
      <Header />
      <main className={s.main}>
        <div className={s.banner}>
          <div className="container">
            <h1 className={s.bannerTitle}>Checkout</h1>
            {/* Step Indicator */}
            <div className={s.stepRow}>
              {STEPS.map((st, i) => (
                <div key={st} className={s.stepItem}>
                  <div className={s.stepInner}>
                    <div
                      className={`step-dot ${i < currentStepIndex ? "done" : i === currentStepIndex ? "active" : "inactive"}`}
                    >
                      {i < currentStepIndex ? <Check size={12} /> : i + 1}
                    </div>
                    <span
                      className={s.stepLabel}
                      style={{
                        color:
                          i <= currentStepIndex
                            ? "var(--color-text)"
                            : "var(--color-muted)",
                        fontWeight: i === currentStepIndex ? 700 : 400,
                      }}
                    >
                      {stepLabel[st]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={s.stepDivider}
                      style={{
                        background:
                          i < currentStepIndex ? "var(--color-gold)" : "#333",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${s.content} container`}>
          <div className={s.grid}>
            {/* Form */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {step === "shipping" && (
                <ShippingStep
                  shipping={shipping}
                  setShipping={setShipping}
                  errors={errors}
                  onNext={handleNext}
                  inputGroup={inputGroup}
                />
              )}
              {step === "review" && (
                <ReviewStep
                  shipping={shipping}
                  onEditShipping={() => setStep("shipping")}
                  onBack={() => setStep("shipping")}
                  onPlace={handlePlaceOrder}
                  placing={placing}
                />
              )}
            </motion.div>

            {/* Summary */}
            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              total={total}
              savedCoupon={savedCoupon}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
