import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, ShoppingBag, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import { ProfileTab, AddressesTab, OrdersTab } from "../components/account";
import s from "./styles/Account.module.css";

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
      <main className={s.main}>
        <div className={`${s.narrow} container`}>
          {/* Page header */}
          <div className={s.header}>
            <div>
              <p className={s.eyebrow}>My Account</p>
              <h1 className={s.title}>{profileName ?? user.email}</h1>
            </div>
            <button onClick={handleLogout} className={s.logoutBtn}>
              <LogOut size={13} />
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className={s.tabs}>
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
                className={tab === id ? s.tabBtnActive : s.tabBtn}
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
