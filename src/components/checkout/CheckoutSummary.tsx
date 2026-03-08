import s from "./CheckoutSummary.module.css";

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
    <div className={s.wrap}>
      <h2 className={s.title}>
        Order Summary
      </h2>
      {items.map((item) => (
        <div
          key={`${item.product.id}-${item.variant.sku}`}
          className={s.itemRow}
        >
          <div className={s.imgWrap}>
            <img
              src={item.product.images[0]}
              alt=""
              className={s.img}
            />
            <span className={s.qtyBadge}>
              {item.quantity}
            </span>
          </div>
          <div className={s.itemInfo}>
            <p className={s.itemName}>{item.product.name}</p>
            <p className={s.itemVariant}>
              {item.variant.size}
              {item.variant.unit}
            </p>
          </div>
          <span className={s.itemPrice}>
            ₹{(item.variant.price * item.quantity).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
      <div className={s.totalsWrap}>
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
          <div key={row.label} className={s.summaryRow}>
            <span className={s.summaryLabel}>{row.label}</span>
            <span className={s.summaryValue}>{row.val}</span>
          </div>
        ))}
        <div className={s.totalRow}>
          <span className={s.totalLabel}>Total</span>
          <span className={s.totalValue}>
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
