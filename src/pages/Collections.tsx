import { useMemo } from "react";
import { motion } from "framer-motion";
import { useProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { ProductCard } from "../components/product";
import s from "./styles/Collections.module.css";

const CATEGORY_META: Record<
  string,
  { label: string; tagline: string; romanNumeral: string }
> = {
  parfum: {
    label: "Parfum",
    tagline:
      "The Purest Expression — Maximum Concentration, Maximum Impression",
    romanNumeral: "I",
  },
  "eau-de-parfum": {
    label: "Eau de Parfum",
    tagline: "Intense & Lasting — Bold Sillage That Commands a Room",
    romanNumeral: "II",
  },
  "eau-de-toilette": {
    label: "Eau de Toilette",
    tagline: "Light & Vibrant — Effortless Freshness for Every Day",
    romanNumeral: "III",
  },
};

const CATEGORY_ORDER = ["parfum", "eau-de-parfum", "eau-de-toilette"];

export default function Collections() {
  const { data, isLoading } = useProducts();
  const products = data?.products || [];
  const isMobile = useIsMobile();

  const grouped = useMemo(() => {
    const map: Record<string, typeof products> = {};
    for (const cat of CATEGORY_ORDER) map[cat] = [];
    for (const p of products) {
      if (map[p.category] !== undefined) {
        map[p.category].push(p);
      } else {
        // unknown category
        if (!map["other"]) map["other"] = [];
        map["other"].push(p);
      }
    }
    return map;
  }, [products]);

  return (
    <>
      <Header />

      {/* Hero Title */}
      <section className={s.hero}>
        {/* Decorative top line */}
        <div className={s.topLine} />
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.25em" }}
          transition={{ duration: 0.9 }}
          className={s.heroEyebrow}
        >
          House of Raven
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className={s.heroTitle}
        >
          Our Collections
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className={s.heroSubtitle}
        >
          Curated by concentration. Each tier is a distinct olfactory world—
          discover yours.
        </motion.p>
        <div className={s.heroDivider} />
      </section>

      {/* Loading state */}
      {isLoading && <div className={s.loadingState}>Loading collections…</div>}

      {/* Category Sections */}
      {!isLoading &&
        CATEGORY_ORDER.map((cat, idx) => {
          const meta = CATEGORY_META[cat];
          const catProducts = grouped[cat] || [];
          if (catProducts.length === 0) return null;

          const isEven = idx % 2 === 0;

          return (
            <section key={cat} className={isEven ? s.section : s.sectionAlt}>
              <div className="container">
                {/* Section Header */}
                <motion.div
                  initial={{ opacity: 0, x: -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7 }}
                  className={s.sectionHeader}
                >
                  {/* Roman numeral */}
                  <span className={s.romanNumeral}>{meta.romanNumeral}</span>

                  <div>
                    <p className={s.catLabel}>
                      {cat.replace(/-/g, " ").toUpperCase()}
                    </p>
                    <h2 className={s.catTitle}>{meta.label}</h2>
                    <p className={s.catTagline}>{meta.tagline}</p>
                    <div className={s.catDivider} />
                  </div>
                </motion.div>

                {/* Product Grid */}
                <div className={s.productGrid}>
                  {catProducts.map((product, pIdx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.55, delay: pIdx * 0.07 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Product count */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={s.productCount}
                >
                  {catProducts.length}{" "}
                  {catProducts.length === 1 ? "fragrance" : "fragrances"} in
                  this collection
                </motion.p>
              </div>
            </section>
          );
        })}

      {/* Closing divider */}
      {!isLoading && (
        <div className={s.closingSection}>
          <div className={s.closingDivider} />
          <p className={s.closingText}>House of Raven · Est. 2024</p>
          <div className={s.closingLine} />
        </div>
      )}

      <Footer />
    </>
  );
}
