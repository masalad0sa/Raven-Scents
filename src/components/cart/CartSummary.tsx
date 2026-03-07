import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { couponsApi } from "../../lib/api";

interface Props {
  subtotal: number;
  shippingFee: number;
  total: number;
  discount: number;
  appliedCoupon: { code: string; pct: number } | null;
  setAppliedCoupon: (c: { code: string; pct: number } | null) => void;
}

export function CartSummary({
  subtotal,
  shippingFee,
  total,
  discount,
  appliedCoupon,
  setAppliedCoupon,
}: Props) {
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await couponsApi.validate(code, subtotal);
      setAppliedCoupon({ code, pct: res.discount_pct });
      sessionStorage.setItem(
        "raven_coupon",
        JSON.stringify({ code, pct: res.discount_pct }),
      );
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(212,175,55,0.15)",
        borderRadius: 8,
        padding: "1.75rem",
        position: "sticky",
        top: 92,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.4rem",
          fontWeight: 500,
          color: "var(--color-text)",
          marginBottom: "1.5rem",
        }}
      >
        Order Summary
      </h2>

      {/* Coupon */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Coupon Code
        </label>
        {appliedCoupon ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              background: "rgba(46, 204, 113, 0.08)",
              border: "1px solid rgba(46, 204, 113, 0.3)",
              borderRadius: 4,
            }}
          >
            <Tag size={14} style={{ color: "var(--color-success)" }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-success)",
              }}
            >
              {appliedCoupon.code} — {appliedCoupon.pct}% off
            </span>
            <button
              onClick={() => {
                setAppliedCoupon(null);
                setCoupon("");
                sessionStorage.removeItem("raven_coupon");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-muted)",
                marginLeft: "auto",
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter code"
              className="input"
              style={{ flex: 1 }}
              onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
            />
            <button
              onClick={applyCoupon}
              disabled={couponLoading}
              className="btn btn-outline"
              style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}
            >
              Apply
            </button>
          </div>
        )}
        {couponError && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-error)",
              marginTop: "0.5rem",
            }}
          >
            {couponError}
          </p>
        )}
      </div>

      {/* Totals */}
      {[
        {
          label: "Subtotal",
          val: `₹${subtotal.toLocaleString("en-IN")}`,
          color: "var(--color-primary)",
        },
        {
          label: "Shipping",
          val: shippingFee === 0 ? "Free" : `₹${shippingFee}`,
          color:
            shippingFee === 0 ? "var(--color-success)" : "var(--color-primary)",
        },
        ...(appliedCoupon
          ? [
              {
                label: `Discount (${appliedCoupon.pct}%)`,
                val: `-₹${discount.toLocaleString("en-IN")}`,
                color: "var(--color-success)",
              },
            ]
          : []),
      ].map((row) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.85rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "var(--color-muted)",
            }}
          >
            {row.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: row.color,
            }}
          >
            {row.val}
          </span>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(212,175,55,0.15)",
          marginBottom: "1.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          Total
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      <Link
        to="/checkout"
        className="btn btn-gold"
        style={{
          width: "100%",
          justifyContent: "center",
          display: "flex",
          textDecoration: "none",
        }}
      >
        Proceed to Checkout →
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        <span style={{ fontSize: "0.85rem" }}>🔒</span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            color: "var(--color-muted)",
          }}
        >
          Secure SSL encrypted checkout
        </span>
      </div>
    </motion.div>
  );
}
