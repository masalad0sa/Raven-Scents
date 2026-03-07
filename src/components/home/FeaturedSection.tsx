import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard } from "../product/ProductCard";

export function FeaturedSection({
  featuredProducts,
  isMobile,
}: {
  featuredProducts: any[];
  isMobile: boolean;
}) {
  return (
    <section className="section" style={{ background: "var(--color-surface)" }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            marginBottom: "3rem",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "0.75rem",
              }}
            >
              Curated for You
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 300,
                color: "var(--color-text)",
                lineHeight: 1.1,
              }}
            >
              Featured
              <br />
              <em>Collections</em>
            </h2>
          </div>
          <Link to="/shop" className="btn btn-outline">
            View All →
          </Link>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {featuredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
