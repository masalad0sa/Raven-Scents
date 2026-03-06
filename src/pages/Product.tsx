import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Minus, Plus, ChevronLeft } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/product/ProductCard";
import { useCartStore } from "../store/cartStore";
import { useProduct, useProducts } from "../hooks/useProducts";
import { Variant } from "../types";

const TABS = [
  "Description",
  "Fragrance Notes",
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
      colors: "from-[#f9c0c0] to-[#f5d08a]",
      width: "60%",
    },
    {
      label: "Heart Notes",
      sublabel: "15–60 min",
      notes: notes.middle,
      colors: "from-[#c9a0f5] to-[#a0c9f5]",
      width: "78%",
    },
    {
      label: "Base Notes",
      sublabel: "60+ min",
      notes: notes.base,
      colors: "from-[#0A0A0A] to-[#1A1A1A]",
      width: "100%",
    },
  ];
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          marginBottom: "1.5rem",
        }}
      >
        Fragrance Pyramid
      </h3>
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
                background: `linear-gradient(135deg, ${i === 0 ? "#1c1c1c, #262015" : i === 1 ? "#181820, #201a22" : "#1c1408, #28200c"})`,
                color: "var(--color-text)",
                border: "1px solid rgba(212,175,55,0.12)",
                minHeight: "72px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
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
                      background: "rgba(212,175,55,0.12)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      color: "var(--color-text)",
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

export default function Product() {
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
  const { addItem } = useCartStore();

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
              color: "var(--color-text)",
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
            padding: "1rem 0",
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

        <div className="container" style={{ padding: "3rem 2rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            {/* Left — Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main image */}
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  aspectRatio: "4/5",
                  marginBottom: "1rem",
                  background: "#1A1A1A",
                }}
              >
                <img
                  src={product.images[mainImage]}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "opacity 0.3s ease",
                  }}
                />
              </div>
              {/* Thumbnails */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 4,
                      overflow: "hidden",
                      border:
                        i === mainImage
                          ? "2px solid var(--color-gold)"
                          : "2px solid transparent",
                      cursor: "pointer",
                      background: "none",
                      padding: 0,
                      transition: "border-color 0.2s",
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
            </motion.div>

            {/* Right — Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badges */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                }}
              >
                {product.isNew && <span className="badge badge-gold">New</span>}
                {product.isBestseller && (
                  <span className="badge badge-dark">Bestseller</span>
                )}
                <span
                  className="badge"
                  style={{ background: "#333", color: "var(--color-muted)" }}
                >
                  {product.gender}
                </span>
                <span
                  className="badge"
                  style={{ background: "#333", color: "var(--color-muted)" }}
                >
                  {product.concentration}
                </span>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                {product.brand}
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                  color: "var(--color-text)",
                  lineHeight: 1.1,
                  marginBottom: "0.75rem",
                }}
              >
                {product.name}
              </h1>

              {/* Rating */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
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
                        fontSize: "1rem",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-muted)",
                  }}
                >
                  {product.rating} ({product.reviewCount.toLocaleString()}{" "}
                  reviews)
                </span>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.8,
                  marginBottom: "1.75rem",
                }}
              >
                {product.shortDescription}
              </p>

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.75rem",
                  marginBottom: "1.75rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--color-text)",
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
                      color: "#9a9590",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Size Selector */}
              <div style={{ marginBottom: "1.75rem" }}>
                <label
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                    display: "block",
                    marginBottom: "0.75rem",
                  }}
                >
                  Size — {selectedVariant?.size}
                  {selectedVariant?.unit}
                </label>
                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  {product.variants.map((v: Variant) => (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: "0.6rem 1.1rem",
                        borderRadius: 4,
                        border: `1.5px solid ${selectedVariant?.sku === v.sku ? "var(--color-gold)" : "#333"}`,
                        background:
                          selectedVariant?.sku === v.sku
                            ? "rgba(212,175,55,0.15)"
                            : "#1A1A1A",
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-text)",
                        transition: "all 0.2s",
                      }}
                    >
                      {v.size}
                      {v.unit}
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.6rem",
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

              {/* Quantity + Add to cart */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    border: "1.5px solid #333",
                    borderRadius: 4,
                    padding: "0.5rem 1rem",
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text)",
                      display: "flex",
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      minWidth: 24,
                      textAlign: "center",
                      color: "var(--color-text)",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text)",
                      display: "flex",
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-gold"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    background: added
                      ? "var(--color-success)"
                      : "var(--color-gold)",
                  }}
                >
                  <ShoppingBag size={14} />
                  {added ? "Added to Cart!" : "Add to Cart"}
                </button>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  style={{
                    background: wishlisted ? "rgba(231,76,60,0.1)" : "#1A1A1A",
                    border: `1.5px solid ${wishlisted ? "#E74C3C" : "#333"}`,
                    borderRadius: 4,
                    padding: "0.5rem 0.85rem",
                    cursor: "pointer",
                    color: wishlisted ? "#E74C3C" : "var(--color-muted)",
                    transition: "all 0.25s",
                  }}
                >
                  <Heart size={16} fill={wishlisted ? "#E74C3C" : "none"} />
                </button>
              </div>

              {/* Quick props */}
              <div
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #333",
                  borderRadius: 6,
                  padding: "1.25rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.75rem",
                }}
              >
                {[
                  { label: "Sillage", value: product.sillage },
                  { label: "Longevity", value: product.longevity },
                  { label: "Scent Family", value: product.scentFamily },
                  { label: "Concentration", value: product.concentration },
                ].map((item) => (
                  <div key={item.label}>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--color-muted)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
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

              {/* Fragrance Pyramid */}
              <FragrancePyramid notes={product.notes} />
            </motion.div>
          </div>

          {/* Tabs */}
          <div style={{ marginTop: "3rem", borderTop: "1px solid #333" }}>
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #333",
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
              {activeTab === "Fragrance Notes" && (
                <div>
                  {[
                    {
                      label: "Top Notes (first impression)",
                      notes: product.notes.top,
                    },
                    {
                      label: "Heart Notes (the soul)",
                      notes: product.notes.middle,
                    },
                    {
                      label: "Base Notes (the lasting impression)",
                      notes: product.notes.base,
                    },
                  ].map((tier) => (
                    <div key={tier.label} style={{ marginBottom: "1.5rem" }}>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.65rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--color-gold)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {tier.label}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {tier.notes.map((note: string) => (
                          <span
                            key={note}
                            style={{
                              padding: "0.35rem 0.9rem",
                              background: "var(--color-surface)",
                              border: "1px solid #333",
                              borderRadius: 3,
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.85rem",
                              color: "var(--color-text)",
                            }}
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                      background: "#1A1A1A",
                      borderRadius: 6,
                      border: "1px solid #333",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "3.5rem",
                          fontWeight: 300,
                          color: "var(--color-text)",
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
                        borderBottom: "1px solid #333",
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
                                      : "#444",
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
            <div style={{ marginTop: "3rem" }}>
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
