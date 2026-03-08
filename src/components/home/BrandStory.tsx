import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GradientBlob } from "../effects";
import s from "./BrandStory.module.css";

export function BrandStory() {
  return (
    <section className={`section ${s.section}`}>
      <div className={s.blobWrap}>
        <GradientBlob size={600} reactToMouse={false} />
      </div>
      <div className={`container ${s.inner}`}>
        <div className={s.grid}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className={s.tagline}>Our Philosophy</p>
            <h2 className={s.heading}>
              Fragrance is the
              <br />
              <em className={s.headingEm}>language of memory</em>
            </h2>
            <p className={s.desc}>
              We craft every fragrance with intention — sourcing the finest
              ingredients from Grasse, Arabia, and beyond. Each bottle is a
              story, each note a chapter.
            </p>
            <Link to="/about" className="btn btn-gold">
              Our Story →
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={s.imgGrid}
          >
            {[
              "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=400&q=80",
              "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400&q=80",
              "https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&q=80",
            ].map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className={s.img}
                loading="lazy"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
