interface CartItem {
  product: { id: string; images: string[]; name: string };
  variant: { sku: string; price: number; size: number; unit: string };
  quantity: number;
}

interface Props {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  savedCoupon: { code: string; pct: number } | null;
}

export function CheckoutSummary({
  items,
  subtotal,
  shippingFee,
  discount,
  total,
  savedCoupon,
}: Props) {
  return (
    <div
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
          fontSize: "1.25rem",
          fontWeight: 500,
          color: "var(--color-text)",
          marginBottom: "1.25rem",
        }}
      >
        Order Summary
      </h2>
      {items.map((item) => (
        <div
          key={`${item.product.id}-${item.variant.sku}`}
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={item.product.images[0]}
              alt=""
              style={{
                width: 52,
                height: 52,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: "var(--color-gold)",
                color: "#0d0d0d",
                borderRadius: "50%",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6rem",
                fontWeight: 700,
              }}
            >
              {item.quantity}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              {item.product.name}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                color: "var(--color-muted)",
              }}
            >
              {item.variant.size}
              {item.variant.unit}
            </p>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--color-gold)",
            }}
          >
            ₹{(item.variant.price * item.quantity).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
      <div
        style={{
          borderTop: "1px solid rgba(212,175,55,0.15)",
          paddingTop: "1rem",
          marginTop: "0.5rem",
        }}
      >
        {[
          { label: "Subtotal", val: `₹${subtotal.toLocaleString("en-IN")}` },
          {
            label: "Shipping",
            val: shippingFee === 0 ? "Free" : `₹${shippingFee}`,
          },
          ...(savedCoupon
            ? [
                {
                  label: `Discount (${savedCoupon.code} ${savedCoupon.pct}%)`,
                  val: `-₹${discount.toLocaleString("en-IN")}`,
                },
              ]
            : []),
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.6rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-muted)",
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-text)",
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
            paddingTop: "0.75rem",
            borderTop: "1px solid rgba(212,175,55,0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            Total
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--color-gold)",
            }}
          >
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
