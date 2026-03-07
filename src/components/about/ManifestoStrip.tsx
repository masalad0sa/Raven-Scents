export function ManifestoStrip() {
  return (
    <section
      style={{
        background: "var(--color-gold)",
        padding: "2rem 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "4rem",
          animation: "marquee 18s linear infinite",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {[...Array(4)].flatMap(() =>
          [
            "CRAFTED WITH INTENTION",
            "·",
            "MADE IN SMALL BATCHES",
            "·",
            "ZERO COMPROMISE",
            "·",
            "YOUR SCENT, YOUR STORY",
            "·",
          ].map((s, i) => (
            <span
              key={`${s}${i}`}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: "var(--color-primary)",
              }}
            >
              {s}
            </span>
          )),
        )}
      </div>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-25%)}}`}</style>
    </section>
  );
}
