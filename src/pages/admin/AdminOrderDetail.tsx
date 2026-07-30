import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  User,
  MapPin,
  CreditCard,
  FileText,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { adminOrdersApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import AdminNav from "../../components/admin/AdminNav";
import type { AdminOrderDetail as OrderDetail, OrderStatus } from "../../types";
import s from "./AdminOrderDetail.module.css";
import { motion, AnimatePresence } from "framer-motion";

// ── Status Config ─────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; class: string }
> = {
  pending_payment: { label: "Pending Payment", class: s.statusPending },
  confirmed: { label: "Confirmed", class: s.statusConfirmed },
  processing: { label: "Processing", class: s.statusProcessing },
  shipped: { label: "Shipped", class: s.statusShipped },
  delivered: { label: "Delivered", class: s.statusDelivered },
  cancelled: { label: "Cancelled", class: s.statusCancelled },
  refunded: { label: "Refunded", class: s.statusRefunded },
};

// Order lifecycle for timeline
const STATUS_FLOW: OrderStatus[] = [
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

// Valid next statuses for each status
const NEXT_STATUSES: Record<string, { value: string; label: string }[]> = {
  pending_payment: [
    { value: "confirmed", label: "Confirm Order" },
    { value: "cancelled", label: "Cancel Order" },
  ],
  confirmed: [
    { value: "processing", label: "Start Processing" },
    { value: "cancelled", label: "Cancel Order" },
  ],
  processing: [
    { value: "shipped", label: "Mark as Shipped" },
    { value: "cancelled", label: "Cancel Order" },
  ],
  shipped: [{ value: "delivered", label: "Mark Delivered" }],
  delivered: [],
  cancelled: [{ value: "refunded", label: "Process Refund" }],
  refunded: [],
};

// ── Helpers ───────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

// ── Component ─────────────────────────────────────────────
export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // Notes
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Copy feedback
  const [copied, setCopied] = useState<string | null>(null);

  // Theme support
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("raven-theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.body.classList.add("theme-light");
      localStorage.setItem("raven-theme", "light");
    } else {
      document.body.classList.remove("theme-light");
      localStorage.setItem("raven-theme", "dark");
    }
  }, [isLight]);

  // ── Admin check ────────────────────────────────
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    Promise.resolve(
      supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()
    )
      .then(({ data }) => {
        const admin = data?.is_admin === true;
        setIsAdmin(admin);
        if (!admin) setLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, [user]);

  // ── Load order ─────────────────────────────────
  useEffect(() => {
    if (isAdmin && id) loadOrder();
  }, [isAdmin, id]);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminOrdersApi.getById(id);
      setOrder(data);
      setNotes(data.notes || "");
      setNewStatus("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;
    setUpdating(true);
    try {
      await adminOrdersApi.updateStatus(order.id, newStatus);
      showToast("Status updated successfully");
      await loadOrder();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!order) return;
    setSavingNotes(true);
    try {
      await adminOrdersApi.updateNotes(order.id, notes);
      showToast("Notes saved");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Loading / Error states ─────────────────────
  if (isAdmin === null || loading) {
    return (
      <div className={s.loadingPage}>
        <p className={s.loadingText}>
          {isAdmin === null ? "Checking permissions…" : "Loading order…"}
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={s.loadingPage}>
        <p className={s.loadingText}>Access denied.</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className={s.page}>
        <AdminNav />
        <div className={s.content}>
          <button className={s.backLink} onClick={() => navigate("/admin/orders")}>
            <ArrowLeft size={14} /> Back to Orders
          </button>
          <div className={s.errorBox}>{error}</div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const items = order.order_items || [];
  const addr = order.shipping_addr || order.shipping_address;
  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
  const nextStatuses = NEXT_STATUSES[order.status] || [];

  // Calculate subtotal from items
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price || 0) * (item.quantity || 1),
    0
  );
  const shippingFee = subtotal >= 5000 ? 0 : 299;
  const discount = order.discount || 0;

  // Timeline: determine which steps are done
  const currentFlowIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
  const isCancelledOrRefunded = ["cancelled", "refunded"].includes(order.status);

  return (
    <div className={s.page}>
      <AdminNav />

      <div className={s.content}>
        {/* Back link */}
        <button className={s.backLink} onClick={() => navigate("/admin/orders")}>
          <ArrowLeft size={14} /> Back to Orders
        </button>

        {/* Error banner */}
        {error && <div className={s.errorBox}>{error}</div>}

        {/* Header */}
        <div className={s.header}>
          <div className={s.headerLeft}>
            <h1 className={s.orderId}>
              Order <span className={s.orderIdHash}>#{order.id.slice(0, 8)}</span>
            </h1>
            <p className={s.orderMeta}>
              Placed on {formatDate(order.created_at)}
              {order.coupon_code && (
                <>
                  {" · "}
                  Coupon: <strong>{order.coupon_code}</strong>
                </>
              )}
            </p>
          </div>
          <div className={s.headerRight}>
            <span className={`${s.statusBadgeLg} ${sc.class}`}>
              {sc.label}
            </span>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className={s.grid}>
          {/* ═══ LEFT COLUMN ═══ */}
          <div>
            {/* Order Items */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.cardTitle}>
                  Order Items ({items.length})
                </span>
              </div>
              <div className={s.cardBody}>
                {items.map((item, i) => {
                  const img = item.products?.images?.[0];
                  const variant = (item as any).product_variants;
                  return (
                    <div key={i} className={s.itemRow}>
                      {img ? (
                        <img src={img} alt="" className={s.itemImage} />
                      ) : (
                        <div className={s.itemImagePlaceholder} />
                      )}
                      <div className={s.itemDetails}>
                        <p className={s.itemName}>
                          {item.products?.name || "Unknown Product"}
                        </p>
                        <p className={s.itemVariant}>
                          {variant
                            ? `${variant.size}${variant.unit}`
                            : item.variant_sku}
                          {" · SKU: "}
                          {variant?.sku || item.variant_sku}
                        </p>
                      </div>
                      <span className={s.itemQty}>×{item.quantity}</span>
                      <span className={s.itemPrice}>
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className={s.totalsWrap}>
                <div className={s.totalRow}>
                  <span className={s.totalLabel}>Subtotal</span>
                  <span className={s.totalValue}>{formatCurrency(subtotal)}</span>
                </div>
                <div className={s.totalRow}>
                  <span className={s.totalLabel}>Shipping</span>
                  <span className={s.totalValue}>
                    {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className={s.totalRow}>
                    <span className={s.totalLabel}>
                      Discount
                      {order.coupon_code && ` (${order.coupon_code})`}
                    </span>
                    <span className={s.totalDiscount}>
                      −{formatCurrency(discount)}
                    </span>
                  </div>
                )}
                <div className={s.grandTotalRow}>
                  <span className={s.grandTotalLabel}>Total</span>
                  <span className={s.grandTotalValue}>
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.cardTitle}>Order Timeline</span>
              </div>
              <div className={s.cardBody}>
                <div className={s.timeline}>
                  {STATUS_FLOW.map((status, i) => {
                    const config = STATUS_CONFIG[status];
                    let dotClass: string;

                    if (isCancelledOrRefunded) {
                      dotClass =
                        i <= currentFlowIndex
                          ? s.timelineDotDone
                          : s.timelineDotPending;
                    } else if (i < currentFlowIndex) {
                      dotClass = s.timelineDotDone;
                    } else if (i === currentFlowIndex) {
                      dotClass = s.timelineDotActive;
                    } else {
                      dotClass = s.timelineDotPending;
                    }

                    return (
                      <div key={status} className={s.timelineItem}>
                        <div className={dotClass} />
                        <p
                          className={
                            i <= currentFlowIndex
                              ? s.timelineLabel
                              : s.timelineMuted
                          }
                        >
                          {config.label}
                        </p>
                        {i === 0 && (
                          <p className={s.timelineDate}>
                            {formatDateTime(order.created_at)}
                          </p>
                        )}
                        {i === currentFlowIndex && i > 0 && order.updated_at && (
                          <p className={s.timelineDate}>
                            {formatDateTime(order.updated_at)}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Show cancelled/refunded as extra timeline item */}
                  {isCancelledOrRefunded && (
                    <div className={s.timelineItem}>
                      <div className={s.timelineDotActive} />
                      <p className={s.timelineLabel}>
                        {STATUS_CONFIG[order.status]?.label || order.status}
                      </p>
                      {order.updated_at && (
                        <p className={s.timelineDate}>
                          {formatDateTime(order.updated_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Notes */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.cardTitle}>
                  <FileText
                    size={13}
                    style={{ verticalAlign: "middle", marginRight: 6 }}
                  />
                  Seller Notes
                </span>
              </div>
              <div className={s.cardBody}>
                <textarea
                  className={s.notesTextarea}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this order…"
                />
                <div className={s.notesSaveRow}>
                  <button
                    className={s.notesSaveBtn}
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes ? "Saving…" : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div>
            {/* Customer Info */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.cardTitle}>
                  <User
                    size={13}
                    style={{ verticalAlign: "middle", marginRight: 6 }}
                  />
                  Customer
                </span>
              </div>
              <div className={s.cardBody}>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Name</span>
                  <span className={s.infoValue}>
                    {order.customer?.full_name || addr?.full_name || "Guest"}
                  </span>
                </div>
                {order.customer?.email && (
                  <div className={s.infoRow}>
                    <span className={s.infoLabel}>Email</span>
                    <span className={s.infoValue}>{order.customer.email}</span>
                  </div>
                )}
                {addr?.phone && (
                  <div className={s.infoRow}>
                    <span className={s.infoLabel}>Phone</span>
                    <span className={s.infoValue}>{addr.phone}</span>
                  </div>
                )}
                {order.customer && (
                  <>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Total Orders</span>
                      <span className={s.infoValue}>
                        {order.customer.totalOrders}
                      </span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Lifetime Value</span>
                      <span className={s.infoValue}>
                        {formatCurrency(order.customer.totalSpend)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.cardTitle}>
                  <MapPin
                    size={13}
                    style={{ verticalAlign: "middle", marginRight: 6 }}
                  />
                  Shipping Address
                </span>
                {addr && (
                  <button
                    className={s.infoCopyBtn}
                    onClick={() =>
                      copyToClipboard(
                        `${addr.full_name}\n${addr.address_line1}\n${addr.city}, ${addr.state} ${addr.pincode}\nPhone: ${addr.phone}`,
                        "address"
                      )
                    }
                    title="Copy address"
                  >
                    {copied === "address" ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                )}
              </div>
              <div className={s.cardBody}>
                {addr ? (
                  <>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Name</span>
                      <span className={s.infoValue}>{addr.full_name}</span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Address</span>
                      <span className={s.infoValue}>{addr.address_line1}</span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>City</span>
                      <span className={s.infoValue}>{addr.city}</span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>State</span>
                      <span className={s.infoValue}>{addr.state}</span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Pincode</span>
                      <span className={s.infoValue}>{addr.pincode}</span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Phone</span>
                      <span className={s.infoValue}>{addr.phone}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ color: "#666", fontSize: "0.82rem" }}>
                    No shipping address on record.
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.cardTitle}>
                  <CreditCard
                    size={13}
                    style={{ verticalAlign: "middle", marginRight: 6 }}
                  />
                  Payment
                </span>
              </div>
              <div className={s.cardBody}>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Amount</span>
                  <span className={s.infoValue}>
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Status</span>
                  <span className={s.infoValue}>
                    {order.status === "pending_payment"
                      ? "Awaiting payment"
                      : "Paid"}
                  </span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Order ID</span>
                  <span className={s.infoValue}>
                    {order.id.slice(0, 12)}…
                    <button
                      className={s.infoCopyBtn}
                      onClick={() => copyToClipboard(order.id, "orderId")}
                    >
                      {copied === "orderId" ? (
                        <Check size={11} />
                      ) : (
                        <Copy size={11} />
                      )}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            {nextStatuses.length > 0 && (
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>
                    <ChevronRight
                      size={13}
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                    />
                    Update Status
                  </span>
                </div>
                <div className={s.cardBody}>
                  <div className={s.statusUpdateRow}>
                    <select
                      className={s.statusSelect}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="">Select action…</option>
                      {nextStatuses.map((ns) => (
                        <option key={ns.value} value={ns.value}>
                          {ns.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className={s.updateBtn}
                      onClick={handleStatusUpdate}
                      disabled={!newStatus || updating}
                    >
                      {updating ? "Updating…" : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className={s.toast}>{toast}</div>}

      {/* Floating golden theme toggle */}
      <motion.button
        onClick={() => setIsLight((prev) => !prev)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 999,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "rgba(212, 175, 55, 0.12)",
          border: "1px solid var(--color-gold)",
          color: "var(--color-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          outline: "none",
        }}
        title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isLight ? "light" : "dark"}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex" }}
          >
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
