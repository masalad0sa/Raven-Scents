import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { useCartStore } from "../store/cartStore";
import { ordersApi } from "../lib/api";
import { Check } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { SEO } from "../components/seo/SEO";
import { ShippingStep } from "../components/checkout/ShippingStep";
import { PaymentStep } from "../components/checkout/PaymentStep";
import { ReviewStep } from "../components/checkout/ReviewStep";
import { CheckoutSummary } from "../components/checkout/CheckoutSummary";

type Step = "shipping" | "payment" | "review";
const STEPS: Step[] = ["shipping", "payment", "review"];

const stepLabel: Record<Step, string> = {
  shipping: "Shipping",
  payment: "Payment",
  review: "Review",
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

interface PaymentData {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const isMobile = useIsMobile();
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
  const [payment, setPayment] = useState<PaymentData>({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
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

  const validatePayment = () => {
    const e: Record<string, string> = {};
    if (!payment.cardName.trim()) e.cardName = "Required";
    if (!payment.cardNumber.replace(/\s/g, "").match(/^[0-9]{16}$/))
      e.cardNumber = "Valid 16-digit card required";
    if (!payment.expiry.match(/^(0[1-9]|1[0-2])\/[0-9]{2}$/))
      e.expiry = "MM/YY format required";
    if (!payment.cvv.match(/^[0-9]{3,4}$/)) e.cvv = "3-4 digits required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCard = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  const formatExpiry = (value: string) => {
    const d = value.replace(/\D/g, "");
    if (d.length >= 2) return d.slice(0, 2) + "/" + d.slice(2, 4);
    return d;
  };

  const handleNext = () => {
    if (step === "shipping" && validateShipping()) setStep("payment");
    else if (step === "payment" && validatePayment()) setStep("review");
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
          unit_price: item.variant.price,
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

      await ordersApi.create(payload);
      sessionStorage.removeItem("raven_coupon");
      clearCart();
      navigate("/order-confirmation");
    } catch (err: any) {
      console.error("Failed to place order:", err);
      alert(
        err.message || "Failed to place order. Please try again or log in.",
      );
    } finally {
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
    <div
      style={{
        flex: opts?.half ? "1 1 calc(50% - 0.5rem)" : "1 1 100%",
        minWidth: opts?.half ? 120 : undefined,
      }}
    >
      <label
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.62rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          display: "block",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </label>
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
      {errors[field] && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            color: "var(--color-error)",
            marginTop: "0.25rem",
          }}
        >
          {errors[field]}
        </p>
      )}
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
      <main
        style={{
          paddingTop: 72,
          background: "var(--color-ivory)",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            padding: "2rem 0",
            borderBottom: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div className="container">
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                fontWeight: 300,
                color: "var(--color-text)",
                marginBottom: "1.5rem",
              }}
            >
              Checkout
            </h1>
            {/* Step Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                    }}
                  >
                    <div
                      className={`step-dot ${i < currentStepIndex ? "done" : i === currentStepIndex ? "active" : "inactive"}`}
                    >
                      {i < currentStepIndex ? <Check size={12} /> : i + 1}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color:
                          i <= currentStepIndex
                            ? "var(--color-text)"
                            : "var(--color-muted)",
                        fontWeight: i === currentStepIndex ? 700 : 400,
                      }}
                    >
                      {stepLabel[s]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 40,
                        height: 1,
                        background:
                          i < currentStepIndex ? "var(--color-gold)" : "#333",
                        margin: "0 0.75rem",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="container"
          style={{ padding: isMobile ? "1.5rem 1rem" : "3rem 2rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
              gap: isMobile ? "1.5rem" : "2.5rem",
              alignItems: "start",
            }}
          >
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
              {step === "payment" && (
                <PaymentStep
                  payment={payment}
                  setPayment={setPayment}
                  errors={errors}
                  onNext={handleNext}
                  onBack={() => setStep("shipping")}
                  formatCard={formatCard}
                  formatExpiry={formatExpiry}
                  inputGroup={inputGroup}
                />
              )}
              {step === "review" && (
                <ReviewStep
                  shipping={shipping}
                  cardLast4={payment.cardNumber.replace(/\s/g, "").slice(-4)}
                  onEditShipping={() => setStep("shipping")}
                  onEditPayment={() => setStep("payment")}
                  onBack={() => setStep("payment")}
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
