import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { CustomCursor } from "./components/effects/CustomCursor";
import { GrainOverlay } from "./components/effects/GrainOverlay";
import { CartDrawer } from "./components/layout/CartDrawer";
import { useAuthStore } from "./store/authStore";
import { useWishlistStore } from "./store/wishlistStore";
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

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      syncToSupabase(user.id).then(() => hydrate(user.id));
    } else {
      hydrate(null);
    }
  }, [user]);

  return (
    <BrowserRouter>
      <CustomCursor />
      <GrainOverlay />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin" element={<AdminProducts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
