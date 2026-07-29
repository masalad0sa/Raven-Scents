import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { couponsApi } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import s from "./CartSummary.module.css";

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
  const { user } = useAuthStore();
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<{ code: string; discount_pct: number }[]>([]);

  useEffect(() => {
    const fetchCouponsAndCheckFirstOrder = async () => {
      try {
        // Fetch active coupons from Supabase
        const { data: couponsData, error: couponsErr } = await supabase
          .from("coupons")
          .select("code, discount_pct")
          .eq("is_active", true);

        if (couponsErr) throw couponsErr;
        
        let codes = couponsData || [];

        // If user is logged in, check if they have completed orders
        if (user) {
          const { count, error: ordersErr } = await supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .not("status", "in", '("cancelled","pending_payment")');

          if (!ordersErr && count && count > 0) {
            // User has placed orders before, filter out WELCOME15!
            codes = codes.filter((c: any) => c.code.toUpperCase() !== "WELCOME15");
          }
        }

        setAvailableCoupons(codes);
      } catch (err) {
        console.error("Error loading coupons:", err);
      }
    };

    fetchCouponsAndCheckFirstOrder();
  }, [user]);

  const applyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride || coupon).trim().toUpperCase();
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
    } catch (err: unknown) {
      setCouponError(
        err instanceof Error ? err.message : "Invalid coupon code",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className={s.wrap}
    >
      <h2 className={s.title}>Order Summary</h2>

      {/* Coupon */}
      <div className={s.couponSection}>
        <label className={s.couponLabel}>Coupon Code</label>
        {appliedCoupon ? (
          <div className={s.couponApplied}>
            <Tag size={14} style={{ color: "var(--color-success)" }} />
            <span className={s.couponText}>
              {appliedCoupon.code} — {appliedCoupon.pct}% off
            </span>
            <button
              onClick={() => {
                setAppliedCoupon(null);
                setCoupon("");
                sessionStorage.removeItem("raven_coupon");
              }}
              className={s.couponRemove}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={s.couponInputRow}>
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
              onClick={() => applyCoupon()}
              disabled={couponLoading}
              className="btn btn-outline"
              style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}
            >
              Apply
            </button>
          </div>
        )}
        {couponError && <p className={s.couponError}>{couponError}</p>}

        {/* Available Coupons list */}
        {availableCoupons.length > 0 && !appliedCoupon && (
          <div className={s.availableCoupons}>
            <span className={s.availableTitle}>Available Coupons (click to apply):</span>
            <div className={s.couponTags}>
              {availableCoupons.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className={s.couponTagBtn}
                  onClick={() => {
                    setCoupon(c.code);
                    applyCoupon(c.code);
                  }}
                >
                  {c.code} ({c.discount_pct}%)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Totals */}
      {[
        {
          label: "Subtotal",
          val: `₹${subtotal.toLocaleString("en-IN")}`,
          color: "var(--color-text)",
        },
        {
          label: "Shipping",
          val: shippingFee === 0 ? "Free" : `₹${shippingFee}`,
          color:
            shippingFee === 0 ? "var(--color-success)" : "var(--color-text)",
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
        <div key={row.label} className={s.summaryRow}>
          <span className={s.summaryLabel}>{row.label}</span>
          <span className={s.summaryValue} style={{ color: row.color }}>
            {row.val}
          </span>
        </div>
      ))}

      <div className={s.totalRow}>
        <span className={s.totalLabel}>Total</span>
        <span className={s.totalValue}>₹{total.toLocaleString("en-IN")}</span>
      </div>

      <Link to="/checkout" className={`btn btn-gold ${s.checkoutLink}`}>
        Proceed to Checkout →
      </Link>

      <div className={s.secureRow}>
        <span style={{ fontSize: "0.85rem" }}>🔒</span>
        <span className={s.secureText}>Secure SSL encrypted checkout</span>
      </div>
    </motion.div>
  );
}
