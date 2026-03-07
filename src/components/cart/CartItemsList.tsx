import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus } from "lucide-react";

interface CartItem {
  product: {
    id: string;
    slug: string;
    images: string[];
    name: string;
    brand: string;
  };
  variant: { sku: string; price: number; size: number; unit: string };
  quantity: number;
}

interface Props {
  items: CartItem[];
  isMobile: boolean;
  removeItem: (productId: string, sku: string) => void;
  updateQuantity: (productId: string, sku: string, qty: number) => void;
}

export function CartItemsList({
  items,
  isMobile,
  removeItem,
  updateQuantity,
}: Props) {
  return (
    <div>
      {!isMobile && (
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            padding: "0 0 1rem",
            borderBottom: "1px solid rgba(212,175,55,0.15)",
            display: "grid",
            gridTemplateColumns: "2.5fr 1fr 1fr 1fr auto",
            gap: "1rem",
          }}
        >
          <span>Product</span>
          <span>Size</span>
          <span>Price</span>
          <span>Qty</span>
          <span></span>
        </div>
      )}

      {items.map((item) => (
        <motion.div
          key={`${item.product.id}-${item.variant.sku}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={
            isMobile
              ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid rgba(212,175,55,0.15)",
                }
              : {
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1fr 1fr 1fr auto",
                  gap: "1rem",
                  alignItems: "center",
                  padding: "1.5rem 0",
                  borderBottom: "1px solid rgba(212,175,55,0.15)",
                }
          }
        >
          {/* Product */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link to={`/product/${item.product.slug}`}>
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                style={{
                  width: isMobile ? 64 : 72,
                  height: isMobile ? 64 : 72,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            </Link>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginBottom: "0.2rem",
                }}
              >
                {item.product.brand}
              </p>
              <Link to={`/product/${item.product.slug}`}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    fontWeight: 500,
                    color: "var(--color-primary)",
                  }}
                >
                  {item.product.name}
                </h3>
              </Link>
              {isMobile && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-muted)",
                    marginTop: "0.15rem",
                  }}
                >
                  {item.variant.size}
                  {item.variant.unit} · ₹
                  {item.variant.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => removeItem(item.product.id, item.variant.sku)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(212,175,55,0.5)",
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {!isMobile && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-muted)",
              }}
            >
              {item.variant.size}
              {item.variant.unit}
            </span>
          )}
          {!isMobile && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--color-primary)",
              }}
            >
              ₹{item.variant.price.toLocaleString("en-IN")}
            </span>
          )}

          {isMobile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <QtyControl item={item} updateQuantity={updateQuantity} />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--color-gold)",
                }}
              >
                ₹{(item.variant.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ) : (
            <>
              <QtyControl item={item} updateQuantity={updateQuantity} />
              <button
                onClick={() => removeItem(item.product.id, item.variant.sku)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(212,175,55,0.5)",
                  display: "flex",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-error)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(212,175,55,0.5)")
                }
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </motion.div>
      ))}

      <div style={{ marginTop: "1.5rem" }}>
        <Link to="/shop" className="btn btn-ghost">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function QtyControl({
  item,
  updateQuantity,
}: {
  item: CartItem;
  updateQuantity: (id: string, sku: string, qty: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        border: "1px solid #333",
        borderRadius: 4,
        padding: "0.3rem 0.6rem",
        width: "fit-content",
      }}
    >
      <button
        onClick={() =>
          updateQuantity(item.product.id, item.variant.sku, item.quantity - 1)
        }
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-primary)",
          display: "flex",
        }}
      >
        <Minus size={12} />
      </button>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          minWidth: 20,
          textAlign: "center",
          color: "var(--color-primary)",
          fontSize: "0.85rem",
        }}
      >
        {item.quantity}
      </span>
      <button
        onClick={() =>
          updateQuantity(item.product.id, item.variant.sku, item.quantity + 1)
        }
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-primary)",
          display: "flex",
        }}
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
