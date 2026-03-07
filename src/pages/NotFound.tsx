import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header, Footer } from "../components/layout";
import s from "./styles/NotFound.module.css";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className={s.main}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={s.wrapper}
        >
          <div className={s.bigCode}>404</div>
          <h1 className={s.title}>Scent Not Found</h1>
          <p className={s.subtitle}>
            This page seems to have evaporated, much like a fleeting top note.
            Let us guide you back to something wonderful.
          </p>
          <div className={s.actions}>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
            <Link to="/shop" className="btn btn-outline">
              Explore Shop
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
