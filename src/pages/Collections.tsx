import { useMemo } from "react";
import { motion } from "framer-motion";
import { useProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { ProductCard } from "../components/product";

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
      <section
        style={{
          paddingTop: "calc(72px + 5rem)",
          paddingBottom: "3rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative top line */}
        <div
          style={{
            width: 1,
            height: 60,
            background:
              "linear-gradient(to bottom, transparent, var(--color-gold))",
            margin: "0 auto 2rem",
          }}
        />
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.25em" }}
          transition={{ duration: 0.9 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            marginBottom: "1rem",
          }}
        >
          House of Raven
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 400,
            color: "var(--color-text)",
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            marginBottom: "1.25rem",
          }}
        >
          Our Collections
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            color: "var(--color-muted)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          Curated by concentration. Each tier is a distinct olfactory world—
          discover yours.
        </motion.p>
        <div
          style={{
            width: 48,
            height: 1,
            background: "var(--color-gold)",
            margin: "2rem auto 0",
            opacity: 0.6,
          }}
        />
      </section>

      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "40vh",
            color: "var(--color-muted)",
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Loading collections…
        </div>
      )}

      {/* Category Sections */}
      {!isLoading &&
        CATEGORY_ORDER.map((cat, idx) => {
          const meta = CATEGORY_META[cat];
          const catProducts = grouped[cat] || [];
          if (catProducts.length === 0) return null;

          const isEven = idx % 2 === 0;

          return (
            <section
              key={cat}
              style={{
                padding: "5rem 0",
                borderTop: "1px solid rgba(212, 175, 55, 0.12)",
                background: isEven ? "transparent" : "rgba(255,255,255,0.015)",
              }}
            >
              <div className="container">
                {/* Section Header */}
                <motion.div
                  initial={{ opacity: 0, x: -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7 }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "2rem",
                    marginBottom: "3.5rem",
                  }}
                >
                  {/* Roman numeral */}
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(3rem, 6vw, 5rem)",
                      fontWeight: 300,
                      color: "rgba(212, 175, 55, 0.18)",
                      lineHeight: 1,
                      userSelect: "none",
                      flexShrink: 0,
                    }}
                  >
                    {meta.romanNumeral}
                  </span>

                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--color-gold)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {cat.replace(/-/g, " ").toUpperCase()}
                    </p>
                    <h2
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                        fontWeight: 400,
                        color: "var(--color-text)",
                        lineHeight: 1.2,
                        marginBottom: "0.6rem",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {meta.label}
                    </h2>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        color: "var(--color-muted)",
                        maxWidth: 520,
                        lineHeight: 1.65,
                      }}
                    >
                      {meta.tagline}
                    </p>
                    <div
                      style={{
                        width: 40,
                        height: 1,
                        background: "var(--color-gold)",
                        marginTop: "1rem",
                        opacity: 0.55,
                      }}
                    />
                  </div>
                </motion.div>

                {/* Product Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "2rem",
                  }}
                >
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
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(212, 175, 55, 0.45)",
                    marginTop: "2.5rem",
                    textAlign: "right",
                  }}
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "4rem 0",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: 48,
              height: 1,
              background: "var(--color-gold)",
              opacity: 0.4,
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            House of Raven · Est. 2024
          </p>
          <div
            style={{
              width: 1,
              height: 40,
              background:
                "linear-gradient(to bottom, var(--color-gold), transparent)",
              opacity: 0.4,
            }}
          />
        </div>
      )}

      <Footer />
    </>
  );
}
