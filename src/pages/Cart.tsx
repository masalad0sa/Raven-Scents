import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
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
              <ShoppingBag
                size={64}
                strokeWidth={1}
                className={s.emptyIcon}
              />
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
    </>
  );
}
