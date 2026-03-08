import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../product";
import s from "./BestsellersSection.module.css";

export function BestsellersSection({
  bestsellers,
}: {
  bestsellers: any[];
  isMobile?: boolean;
}) {
  return (
    <section className={`section ${s.section}`}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={s.headerWrap}
        >
          <p className={s.tagline}>Most Loved</p>
          <h2 className={s.heading}>Bestsellers</h2>
        </motion.div>
        <div className={s.grid}>
          {bestsellers.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className={s.ctaWrap}>
          <Link to="/shop" className="btn btn-primary">
            View All Fragrances <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
