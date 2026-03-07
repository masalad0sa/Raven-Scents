import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  FormField,
  sectionHeading,
  primaryBtnStyle,
  ghostBtnStyle,
} from "./AccountStyles";

interface Address {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export function AddressesTab({
  user,
  defaultName,
  defaultPhone,
}: {
  user: { id: string };
  defaultName: string | null;
  defaultPhone: string | null;
}) {
  const isMobile = useIsMobile();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<
    Address,
    "id" | "is_default"
  > | null>(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, [user.id]);

  const loadAddresses = async () => {
    setAddrLoading(true);
    const { data } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setAddresses(data ?? []);
    setAddrLoading(false);
  };

  const emptyAddrForm = (): Omit<Address, "id" | "is_default"> => ({
    full_name: defaultName ?? "",
    phone: defaultPhone ?? "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const saveAddress = async () => {
    if (!addrForm) return;
    setAddrSaving(true);
    if (editingAddrId) {
      await supabase
        .from("user_addresses")
        .update({ ...addrForm, updated_at: new Date().toISOString() })
        .eq("id", editingAddrId);
    } else {
      await supabase
        .from("user_addresses")
        .insert({ ...addrForm, user_id: user.id });
    }
    setAddrForm(null);
    setEditingAddrId(null);
    setAddrSaving(false);
    loadAddresses();
  };

  const deleteAddress = async (id: string) => {
    await supabase.from("user_addresses").delete().eq("id", id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefaultAddress = async (id: string) => {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
    await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", id);
    loadAddresses();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={sectionHeading}>Saved Addresses</h2>
        {!addrForm && (
          <button
            onClick={() => {
              setAddrForm(emptyAddrForm());
              setEditingAddrId(null);
            }}
            style={primaryBtnStyle(false)}
          >
            <Plus size={13} />
            Add Address
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {addrForm && (
        <div
          style={{
            background: "#111",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 10,
            padding: "1.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <h3 style={{ ...sectionHeading, marginBottom: "1.5rem" }}>
            {editingAddrId ? "Edit Address" : "New Address"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "1rem 1.25rem",
              maxWidth: 600,
            }}
          >
            <FormField
              label="Full Name"
              value={addrForm.full_name}
              onChange={(v) => setAddrForm((f) => f && { ...f, full_name: v })}
            />
            <FormField
              label="Phone"
              value={addrForm.phone}
              onChange={(v) => setAddrForm((f) => f && { ...f, phone: v })}
              type="tel"
              placeholder="+91 98765 43210"
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <FormField
                label="Street Address"
                value={addrForm.street}
                onChange={(v) => setAddrForm((f) => f && { ...f, street: v })}
                placeholder="123 Main St, Apt 4"
              />
            </div>
            <FormField
              label="City"
              value={addrForm.city}
              onChange={(v) => setAddrForm((f) => f && { ...f, city: v })}
            />
            <FormField
              label="State"
              value={addrForm.state}
              onChange={(v) => setAddrForm((f) => f && { ...f, state: v })}
            />
            <FormField
              label="Postal Code"
              value={addrForm.postal_code}
              onChange={(v) =>
                setAddrForm((f) => f && { ...f, postal_code: v })
              }
            />
            <FormField
              label="Country"
              value={addrForm.country}
              onChange={(v) => setAddrForm((f) => f && { ...f, country: v })}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              onClick={saveAddress}
              disabled={addrSaving}
              style={primaryBtnStyle(addrSaving)}
            >
              <Check size={13} />
              {addrSaving ? "Saving…" : "Save Address"}
            </button>
            <button
              onClick={() => {
                setAddrForm(null);
                setEditingAddrId(null);
              }}
              style={ghostBtnStyle}
            >
              <X size={13} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address cards */}
      {addrLoading ? (
        <p
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Loading…
        </p>
      ) : addresses.length === 0 ? (
        <div
          style={{
            background: "#111",
            border: "1px solid rgba(212,175,55,0.1)",
            borderRadius: 10,
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <MapPin
            size={32}
            color="rgba(212,175,55,0.3)"
            style={{ margin: "0 auto 1rem" }}
          />
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            No saved addresses yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(280px,1fr))",
            gap: "1rem",
          }}
        >
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                background: "#111",
                border: `1px solid ${addr.is_default ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.1)"}`,
                borderRadius: 10,
                padding: "1.5rem",
                position: "relative",
              }}
            >
              {addr.is_default && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(212,175,55,0.15)",
                    color: "var(--color-gold)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "0.2rem 0.6rem",
                    borderRadius: 20,
                  }}
                >
                  Default
                </span>
              )}
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: "0 0 0.25rem",
                }}
              >
                {addr.full_name}
              </p>
              {addr.phone && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    margin: "0 0 0.75rem",
                  }}
                >
                  {addr.phone}
                </p>
              )}
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {addr.street}
                <br />
                {addr.city}, {addr.state} {addr.postal_code}
                <br />
                {addr.country}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "1.25rem",
                  flexWrap: "wrap",
                }}
              >
                {!addr.is_default && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    style={{ ...ghostBtnStyle, fontSize: "0.6rem" }}
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => {
                    setAddrForm({
                      full_name: addr.full_name,
                      phone: addr.phone,
                      street: addr.street,
                      city: addr.city,
                      state: addr.state,
                      postal_code: addr.postal_code,
                      country: addr.country,
                    });
                    setEditingAddrId(addr.id);
                  }}
                  style={{ ...ghostBtnStyle, fontSize: "0.6rem" }}
                >
                  <Edit2 size={11} />
                  Edit
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  style={{
                    ...ghostBtnStyle,
                    fontSize: "0.6rem",
                    color: "#f87171",
                    borderColor: "rgba(248,113,113,0.2)",
                  }}
                >
                  <Trash2 size={11} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
