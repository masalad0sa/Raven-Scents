import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import s from "./StatsRibbon.module.css";

function CountUp({ end, suffix = "", duration = 1.5 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();

    const updateCount = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // Ease out quad
      
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { end: 50, suffix: "+", label: "Luxury Fragrances" },
  { end: 100, suffix: "%", label: "In-House Crafted" },
  { end: 12, suffix: "K+", label: "Happy Customers" },
  { end: 100, suffix: "%", label: "Authentic Guarantee" },
];

export function StatsRibbon() {
  return (
    <section className={s.section}>
      <div className={s.glowOverlay} />
      <div className={`${s.container} container`}>
        <div className={s.grid}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className={s.statItem}
            >
              <div className={s.radialGlow} />
              <div className={s.statContent}>
                <div className={s.statValue}>
                  <CountUp end={stat.end} suffix={stat.suffix} />
                </div>
                <div className={s.statLabel}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
