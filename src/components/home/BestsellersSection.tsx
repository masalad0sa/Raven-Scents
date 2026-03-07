import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../product";

export function BestsellersSection({
  bestsellers,
  isMobile,
}: {
  bestsellers: any[];
  isMobile: boolean;
}) {
  return (
    <section className="section" style={{ background: "var(--color-ivory)" }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem", textAlign: "center" }}
        >
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
            Most Loved
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
            Bestsellers
          </h2>
        </motion.div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {bestsellers.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link to="/shop" className="btn btn-primary">
            View All Fragrances <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
