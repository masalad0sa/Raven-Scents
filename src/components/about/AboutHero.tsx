import { motion } from "framer-motion";
import { GradientBlob } from "../effects";

export function AboutHero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        background: "var(--color-primary)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.45,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <GradientBlob size={900} reactToMouse={true} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {[700, 450, 220].map((size, i) => (
          <div
            key={i}
            className="hud-circle"
            style={{
              width: size,
              height: size,
              top: "50%",
              right: "-10%",
              transform: "translateY(-50%)",
              borderColor: "rgba(212,175,55,0.1)",
            }}
          />
        ))}
      </div>
      <div
        className="container"
        style={{ position: "relative", zIndex: 1, padding: "6rem 2rem" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: "1.25rem",
            }}
          >
            Who We Are
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              fontWeight: 300,
              color: "var(--color-text)",
              lineHeight: 1.0,
              marginBottom: "1.75rem",
            }}
          >
            We Don't Follow
            <br />
            <em style={{ color: "var(--color-gold)" }}>Trends.</em>
            <br />
            We Set Them.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "rgba(232,228,220,0.65)",
              maxWidth: 520,
              lineHeight: 1.9,
            }}
          >
            Raven is an independent perfume house — crafting bold, intimate, and
            unforgettable fragrances entirely from our own studio. No
            celebrities, no licensing. Just perfectly made scents.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
