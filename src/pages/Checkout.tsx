import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { ordersApi } from "../lib/api";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import {
  ShippingStep,
  PaymentStep,
  ReviewStep,
  CheckoutSummary,
} from "../components/checkout";
import s from "./styles/Checkout.module.css";

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
