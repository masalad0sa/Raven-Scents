import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { getTotalItems, toggleDrawer } = useCartStore();
  const { user, logout } = useAuthStore();
  const { ids: wishlistIds } = useWishlistStore();
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = getTotalItems();
  const wishlistCount = wishlistIds.length;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 0);
      if (y > lastScrollY.current && y > 72) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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
          transition:
            "transform 0.35s ease, background 0.4s ease, border-color 0.4s ease",
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
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
            style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
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
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
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
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "none",
                color: "var(--color-text)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--color-gold)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--color-text)")
              }
            >
              <Heart
                size={18}
                fill={wishlistCount > 0 ? "currentColor" : "none"}
              />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    background: "var(--color-gold)",
                    color: "#0d0d0d",
                    borderRadius: "50%",
                    width: 14,
                    height: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.5rem",
                    fontWeight: 700,
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
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

            {/* Auth: Avatar dropdown or Sign In */}
            {user ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: "50px",
                    padding: "0.35rem 0.85rem 0.35rem 0.5rem",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label="Account menu"
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(212,175,55,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={13} color="var(--color-gold)" />
                  </span>
                  <ChevronDown size={12} color="var(--color-text-muted)" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        background: "#111",
                        border: "1px solid rgba(212,175,55,0.2)",
                        borderRadius: 10,
                        padding: "0.5rem",
                        minWidth: 180,
                        zIndex: 200,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          padding: "0.4rem 0.75rem 0.75rem",
                          margin: 0,
                          borderBottom: "1px solid rgba(212,175,55,0.1)",
                        }}
                      >
                        {user.email}
                      </p>
                      {[
                        { label: "My Account", to: "/account" },
                        { label: "Wishlist", to: "/wishlist" },
                      ].map(({ label, to }) => (
                        <Link
                          key={to}
                          to={to}
                          style={{
                            display: "block",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--color-text)",
                            textDecoration: "none",
                            padding: "0.6rem 0.75rem",
                            borderRadius: 6,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(212,175,55,0.08)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "none")
                          }
                        >
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          width: "100%",
                          background: "none",
                          border: "none",
                          borderTop: "1px solid rgba(212,175,55,0.1)",
                          borderRadius: 0,
                          padding: "0.6rem 0.75rem",
                          color: "#f87171",
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginTop: "0.25rem",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "rgba(248,113,113,0.07)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "none")
                        }
                      >
                        <LogOut size={12} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "none",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderRadius: "50px",
                  padding: "0.45rem 1rem",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--color-gold)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-gold)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(212,175,55,0.25)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-text)";
                }}
              >
                <User size={13} />
                Sign In
              </Link>
            )}

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
