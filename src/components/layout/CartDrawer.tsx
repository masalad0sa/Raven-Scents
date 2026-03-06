import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { Link, useNavigate } from "react-router-dom";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getSubtotal,
  } = useCartStore();
  const subtotal = getSubtotal();
  const navigate = useNavigate();

  const freeShippingThreshold = 5000;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 299;
  const total = subtotal + shippingFee;

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.5rem 1.5rem 1.25rem",
                borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.4rem",
                    fontWeight: 500,
                    color: "var(--color-text)",
                  }}
                >
                  Your Cart
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "var(--color-muted)",
                    marginTop: "0.2rem",
                  }}
                >
                  {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text)",
                  padding: "0.25rem",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Free shipping bar */}
            {subtotal < freeShippingThreshold && (
              <div
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(212, 175, 55, 0.08)",
                  borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.08em",
                    color: "var(--color-muted)",
                  }}
                >
                  Add ₹
                  {(freeShippingThreshold - subtotal).toLocaleString("en-IN")}{" "}
                  more for{" "}
                  <strong style={{ color: "var(--color-gold)" }}>
                    FREE shipping
                  </strong>
                </p>
                <div
                  style={{
                    height: 3,
                    background: "#333",
                    borderRadius: 2,
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "var(--color-gold)",
                      borderRadius: 2,
                      width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div
              style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}
              className="no-scrollbar"
            >
              {items.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: "1rem",
                    padding: "3rem 0",
                  }}
                >
                  <ShoppingBag
                    size={48}
                    strokeWidth={1}
                    style={{ color: "rgba(212,175,55,0.5)" }}
                  />
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.25rem",
                      color: "var(--color-text)",
                    }}
                  >
                    Your cart is empty
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-muted)",
                      textAlign: "center",
                    }}
                  >
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant.sku}`}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        paddingBottom: "1.25rem",
                        borderBottom: "1px solid rgba(212,175,55,0.15)",
                      }}
                    >
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeDrawer}
                        style={{ flexShrink: 0 }}
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      </Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--color-muted)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {item.product.brand}
                        </p>
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeDrawer}
                        >
                          <h4
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: "1rem",
                              fontWeight: 500,
                              color: "var(--color-primary)",
                              marginBottom: "0.3rem",
                            }}
                          >
                            {item.product.name}
                          </h4>
                        </Link>
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-muted)",
                            marginBottom: "0.75rem",
                          }}
                        >
                          {item.variant.size}
                          {item.variant.unit} · {item.product.concentration}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              border: "1px solid #333",
                              borderRadius: 4,
                              padding: "0.25rem 0.5rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.variant.sku,
                                  item.quantity - 1,
                                )
                              }
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--color-primary)",
                                display: "flex",
                                padding: 0,
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <span
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                minWidth: 16,
                                textAlign: "center",
                                color: "var(--color-primary)",
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.variant.sku,
                                  item.quantity + 1,
                                )
                              }
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--color-primary)",
                                display: "flex",
                                padding: 0,
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "var(--color-primary)",
                              }}
                            >
                              ₹
                              {(
                                item.variant.price * item.quantity
                              ).toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() =>
                                removeItem(item.product.id, item.variant.sku)
                              }
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
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderTop: "1px solid rgba(212, 175, 55, 0.2)",
                  background: "#0d0d0d",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-muted)",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                    }}
                  >
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-muted)",
                    }}
                  >
                    Shipping
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color:
                        shippingFee === 0
                          ? "var(--color-success)"
                          : "var(--color-primary)",
                    }}
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
