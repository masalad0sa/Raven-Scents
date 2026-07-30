import { useState, useEffect } from "react";
import { ShoppingBag, CheckCircle2, Circle, Package, Truck, Home } from "lucide-react";
import { ordersApi } from "../../lib/api";
import type { Order, OrderItem } from "../../types";
import s from "./OrdersTab.module.css";

// ─── Status pipeline definition ──────────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: "confirmed",   label: "Order Placed", icon: CheckCircle2 },
  { key: "processing",  label: "Processing",   icon: Package      },
  { key: "shipped",     label: "Shipped",       icon: Truck        },
  { key: "delivered",   label: "Delivered",     icon: Home         },
] as const;

type PipelineKey = typeof PIPELINE_STEPS[number]["key"];

/** Returns the index of the current status in the pipeline, or -1 if cancelled */
const pipelineIndex = (status: string): number => {
  const idx = PIPELINE_STEPS.findIndex((step) => step.key === status);
  return idx; // -1 for cancelled / unknown
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getAll()
      .then((data) => setOrders(data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  if (ordersLoading) {
    return (
      <div className={s.loadingWrap}>
        <p className={s.loadingText}>Loading orders…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={s.emptyCard}>
        <ShoppingBag
          size={40}
          color="rgba(212,175,55,0.3)"
          style={{ margin: "0 auto 1rem" }}
        />
        <h3 className={s.emptyTitle}>No Orders Yet</h3>
        <p className={s.emptyText}>
          Your order history will appear here once you place your first order.
        </p>
        <a href="/shop" className={s.shopLink}>
          Shop Now
        </a>
      </div>
    );
  }

  const statusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return s.statusDelivered;
      case "shipped":
        return s.statusShipped;
      case "cancelled":
        return s.statusCancelled;
      default:
        return s.statusDefault; // confirmed / processing
    }
  };

  return (
    <div className={s.orderList}>
      {orders.map((order: Order) => {
        const activeIdx = pipelineIndex(order.status);
        const isCancelled = order.status === "cancelled";

        return (
          <div key={order.id} className={s.orderCard}>
            {/* ── Header row ── */}
            <div className={s.orderHeader}>
              <div className={s.orderMeta}>
                <div>
                  <span className={s.metaLabel}>Order</span>
                  <p className={s.metaValue}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className={s.metaLabel}>Date</span>
                  <p className={s.metaValue}>
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className={s.metaLabel}>Total</span>
                  <p className={s.metaValueGold}>
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <span className={`${s.statusBadge} ${statusClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* ── Item rows ── */}
            <div className={s.orderItems}>
              {order.order_items?.map((item: OrderItem, idx: number) => (
                <div
                  key={idx}
                  className={`${s.orderItem}${
                    idx < (order.order_items?.length ?? 0) - 1
                      ? ` ${s.orderItemBorder}`
                      : ""
                  }`}
                >
                  {item.products?.images?.[0] && (
                    <img
                      src={item.products.images[0]}
                      alt={item.products.name}
                      className={s.itemImg}
                    />
                  )}
                  <div className={s.itemInfo}>
                    <p className={s.itemName}>
                      {item.products?.name ?? "Product"}
                    </p>
                    <p className={s.itemQty}>
                      Qty: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className={s.itemTotal}>
                    ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Coupon row ── */}
            {order.coupon_code && (
              <div className={s.couponRow}>
                <span className={s.couponCode}>Coupon: {order.coupon_code}</span>
                <span className={s.couponDiscount}>
                  −₹{order.discount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* ── Status pipeline ── */}
            {!isCancelled && (
              <div className={s.pipeline}>
                {PIPELINE_STEPS.map((step, i) => {
                  const done    = i <= activeIdx;
                  const active  = i === activeIdx;
                  const isLast  = i === PIPELINE_STEPS.length - 1;
                  const Icon    = step.icon;
                  return (
                    <div key={step.key} className={s.pipelineItem}>
                      {/* connector before this step */}
                      {i !== 0 && (
                        <div
                          className={`${s.pipelineConnector} ${
                            done ? s.pipelineConnectorDone : ""
                          }`}
                        />
                      )}
                      <div
                        className={`${s.pipelineNode} ${
                          active
                            ? s.pipelineNodeActive
                            : done
                            ? s.pipelineNodeDone
                            : s.pipelineNodePending
                        }`}
                        title={step.label}
                      >
                        <Icon size={13} />
                      </div>
                      <span
                        className={`${s.pipelineLabel} ${
                          active
                            ? s.pipelineLabelActive
                            : done
                            ? s.pipelineLabelDone
                            : s.pipelineLabelPending
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Cancelled banner ── */}
            {isCancelled && (
              <div className={s.cancelledBanner}>
                <Circle size={12} /> Order Cancelled
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
