import s from "./ShippingStep.module.css";

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

interface Props {
  shipping: ShippingData;
  setShipping: React.Dispatch<React.SetStateAction<ShippingData>>;
  errors: Record<string, string>;
  onNext: () => void;
  inputGroup: (
    label: string,
    field: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { type?: string; placeholder?: string; half?: boolean },
  ) => React.ReactNode;
}

export function ShippingStep({
  shipping,
  setShipping,
  errors,
  onNext,
  inputGroup,
}: Props) {
  return (
    <div>
      <h2 className={s.title}>Shipping Information</h2>
      <div className={s.formRow}>
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
        {inputGroup("Street Address", "address", shipping.address, (v) =>
          setShipping((s) => ({ ...s, address: v })),
        )}
        {inputGroup(
          "City",
          "city",
          shipping.city,
          (v) => setShipping((s) => ({ ...s, city: v })),
          { half: true },
        )}
        <div className={s.stateGroup}>
          <label className={s.fieldLabel}>State</label>
          <select
            value={shipping.state}
            onChange={(e) =>
              setShipping((s) => ({ ...s, state: e.target.value }))
            }
            className="input"
            style={{
              cursor: "pointer",
              borderColor: errors.state ? "var(--color-error)" : undefined,
            }}
          >
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.state && <p className={s.fieldError}>{errors.state}</p>}
        </div>
        {inputGroup(
          "Pincode",
          "pincode",
          shipping.pincode,
          (v) => setShipping((s) => ({ ...s, pincode: v })),
          { half: true, placeholder: "6-digit pincode" },
        )}
      </div>
      <button onClick={onNext} className={`btn btn-gold ${s.nextBtn}`}>
        Continue to Payment →
      </button>
    </div>
  );
}
