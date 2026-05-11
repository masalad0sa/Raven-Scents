import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GradientBlob } from "../effects";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import s from "./BrandStory.module.css";

export function BrandStory() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await supabase
          .from("products")
          .select("images")
          .limit(3);

        if (data) {
          // `images` is a text[] on the products table; use the first image if present
          const imgs = data
            .map((item: any) =>
              Array.isArray(item.images) ? item.images[0] : null,
            )
            .filter(Boolean) as string[];
          setImages(imgs);
        }
      } catch (error) {
        console.error("Failed to fetch brand story images:", error);
      }
    };

    fetchImages();
  }, []);

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
            {images.map((url, i) => (
              <img key={i} src={url} alt="" className={s.img} loading="lazy" />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
