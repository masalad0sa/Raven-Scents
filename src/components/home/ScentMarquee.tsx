export function ScentMarquee() {
  const scents = [
    "Floral",
    "Woody",
    "Oriental",
    "Aquatic",
    "Gourmand",
    "Citrus",
    "Leather",
    "Aromatic",
    "Chypre",
  ];
  return (
    <section
      style={{
        background: "var(--color-surface)",
        padding: "3rem 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "3rem",
          animation: "marquee 22s linear infinite",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {[...Array(3)].flatMap((_, rep) =>
          scents.map((s, i) => (
            <span
              key={`${rep}-${s}${i}`}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                color:
                  i % 2 === 0 ? "var(--color-text)" : "var(--color-marquee-alt)",
                fontStyle: "italic",
              }}
            >
              {s} ·&nbsp;
            </span>
          )),
        )}
      </div>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
    </section>
  );
}
