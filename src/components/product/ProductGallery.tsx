import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import s from "./ProductGallery.module.css";

interface Props {
  images: string[];
  name: string;
  isMobile: boolean;
}

export function ProductGallery({ images, name, isMobile }: Props) {
  const [mainImage, setMainImage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovering, setIsHovering] = useState(false);

  const goTo = (next: number, dir: number) => {
    setDirection(dir);
    setMainImage(next);
  };

  useEffect(() => {
    if ((images?.length ?? 0) <= 1 || isHovering) return;
    const timer = setInterval(() => {
      setDirection(1);
      setMainImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images, isHovering]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`${s.gallery}${isMobile ? ` ${s.galleryMobile}` : ""}`}
    >
      {/* Thumbnail strip */}
      <div
        className={`${s.thumbStrip}${isMobile ? ` ${s.thumbStripMobile}` : ""} no-scrollbar`}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > mainImage ? 1 : -1)}
            className={s.thumbBtn}
            style={{
              width: isMobile ? 56 : 72,
              height: isMobile ? 64 : 80,
              border:
                i === mainImage
                  ? "2px solid var(--color-gold)"
                  : "2px solid rgba(255,255,255,0.08)",
            }}
          >
            <img src={img} alt="" className={s.thumbImg} />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className={s.mainWrap}
        style={{
          height: isMobile ? "55vw" : "calc(100vh - 200px)",
          maxHeight: isMobile ? 400 : 560,
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={mainImage}
            src={images[mainImage]}
            alt={name}
            custom={direction}
            variants={{
              enter: (d: number) => ({
                x: d > 0 ? "100%" : "-100%",
                opacity: 0,
              }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({
                x: d > 0 ? "-100%" : "100%",
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className={s.mainImg}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <div className={s.dots}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > mainImage ? 1 : -1)}
                className={s.dot}
                style={{
                  width: i === mainImage ? 20 : 7,
                  background:
                    i === mainImage
                      ? "var(--color-gold)"
                      : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
