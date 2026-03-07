import { motion } from "framer-motion";
import { Leaf, FlaskConical, Sparkles, Globe } from "lucide-react";
import { GradientBlob } from "../effects";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const values = [
  {
    Icon: FlaskConical,
    title: "Crafted In-House",
    desc: "Every fragrance is developed by our own perfumers — blended, tested, and refined in our studio. No outsourcing, no compromise.",
  },
  {
    Icon: Leaf,
    title: "Ethically Sourced",
    desc: "We source ingredients responsibly from their regions of origin — Bulgarian rose, Assam oud, Calabrian bergamot — with full supply chain transparency.",
  },
  {
    Icon: Sparkles,
    title: "Small Batch Quality",
    desc: "Every batch is small by design. This ensures freshness, allows us to refine each formula, and guarantees you receive the best possible quality.",
  },
  {
    Icon: Globe,
    title: "Global Inspirations",
    desc: "Our collections draw from the world's great fragrance traditions — French haute parfumerie, Middle Eastern oud culture, and Japanese minimalism.",
  },
];

export function ValuesGrid() {
  return (
    <section
      className="section"
      style={{
        background: "var(--color-surface)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "-80px",
          transform: "translateX(-50%)",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      >
        <GradientBlob size={700} reactToMouse={false} />
      </div>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
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
            What Drives Us
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 300,
              color: "var(--color-text)",
            }}
          >
            Built on These Principles
          </h2>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {values.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              style={{
                padding: "2.25rem",
                background: "#1a1a1a",
                borderRadius: 8,
                border: "1px solid rgba(212,175,55,0.15)",
                transition: "box-shadow 0.3s, transform 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 20px 48px rgba(0,0,0,0.4)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(212,175,55,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <Icon size={22} color="var(--color-gold)" strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  marginBottom: "0.75rem",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.85,
                }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
