import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Package, ArrowRight } from "lucide-react";
import { Header, Footer } from "../components/layout";
import s from "./styles/OrderConfirmation.module.css";

export default function OrderConfirmation() {
  const orderId = "RVN" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <>
      <Header />
      <main className={s.main}>
        <div className={s.wrapper}>
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 120 }}
            className={s.checkmark}
          >
            <Check size={36} strokeWidth={2.5} color="#0d0d0d" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className={s.eyebrow}>Order Confirmed</p>
            <h1 className={s.title}>Thank You for Your Order!</h1>
            <p className={s.subtitle}>
              Your fragrance journey begins. We'll send an email confirmation
              with tracking details shortly.
            </p>

            {/* Order Details */}
            <div className={s.detailsBox}>
              {[
                { label: "Order ID", value: orderId },
                { label: "Estimated Delivery", value: "5–7 business days" },
                { label: "Shipping Method", value: "Express Delivery" },
              ].map((row) => (
                <div key={row.label} className={s.detailRow}>
                  <span className={s.detailLabel}>{row.label}</span>
                  <span className={s.detailValue}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Status Steps */}
            <div className={s.statusSteps}>
              {[
                { icon: "✓", label: "Order Placed", done: true },
                { icon: Package, label: "Processing", done: false },
                { icon: "→", label: "Shipped", done: false },
                { icon: "🏠", label: "Delivered", done: false },
              ].map((step, i) => (
                <div key={i} className={s.statusStep}>
                  <div
                    className={
                      step.done ? s.statusCircleDone : s.statusCirclePending
                    }
                  >
                    {typeof step.icon === "string" ? (
                      step.icon
                    ) : (
                      <Package size={14} />
                    )}
                  </div>
                  <p
                    className={s.statusLabel}
                    style={{
                      color: step.done
                        ? "var(--color-text)"
                        : "var(--color-muted)",
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            <div className={s.actions}>
              <Link to="/" className="btn btn-primary">
                Back to Home <ArrowRight size={14} />
              </Link>
              <Link to="/shop" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
