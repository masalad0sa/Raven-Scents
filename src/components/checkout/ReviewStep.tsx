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
  cardLast4: string;
  onEditShipping: () => void;
  onEditPayment: () => void;
  onBack: () => void;
  onPlace: () => void;
  placing: boolean;
}

export function ReviewStep({
  shipping,
  cardLast4,
  onEditShipping,
  onEditPayment,
  onBack,
  onPlace,
  placing,
}: Props) {
  return (
    <div>
      <h2 className={s.title}>
        Order Review
      </h2>
      {/* Shipping summary */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h3 className={s.cardLabel}>Shipping To</h3>
          <button onClick={onEditShipping} className={s.editBtn}>Edit</button>
        </div>
        <p className={s.name}>
          {shipping.firstName} {shipping.lastName}
        </p>
        <p className={s.address}>
          {shipping.address}, {shipping.city}, {shipping.state} —{" "}
          {shipping.pincode}
        </p>
      </div>
      {/* Payment summary */}
      <div className={s.cardPayment}>
        <div className={s.cardHeader}>
          <h3 className={s.cardLabel}>Payment</h3>
          <button onClick={onEditPayment} className={s.editBtn}>Edit</button>
        </div>
        <p className={s.paymentText}>
          Ending in {cardLast4}
        </p>
      </div>
      <div className={s.actions}>
        <button onClick={onBack} className="btn btn-outline">
          ← Back
        </button>
        <button
          onClick={onPlace}
          className="btn btn-gold"
          disabled={placing}
          style={{ opacity: placing ? 0.7 : 1 }}
        >
          {placing ? "Placing Order..." : "✓ Place Order"}
        </button>
      </div>
    </div>
  );
}
