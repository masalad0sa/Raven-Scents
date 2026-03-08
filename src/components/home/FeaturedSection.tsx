import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard } from "../product";
import type { Product } from "../../types";
import s from "./FeaturedSection.module.css";

export function FeaturedSection({
  featuredProducts,
}: {
  featuredProducts: Product[];
  isMobile?: boolean;
}) {
  return (
    <section className={`section ${s.section}`}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={s.headerWrap}
        >
          <div>
            <p className={s.tagline}>Curated for You</p>
            <h2 className={s.heading}>
              Featured
              <br />
              <em>Collections</em>
            </h2>
          </div>
          <Link to="/shop" className="btn btn-outline">
            View All →
          </Link>
        </motion.div>

        <div className={s.grid}>
          {featuredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
