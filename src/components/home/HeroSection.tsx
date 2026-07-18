import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = ["/perfume1.png", "/perfume2.png"];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className={s.section}>
      {/* Left Column (70%) with Video Background & Main Content */}
      <div className={s.leftColumn}>
        <video
          className={s.bgVideo}
          src="/video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={s.videoOverlay} />

        <div className={s.leftContent}>
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

          {/* Stats Bar Integrated Directly inside the Left Column */}
          <div className={s.statsBarIntegrated}>
            {[
              { value: "50+", label: "Luxury Fragrances" },
              { value: "100%", label: "In-House Crafted" },
              { value: "12K+", label: "Happy Customers" },
              { value: "100%", label: "Authentic Guarantee" },
            ].map((stat) => (
              <div key={stat.label} className={s.statItemIntegrated}>
                <div className={s.statValue}>{stat.value}</div>
                <div className={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (30%) with concentric circles, gradient blob, and sliding perfume bottles */}
      <div className={s.rightColumn}>
        {/* Concentric Circle HUD rings */}
        <div className={s.circlesWrap}>
          {[600, 400, 200].map((size, i) => (
            <div
              key={i}
              className="hud-circle"
              style={{
                width: size,
                height: size,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderColor: "rgba(212, 175, 55, 0.08)",
              }}
            />
          ))}
        </div>

        {/* Gradient Blob background */}
        <div className={s.blobWrap}>
          <GradientBlob size={600} />
        </div>

        {/* Perfume Images Slider */}
        <div className={s.sliderContainer}>
          <AnimatePresence mode="wait">
            <motion.img
              key={activeSlide}
              src={slides[activeSlide]}
              alt={`Perfume ${activeSlide + 1}`}
              className={s.slideImage}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </AnimatePresence>

          {/* Slider Controls / Dots */}
          <div className={s.sliderDots}>
            {slides.map((_, i) => (
              <button
                key={i}
                className={`${s.dot} ${activeSlide === i ? s.activeDot : ""}`}
                onClick={() => setActiveSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
