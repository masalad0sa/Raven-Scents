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
import s from "./Header.module.css";

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
        className={s.header}
        style={{
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          background: scrolled ? "rgba(13, 13, 13, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(212, 175, 55, 0.15)"
            : "none",
        }}
      >
        <div className={`${s.headerInner} container`}>
          {/* Logo */}
          <Link to="/" className={s.logo}>
            <span className={s.logoText}>
              RAVEN
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className={s.desktopNav}>
            {[
              { label: "Shop", to: "/shop" },
              { label: "Collections", to: "/shop?category=eau-de-parfum" },
              { label: "About", to: "/about" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={s.navLink}
                style={{
                  borderBottom:
                    location.pathname === item.to.split("?")[0]
                      ? "1px solid var(--color-gold)"
                      : "1px solid transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className={s.actions}>
            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className={s.wishlistLink}
            >
              <Heart
                size={18}
                fill={wishlistCount > 0 ? "currentColor" : "none"}
              />
              {wishlistCount > 0 && (
                <span className={s.badge}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={toggleDrawer}
              className={s.cartBtn}
              id="cart-btn"
              aria-label="Open cart"
            >
              <ShoppingBag size={14} />
              {totalItems > 0 ? (
                <span className={s.cartBadge}>
                  {totalItems}
                </span>
              ) : (
                "Cart"
              )}
            </button>

            {/* Auth: Avatar dropdown or Sign In */}
            {user ? (
              <div ref={userMenuRef} className={s.userMenuWrap}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={s.userMenuBtn}
                  aria-label="Account menu"
                >
                  <span className={s.userAvatar}>
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
                      className={s.dropdown}
                    >
                      <p className={s.dropdownEmail}>
                        {user.email}
                      </p>
                      {[
                        { label: "My Account", to: "/account" },
                        { label: "Wishlist", to: "/wishlist" },
                      ].map(({ label, to }) => (
                        <Link
                          key={to}
                          to={to}
                          className={s.dropdownLink}
                        >
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className={s.logoutBtn}
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
                className={s.signInLink}
              >
                <User size={13} />
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={s.mobileMenuBtn}
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
            className={s.mobileNav}
          >
            {[
              { label: "Shop", to: "/shop" },
              { label: "Collections", to: "/shop" },
              { label: "About", to: "/about" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={s.mobileNavLink}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
