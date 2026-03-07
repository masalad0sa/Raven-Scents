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
import s from "./styles/Wishlist.module.css";

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
      <main className={s.main}>
        <div className={`${s.narrow} container`}>
          {/* Page header */}
          <div className={s.header}>
            <p className={s.eyebrow}>Your Collection</p>
            <h1 className={s.title}>
              Wishlist
              {ids.length > 0 && (
                <span className={s.count}>
                  ({ids.length} {ids.length === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>

          {/* Empty state */}
          {!isLoading && ids.length === 0 && (
            <div className={s.emptyState}>
              <Heart
                size={48}
                color="rgba(212,175,55,0.25)"
                style={{ margin: "0 auto 1.25rem" }}
              />
              <h2 className={s.emptyTitle}>Your wishlist is empty</h2>
              <p className={s.emptyText}>
                Save fragrances you love by clicking the heart icon on any
                product.
              </p>
              <Link to="/shop" className={s.exploreBtn}>
                Explore Fragrances
              </Link>
            </div>
          )}

          {/* Loading */}
          {isLoading && ids.length > 0 && (
            <div className={s.grid}>
              {ids.map((id) => (
                <div key={id} className={s.shimmer} />
              ))}
            </div>
          )}

          {/* Product grid */}
          {!isLoading && wishlistProducts.length > 0 && (
            <div className={s.grid}>
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
                      className={s.card}
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        className={s.removeBtn}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Image */}
                      <Link
                        to={`/product/${product.slug}`}
                        className={s.cardLink}
                      >
                        <div className={s.cardImage}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            loading="lazy"
                          />
                        </div>

                        {/* Info */}
                        <div className={s.cardInfo}>
                          <p className={s.cardFamily}>{product.scentFamily}</p>
                          <h3 className={s.cardName}>{product.name}</h3>
                          <p className={s.cardPrice}>
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </Link>

                      {/* Add to cart */}
                      <div className={s.cardActions}>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!variant || variant.stock === 0}
                          className={s.addToCartBtn}
                          style={
                            !variant || variant.stock === 0
                              ? {
                                  background: "rgba(212,175,55,0.2)",
                                  color: "var(--color-text-muted)",
                                  cursor: "not-allowed",
                                }
                              : undefined
                          }
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
