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
            onClick={onEditShipping}
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
            onClick={onEditPayment}
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
          Ending in {cardLast4}
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
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
