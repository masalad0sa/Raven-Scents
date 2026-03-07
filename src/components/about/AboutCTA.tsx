import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GradientBlob } from "../effects";

export function AboutCTA() {
  return (
    <section
      className="section"
      style={{
        background: "var(--color-ivory)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-100px",
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.13,
          pointerEvents: "none",
        }}
      >
        <GradientBlob size={480} reactToMouse={false} />
      </div>
      <div
        style={{
          position: "absolute",
          right: "-120px",
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      >
        <GradientBlob size={400} reactToMouse={false} />
      </div>
      <div className="container" style={{ maxWidth: 600 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 300,
              color: "var(--color-text)",
              lineHeight: 1.2,
              marginBottom: "1.5rem",
            }}
          >
            Ready to Find Your
            <br />
            <em style={{ color: "var(--color-gold)" }}>Signature Scent?</em>
          </h2>
          <Link to="/shop" className="btn btn-primary">
            Explore Our Collection <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
