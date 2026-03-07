import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GradientBlob } from "../effects";

export function BrandStory({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      className="section"
      style={{
        background: "var(--color-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-200px",
          top: "-200px",
          opacity: 0.15,
          pointerEvents: "none",
        }}
      >
        <GradientBlob size={600} reactToMouse={false} />
      </div>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2rem" : "5rem",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "1.5rem",
              }}
            >
              Our Philosophy
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: 300,
                color: "var(--color-ivory)",
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              Fragrance is the
              <br />
              <em style={{ color: "var(--color-gold)" }}>language of memory</em>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                color: "rgba(232,228,220,0.65)",
                lineHeight: 1.9,
                marginBottom: "2.5rem",
              }}
            >
              We craft every fragrance with intention — sourcing the finest
              ingredients from Grasse, Arabia, and beyond. Each bottle is a
              story, each note a chapter.
            </p>
            <Link to="/about" className="btn btn-gold">
              Our Story →
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {[
              "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=400&q=80",
              "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400&q=80",
              "https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&q=80",
            ].map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: 6,
                  marginTop: i % 2 === 1 ? "2rem" : 0,
                }}
                loading="lazy"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
