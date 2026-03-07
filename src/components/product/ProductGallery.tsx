import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      style={{
        display: "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
        gap: "0.6rem",
      }}
    >
      {/* Thumbnail strip */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: "0.5rem",
          flexShrink: 0,
          ...(isMobile ? { overflowX: "auto", paddingBottom: 4 } : {}),
        }}
        className="no-scrollbar"
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > mainImage ? 1 : -1)}
            style={{
              width: isMobile ? 56 : 72,
              height: isMobile ? 64 : 80,
              borderRadius: 6,
              overflow: "hidden",
              border:
                i === mainImage
                  ? "2px solid var(--color-gold)"
                  : "2px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              background: "#1a1a1a",
              padding: 0,
              transition: "border-color 0.2s",
              flexShrink: 0,
            }}
          >
            <img
              src={img}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        style={{
          flex: 1,
          borderRadius: 8,
          overflow: "hidden",
          height: isMobile ? "55vw" : "calc(100vh - 200px)",
          maxHeight: isMobile ? 400 : 560,
          background: "#1a1a1a",
          position: "relative",
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
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
              zIndex: 2,
            }}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > mainImage ? 1 : -1)}
                style={{
                  width: i === mainImage ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  background:
                    i === mainImage
                      ? "var(--color-gold)"
                      : "rgba(255,255,255,0.35)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
