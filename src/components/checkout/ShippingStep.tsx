import { useState, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
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

interface SavedAddress {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
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
  const { user } = useAuthStore();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved addresses on mount
  useEffect(() => {
    if (!user) {
      setShowForm(true);
      setLoaded(true);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      const addrs = (data ?? []) as SavedAddress[];
      setSavedAddresses(addrs);

      if (addrs.length === 0) {
        setShowForm(true);
      } else {
        // Auto-select the default or first address
        const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
        selectAddress(defaultAddr);
      }
      setLoaded(true);
    })();
  }, [user]);

  const selectAddress = (addr: SavedAddress) => {
    setSelectedAddrId(addr.id);
    setShowForm(false);

    // Split full_name into first/last
    const parts = addr.full_name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ");

    setShipping({
      firstName,
      lastName,
      email: user?.email || shipping.email || "",
      phone: addr.phone || "",
      address: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.postal_code || "",
    });
  };

  const handleNewAddress = () => {
    setSelectedAddrId(null);
    setShowForm(true);
    setShipping({
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  if (!loaded) return null;

  return (
    <div>
      <h2 className={s.title}>Shipping Information</h2>

      {/* Saved addresses */}
      {savedAddresses.length > 0 && (
        <div className={s.savedSection}>
          <p className={s.savedLabel}>
            <MapPin size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Saved Addresses
          </p>
          <div className={s.savedGrid}>
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={
                  selectedAddrId === addr.id ? s.addrCardActive : s.addrCard
                }
                onClick={() => selectAddress(addr)}
              >
                {addr.is_default && (
                  <span className={s.addrDefault}>Default</span>
                )}
                <p className={s.addrName}>{addr.full_name}</p>
                <p className={s.addrDetail}>
                  {addr.street}
                  <br />
                  {addr.city}, {addr.state} {addr.postal_code}
                </p>
              </div>
            ))}
            <div className={s.newAddrCard} onClick={handleNewAddress}>
              <Plus size={14} /> New Address
            </div>
          </div>

          {showForm && (
            <div className={s.divider}>
              <div className={s.dividerLine} />
              <span className={s.dividerText}>Enter new address</span>
              <div className={s.dividerLine} />
            </div>
          )}
        </div>
      )}

      {/* Address form */}
      {showForm && (
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
      )}

      <button onClick={onNext} className={`btn btn-gold ${s.nextBtn}`}>
        Continue to Review →
      </button>
    </div>
  );
}
