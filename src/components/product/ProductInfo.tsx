import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { Variant } from "../../types";

interface Props {
  product: any;
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
      style={{ paddingRight: "0.25rem" }}
    >
      {/* Brand */}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.62rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          marginBottom: "0.3rem",
        }}
      >
        {product.brand}
      </p>

      {/* Name */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
          fontWeight: 700,
          color: "var(--color-text)",
          lineHeight: 1.1,
          letterSpacing: "0.02em",
          marginBottom: "0.5rem",
          textTransform: "uppercase",
        }}
      >
        {product.name}
      </h1>

      {/* Price */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.75rem",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--color-gold)",
          }}
        >
          ₹{(selectedVariant?.price ?? product.price).toLocaleString("en-IN")}
        </span>
        {product.compareAtPrice && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--color-muted)",
              textDecoration: "line-through",
            }}
          >
            ₹{product.compareAtPrice.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* Rating */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.9rem",
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
                fontSize: "0.95rem",
              }}
            >
              ★
            </span>
          ))}
        </div>
        <span style={{ color: "var(--color-muted)", fontSize: "0.75rem" }}>
          ·
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-muted)",
          }}
        >
          {product.rating} / 5 · {product.reviewCount.toLocaleString()} reviews
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          color: "var(--color-muted)",
          lineHeight: 1.7,
          marginBottom: "0.9rem",
          paddingLeft: "0.75rem",
          borderLeft: "2px solid var(--color-gold)",
        }}
      >
        {product.shortDescription}
      </p>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "0.9rem",
        }}
      />

      {/* Size Selector */}
      <div style={{ marginBottom: "0.9rem" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: "0.4rem",
          }}
        >
          Size — {selectedVariant?.size}
          {selectedVariant?.unit}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {product.variants.map((v: Variant) => (
            <button
              key={v.sku}
              onClick={() => setSelectedVariant(v)}
              style={{
                padding: "0.3rem 0.7rem",
                borderRadius: 4,
                border: `1.5px solid ${selectedVariant?.sku === v.sku ? "var(--color-gold)" : "rgba(255,255,255,0.12)"}`,
                background:
                  selectedVariant?.sku === v.sku
                    ? "rgba(212,175,55,0.08)"
                    : "transparent",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color:
                  selectedVariant?.sku === v.sku
                    ? "var(--color-gold)"
                    : "var(--color-text)",
                transition: "all 0.2s",
              }}
            >
              {v.size}
              {v.unit}
              <span
                style={{
                  display: "block",
                  fontSize: "0.58rem",
                  color: "var(--color-muted)",
                  fontWeight: 400,
                }}
              >
                ₹{v.price.toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity + Add to Cart + Wishlist */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "0.9rem",
          alignItems: "stretch",
        }}
      >
        {/* Qty box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1.5px solid rgba(255,255,255,0.15)",
            borderRadius: 4,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.95rem",
              minWidth: 36,
              textAlign: "center",
              color: "var(--color-text)",
              padding: "0 0.5rem",
            }}
          >
            {quantity}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                color: "var(--color-text)",
                padding: "0.25rem 0.5rem",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={10} />
            </button>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text)",
                padding: "0.25rem 0.5rem",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Minus size={10} />
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            background: added ? "rgba(39,174,96,0.9)" : "var(--color-text)",
            color: added ? "#fff" : "#0d0d0d",
            border: "none",
            borderRadius: 4,
            padding: "0.65rem 1rem",
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <ShoppingBag size={14} />
          {added ? "Added!" : "Add to Cart"}
        </button>

        {/* Wishlist */}
        <button
          onClick={() => toggle(product.id, user?.id ?? null)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            flexShrink: 0,
            background: wishlisted ? "rgba(231,76,60,0.08)" : "transparent",
            border: `1.5px solid ${wishlisted ? "#E74C3C" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 4,
            cursor: "pointer",
            color: wishlisted ? "#E74C3C" : "var(--color-muted)",
            transition: "all 0.2s",
          }}
        >
          <Heart size={15} fill={wishlisted ? "#E74C3C" : "none"} />
        </button>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "0.9rem",
        }}
      />

      {/* Characteristics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.6rem",
          marginBottom: "0.75rem",
        }}
      >
        {[
          { label: "Scent Family", value: product.scentFamily },
          { label: "Concentration", value: product.concentration },
          { label: "Sillage", value: product.sillage },
          { label: "Longevity", value: product.longevity },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              padding: "0.45rem 0.6rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.5rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                marginBottom: "0.15rem",
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text)",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
