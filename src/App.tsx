import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import { HelmetProvider } from "react-helmet-async";
import { CustomCursor } from "./components/effects/CustomCursor";
import { GrainOverlay } from "./components/effects/GrainOverlay";
import { CartDrawer } from "./components/layout/CartDrawer";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { useWishlistStore } from "./store/wishlistStore";
import { useCartStore } from "./store/cartStore";
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
      syncCartToSupabase(user.id).then(() => hydrateCart(user.id));
    } else {
      hydrate(null);
    }
  }, [user]);

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
