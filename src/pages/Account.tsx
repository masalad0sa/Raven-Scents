import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, ShoppingBag, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import { ProfileTab, AddressesTab, OrdersTab } from "../components/account";

type Tab = "profile" | "addresses" | "orders";

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>("profile");
  const isMobile = useIsMobile();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfileName(data.full_name);
      });
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <>
      <SEO
        title="My Account"
        description="Manage your profile, addresses, and orders at Raven Scents."
      />
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
                {profileName ?? user.email}
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

          {/* Tab Content */}
          {tab === "profile" && <ProfileTab user={user} />}
          {tab === "addresses" && (
            <AddressesTab
              user={user}
              defaultName={profileName}
              defaultPhone={null}
            />
          )}
          {tab === "orders" && <OrdersTab />}
        </div>
      </main>
      <Footer />
    </>
  );
}
