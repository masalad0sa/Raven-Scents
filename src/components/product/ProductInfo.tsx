import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { Variant, Product } from "../../types";
import s from "./ProductInfo.module.css";

interface Props {
  product: Product;
  isMobile: boolean;
}

export function ProductInfo({ product, isMobile }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { user } = useAuthStore();
  const wishlisted = isWishlisted(product.id);

  useEffect(() => {
    setSelectedVariant(product.variants[1] ?? product.variants[0] ?? null);
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={s.wrap}
    >
      {/* Brand */}
      <p className={s.brand}>{product.brand}</p>

      {/* Name */}
      <h1 className={s.name}>{product.name}</h1>

      {/* Price */}
      <div className={s.priceRow}>
        <span className={s.price}>
          ₹{(selectedVariant?.price ?? product.price).toLocaleString("en-IN")}
        </span>
        {product.compareAtPrice && (
          <span className={s.comparePrice}>
            ₹{product.compareAtPrice.toLocaleString("en-IN")}
          </span>
        )}
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
        <span className={s.ratingDot}>·</span>
        <span className={s.ratingText}>
          {product.rating} / 5 · {product.reviewCount.toLocaleString()} reviews
        </span>
      </div>

      {/* Description */}
      <p className={s.description}>{product.shortDescription}</p>

      <div className={s.divider} />

      {/* Size Selector */}
      <div className={s.sizeSection}>
        <p className={s.sizeLabel}>
          Size — {selectedVariant?.size}
          {selectedVariant?.unit}
        </p>
        <div className={s.sizeOptions}>
          {product.variants.map((v: Variant) => (
            <button
              key={v.sku}
              onClick={() => setSelectedVariant(v)}
              className={s.sizeBtn}
              style={{
                border: `1.5px solid ${selectedVariant?.sku === v.sku ? "var(--color-gold)" : "var(--color-card-border)"}`,
                background:
                  selectedVariant?.sku === v.sku
                    ? "rgba(212,175,55,0.08)"
                    : "transparent",
                color:
                  selectedVariant?.sku === v.sku
                    ? "var(--color-gold)"
                    : "var(--color-text)",
              }}
            >
              {v.size}
              {v.unit}
              <span className={s.sizeBtnPrice}>
                ₹{v.price.toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity + Add to Cart + Wishlist */}
      <div className={s.actionsRow}>
        {/* Qty box */}
        <div className={s.qtyBox}>
          <span className={s.qtyValue}>{quantity}</span>
          <div className={s.qtyBtns}>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className={`${s.qtyBtn} ${s.qtyBtnTop}`}
            >
              <Plus size={10} />
            </button>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={s.qtyBtn}
            >
              <Minus size={10} />
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={s.addToCartBtn}
          style={{
            background: added ? "rgba(39,174,96,0.9)" : "var(--color-text)",
            color: added ? "#fff" : "var(--color-bg)",
          }}
        >
          <ShoppingBag size={14} />
          {added ? "Added!" : "Add to Cart"}
        </button>

        {/* Wishlist */}
        <button
          onClick={() => toggle(product.id, user?.id ?? null)}
          className={s.wishlistBtn}
          style={{
            background: wishlisted ? "rgba(231,76,60,0.08)" : "transparent",
            border: `1.5px solid ${wishlisted ? "#E74C3C" : "var(--color-card-border)"}`,
            color: wishlisted ? "#E74C3C" : "var(--color-muted)",
          }}
        >
          <Heart size={15} fill={wishlisted ? "#E74C3C" : "none"} />
        </button>
      </div>

      <div className={s.divider} />

      {/* Characteristics grid */}
      <div className={s.charGrid}>
        {[
          { label: "Scent Family", value: product.scentFamily },
          { label: "Concentration", value: product.concentration },
          { label: "Sillage", value: product.sillage },
          { label: "Longevity", value: product.longevity },
        ].map((item) => (
          <div key={item.label} className={s.charItem}>
            <p className={s.charLabel}>{item.label}</p>
            <p className={s.charValue}>{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
