import s from "./PaymentStep.module.css";

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
  inputGroup: (
    label: string,
    field: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { type?: string; placeholder?: string; half?: boolean },
  ) => React.ReactNode;
}

export function PaymentStep({
  payment,
  setPayment,
  errors,
  onNext,
  onBack,
  formatCard,
  formatExpiry,
  inputGroup,
}: Props) {
  return (
    <div>
      <h2 className={s.title}>
        Payment Details
      </h2>
      {/* Card Preview */}
      <div className={s.cardPreview}>
        <div className={s.cardCircle1} />
        <div className={s.cardCircle2} />
        <p className={s.cardLabel}>
          Secured Card
        </p>
        <p className={s.cardNumber}>
          {payment.cardNumber
            ? payment.cardNumber.padEnd(19, "•").replace(/\S(?=.{1,4}$)/g, "•")
            : "•••• •••• •••• ••••"}
        </p>
        <div className={s.cardBottom}>
          <div>
            <p className={s.cardSubLabel}>Card Holder</p>
            <p className={s.cardSubValue}>{payment.cardName || "YOUR NAME"}</p>
          </div>
          <div>
            <p className={s.cardSubLabel}>Expires</p>
            <p className={s.cardSubValue}>{payment.expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>
      <div className={s.formRow}>
        {inputGroup(
          "Card Holder Name",
          "cardName",
          payment.cardName,
          (v) => setPayment((p) => ({ ...p, cardName: v })),
          { placeholder: "As on card" },
        )}
        <div className={s.fieldFull}>
          <label className={s.fieldLabel}>
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
              borderColor: errors.cardNumber ? "var(--color-error)" : undefined,
            }}
          />
          {errors.cardNumber && (
            <p className={s.fieldError}>
              {errors.cardNumber}
            </p>
          )}
        </div>
        <div className={s.fieldHalf}>
          <label className={s.fieldLabel}>
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
              borderColor: errors.expiry ? "var(--color-error)" : undefined,
            }}
          />
          {errors.expiry && (
            <p className={s.fieldError}>
              {errors.expiry}
            </p>
          )}
        </div>
        <div className={s.fieldHalf}>
          <label className={s.fieldLabel}>
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
              borderColor: errors.cvv ? "var(--color-error)" : undefined,
            }}
          />
          {errors.cvv && (
            <p className={s.fieldError}>
              {errors.cvv}
            </p>
          )}
        </div>
      </div>
      <div className={s.actions}>
        <button onClick={onBack} className="btn btn-outline">
          ← Back
        </button>
        <button onClick={onNext} className="btn btn-gold">
          Review Order →
        </button>
      </div>
    </div>
  );
}
