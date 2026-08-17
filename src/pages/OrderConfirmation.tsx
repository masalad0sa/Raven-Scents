import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Package, ArrowRight, Sun, Moon, Home } from "lucide-react";
import { Header, Footer } from "../components/layout";
import s from "./styles/OrderConfirmation.module.css";

export default function OrderConfirmation() {
  const orderId = "RVN" + Math.random().toString(36).substring(2, 11).toUpperCase();

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

  return (
    <>
      <Header />
      <main className={s.main}>
        <div className={s.wrapper}>
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 120 }}
            className={s.checkmark}
          >
            <Check size={36} strokeWidth={2.5} color="#0d0d0d" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className={s.eyebrow}>Order Confirmed</p>
            <h1 className={s.title}>Thank You for Your Order!</h1>
            <p className={s.subtitle}>
              Your fragrance journey begins. We'll send an email confirmation
              with tracking details shortly.
            </p>

            {/* Order Details */}
            <div className={s.detailsBox}>
              {[
                { label: "Order ID", value: orderId },
                { label: "Estimated Delivery", value: "5–7 business days" },
                { label: "Shipping Method", value: "Express Delivery" },
              ].map((row) => (
                <div key={row.label} className={s.detailRow}>
                  <span className={s.detailLabel}>{row.label}</span>
                  <span className={s.detailValue}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Status Steps */}
            <div className={s.statusSteps}>
              {[
                { icon: Check, label: "Order Placed", done: true },
                { icon: Package, label: "Processing", done: false },
                { icon: ArrowRight, label: "Shipped", done: false },
                { icon: Home, label: "Delivered", done: false },
              ].map((step, i) => (
                <div key={i} className={s.statusStep}>
                  <div
                    className={
                      step.done ? s.statusCircleDone : s.statusCirclePending
                    }
                  >
                    <step.icon size={14} />
                  </div>
                  <p
                    className={s.statusLabel}
                    style={{
                      color: step.done
                        ? "var(--color-text)"
                        : "var(--color-muted)",
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            <div className={s.actions}>
              <Link to="/" className="btn btn-primary">
                Back to Home <ArrowRight size={14} />
              </Link>
              <Link to="/shop" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Floating Golden Theme Toggle */}
      <motion.button
        onClick={() => setIsLight((prev) => !prev)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
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
