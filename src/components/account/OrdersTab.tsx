import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { ordersApi } from "../../lib/api";

export function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
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
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
          Loading orders…
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(212,175,55,0.1)",
          borderRadius: 10,
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <ShoppingBag size={40} color="rgba(212,175,55,0.3)" style={{ margin: "0 auto 1rem" }} />
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.3rem",
            color: "var(--color-text)",
            margin: "0 0 0.5rem",
          }}
        >
          No Orders Yet
        </h3>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", margin: "0 0 2rem" }}>
          Your order history will appear here once you place your first order.
        </p>
        <a
          href="/shop"
          style={{
            display: "inline-block",
            background: "var(--color-gold)",
            color: "#0d0d0d",
            textDecoration: "none",
            borderRadius: 6,
            padding: "0.75rem 2rem",
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Shop Now
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {orders.map((order: any) => (
        <div
          key={order.id}
          style={{
            background: "#111",
            border: "1px solid rgba(212,175,55,0.1)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Order header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid rgba(212,175,55,0.08)",
              background: "rgba(212,175,55,0.03)",
            }}
          >
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Order
                </span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text)", margin: "0.15rem 0 0" }}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Date
                </span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text)", margin: "0.15rem 0 0" }}>
                  {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Total
                </span>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-gold)", margin: "0.15rem 0 0", fontWeight: 600 }}>
                  ${(order.total / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "0.3rem 0.75rem",
                borderRadius: 20,
                fontSize: "0.6rem",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background:
                  order.status === "delivered"
                    ? "rgba(74,222,128,0.12)"
                    : order.status === "shipped"
                      ? "rgba(96,165,250,0.12)"
                      : order.status === "cancelled"
                        ? "rgba(248,113,113,0.12)"
                        : "rgba(212,175,55,0.12)",
                color:
                  order.status === "delivered"
                    ? "#4ade80"
                    : order.status === "shipped"
                      ? "#60a5fa"
                      : order.status === "cancelled"
                        ? "#f87171"
                        : "var(--color-gold)",
              }}
            >
              {order.status}
            </span>
          </div>

          {/* Order items */}
          <div style={{ padding: "1rem 1.25rem" }}>
            {order.order_items?.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.6rem 0",
                  borderBottom: idx < order.order_items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                {item.products?.images?.[0] && (
                  <img
                    src={item.products.images[0]}
                    alt={item.products.name}
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,175,55,0.1)" }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text)", margin: 0 }}>
                    {item.products?.name ?? "Product"}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0" }}>
                    Qty: {item.quantity} × ${(item.unit_price / 100).toFixed(2)}
                  </p>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text)", margin: 0 }}>
                  ${((item.quantity * item.unit_price) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Coupon / discount row */}
          {order.coupon_code && (
            <div style={{ padding: "0 1.25rem 0.75rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                Coupon: {order.coupon_code}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "#4ade80" }}>
                −${(order.discount / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
