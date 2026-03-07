import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "../store/wishlistStore";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";

export default function Wishlist() {
  const navigate = useNavigate();
  const { ids, toggle } = useWishlistStore();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const isMobile = useIsMobile();

  // Fetch all products and filter by wishlisted IDs
  const { data, isLoading } = useProducts();
  const allProducts = data?.products ?? [];
  const wishlistProducts = allProducts.filter((p) => ids.includes(p.id));

  const handleRemove = (productId: string) => {
    toggle(productId, user?.id ?? null);
  };

  const handleAddToCart = (product: (typeof wishlistProducts)[0]) => {
    if (product.variants.length > 0) {
      addItem(product, product.variants[0]);
    }
  };

  return (
    <>
      <SEO
        title="My Wishlist"
        description="Your saved fragrances at Raven Scents."
      />
      <Header />
      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          paddingTop: "5rem",
          paddingBottom: "4rem",
        }}
      >
        <div className="container" style={{ maxWidth: 1000 }}>
          {/* Page header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                margin: "0 0 0.25rem",
              }}
            >
              Your Collection
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.2rem",
                fontWeight: 500,
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Wishlist
              {ids.length > 0 && (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                    color: "var(--color-text-muted)",
                    fontWeight: 400,
                    marginLeft: "0.75rem",
                  }}
                >
                  ({ids.length} {ids.length === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>

          {/* Empty state */}
          {!isLoading && ids.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 2rem",
                background: "#111",
                borderRadius: 12,
                border: "1px solid rgba(212,175,55,0.1)",
              }}
            >
              <Heart
                size={48}
                color="rgba(212,175,55,0.25)"
                style={{ margin: "0 auto 1.25rem" }}
              />
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  color: "var(--color-text)",
                  margin: "0 0 0.75rem",
                }}
              >
                Your wishlist is empty
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  margin: "0 0 2rem",
                  lineHeight: 1.7,
                }}
              >
                Save fragrances you love by clicking the heart icon on any
                product.
              </p>
              <Link
                to="/shop"
                style={{
                  display: "inline-block",
                  background: "var(--color-gold)",
                  color: "#0d0d0d",
                  textDecoration: "none",
                  borderRadius: 6,
                  padding: "0.75rem 2rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Explore Fragrances
              </Link>
            </div>
          )}

          {/* Loading */}
          {isLoading && ids.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(280px,1fr))",
                gap: "1.5rem",
              }}
            >
              {ids.map((id) => (
                <div
                  key={id}
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 10,
                    height: 380,
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              ))}
            </div>
          )}

          {/* Product grid */}
          {!isLoading && wishlistProducts.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(280px,1fr))",
                gap: "1.5rem",
              }}
            >
              <AnimatePresence>
                {wishlistProducts.map((product) => {
                  const variant = product.variants[0];
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        background: "#111",
                        border: "1px solid rgba(212,175,55,0.1)",
                        borderRadius: 10,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          zIndex: 5,
                          background: "rgba(13,13,13,0.75)",
                          border: "1px solid rgba(212,175,55,0.15)",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#f87171",
                          backdropFilter: "blur(6px)",
                          transition: "background 0.2s",
                        }}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Image */}
                      <Link
                        to={`/product/${product.slug}`}
                        style={{ display: "block", textDecoration: "none" }}
                      >
                        <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            loading="lazy"
                          />
                        </div>

                        {/* Info */}
                        <div style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "0.58rem",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "var(--color-gold)",
                              margin: "0 0 0.3rem",
                            }}
                          >
                            {product.scentFamily}
                          </p>
                          <h3
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: "1.1rem",
                              fontWeight: 500,
                              color: "var(--color-text)",
                              margin: "0 0 0.4rem",
                            }}
                          >
                            {product.name}
                          </h3>
                          <p
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.85rem",
                              color: "var(--color-text-muted)",
                              margin: 0,
                            }}
                          >
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </Link>

                      {/* Add to cart */}
                      <div style={{ padding: "0.75rem 1.25rem 1.25rem" }}>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!variant || variant.stock === 0}
                          style={{
                            width: "100%",
                            background:
                              variant && variant.stock > 0
                                ? "var(--color-gold)"
                                : "rgba(212,175,55,0.2)",
                            color:
                              variant && variant.stock > 0
                                ? "#0d0d0d"
                                : "var(--color-text-muted)",
                            border: "none",
                            borderRadius: 6,
                            padding: "0.65rem",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            cursor:
                              variant && variant.stock > 0
                                ? "pointer"
                                : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            transition: "opacity 0.2s",
                          }}
                        >
                          <ShoppingBag size={13} />
                          {variant && variant.stock > 0
                            ? "Add to Cart"
                            : "Out of Stock"}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
