import { motion } from "framer-motion";
import { GradientBlob } from "../effects";
import s from "./AboutHero.module.css";

export function AboutHero() {
  return (
    <section className={s.section}>
      <div className={s.blobWrap}>
        <GradientBlob size={900} reactToMouse={true} />
      </div>
      <div className={s.circlesWrap}>
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
      <div className="container" style={{ position: "relative", zIndex: 1, padding: "6rem 2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className={s.tagline}>Who We Are</p>
          <h1 className={s.heading}>
            We Don't Follow
            <br />
            <em className={s.headingEm}>Trends.</em>
            <br />
            We Set Them.
          </h1>
          <p className={s.desc}>
            Raven is an independent perfume house — crafting bold, intimate, and
            unforgettable fragrances entirely from our own studio. No
            celebrities, no licensing. Just perfectly made scents.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
