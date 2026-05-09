import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GradientBlob } from "../effects";
import s from "./HeroSection.module.css";

interface HeroSectionProps {
  isMobile: boolean;
}

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

export function HeroSection({ isMobile }: HeroSectionProps) {
  return (
    <section className={s.section}>
      {/* HUD Circles */}
      <div className={s.hudWrap}>
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
      <div className={s.blobWrap}>
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
          className={s.tagline}
        >
          New Collection — 2025
        </motion.p>

        <div className={s.headingWrap}>
          {["DISCOVER", "YOUR", "SCENT"].map((word, i) => (
            <motion.div
              key={word}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i + 1}
              className={i === 1 ? s.headingGold : s.headingWord}
            >
              {word}
            </motion.div>
          ))}
        </div>

        <div className={s.bottomRow}>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className={s.desc}
          >
            A curation of rare, niche, and luxury fragrances. From fresh citrus
            to deep oud — find your signature scent.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className={s.btnRow}
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
          className={s.scrollIndicator}
        >
          <div className={s.scrollLine} />
          <span className={s.scrollText}>Scroll</span>
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className={s.statsBar}>
        <div className={`${s.statsRow} container no-scrollbar`}>
          {[
            { value: "50+", label: "Luxury Fragrances" },
            { value: "100%", label: "In-House Crafted" },
            { value: "12K+", label: "Happy Customers" },
            { value: "100%", label: "Authentic Guarantee" },
          ].map((stat) => (
            <div key={stat.label} className={s.statItem}>
              <div className={s.statValue}>{stat.value}</div>
              <div className={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
