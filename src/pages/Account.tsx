import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  LogOut,
  Edit2,
  Plus,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { useIsMobile } from "../hooks/useIsMobile";

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

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

type Tab = "profile" | "addresses" | "orders";

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>("profile");
  const isMobile = useIsMobile();

  // Profile state
  const [profile, setProfile] = useState<Profile>({
    full_name: null,
    phone: null,
    avatar_url: null,
  });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>({
    full_name: null,
    phone: null,
    avatar_url: null,
  });

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<
    Address,
    "id" | "is_default"
  > | null>(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    loadProfile();
    loadAddresses();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      setProfile(data);
      setProfileDraft(data);
    }
  };

  const loadAddresses = async () => {
    if (!user) return;
    setAddrLoading(true);
    const { data } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setAddresses(data ?? []);
    setAddrLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    await supabase.from("profiles").upsert({
      id: user.id,
      ...profileDraft,
      updated_at: new Date().toISOString(),
    });
    setProfile(profileDraft);
    setProfileEditing(false);
    setProfileSaving(false);
  };

  const emptyAddrForm = (): Omit<Address, "id" | "is_default"> => ({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const saveAddress = async () => {
    if (!user || !addrForm) return;
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
    if (!user) return;
    // Remove default from all, then set this one
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

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          paddingTop: "5rem",
          paddingBottom: "4rem",
        }}
      >
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Page header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2.5rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid rgba(212,175,55,0.1)",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-gold)",
                  margin: "0 0 0.25rem",
                }}
              >
                My Account
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2rem",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {profile.full_name ?? user.email}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "none",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f87171";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)";
                e.currentTarget.style.color = "var(--color-text-muted)";
              }}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              marginBottom: "2rem",
              background: "#111",
              borderRadius: 8,
              padding: "0.25rem",
              border: "1px solid rgba(212,175,55,0.1)",
              width: isMobile ? "100%" : "fit-content",
              overflowX: isMobile ? "auto" : undefined,
            }}
          >
            {(
              [
                { id: "profile", icon: User, label: "Profile" },
                { id: "addresses", icon: MapPin, label: "Addresses" },
                { id: "orders", icon: ShoppingBag, label: "Orders" },
              ] as {
                id: Tab;
                icon: React.ComponentType<{ size?: number }>;
                label: string;
              }[]
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: tab === id ? "var(--color-gold)" : "none",
                  color: tab === id ? "#0d0d0d" : "var(--color-text-muted)",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.5rem 1.1rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Profile */}
          {tab === "profile" && (
            <div
              style={{
                background: "#111",
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: 10,
                padding: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.75rem",
                }}
              >
                <h2 style={sectionHeading}>Personal Info</h2>
                {!profileEditing && (
                  <button
                    onClick={() => {
                      setProfileDraft(profile);
                      setProfileEditing(true);
                    }}
                    style={iconBtnStyle}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                )}
              </div>

              {profileEditing ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                    maxWidth: 480,
                  }}
                >
                  <FormField
                    label="Full Name"
                    value={profileDraft.full_name ?? ""}
                    onChange={(v) =>
                      setProfileDraft((d) => ({ ...d, full_name: v }))
                    }
                  />
                  <FormField
                    label="Phone"
                    value={profileDraft.phone ?? ""}
                    onChange={(v) =>
                      setProfileDraft((d) => ({ ...d, phone: v }))
                    }
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={saveProfile}
                      disabled={profileSaving}
                      style={primaryBtnStyle(profileSaving)}
                    >
                      <Check size={13} />
                      {profileSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setProfileEditing(false)}
                      style={ghostBtnStyle}
                    >
                      <X size={13} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <dl
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "1.5rem 2rem",
                  }}
                >
                  {[
                    { label: "Full Name", value: profile.full_name ?? "—" },
                    { label: "Email", value: user.email },
                    { label: "Phone", value: profile.phone ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.58rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {label}
                      </dt>
                      <dd
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.95rem",
                          color: "var(--color-text)",
                          margin: 0,
                        }}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}

          {/* Tab: Addresses */}
          {tab === "addresses" && (
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
                      onChange={(v) =>
                        setAddrForm((f) => f && { ...f, full_name: v })
                      }
                    />
                    <FormField
                      label="Phone"
                      value={addrForm.phone}
                      onChange={(v) =>
                        setAddrForm((f) => f && { ...f, phone: v })
                      }
                      type="tel"
                      placeholder="+91 98765 43210"
                    />
                    <div style={{ gridColumn: "1 / -1" }}>
                      <FormField
                        label="Street Address"
                        value={addrForm.street}
                        onChange={(v) =>
                          setAddrForm((f) => f && { ...f, street: v })
                        }
                        placeholder="123 Main St, Apt 4"
                      />
                    </div>
                    <FormField
                      label="City"
                      value={addrForm.city}
                      onChange={(v) =>
                        setAddrForm((f) => f && { ...f, city: v })
                      }
                    />
                    <FormField
                      label="State"
                      value={addrForm.state}
                      onChange={(v) =>
                        setAddrForm((f) => f && { ...f, state: v })
                      }
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
                      onChange={(v) =>
                        setAddrForm((f) => f && { ...f, country: v })
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "1.5rem",
                    }}
                  >
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
          )}

          {/* Tab: Orders */}
          {tab === "orders" && (
            <div
              style={{
                background: "#111",
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: 10,
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <ShoppingBag
                size={40}
                color="rgba(212,175,55,0.3)"
                style={{ margin: "0 auto 1rem" }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.3rem",
                  color: "var(--color-text)",
                  margin: "0 0 0.5rem",
                }}
              >
                No Orders Yet
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  margin: "0 0 2rem",
                }}
              >
                Your order history will appear here once you place your first
                order.
              </p>
              <a
                href="/shop"
                style={{
                  display: "inline-block",
                  background: "var(--color-gold)",
                  color: "#0d0d0d",
                  textDecoration: "none",
                  borderRadius: 6,
                  padding: "0.75rem 2rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Shop Now
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Helpers ────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-display)",
          fontSize: "0.58rem",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#1a1a1a",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 6,
          padding: "0.7rem 1rem",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-gold)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")
        }
      />
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--color-text)",
  margin: 0,
};

const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "none",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 6,
  padding: "0.4rem 0.8rem",
  color: "var(--color-text-muted)",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
  fontSize: "0.62rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  transition: "all 0.2s",
};

const primaryBtnStyle = (disabled: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: disabled ? "rgba(212,175,55,0.5)" : "var(--color-gold)",
  color: "#0d0d0d",
  border: "none",
  borderRadius: 6,
  padding: "0.6rem 1.2rem",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "var(--font-display)",
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  transition: "opacity 0.2s",
});

const ghostBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "none",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 6,
  padding: "0.6rem 1rem",
  color: "var(--color-text-muted)",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  transition: "all 0.2s",
};
