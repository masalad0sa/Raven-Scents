import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GradientBlob } from "../effects/GradientBlob";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.65,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function HeroSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(120deg, #0d0d0d 45%, #111 100%)",
      }}
    >
      {/* HUD Circles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {[800, 550, 300].map((size, i) => (
          <div
            key={i}
            className="hud-circle"
            style={{
              width: size,
              height: size,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Gradient Blob */}
      <div
        style={{
          position: "absolute",
          right: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <GradientBlob size={700} />
      </div>

      {/* Content */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 4,
          padding: isMobile ? "6rem 1rem 4rem" : "8rem 2rem 6rem",
        }}
      >
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: "1.5rem",
          }}
        >
          New Collection — 2025
        </motion.p>

        <div style={{ lineHeight: 0.9, marginBottom: "2.5rem" }}>
          {["DISCOVER", "YOUR", "SCENT"].map((word, i) => (
            <motion.div
              key={word}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i + 1}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(4rem, 11vw, 9rem)",
                fontWeight: 300,
                color: i === 1 ? "var(--color-gold)" : "var(--color-text)",
                fontStyle: i === 1 ? "italic" : "normal",
                letterSpacing: "-0.02em",
                display: "block",
                lineHeight: 1.05,
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "3rem",
            flexWrap: "wrap",
          }}
        >
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--color-muted)",
              maxWidth: 320,
              lineHeight: 1.8,
            }}
          >
            A curation of rare, niche, and luxury fragrances. From fresh citrus
            to deep oud — find your signature scent.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
          >
            <Link to="/shop" className="btn btn-primary">
              Explore Fragrances <ArrowRight size={14} />
            </Link>
            <Link to="/shop?filter=new" className="btn btn-ghost">
              New Arrivals →
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            position: "absolute",
            bottom: "-2rem",
            right: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              width: 1,
              height: 60,
              background:
                "linear-gradient(to bottom, transparent, var(--color-gold))",
              animation: "scrollLine 1.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            Scroll
          </span>
        </motion.div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "1px solid rgba(212,175,55,0.15)",
          background: "rgba(13, 13, 13, 0.9)",
          backdropFilter: "blur(12px)",
          padding: "1.25rem 0",
          zIndex: 4,
        }}
      >
        <div
          className="container no-scrollbar"
          style={{ display: "flex", gap: "3rem", overflowX: "auto" }}
        >
          {[
            { value: "50+", label: "Luxury Fragrances" },
            { value: "100%", label: "In-House Crafted" },
            { value: "12K+", label: "Happy Customers" },
            { value: "100%", label: "Authentic Guarantee" },
          ].map((stat) => (
            <div key={stat.label} style={{ flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  color: "var(--color-gold)",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                  marginTop: "0.2rem",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%,100% { transform: scaleY(0.5); opacity: 0.3; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
