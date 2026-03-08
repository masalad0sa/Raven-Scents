import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { ordersApi } from "../../lib/api";
import type { Order, OrderItem } from "../../types";
import s from "./OrdersTab.module.css";

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
        return s.statusDefault;
    }
  };

  return (
    <div className={s.orderList}>
      {orders.map((order: Order) => (
        <div key={order.id} className={s.orderCard}>
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
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className={s.metaLabel}>Total</span>
                <p className={s.metaValueGold}>
                  ${(order.total / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <span className={`${s.statusBadge} ${statusClass(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className={s.orderItems}>
            {order.order_items?.map((item: OrderItem, idx: number) => (
              <div
                key={idx}
                className={`${s.orderItem}${idx < order.order_items.length - 1 ? ` ${s.orderItemBorder}` : ""}`}
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
                    Qty: {item.quantity} × ${(item.unit_price / 100).toFixed(2)}
                  </p>
                </div>
                <p className={s.itemTotal}>
                  ${((item.quantity * item.unit_price) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {order.coupon_code && (
            <div className={s.couponRow}>
              <span className={s.couponCode}>Coupon: {order.coupon_code}</span>
              <span className={s.couponDiscount}>
                −${(order.discount / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
