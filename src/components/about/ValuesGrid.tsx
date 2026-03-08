import { motion } from "framer-motion";
import { Leaf, FlaskConical, Sparkles, Globe } from "lucide-react";
import { GradientBlob } from "../effects";
import s from "./ValuesGrid.module.css";

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
    <section className={`section ${s.section}`}>
      <div className={s.blobWrap}>
        <GradientBlob size={700} reactToMouse={false} />
      </div>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={s.headerWrap}
        >
          <p className={s.tagline}>What Drives Us</p>
          <h2 className={s.heading}>Built on These Principles</h2>
        </motion.div>

        <div className={s.grid}>
          {values.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={s.card}
            >
              <div className={s.iconWrap}>
                <Icon size={22} color="var(--color-gold)" strokeWidth={1.5} />
              </div>
              <h3 className={s.cardTitle}>{title}</h3>
              <p className={s.cardDesc}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
