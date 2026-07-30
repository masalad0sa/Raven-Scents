import { CreditCard, Shield } from "lucide-react";
import s from "./ReviewStep.module.css";

interface Props {
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  onEditShipping: () => void;
  onBack: () => void;
  onPlace: () => void;
  onPlaceMock?: () => void;
  placing: boolean;
}

export function ReviewStep({
  shipping,
  onEditShipping,
  onBack,
  onPlace,
  onPlaceMock,
  placing,
}: Props) {
  return (
    <div>
      <h2 className={s.title}>Review Your Order</h2>
      {/* Shipping summary */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h3 className={s.cardLabel}>Shipping To</h3>
          <button onClick={onEditShipping} className={s.editBtn}>
            Edit
          </button>
        </div>
        <p className={s.name}>
          {shipping.firstName} {shipping.lastName}
        </p>
        <p className={s.address}>
          {shipping.address}, {shipping.city}, {shipping.state} —{" "}
          {shipping.pincode}
        </p>
      </div>
      {/* Payment info */}
      <div className={s.cardPayment}>
        <div className={s.cardHeader}>
          <h3 className={s.cardLabel}>
            <CreditCard size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Payment
          </h3>
        </div>
        <p className={s.paymentText}>
          <Shield size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
          Secure payment via Razorpay — UPI, Cards, Wallets, Net Banking
        </p>
      </div>
      <div className={s.actions} style={{ flexWrap: "wrap", gap: "0.75rem" }}>
        <button onClick={onBack} className="btn btn-outline">
          ← Back
        </button>
        <button
          onClick={onPlace}
          className="btn btn-gold"
          disabled={placing}
          style={{ opacity: placing ? 0.7 : 1 }}
        >
          {placing ? "Processing..." : "💳 Pay Now"}
        </button>
        {onPlaceMock && (
          <button
            onClick={onPlaceMock}
            className="btn"
            disabled={placing}
            style={{
              opacity: placing ? 0.7 : 1,
              backgroundColor: "var(--color-success, #2ecc71)",
              color: "#fff",
            }}
          >
            {placing ? "Processing..." : "⚡ Mock Payment (Test)"}
          </button>
        )}
      </div>
    </div>
  );
}
