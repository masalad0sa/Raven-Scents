import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus } from "lucide-react";
import s from "./CartItemsList.module.css";

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
        <div className={s.tableHeader}>
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
          className={isMobile ? s.rowMobile : s.rowDesktop}
        >
          {/* Product */}
          <div className={s.productCell}>
            <Link to={`/product/${item.product.slug}`}>
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className={s.productImg}
                style={{
                  width: isMobile ? 76 : 96,
                  height: isMobile ? 76 : 96,
                }}
              />
            </Link>
            <div style={{ flex: 1 }}>
              <p className={s.productBrand}>{item.product.brand}</p>
              <Link to={`/product/${item.product.slug}`}>
                <h3
                  className={s.productName}
                  style={{ fontSize: isMobile ? "0.98rem" : "1.15rem" }}
                >
                  {item.product.name}
                </h3>
              </Link>
              {isMobile && (
                <p className={s.mobileVariant}>
                  {item.variant.size}
                  {item.variant.unit} · ₹
                  {item.variant.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => removeItem(item.product.id, item.variant.sku)}
                className={s.removeBtn}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {!isMobile && (
            <span className={s.sizeCol}>
              {item.variant.size}
              {item.variant.unit}
            </span>
          )}
          {!isMobile && (
            <span className={s.priceCol}>
              ₹{item.variant.price.toLocaleString("en-IN")}
            </span>
          )}

          {isMobile ? (
            <div className={s.mobileBottom}>
              <QtyControl item={item} updateQuantity={updateQuantity} />
              <span className={s.mobileTotal}>
                ₹{(item.variant.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ) : (
            <>
              <QtyControl item={item} updateQuantity={updateQuantity} />
              <button
                onClick={() => removeItem(item.product.id, item.variant.sku)}
                className={s.removeBtn}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </motion.div>
      ))}

      <div className={s.continueLink}>
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
    <div className={s.qtyControl}>
      <button
        onClick={() =>
          updateQuantity(item.product.id, item.variant.sku, item.quantity - 1)
        }
        className={s.qtyBtn}
      >
        <Minus size={12} />
      </button>
      <span className={s.qtyValue}>{item.quantity}</span>
      <button
        onClick={() =>
          updateQuantity(item.product.id, item.variant.sku, item.quantity + 1)
        }
        className={s.qtyBtn}
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
