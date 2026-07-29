import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trees, Flame, Waves, Sun } from "lucide-react";
import s from "./FragranceFinderSection.module.css";

interface ScentProfile {
  id: string;
  name: string;
  slug: string;
  price: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  shortMood: string;
  story: string;
  notes: {
    top: string;
    heart: string;
    base: string;
  };
}

const SCENT_PROFILES: Record<string, ScentProfile> = {
  woody: {
    id: "woody",
    name: "Luxuria Gold Edition",
    slug: "luxuria-gold-edition-50ml",
    price: "₹999",
    label: "Warm Woody & Rum",
    Icon: Trees,
    shortMood: "Rich, boozy, and warm cedarwood with Madagascar vanilla.",
    story:
      "Indulge in liquid luxury — golden rum and davana infused with Madagascar vanilla, roasted chestnut, and warm cedarwood.",
    notes: {
      top: "Golden Rum, Elemi, Bergamot",
      heart: "Lavender, Davana",
      base: "Madagascar Vanilla, Chestnut, Cedar, Patchouli",
    },
  },
  smoky: {
    id: "smoky",
    name: "Smoky Oudh",
    slug: "raven-smoky-oudh-50ml",
    price: "₹999",
    label: "Smoky Oud & Saffron",
    Icon: Flame,
    shortMood: "Intense, dark Assam oud and spicy Kashmiri saffron.",
    story:
      "An intense desert aura — precious agarwood oud and aromatic nutmeg illuminated by saffron and dark earth patchouli.",
    notes: {
      top: "Kashmiri Saffron, Nutmeg, Lavender",
      heart: "Smoky Agarwood, Patchouli",
      base: "Precious Oud, Earthy Patchouli, Musk",
    },
  },
  fresh: {
    id: "fresh",
    name: "Dark Ocean Gold",
    slug: "raven-dark-ocean-gold-edition",
    price: "₹999",
    label: "Fresh Ocean & Citrus",
    Icon: Waves,
    shortMood: "Crisp marine breeze, mandarin orange, and white peony.",
    story:
      "A refined wave of ocean air — mandarin orange and white peony opening into rich osmanthus and warm sandalwood.",
    notes: {
      top: "Mandarin Orange, Peony, Citrus Accords",
      heart: "Exotic Osmanthus, Rose",
      base: "Sandalwood, Patchouli, Pink Pepper",
    },
  },
  oriental: {
    id: "oriental",
    name: "Kesar Chandan",
    slug: "kesar-chandan-50ml",
    price: "₹999",
    label: "Royal Saffron & Amber",
    Icon: Sun,
    shortMood: "Pure royal warmth of saffron and creamy Mysore chandan.",
    story:
      "Pure royal warmth — hand-harvested Kashmiri saffron and creamy Indian sandalwood anchored in a timeless amber veil.",
    notes: {
      top: "Hand-harvested Saffron",
      heart: "Creamy Mysore Sandalwood",
      base: "Warm Amber, Soft Woody Accords",
    },
  },
};

export function FragranceFinderSection() {
  const [selectedMood, setSelectedMood] = useState<string>("woody");
  const currentScent = SCENT_PROFILES[selectedMood];

  return (
    <section className={s.section}>
      <div className="container">
        {/* Header */}
        <div className={s.headerWrap}>
          <p className={s.tagline}>Olfactory Concierge</p>
          <h2 className={s.title}>
            Find Your <em>Signature Scent</em>
          </h2>
          <p className={s.subtitle}>
            Every fragrance tells an evocative story. Select your olfactory vibe
            to uncover the scent crafted for your unique presence.
          </p>
        </div>

        {/* Interactive Layout */}
        <div className={s.container}>
          {/* Mood Selection Cards Grid */}
          <div className={s.moodGrid}>
            {[
              { id: "woody", label: "Woody Rum" },
              { id: "smoky", label: "Smoky Oudh" },
              { id: "fresh", label: "Fresh Ocean" },
              { id: "oriental", label: "Kesar Chandan" },
            ].map((mood) => {
              const profile = SCENT_PROFILES[mood.id];
              const IconComp = profile.Icon;
              return (
                <div
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`${s.moodCard} ${
                    selectedMood === mood.id ? s.moodCardActive : ""
                  }`}
                >
                  <div className={s.moodHeader}>
                    <IconComp size={18} className={s.moodIconSvg} />
                    <span className={s.moodLabel}>{mood.label}</span>
                  </div>
                  <p className={s.moodDesc}>{profile.shortMood}</p>
                </div>
              );
            })}
          </div>

          {/* Scent Showcase Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScent.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className={s.showcaseCard}
            >
              <span className={s.scentBadge}>{currentScent.label}</span>

              <div className={s.scentTitleRow}>
                <h3 className={s.scentName}>{currentScent.name}</h3>
                <span className={s.scentPrice}>{currentScent.price}</span>
              </div>

              {/* Story */}
              <p className={s.scentQuote}>“{currentScent.story}”</p>

              {/* Scent Pyramid Notes */}
              <div className={s.notesPyramid}>
                <div className={s.pyramidRow}>
                  <span className={s.pyramidLabel}>Top</span>
                  <span className={s.pyramidValue}>{currentScent.notes.top}</span>
                </div>
                <div className={s.pyramidRow}>
                  <span className={s.pyramidLabel}>Heart</span>
                  <span className={s.pyramidValue}>{currentScent.notes.heart}</span>
                </div>
                <div className={s.pyramidRow}>
                  <span className={s.pyramidLabel}>Base</span>
                  <span className={s.pyramidValue}>{currentScent.notes.base}</span>
                </div>
              </div>

              {/* CTA Link */}
              <Link
                to={`/product/${currentScent.slug}`}
                className={s.ctaBtn}
              >
                Discover {currentScent.name} <Sparkles size={14} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
