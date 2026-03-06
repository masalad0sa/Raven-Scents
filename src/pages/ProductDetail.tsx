import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/product/ProductCard";
import { useCartStore } from "../store/cartStore";
import { useProduct, useProducts } from "../hooks/useProducts";
import { Variant } from "../types";

const TABS = [
  "Description",
  "Fragrance Pyramid",
  "How to Wear",
  "Reviews",
] as const;
type Tab = (typeof TABS)[number];

function FragrancePyramid({
  notes,
}: {
  notes: { top: string[]; middle: string[]; base: string[] };
}) {
  const tiers = [
    {
      label: "Top Notes",
      sublabel: "0–15 min",
      notes: notes.top,
      colors: "from-[#d4af37] to-[#e8c94f]",
      width: "60%",
    },
    {
      label: "Heart Notes",
      sublabel: "15–60 min",
      notes: notes.middle,
      colors: "from-[#9a9590] to-[#8a7e6b]",
      width: "78%",
    },
    {
      label: "Base Notes",
      sublabel: "60+ min",
      notes: notes.base,
      colors: "from-[#0d0d0d] to-[#1a1a1a]",
      width: "100%",
    },
  ];
  return (
    <div style={{ padding: "0.75rem 0" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        {tiers.map((tier, i) => (
          <div
            key={tier.label}
            style={{ width: tier.width, position: "relative" }}
          >
            <div
              style={{
                borderRadius:
                  i === 2 ? "0 0 6px 6px" : i === 0 ? "6px 6px 0 0" : "0",
                padding: "0.6rem 1rem",
                minHeight: 68,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${i === 0 ? "#d4af37, #e8c94f" : i === 1 ? "#8a7e6b, #9a9590" : "#0d0d0d, #1a1a1a"})`,
                color: i === 2 ? "var(--color-text)" : "#0d0d0d",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {tier.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.65rem",
                    opacity: 0.7,
                  }}
                >
                  {tier.sublabel}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {tier.notes.map((note) => (
                  <span
                    key={note}
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      borderRadius: 3,
                      padding: "0.2rem 0.6rem",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: allData } = useProducts();
  const allProducts = allData?.products || [];
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product?.variants[1] ?? product?.variants[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [direction, setDirection] = useState(1);
  const { addItem } = useCartStore();

  const goTo = (next: number, dir: number) => {
    setDirection(dir);
    setMainImage(next);
  };

  useEffect(() => {
    if (!product || (product.images?.length ?? 0) <= 1 || isHovering) return;
    const timer = setInterval(() => {
      setDirection(1);
      setMainImage((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [product, isHovering]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div
          style={{
            paddingTop: 100,
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-muted)",
            }}
          >
            Loading fragrance...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div
          style={{
            paddingTop: 100,
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              color: "var(--color-primary)",
              marginBottom: "1rem",
            }}
          >
            Product not found
          </h1>
          <Link to="/shop" className="btn btn-primary">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const related = allProducts
    .filter(
      (p: any) =>
        p.id !== product.id &&
        (p.brand === product.brand || p.scentFamily === product.scentFamily),
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Header />
      <main
        style={{
          paddingTop: 72,
          background: "var(--color-ivory)",
          minHeight: "100vh",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            background: "var(--color-surface)",
            padding: "0.45rem 0",
            borderBottom: "1px solid rgba(212,175,55,0.15)",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Link
              to="/shop"
              style={{
                color: "var(--color-muted)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <ChevronLeft size={12} /> Shop
            </Link>
            <span style={{ color: "var(--color-muted)" }}>/</span>
            <span style={{ color: "var(--color-text)", fontWeight: 600 }}>
              {product.name}
            </span>
          </div>
        </div>

        <div className="container" style={{ padding: "0.75rem 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "52% 1fr",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            {/* Left — Images: vertical thumbnails + main image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{ display: "flex", gap: "0.6rem" }}
            >
              {/* Vertical thumbnail strip */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > mainImage ? 1 : -1)}
                    style={{
                      width: 72,
                      height: 80,
                      borderRadius: 6,
                      overflow: "hidden",
                      border:
                        i === mainImage
                          ? "2px solid var(--color-gold)"
                          : "2px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      background: "#1a1a1a",
                      padding: 0,
                      transition: "border-color 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div
                style={{
                  flex: 1,
                  borderRadius: 8,
                  overflow: "hidden",
                  height: "calc(100vh - 200px)",
                  maxHeight: 560,
                  background: "#1a1a1a",
                  position: "relative",
                }}
              >
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.img
                    key={mainImage}
                    src={product.images[mainImage]}
                    alt={product.name}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({
                        x: d > 0 ? "100%" : "-100%",
                        opacity: 0,
                      }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({
                        x: d > 0 ? "-100%" : "100%",
                        opacity: 0,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.38, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </AnimatePresence>
                {/* Dot indicators */}
                {product.images.length > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "6px",
                      zIndex: 2,
                    }}
                  >
                    {product.images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => goTo(i, i > mainImage ? 1 : -1)}
                        style={{
                          width: i === mainImage ? 20 : 7,
                          height: 7,
                          borderRadius: 4,
                          background:
                            i === mainImage
                              ? "var(--color-gold)"
                              : "rgba(255,255,255,0.35)",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right — Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                paddingRight: "0.25rem",
              }}
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
                  ₹
                  {(selectedVariant?.price ?? product.price).toLocaleString(
                    "en-IN",
                  )}
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
                <span
                  style={{ color: "var(--color-muted)", fontSize: "0.75rem" }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--color-muted)",
                  }}
                >
                  {product.rating} / 5 · {product.reviewCount.toLocaleString()}{" "}
                  reviews
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

              {/* Divider */}
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
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
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
                    background: added
                      ? "rgba(39,174,96,0.9)"
                      : "var(--color-text)",
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
                  onClick={() => setWishlisted(!wishlisted)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    flexShrink: 0,
                    background: wishlisted
                      ? "rgba(231,76,60,0.08)"
                      : "transparent",
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

              {/* Divider */}
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
          </div>

          {/* Tabs */}
          <div
            style={{
              marginTop: "1.5rem",
              borderTop: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(212,175,55,0.15)",
                overflowX: "auto",
              }}
              className="no-scrollbar"
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ padding: "2rem 0", maxWidth: 700 }}>
              {activeTab === "Description" && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.9,
                  }}
                >
                  {product.description}
                </p>
              )}
              {activeTab === "Fragrance Pyramid" && (
                <FragrancePyramid notes={product.notes} />
              )}
              {activeTab === "How to Wear" && (
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.9,
                  }}
                >
                  <p style={{ marginBottom: "1rem" }}>
                    Apply to pulse points: wrists, neck, behind ears, and inside
                    elbows. These warm spots will help the fragrance bloom and
                    project naturally.
                  </p>
                  <p style={{ marginBottom: "1rem" }}>
                    For longer wear, apply to moisturized skin — fragrance
                    adheres better to hydrated skin. Consider layering with an
                    unscented lotion first.
                  </p>
                  <p>
                    Avoid rubbing the wrists together after application, as this
                    breaks down the fragrance molecules and shortens longevity.
                  </p>
                </div>
              )}
              {activeTab === "Reviews" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2rem",
                      marginBottom: "2rem",
                      padding: "1.5rem",
                      background: "#1a1a1a",
                      borderRadius: 6,
                      border: "1px solid rgba(212,175,55,0.15)",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "3.5rem",
                          fontWeight: 300,
                          color: "var(--color-gold)",
                          lineHeight: 1,
                        }}
                      >
                        {product.rating}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          margin: "0.5rem 0",
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            style={{
                              color:
                                s <= Math.round(product.rating)
                                  ? "var(--color-gold)"
                                  : "#444",
                              fontSize: "1rem",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.6rem",
                          letterSpacing: "0.1em",
                          color: "var(--color-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        {product.reviewCount.toLocaleString()} Reviews
                      </div>
                    </div>
                  </div>
                  {[
                    {
                      name: "Priya M.",
                      rating: 5,
                      text: "Absolutely divine. The longevity is incredible — gets compliments every single time I wear it.",
                      date: "2 weeks ago",
                    },
                    {
                      name: "Arjun K.",
                      rating: 5,
                      text: "Worth every rupee. This is my signature scent now. The fragrance pyramid is exactly as described.",
                      date: "1 month ago",
                    },
                    {
                      name: "Sneha T.",
                      rating: 4,
                      text: "Beautiful scent, very sophisticated. Slightly strong on initial spray but settles beautifully.",
                      date: "2 months ago",
                    },
                  ].map((review) => (
                    <div
                      key={review.name}
                      style={{
                        padding: "1.5rem 0",
                        borderBottom: "1px solid rgba(212,175,55,0.15)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--color-text)",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {review.name}
                          </p>
                          <div style={{ display: "flex" }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                style={{
                                  color:
                                    s <= review.rating
                                      ? "var(--color-gold)"
                                      : "#DDD",
                                  fontSize: "0.85rem",
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-muted)",
                          }}
                        >
                          {review.date}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.9rem",
                          color: "var(--color-muted)",
                          lineHeight: 1.7,
                        }}
                      >
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2rem",
                  fontWeight: 300,
                  color: "var(--color-text)",
                  marginBottom: "2rem",
                }}
              >
                You May Also Like
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .pdp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
