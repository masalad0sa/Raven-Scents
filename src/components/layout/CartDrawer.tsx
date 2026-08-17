import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { Link, useNavigate } from "react-router-dom";
import { shippingSettingsApi, type ShippingSettings } from "../../lib/api";
import s from "./CartDrawer.module.css";

export function CartDrawer() {
  const {
    items: rawItems,
    isOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getSubtotal,
  } = useCartStore();
  const items = rawItems.filter((i) => i?.product && i?.variant);
  const subtotal = getSubtotal();
  const navigate = useNavigate();
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    id: "default-shipping-settings",
    free_shipping_threshold: 0,
    standard_shipping_fee: 0,
    currency: "INR",
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    let active = true;

    shippingSettingsApi
      .get()
      .then((settings) => {
        if (active) setShippingSettings(settings);
      })
      .catch(() => {
        if (active) {
          setShippingSettings((prev) => ({ ...prev, currency: "INR" }));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const freeShippingThreshold = shippingSettings.free_shipping_threshold;
  const shippingFee =
    subtotal >= freeShippingThreshold
      ? 0
      : shippingSettings.standard_shipping_fee;
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        const header = document.querySelector("header");
        if (header) {
          header.style.paddingRight = `${scrollbarWidth}px`;
        }
      } else {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      const header = document.querySelector("header");
      if (header) {
        header.style.paddingRight = "";
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      const header = document.querySelector("header");
      if (header) {
        header.style.paddingRight = "";
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
          >
            {/* Header */}
            <div className={s.drawerHeader}>
              <div>
                <h2 className={s.drawerTitle}>Your Cart</h2>
                <p className={s.drawerCount}>
                  {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
                </p>
              </div>
              <button onClick={closeDrawer} className={s.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {/* Free shipping bar */}
            {subtotal < freeShippingThreshold && (
              <div className={s.shippingBar}>
                <p className={s.shippingText}>
                  Add ₹
                  {(freeShippingThreshold - subtotal).toLocaleString("en-IN")}{" "}
                  more for{" "}
                  <strong className={s.shippingHighlight}>FREE shipping</strong>
                </p>
                <div className={s.progressTrack}>
                  <div
                    className={s.progressFill}
                    style={{
                      width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className={`${s.itemsArea} no-scrollbar`}>
              {items.length === 0 ? (
                <div className={s.emptyState}>
                  <ShoppingBag
                    size={48}
                    strokeWidth={1}
                    className={s.emptyIcon}
                  />
                  <h3 className={s.emptyTitle}>Your cart is empty</h3>
                  <p className={s.emptyText}>
                    Discover our curated collection of luxury fragrances.
                  </p>
                  <button
                    onClick={() => {
                      closeDrawer();
                      navigate("/shop");
                    }}
                    className="btn btn-primary"
                    style={{ marginTop: "0.5rem" }}
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                <div className={s.itemsList}>
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant.sku}`}
                      className={s.itemRow}
                    >
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeDrawer}
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className={s.itemImage}
                        />
                      </Link>
                      <div className={s.itemDetails}>
                        <p className={s.itemBrand}>{item.product.brand}</p>
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeDrawer}
                        >
                          <h4 className={s.itemName}>{item.product.name}</h4>
                        </Link>
                        <p className={s.itemVariant}>
                          {item.variant.size}
                          {item.variant.unit} · {item.product.concentration}
                        </p>
                        <div className={s.itemActions}>
                          <div className={s.qtyControl}>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.variant.sku,
                                  item.quantity - 1,
                                )
                              }
                              className={s.qtyBtn}
                            >
                              <Minus size={12} />
                            </button>
                            <span className={s.qtyValue}>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.variant.sku,
                                  item.quantity + 1,
                                )
                              }
                              className={s.qtyBtn}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className={s.priceArea}>
                            <span className={s.itemPrice}>
                              ₹
                              {(
                                item.variant.price * item.quantity
                              ).toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() =>
                                removeItem(item.product.id, item.variant.sku)
                              }
                              className={s.removeBtn}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className={s.drawerFooter}>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Subtotal</span>
                  <span className={s.summaryValue}>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className={s.summaryRowLast}>
                  <span className={s.summaryLabel}>Shipping</span>
                  <span
                    className={
                      shippingFee === 0 ? s.summaryValueFree : s.summaryValue
                    }
                  >
                    {shippingFee === 0 ? "Free" : `₹${shippingFee}`}
                  </span>
                </div>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate("/checkout");
                  }}
                  className="btn btn-gold"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  Checkout · ₹{total.toLocaleString("en-IN")}
                </button>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate("/cart");
                  }}
                  className="btn btn-outline"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  View Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
