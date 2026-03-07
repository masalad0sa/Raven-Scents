interface PaymentData {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface Props {
  payment: PaymentData;
  setPayment: React.Dispatch<React.SetStateAction<PaymentData>>;
  errors: Record<string, string>;
  onNext: () => void;
  onBack: () => void;
  formatCard: (v: string) => string;
  formatExpiry: (v: string) => string;
  inputGroup: (label: string, field: string, value: string, onChange: (v: string) => void, opts?: { type?: string; placeholder?: string; half?: boolean }) => React.ReactNode;
}

export function PaymentStep({ payment, setPayment, errors, onNext, onBack, formatCard, formatExpiry, inputGroup }: Props) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-text)", marginBottom: "2rem" }}>
        Payment Details
      </h2>
      {/* Card Preview */}
      <div style={{ background: "var(--color-primary)", borderRadius: 12, padding: "1.5rem 1.75rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.2)" }} />
        <div style={{ position: "absolute", top: 10, right: 10, width: 80, height: 80, borderRadius: "50%", background: "rgba(212,175,55,0.1)" }} />
        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>Secured Card</p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", letterSpacing: "0.2em", color: "#fff", marginBottom: "1.5rem" }}>
          {payment.cardNumber ? payment.cardNumber.padEnd(19, "•").replace(/\S(?=.{1,4}$)/g, "•") : "•••• •••• •••• ••••"}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem" }}>Card Holder</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "#fff" }}>{payment.cardName || "YOUR NAME"}</p>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem" }}>Expires</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "#fff" }}>{payment.expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {inputGroup("Card Holder Name", "cardName", payment.cardName, (v) => setPayment((p) => ({ ...p, cardName: v })), { placeholder: "As on card" })}
        <div style={{ flex: "1 1 100%" }}>
          <label style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-muted)", display: "block", marginBottom: "0.4rem" }}>Card Number</label>
          <input type="text" value={payment.cardNumber} onChange={(e) => setPayment((p) => ({ ...p, cardNumber: formatCard(e.target.value) }))} placeholder="1234 5678 9012 3456" maxLength={19} className="input" style={{ borderColor: errors.cardNumber ? "var(--color-error)" : undefined }} />
          {errors.cardNumber && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-error)", marginTop: "0.25rem" }}>{errors.cardNumber}</p>}
        </div>
        <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
          <label style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-muted)", display: "block", marginBottom: "0.4rem" }}>Expiry</label>
          <input type="text" value={payment.expiry} onChange={(e) => setPayment((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))} placeholder="MM/YY" maxLength={5} className="input" style={{ borderColor: errors.expiry ? "var(--color-error)" : undefined }} />
          {errors.expiry && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-error)", marginTop: "0.25rem" }}>{errors.expiry}</p>}
        </div>
        <div style={{ flex: "1 1 calc(50% - 0.5rem)" }}>
          <label style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-muted)", display: "block", marginBottom: "0.4rem" }}>CVV</label>
          <input type="password" value={payment.cvv} onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="•••" maxLength={4} className="input" style={{ borderColor: errors.cvv ? "var(--color-error)" : undefined }} />
          {errors.cvv && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-error)", marginTop: "0.25rem" }}>{errors.cvv}</p>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button onClick={onBack} className="btn btn-outline">← Back</button>
        <button onClick={onNext} className="btn btn-gold">Review Order →</button>
      </div>
    </div>
  );
}
