import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import { CartItemsList, CartSummary } from "../components/cart";
import s from "./styles/Cart.module.css";

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const isMobile = useIsMobile();
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    pct: number;
  } | null>(null);

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

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 299;
  const discount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.pct) / 100)
    : 0;
  const total = subtotal + shippingFee - discount;

  return (
    <>
      <SEO
        title="Your Cart"
        description="Review your cart and proceed to checkout at Raven Scents."
      />
      <Header />
      <main className={s.main}>
        <div className={s.banner}>
          <div className="container">
            <h1 className={s.bannerTitle}>Your Cart</h1>
          </div>
        </div>

        <div className={`${s.content} container`}>
          {items.length === 0 ? (
            <div className={s.emptyState}>
              <ShoppingBag size={64} strokeWidth={1} className={s.emptyIcon} />
              <h2 className={s.emptyTitle}>Your cart is empty</h2>
              <p className={s.emptyText}>Begin your fragrance journey.</p>
              <Link to="/shop" className="btn btn-primary">
                Explore Fragrances
              </Link>
            </div>
          ) : (
            <div className={s.grid}>
              <CartItemsList
                items={items}
                isMobile={isMobile}
                removeItem={removeItem}
                updateQuantity={updateQuantity}
              />
              <CartSummary
                subtotal={subtotal}
                shippingFee={shippingFee}
                total={total}
                discount={discount}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
              />
            </div>
          )}
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
