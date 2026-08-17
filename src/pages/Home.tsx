import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useFeaturedProducts, useBestsellers } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import {
  HeroSection,
  StatsRibbon,
  FeaturedSection,
  FragranceFinderSection,
  BrandStory,
  BestsellersSection,
  ScentMarquee,
} from "../components/home";

export default function Home() {
  const { data: featuredProducts = [] } = useFeaturedProducts();
  const { data: bestsellers = [] } = useBestsellers();
  const isMobile = useIsMobile();
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("raven-theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.body.classList.add("theme-light");
      localStorage.setItem("raven-theme", "light");
    } else {
      document.body.classList.remove("theme-light");
      localStorage.setItem("raven-theme", "dark");
    }
    return () => {
      document.body.classList.remove("theme-light");
    };
  }, [isLight]);

  return (
    <>
      <SEO
        title="Luxury Perfumes & Niche Fragrances"
        description="Discover premium and niche fragrances at Raven Scents. Explore our curated collection of luxury perfumes for every occasion."
      />
      <Header />
      <main>
        <HeroSection isMobile={isMobile} featuredProducts={featuredProducts} />
        <StatsRibbon />
        <FeaturedSection
          featuredProducts={featuredProducts}
          isMobile={isMobile}
        />
        <BestsellersSection bestsellers={bestsellers} isMobile={isMobile} />
        <BrandStory />
        <FragranceFinderSection />
        <ScentMarquee />
      </main>
      <Footer />

      {/* Floating Golden Theme Toggle */}
      <motion.button
        onClick={() => setIsLight((prev) => !prev)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 999,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "rgba(212, 175, 55, 0.12)",
          border: "1px solid var(--color-gold)",
          color: "var(--color-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          outline: "none",
        }}
        title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isLight ? "light" : "dark"}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex" }}
          >
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
