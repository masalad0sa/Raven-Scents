import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, ShoppingBag, LogOut, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("raven-theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.body.classList.add("theme-light");
      localStorage.setItem("raven-theme", "light");
    } else {
      document.body.classList.remove("theme-light");
      localStorage.setItem("raven-theme", "dark");
    }
    return () => {
      document.body.classList.remove("theme-light");
    };
  }, [isLight]);

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
          {tab === "profile" && (
            <ProfileTab user={{ id: user.id, email: user.email ?? "" }} />
          )}
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

      {/* Floating golden theme toggle */}
      <motion.button
        onClick={() => setIsLight((prev) => !prev)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 999,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "rgba(212, 175, 55, 0.12)",
          border: "1px solid var(--color-gold)",
          color: "var(--color-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          outline: "none",
        }}
        title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isLight ? "light" : "dark"}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex" }}
          >
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
