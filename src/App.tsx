import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { useAuthStore } from "./store/authStore";
import { useWishlistStore } from "./store/wishlistStore";
import { useCartStore } from "./store/cartStore";

import { CustomCursor, GrainOverlay } from "./components/effects";
import { CartDrawer } from "./components/layout";
import { ProtectedRoute } from "./components/auth";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * AppContent is defined OUTSIDE of App so that React sees a stable component
 * identity across renders. Previously it was a nested function inside App,
 * which meant every App render created a brand-new component type — causing
 * React to unmount + remount the entire tree on every render (infinite loop).
 */
function AppContent() {
  const { initialize, user } = useAuthStore();
  const { hydrate, syncToSupabase } = useWishlistStore();
  const { hydrate: hydrateCart, syncToSupabase: syncCartToSupabase } =
    useCartStore();
  const unsubRef = useRef<(() => void) | null>(null);

  const location = useLocation();
  const [cartNoticeVisible, setCartNoticeVisible] = useState(false);

  useEffect(() => {
    const state = location.state as { cartMerged?: boolean } | null;
    if (state?.cartMerged) {
      setCartNoticeVisible(true);
      const timer = window.setTimeout(
        () => setCartNoticeVisible(false),
        4000,
      );
      window.history.replaceState({}, document.title);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [location.state]);

  useEffect(() => {
    initialize().then((unsub) => {
      unsubRef.current = unsub;
    });
    return () => {
      unsubRef.current?.();
    };
  }, [initialize]);

  useEffect(() => {
    if (user) {
      syncToSupabase(user.id).then(() => hydrate(user.id));
      // Merge guest cart with the signed-in user's cart, then let the cart
      // store sync effect persist the merged result.
      hydrateCart(user.id);
    } else {
      hydrate(null);
    }
  }, [user, syncToSupabase, hydrate, hydrateCart]);

  // Sync cart to Supabase whenever items change (for logged-in users)
  useEffect(() => {
    if (!user) return;

    let prevItems = useCartStore.getState().items;

    const unsubscribe = useCartStore.subscribe((state) => {
      if (state.items !== prevItems) {
        prevItems = state.items;
        syncCartToSupabase(user.id);
      }
    });

    return () => unsubscribe();
  }, [user, syncCartToSupabase]);

  // Listen for cart changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "raven-cart" && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          if (newState.state?.items) {
            useCartStore.setState({ items: newState.state.items });
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <>
      <ScrollToTop />
      {cartNoticeVisible && (
        <div
          style={{
            position: "fixed",
            right: "1.25rem",
            bottom: "1.25rem",
            zIndex: 60,
            maxWidth: "22rem",
            borderRadius: "1rem",
            border: "1px solid rgba(196, 159, 89, 0.35)",
            background: "rgba(19, 16, 12, 0.92)",
            color: "#f5efe4",
            padding: "0.9rem 1rem",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(10px)",
          }}
        >
          We merged your saved cart with your current cart.
        </div>
      )}
      <CustomCursor />
      <GrainOverlay />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <ProtectedRoute>
              <AdminOrderDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;

