import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  const { initialize, user } = useAuthStore();
  const { hydrate, syncToSupabase } = useWishlistStore();
  const { hydrate: hydrateCart, syncToSupabase: syncCartToSupabase } =
    useCartStore();
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    initialize().then((unsub) => {
      unsubRef.current = unsub;
    });
    return () => {
      unsubRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (user) {
      syncToSupabase(user.id).then(() => hydrate(user.id));
      syncCartToSupabase(user.id);
    } else {
      hydrate(null);
    }
  }, [user]);

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
    <HelmetProvider>
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
