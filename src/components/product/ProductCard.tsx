import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "../../types";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useIsMobile } from "../../hooks/useIsMobile";
import s from "./ProductCard.module.css";

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
  const isMobile = useIsMobile();

  const defaultVariant = product.variants[0];
  const isOutOfStock =
    !defaultVariant || product.variants.every((v) => v.stock <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
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
      <Link to={`/product/${product.slug}`} className={s.cardLink}>
        <div className={s.card}>
          {/* Image */}
          <div className={s.imgWrap}>
            <img
              src={product.images[0]}
              alt={product.name}
              className={s.img}
              loading="lazy"
            />

            {/* Badges */}
            <div className={s.badges}>
              {product.isNew && <span className="badge badge-gold">New</span>}
              {product.isBestseller && (
                <span className="badge badge-dark">Bestseller</span>
              )}
              {discount && (
                <span className="badge badge-rose">-{discount}%</span>
              )}
            </div>

            {/* Actions */}
            <div className={s.actionBtns}>
              <button
                onClick={handleWishlist}
                className={s.wishBtn}
                style={{
                  color: wishlisted ? "#E74C3C" : "var(--color-muted)",
                }}
              >
                <Heart size={13} fill={wishlisted ? "#E74C3C" : "none"} />
              </button>
              {onQuickView && (
                <button onClick={handleQuickView} className={s.quickViewBtn}>
                  <Eye size={13} />
                </button>
              )}
            </div>

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className={s.outOfStockOverlay}>
                <span className={s.outOfStockLabel}>Out of Stock</span>
              </div>
            )}

            {/* Add to cart hover overlay */}
            <div
              className={`${s.addOverlay}${isMobile ? ` ${s.addOverlayVisible}` : ""}`}
            >
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={s.addBtn}
                style={{
                  background: isOutOfStock
                    ? "#333"
                    : added
                      ? "var(--color-success)"
                      : "var(--color-gold)",
                  color: isOutOfStock ? "#666" : "var(--color-primary)",
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                }}
              >
                <ShoppingBag size={12} />
                {isOutOfStock
                  ? "Out of Stock"
                  : added
                    ? "Added!"
                    : "Add to Cart"}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className={s.info}>
            <p className={s.brand}>{product.brand}</p>
            <h3 className={s.name}>{product.name}</h3>
            <div className={s.priceRow}>
              <span className={s.price}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && (
                <span className={s.comparePrice}>
                  ₹{product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
              <span className={s.meta}>
                {product.gender} · {product.concentration}
              </span>
            </div>
            {/* Rating */}
            <div className={s.ratingRow}>
              <div className={s.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={s.star}
                    style={{
                      color:
                        i <= Math.round(product.rating)
                          ? "var(--color-gold)"
                          : "#444",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className={s.reviewCount}>
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
