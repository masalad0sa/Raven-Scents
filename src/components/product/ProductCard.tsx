import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "../../types";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const defaultVariant = product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, defaultVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id, user?.id ?? null);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100,
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <Link
        to={`/product/${product.slug}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid rgba(212, 175, 55, 0.1)",
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.boxShadow =
              "0 20px 60px rgba(0, 0, 0, 0.4)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.boxShadow = "none")
          }
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              aspectRatio: "4/5",
              overflow: "hidden",
            }}
            className="product-img-wrap"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
                display: "block",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLImageElement).style.transform =
                  "scale(1.07)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLImageElement).style.transform =
                  "scale(1)")
              }
              loading="lazy"
            />

            {/* Badges */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {product.isNew && <span className="badge badge-gold">New</span>}
              {product.isBestseller && (
                <span className="badge badge-dark">Bestseller</span>
              )}
              {discount && (
                <span className="badge badge-rose">-{discount}%</span>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <button
                onClick={handleWishlist}
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(250, 246, 238, 0.95)",
                  border: "none",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: wishlisted ? "#E74C3C" : "var(--color-muted)",
                  transition: "all 0.25s",
                }}
              >
                <Heart size={13} fill={wishlisted ? "#E74C3C" : "none"} />
              </button>
              {onQuickView && (
                <button
                  onClick={handleQuickView}
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(13, 13, 13, 0.95)",
                    border: "none",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--color-muted)",
                    transition: "all 0.25s",
                  }}
                >
                  <Eye size={13} />
                </button>
              )}
            </div>

            {/* Add to cart hover overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1rem",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                transform: "translateY(100%)",
                transition: "transform 0.35s ease",
              }}
              className="add-to-cart-overlay"
            >
              <button
                onClick={handleAddToCart}
                style={{
                  width: "100%",
                  background: added
                    ? "var(--color-success)"
                    : "var(--color-gold)",
                  color: "var(--color-primary)",
                  border: "none",
                  borderRadius: 3,
                  padding: "0.65rem 1rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  transition: "background 0.25s",
                }}
              >
                <ShoppingBag size={12} />
                {added ? "Added!" : "Add to Cart"}
              </button>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: "1rem 1.1rem 1.25rem" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: "0.3rem",
              }}
            >
              {product.brand}
            </p>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.1rem",
                fontWeight: 500,
                color: "var(--color-text)",
                marginBottom: "0.5rem",
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--color-gold)",
                }}
              >
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && (
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "#9a9590",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-muted)",
                }}
              >
                {product.gender} · {product.concentration}
              </span>
            </div>
            {/* Rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                marginTop: "0.6rem",
              }}
            >
              <div style={{ display: "flex" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      color:
                        s <= Math.round(product.rating)
                          ? "var(--color-gold)"
                          : "#444",
                      fontSize: "0.75rem",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.7rem",
                  color: "var(--color-muted)",
                }}
              >
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </Link>

      <style>{`
        div:hover .add-to-cart-overlay {
          transform: translateY(0) !important;
        }
      `}</style>
    </motion.div>
  );
}
