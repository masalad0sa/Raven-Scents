import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { useCartStore } from "../store/cartStore";
import { ordersApi } from "../lib/api";
import { Check } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";

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

const STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

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

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 299;
  const total = subtotal + shippingFee;

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
        discount: 0, // Will implement coupon later
      };

      await ordersApi.create(payload);
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

        <div className="container" style={{ padding: isMobile ? '1.5rem 1rem' : '3rem 2rem' }}>
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
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                      color: "var(--color-text)",
                      marginBottom: "2rem",
                    }}
                  >
                    Shipping Information
                  </h2>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
                  >
                    {inputGroup(
                      "First Name",
                      "firstName",
                      shipping.firstName,
                      (v) => setShipping((s) => ({ ...s, firstName: v })),
                      { half: true },
                    )}
                    {inputGroup(
                      "Last Name",
                      "lastName",
                      shipping.lastName,
                      (v) => setShipping((s) => ({ ...s, lastName: v })),
                      { half: true },
                    )}
                    {inputGroup(
                      "Email",
                      "email",
                      shipping.email,
                      (v) => setShipping((s) => ({ ...s, email: v })),
                      { type: "email", placeholder: "you@example.com" },
                    )}
                    {inputGroup(
                      "Phone",
                      "phone",
                      shipping.phone,
                      (v) => setShipping((s) => ({ ...s, phone: v })),
                      { placeholder: "10-digit mobile number" },
                    )}
                    {inputGroup(
                      "Street Address",
                      "address",
                      shipping.address,
                      (v) => setShipping((s) => ({ ...s, address: v })),
                    )}
                    {inputGroup(
                      "City",
                      "city",
                      shipping.city,
                      (v) => setShipping((s) => ({ ...s, city: v })),
                      { half: true },
                    )}
                    <div
                      style={{ flex: "1 1 calc(50% - 0.5rem)", minWidth: 120 }}
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
                        State
                      </label>
                      <select
                        value={shipping.state}
                        onChange={(e) =>
                          setShipping((s) => ({ ...s, state: e.target.value }))
                        }
                        className="input"
                        style={{
                          cursor: "pointer",
                          borderColor: errors.state
                            ? "var(--color-error)"
                            : undefined,
                        }}
                      >
                        <option value="">Select state</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: "var(--color-error)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {errors.state}
                        </p>
                      )}
                    </div>
                    {inputGroup(
                      "Pincode",
                      "pincode",
                      shipping.pincode,
                      (v) => setShipping((s) => ({ ...s, pincode: v })),
                      { half: true, placeholder: "6-digit pincode" },
                    )}
                  </div>
                  <button
                    onClick={handleNext}
                    className="btn btn-gold"
                    style={{ marginTop: "2rem" }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {step === "payment" && (
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                      color: "var(--color-text)",
                      marginBottom: "2rem",
                    }}
                  >
                    Payment Details
                  </h2>
                  <div
                    style={{
                      background: "var(--color-primary)",
                      borderRadius: 12,
                      padding: "1.5rem 1.75rem",
                      marginBottom: "2rem",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -30,
                        right: -30,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        border: "1px solid rgba(212,175,55,0.2)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(212,175,55,0.1)",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.62rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "2rem",
                      }}
                    >
                      Secured Card
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.15rem",
                        letterSpacing: "0.2em",
                        color: "#fff",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {payment.cardNumber
                        ? payment.cardNumber
                            .padEnd(19, "•")
                            .replace(/\S(?=.{1,4}$)/g, "•")
                        : "•••• •••• •••• ••••"}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.55rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Card Holder
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.8rem",
                            color: "#fff",
                          }}
                        >
                          {payment.cardName || "YOUR NAME"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.55rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Expires
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.8rem",
                            color: "#fff",
                          }}
                        >
                          {payment.expiry || "MM/YY"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
                  >
                    {inputGroup(
                      "Card Holder Name",
                      "cardName",
                      payment.cardName,
                      (v) => setPayment((p) => ({ ...p, cardName: v })),
                      { placeholder: "As on card" },
                    )}
                    <div style={{ flex: "1 1 100%" }}>
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
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={(e) =>
                          setPayment((p) => ({
                            ...p,
                            cardNumber: formatCard(e.target.value),
                          }))
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="input"
                        style={{
                          borderColor: errors.cardNumber
                            ? "var(--color-error)"
                            : undefined,
                        }}
                      />
                      {errors.cardNumber && (
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: "var(--color-error)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
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
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={payment.expiry}
                        onChange={(e) =>
                          setPayment((p) => ({
                            ...p,
                            expiry: formatExpiry(e.target.value),
                          }))
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                        className="input"
                        style={{
                          borderColor: errors.expiry
                            ? "var(--color-error)"
                            : undefined,
                        }}
                      />
                      {errors.expiry && (
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: "var(--color-error)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {errors.expiry}
                        </p>
                      )}
                    </div>
                    <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
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
                        CVV
                      </label>
                      <input
                        type="password"
                        value={payment.cvv}
                        onChange={(e) =>
                          setPayment((p) => ({
                            ...p,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        placeholder="•••"
                        maxLength={4}
                        className="input"
                        style={{
                          borderColor: errors.cvv
                            ? "var(--color-error)"
                            : undefined,
                        }}
                      />
                      {errors.cvv && (
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: "var(--color-error)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                  >
                    <button
                      onClick={() => setStep("shipping")}
                      className="btn btn-outline"
                    >
                      ← Back
                    </button>
                    <button onClick={handleNext} className="btn btn-gold">
                      Review Order →
                    </button>
                  </div>
                </div>
              )}

              {step === "review" && (
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                      color: "var(--color-text)",
                      marginBottom: "2rem",
                    }}
                  >
                    Order Review
                  </h2>
                  {/* Shipping summary */}
                  <div
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid rgba(212,175,55,0.15)",
                      borderRadius: 6,
                      padding: "1.25rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.65rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--color-muted)",
                        }}
                      >
                        Shipping To
                      </h3>
                      <button
                        onClick={() => setStep("shipping")}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.1em",
                          color: "var(--color-gold)",
                          textTransform: "uppercase",
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.9rem",
                        color: "var(--color-text)",
                      }}
                    >
                      {shipping.firstName} {shipping.lastName}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        color: "var(--color-muted)",
                      }}
                    >
                      {shipping.address}, {shipping.city}, {shipping.state} —{" "}
                      {shipping.pincode}
                    </p>
                  </div>
                  {/* Payment summary */}
                  <div
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid rgba(212,175,55,0.15)",
                      borderRadius: 6,
                      padding: "1.25rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.65rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--color-muted)",
                        }}
                      >
                        Payment
                      </h3>
                      <button
                        onClick={() => setStep("payment")}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.1em",
                          color: "var(--color-gold)",
                          textTransform: "uppercase",
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.9rem",
                        color: "var(--color-text)",
                      }}
                    >
                      Ending in {payment.cardNumber.slice(-4)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={() => setStep("payment")}
                      className="btn btn-outline"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="btn btn-gold"
                      disabled={placing}
                      style={{ opacity: placing ? 0.7 : 1 }}
                    >
                      {placing ? "Placing Order..." : "✓ Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Summary */}
            <div
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(212,175,55,0.15)",
                borderRadius: 8,
                padding: "1.75rem",
                position: "sticky",
                top: 92,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  marginBottom: "1.25rem",
                }}
              >
                Order Summary
              </h2>
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant.sku}`}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img
                      src={item.product.images[0]}
                      alt=""
                      style={{
                        width: 52,
                        height: 52,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "var(--color-gold)",
                        color: "#0d0d0d",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                      }}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "var(--color-text)",
                      }}
                    >
                      {item.product.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        color: "var(--color-muted)",
                      }}
                    >
                      {item.variant.size}
                      {item.variant.unit}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--color-gold)",
                    }}
                  >
                    ₹
                    {(item.variant.price * item.quantity).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid rgba(212,175,55,0.15)",
                  paddingTop: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                {[
                  {
                    label: "Subtotal",
                    val: `₹${subtotal.toLocaleString("en-IN")}`,
                  },
                  {
                    label: "Shipping",
                    val: shippingFee === 0 ? "Free" : `₹${shippingFee}`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.6rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        color: "var(--color-muted)",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      {row.val}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid rgba(212,175,55,0.15)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      color: "var(--color-text)",
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--color-gold)",
                    }}
                  >
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
