import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        style={{
          paddingTop: 72,
          background: "var(--color-ivory)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ padding: "4rem 2rem" }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(6rem, 20vw, 12rem)",
              fontWeight: 300,
              color: "var(--color-gold)",
              lineHeight: 1,
              opacity: 0.3,
              marginBottom: "-1rem",
            }}
          >
            404
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: 300,
              color: "var(--color-text)",
              marginBottom: "1rem",
            }}
          >
            Scent Not Found
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              color: "var(--color-muted)",
              lineHeight: 1.8,
              marginBottom: "2.5rem",
              maxWidth: 360,
              margin: "0 auto 2.5rem",
            }}
          >
            This page seems to have evaporated, much like a fleeting top note.
            Let us guide you back to something wonderful.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
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
