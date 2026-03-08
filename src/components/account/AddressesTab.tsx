import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  FormField,
  sectionHeadingClass,
  primaryBtnClass,
  ghostBtnClass,
} from "./AccountStyles";
import s from "./AddressesTab.module.css";

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
      <div className={s.header}>
        <h2 className={sectionHeadingClass}>Saved Addresses</h2>
        {!addrForm && (
          <button
            onClick={() => {
              setAddrForm(emptyAddrForm());
              setEditingAddrId(null);
            }}
            className={primaryBtnClass(false)}
          >
            <Plus size={13} />
            Add Address
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {addrForm && (
        <div className={s.formCard}>
          <h3 className={`${sectionHeadingClass} ${s.formTitle}`}>
            {editingAddrId ? "Edit Address" : "New Address"}
          </h3>
          <div className={s.formGrid}>
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
            <div className={s.streetCol}>
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
          <div className={s.formActions}>
            <button
              onClick={saveAddress}
              disabled={addrSaving}
              className={primaryBtnClass(addrSaving)}
            >
              <Check size={13} />
              {addrSaving ? "Saving…" : "Save Address"}
            </button>
            <button
              onClick={() => {
                setAddrForm(null);
                setEditingAddrId(null);
              }}
              className={ghostBtnClass}
            >
              <X size={13} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address cards */}
      {addrLoading ? (
        <p className={s.loadingText}>
          Loading…
        </p>
      ) : addresses.length === 0 ? (
        <div className={s.emptyCard}>
          <MapPin
            size={32}
            color="rgba(212,175,55,0.3)"
            style={{ margin: "0 auto 1rem" }}
          />
          <p className={s.emptyText}>
            No saved addresses yet.
          </p>
        </div>
      ) : (
        <div className={s.addrGrid}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`${s.addrCard}${addr.is_default ? ` ${s.addrCardDefault}` : ""}`}
            >
              {addr.is_default && (
                <span className={s.defaultBadge}>Default</span>
              )}
              <p className={s.addrName}>{addr.full_name}</p>
              {addr.phone && (
                <p className={s.addrPhone}>{addr.phone}</p>
              )}
              <p className={s.addrDetail}>
                {addr.street}
                <br />
                {addr.city}, {addr.state} {addr.postal_code}
                <br />
                {addr.country}
              </p>
              <div className={s.addrActions}>
                {!addr.is_default && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className={`${ghostBtnClass} ${s.addrActionBtn}`}
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
                  className={`${ghostBtnClass} ${s.addrActionBtn}`}
                >
                  <Edit2 size={11} />
                  Edit
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className={`${ghostBtnClass} ${s.deleteBtn}`}
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
