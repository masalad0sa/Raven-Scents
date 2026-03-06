import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, FlaskConical, Sparkles, Globe } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { GradientBlob } from "../components/effects/GradientBlob";

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

export default function About() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 72, background: "var(--color-ivory)" }}>
        {/* ── Hero ──────────────────────────────────────  */}
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
              left: "-100px",
              bottom: "-200px",
              opacity: 0.2,
              pointerEvents: "none",
            }}
          >
            <GradientBlob size={700} reactToMouse={false} />
          </div>
          <div
            style={{
              position: "absolute",
              right: "-50px",
              top: "-150px",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          >
            <GradientBlob size={500} reactToMouse={false} />
          </div>

          {/* HUD circles */}
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
                Raven is an independent perfume house — crafting bold, intimate,
                and unforgettable fragrances entirely from our own studio. No
                celebrities, no licensing. Just perfectly made scents.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Manifesto Strip ───────────────────────────  */}
        <section
          style={{
            background: "var(--color-gold)",
            padding: "2rem 0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "4rem",
              animation: "marquee 18s linear infinite",
              whiteSpace: "nowrap",
              width: "max-content",
            }}
          >
            {[...Array(4)].flatMap(() =>
              [
                "CRAFTED WITH INTENTION",
                "·",
                "MADE IN SMALL BATCHES",
                "·",
                "ZERO COMPROMISE",
                "·",
                "YOUR SCENT, YOUR STORY",
                "·",
              ].map((s, i) => (
                <span
                  key={`${s}${i}`}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: "var(--color-primary)",
                  }}
                >
                  {s}
                </span>
              )),
            )}
          </div>
          <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-25%)}}`}</style>
        </section>

        {/* ── Story Timeline ────────────────────────────  */}
        <section
          className="section"
          style={{ background: "var(--color-ivory)" }}
        >
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

            <div
              style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}
            >
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background:
                    "linear-gradient(to bottom, transparent, var(--color-gold), transparent)",
                  transform: "translateX(-50%)",
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
                    gap: "3rem",
                    alignItems: "flex-start",
                    marginBottom: "3rem",
                    flexDirection: i % 2 === 0 ? "row" : "row-reverse",
                  }}
                >
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
                  {/* Center dot */}
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values Grid ───────────────────────────────  */}
        <section
          className="section"
          style={{ background: "var(--color-surface)" }}
        >
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
                    <Icon
                      size={22}
                      color="var(--color-gold)"
                      strokeWidth={1.5}
                    />
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

        {/* ── Process Section ───────────────────────────  */}
        <section
          className="section"
          style={{
            background: "var(--color-primary)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-100px",
              bottom: "-100px",
              opacity: 0.15,
              pointerEvents: "none",
            }}
          >
            <GradientBlob size={500} reactToMouse={false} />
          </div>
          <div
            className="container"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "5rem",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--color-gold)",
                    marginBottom: "1.25rem",
                  }}
                >
                  Our Process
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 300,
                    color: "var(--color-ivory)",
                    lineHeight: 1.15,
                    marginBottom: "1.5rem",
                  }}
                >
                  100+ Iterations
                  <br />
                  <em style={{ color: "var(--color-gold)" }}>
                    Until It's Perfect
                  </em>
                </h2>
                {[
                  {
                    step: "01",
                    title: "Concept",
                    desc: "Every fragrance begins with a feeling — a memory, a landscape, an emotion.",
                  },
                  {
                    step: "02",
                    title: "Formula",
                    desc: "Our perfumers blend and test hundreds of ingredient combinations until the balance is exact.",
                  },
                  {
                    step: "03",
                    title: "Refinement",
                    desc: "We live with each formula for weeks, adjusting top, heart, and base notes on real skin.",
                  },
                  {
                    step: "04",
                    title: "Bottling",
                    desc: "Small-batch bottled with care, every bottle leaves our studio ready to tell its story.",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        color: "var(--color-gold)",
                        fontWeight: 700,
                        paddingTop: "0.2rem",
                        flexShrink: 0,
                      }}
                    >
                      {item.step}
                    </span>
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.75rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--color-ivory)",
                          fontWeight: 600,
                          marginBottom: "0.3rem",
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          color: "rgba(232,228,220,0.55)",
                          lineHeight: 1.75,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {[
                  "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=500&q=80",
                  "https://images.unsplash.com/photo-1566977776052-6e61e35bf9be?w=500&q=80",
                  "https://images.unsplash.com/photo-1594035491768-73b0cbb7c0fa?w=500&q=80",
                  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=80",
                ].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    loading="lazy"
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      objectFit: "cover",
                      borderRadius: 6,
                      marginTop: i % 2 === 1 ? "1.5rem" : 0,
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────  */}
        <section
          className="section"
          style={{ background: "var(--color-ivory)", textAlign: "center" }}
        >
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
      </main>
      <Footer />
    </>
  );
}
