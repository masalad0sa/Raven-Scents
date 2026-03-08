import { motion } from "framer-motion";
import { GradientBlob } from "../effects";
import s from "./StoryTimeline.module.css";

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
    <section className={`section ${s.section}`}>
      <div className={s.blobRight}>
        <GradientBlob size={560} reactToMouse={false} />
      </div>
      <div className={s.blobLeft}>
        <GradientBlob size={420} reactToMouse={false} />
      </div>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={s.headerWrap}
        >
          <p className={s.tagline}>Our Journey</p>
          <h2 className={s.heading}>From Studio to Shelf</h2>
        </motion.div>

        <div className={s.timelineWrap}>
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
                  <div className={s.dotMobile} />
                  <div>
                    <span className={s.yearMobile}>{item.year}</span>
                    <h3 className={s.itemTitleMobile}>{item.title}</h3>
                    <p className={s.itemDesc}>{item.desc}</p>
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
                    <span className={s.yearDesktop}>{item.year}</span>
                    <h3 className={s.itemTitleDesktop}>{item.title}</h3>
                    <p className={s.itemDesc}>{item.desc}</p>
                  </div>
                  <div className={s.dotDesktop} />
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
