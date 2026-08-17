import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Product } from "../../types";
import s from "./HeroSection.module.css";

interface HeroSectionProps {
  isMobile: boolean;
  featuredProducts?: Product[];
}

const DEFAULT_HERO_PRODUCTS: Product[] = [
  {
    id: "1a1e8b68-3fa4-47ca-9ab0-2346a33e54f8",
    name: "Luxuria Gold Edition",
    brand: "RAVEN",
    slug: "luxuria-gold-edition-50ml",
    shortDescription:
      "Warm oriental woody gourmand fragrance with rum, vanilla, chestnut, and cedar.",
    description:
      "RAVEN™ Luxuria Gold Edition blends rum, elemi, bergamot, lavender, davana, Madagascar vanilla, chestnut, cedar, and patchouli into a rich luxurious scent.",
    price: 999,
    compareAtPrice: 2499,
    images: [
      "https://mgvxjluytusarcnxufxf.supabase.co/storage/v1/object/public/product-images/products/1a1e8b68-3fa4-47ca-9ab0-2346a33e54f8/1778410832578-ul0ip5.jpeg",
    ],
    category: "eau-de-parfum",
    gender: "unisex",
    scentFamily: "Oriental Woody Gourmand",
    concentration: "Eau de Parfum (EDP)",
    sillage: "heavy",
    longevity: "12+ hours",
    tags: ["Warm", "Boozy", "Sweet", "Spicy", "Woody"],
    notes: {
      top: ["Rum", "Elemi", "Bergamot"],
      middle: ["Lavender", "Davana"],
      base: ["Madagascar Vanilla", "Chestnut", "Cedar", "Patchouli"],
    },
    rating: 4.9,
    reviewCount: 128,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    variants: [
      {
        id: "v1",
        size: 50,
        unit: "ml",
        price: 999,
        stock: 50,
        sku: "LUX-GOLD-50ML",
      },
    ],
  },
  {
    id: "31f5f281-e6cc-44c7-b18a-9cf2007099b1",
    name: "Dark Ocean Gold Edition",
    brand: "RAVEN",
    slug: "raven-dark-ocean-gold-edition",
    shortDescription:
      "Refined wave of ocean air with mandarin orange, peony, and osmanthus.",
    description:
      "RAVEN™ Dark Ocean Gold Edition opens with mandarin orange and peony, with a heart of osmanthus and rose over sandalwood and patchouli.",
    price: 999,
    compareAtPrice: 2499,
    images: [
      "https://mgvxjluytusarcnxufxf.supabase.co/storage/v1/object/public/product-images/products/4fcbbbca-7dad-4c87-a50f-7388a71713ec/1778298719506-mlvqtg.jpg",
    ],
    category: "eau-de-parfum",
    gender: "unisex",
    scentFamily: "Floral Fresh Aquatic",
    concentration: "ELIXIR",
    sillage: "moderate",
    longevity: "12+ hours",
    tags: ["Floral", "Fresh", "Citrus", "Woody"],
    notes: {
      top: ["Mandarin Orange", "Peony", "Citrus Accords"],
      middle: ["Osmanthus", "Rose"],
      base: ["Sandalwood", "Patchouli", "Pink Pepper"],
    },
    rating: 4.8,
    reviewCount: 94,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    variants: [
      {
        id: "v2",
        size: 50,
        unit: "ml",
        price: 999,
        stock: 50,
        sku: "DARK-OCEAN-50ML",
      },
    ],
  },
];

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

export function HeroSection({
  isMobile: _isMobile,
  featuredProducts = [],
}: HeroSectionProps) {
  const displayProducts =
    featuredProducts.length >= 2
      ? featuredProducts.slice(0, 3)
      : DEFAULT_HERO_PRODUCTS;

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || displayProducts.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayProducts.length);
    }, 6000); // Smooth 6-second auto-slide

    return () => clearInterval(timer);
  }, [isPaused, displayProducts.length]);

  const currentProduct = displayProducts[activeIdx] || displayProducts[0];
  const discountPct = currentProduct.compareAtPrice
    ? Math.round(
        ((currentProduct.compareAtPrice - currentProduct.price) /
          currentProduct.compareAtPrice) *
          100,
      )
    : null;

  return (
    <section className={s.section}>
      {/* Left Column (60%) with Video Background & Main Content */}
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
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className={s.firstOrderPromo}
          >
            Get 15% discount on your first order. Use code: <span className={s.promoCode}>WELCOME15</span>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className={s.heroSubtitle}
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
                custom={i + 2}
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
              custom={5}
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
        </div>
      </div>

      {/* Right Column (40%) with video1.mp4 background & Custom Minimal Hero Card Auto-Slider */}
      <div className={s.rightColumn}>
        <video
          className={s.rightBgVideo}
          src="/video1.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={s.rightVideoOverlay} />

        {/* Horizontal Auto-Slider Product Card */}
        <div
          className={s.heroProductsWrap}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={s.heroProductsHeader}>
            <span className={s.heroProductsTag}>Featured Selection</span>
            <h3 className={s.heroProductsTitle}>Signature Fragrances</h3>
          </div>

          <div className={s.heroSliderViewport}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={`/product/${currentProduct.slug}`}
                  className={s.heroCardLink}
                >
                  <div className={s.heroMinimalCard}>
                    {/* Image & Badges */}
                    <div className={s.heroImgBox}>
                      <img
                        src={currentProduct.images[0]}
                        alt={currentProduct.name}
                        className={s.heroImg}
                      />
                      <div className={s.heroBadgeContainer}>
                        {currentProduct.isBestseller && (
                          <span className={s.heroBadgeBestseller}>
                            Bestseller
                          </span>
                        )}
                        {discountPct && (
                          <span className={s.heroBadgeDiscount}>
                            SAVE {discountPct}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Minimal Info */}
                    <div className={s.heroCardBody}>
                      <span className={s.heroCardCategory}>
                        {currentProduct.scentFamily || currentProduct.category}
                      </span>
                      <h4 className={s.heroCardName}>{currentProduct.name}</h4>
                      <div className={s.heroPriceRow}>
                        <span className={s.heroCurrentPrice}>
                          ₹{currentProduct.price.toLocaleString("en-IN")}
                        </span>
                        {currentProduct.compareAtPrice && (
                          <span className={s.heroComparePrice}>
                            ₹
                            {currentProduct.compareAtPrice.toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

