import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getTotalItems, toggleDrawer } = useCartStore();
  const location = useLocation();
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isDark = !scrolled && location.pathname === "/";

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "all 0.4s ease",
          background: scrolled ? "rgba(13, 13, 13, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(212, 175, 55, 0.15)"
            : "none",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 72,
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "var(--color-gold)",
                letterSpacing: "0.05em",
              }}
            >
              RAVEN
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}
            className="desktop-nav"
          >
            {[
              { label: "Shop", to: "/shop" },
              { label: "Collections", to: "/shop?category=eau-de-parfum" },
              { label: "About", to: "/about" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom:
                    location.pathname === item.to.split("?")[0]
                      ? "1px solid var(--color-gold)"
                      : "1px solid transparent",
                  paddingBottom: "2px",
                  transition: "border-color 0.25s",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={toggleDrawer}
              style={{
                background: "var(--color-gold)",
                color: "#0d0d0d",
                border: "none",
                borderRadius: "50px",
                padding: "0.5rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                transition: "all 0.25s ease",
              }}
              id="cart-btn"
              aria-label="Open cart"
            >
              <ShoppingBag size={14} />
              {totalItems > 0 ? (
                <span
                  style={{
                    background: "#0d0d0d",
                    color: "var(--color-gold)",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                  }}
                >
                  {totalItems}
                </span>
              ) : (
                "Cart"
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text)",
                display: "none",
              }}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 72,
              left: 0,
              right: 0,
              background: "var(--color-ivory)",
              zIndex: 99,
              padding: "2rem",
              borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {[
              { label: "Shop", to: "/shop" },
              { label: "Collections", to: "/shop" },
              { label: "About", to: "/about" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
