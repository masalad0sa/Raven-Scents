import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GradientBlob } from "../effects";
import s from "./AboutCTA.module.css";

export function AboutCTA() {
  return (
    <section className={`section ${s.section}`}>
      <div className={s.blobLeft}>
        <GradientBlob size={480} reactToMouse={false} />
      </div>
      <div className={s.blobRight}>
        <GradientBlob size={400} reactToMouse={false} />
      </div>
      <div className={`container ${s.inner}`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={s.heading}>
            Ready to Find Your
            <br />
            <em className={s.headingEm}>Signature Scent?</em>
          </h2>
          <Link to="/shop" className="btn btn-primary">
            Explore Our Collection <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
