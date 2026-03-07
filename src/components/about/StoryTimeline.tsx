import { motion } from "framer-motion";
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

const timeline = [
  {
    year: "2018",
    title: "The Beginning",
    desc: "Founded in a small studio with a single reed diffuser and a dream. Our first fragrance — Velvet Rose — was born here.",
  },
  {
    year: "2020",
    title: "First Collection",
    desc: 'Launched 6 fragrances under our inaugural "Origins" collection, selling out within 3 weeks.',
  },
  {
    year: "2022",
    title: "Our Own Lab",
    desc: "Opened a dedicated fragrance lab allowing us full control over every note, every molecule, every memory.",
  },
  {
    year: "2024",
    title: "Raven Evolves",
    desc: "Expanded to 50+ fragrances, launched nationwide shipping, and introduced our signature Oud Bouquet series.",
  },
];

export function StoryTimeline({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      className="section"
      style={{
        background: "var(--color-ivory)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-180px",
          top: "-120px",
          opacity: 0.12,
          pointerEvents: "none",
        }}
      >
        <GradientBlob size={560} reactToMouse={false} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "-150px",
          bottom: "-100px",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      >
        <GradientBlob size={420} reactToMouse={false} />
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
            Our Journey
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 300,
              color: "var(--color-text)",
            }}
          >
            From Studio to Shelf
          </h2>
        </motion.div>

        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              position: "absolute",
              left: isMobile ? 8 : "50%",
              top: 0,
              bottom: 0,
              width: 1,
              background:
                "linear-gradient(to bottom, transparent, var(--color-gold), transparent)",
              transform: isMobile ? "none" : "translateX(-50%)",
            }}
          />

          {timeline.map((item, i) => (
            <motion.div
              key={item.year}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              style={{
                display: "flex",
                gap: isMobile ? "1.25rem" : "3rem",
                alignItems: "flex-start",
                marginBottom: "3rem",
                flexDirection: isMobile
                  ? "row"
                  : i % 2 === 0
                    ? "row"
                    : "row-reverse",
              }}
            >
              {isMobile ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      flexShrink: 0,
                      marginTop: "0.25rem",
                      boxShadow: "0 0 0 4px rgba(212,175,55,0.2)",
                    }}
                  />
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "2rem",
                        fontWeight: 300,
                        color: "var(--color-gold)",
                        display: "block",
                        lineHeight: 1,
                      }}
                    >
                      {item.year}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        color: "var(--color-text)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.875rem",
                        color: "var(--color-muted)",
                        lineHeight: 1.8,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      flex: 1,
                      textAlign: i % 2 === 0 ? "right" : "left",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "2.5rem",
                        fontWeight: 300,
                        color: "var(--color-gold)",
                        display: "block",
                        lineHeight: 1,
                      }}
                    >
                      {item.year}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.25rem",
                        fontWeight: 500,
                        color: "var(--color-text)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.875rem",
                        color: "var(--color-muted)",
                        lineHeight: 1.8,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      flexShrink: 0,
                      marginTop: "2.5rem",
                      boxShadow: "0 0 0 4px rgba(212,175,55,0.2)",
                    }}
                  />
                  <div style={{ flex: 1 }} />
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
