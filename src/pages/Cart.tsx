import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { useCartStore } from "../store/cartStore";
import { useIsMobile } from "../hooks/useIsMobile";
import { SEO } from "../components/seo/SEO";
import { CartItemsList } from "../components/cart/CartItemsList";
import { CartSummary } from "../components/cart/CartSummary";

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
      <main
        style={{
          paddingTop: 72,
          background: "var(--color-ivory)",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            padding: "2rem 0",
            borderBottom: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div className="container">
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 300,
                color: "var(--color-primary)",
              }}
            >
              Your Cart
            </h1>
          </div>
        </div>

        <div
          className="container"
          style={{ padding: isMobile ? "1.5rem 1rem" : "3rem 2rem" }}
        >
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <ShoppingBag
                size={64}
                strokeWidth={1}
                style={{
                  color: "rgba(212,175,55,0.5)",
                  marginBottom: "1.5rem",
                }}
              />
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  color: "var(--color-text)",
                  marginBottom: "0.75rem",
                }}
              >
                Your cart is empty
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-muted)",
                  marginBottom: "2rem",
                }}
              >
                Begin your fragrance journey.
              </p>
              <Link to="/shop" className="btn btn-primary">
                Explore Fragrances
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 380px",
                gap: isMobile ? "1.5rem" : "2.5rem",
                alignItems: "start",
              }}
            >
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
