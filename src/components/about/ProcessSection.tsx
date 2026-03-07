import { GradientBlob } from "../effects/GradientBlob";

const steps = [
  { step: "01", title: "Concept", desc: "Every fragrance begins with a feeling — a memory, a landscape, an emotion." },
  { step: "02", title: "Formula", desc: "Our perfumers blend and test hundreds of ingredient combinations until the balance is exact." },
  { step: "03", title: "Refinement", desc: "We live with each formula for weeks, adjusting top, heart, and base notes on real skin." },
  { step: "04", title: "Bottling", desc: "Small-batch bottled with care, every bottle leaves our studio ready to tell its story." },
];

export function ProcessSection({ processImages, isMobile }: { processImages: string[]; isMobile: boolean }) {
  return (
    <section className="section" style={{ background: "var(--color-primary)", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", right: "-100px", bottom: "-100px", opacity: 0.15, pointerEvents: "none" }}>
        <GradientBlob size={500} reactToMouse={false} />
      </div>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "1.25rem" }}>Our Process</p>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "var(--color-ivory)", lineHeight: 1.15, marginBottom: "1.5rem" }}>
              100+ Iterations<br /><em style={{ color: "var(--color-gold)" }}>Until It's Perfect</em>
            </h2>
            {steps.map((item) => (
              <div key={item.step} style={{ display: "flex", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--color-gold)", fontWeight: 700, paddingTop: "0.2rem", flexShrink: 0 }}>{item.step}</span>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ivory)", fontWeight: 600, marginBottom: "0.3rem" }}>{item.title}</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "rgba(232,228,220,0.55)", lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {processImages.map((url, i) => (
              <img key={i} src={url} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 6, marginTop: i % 2 === 1 ? "1.5rem" : 0, opacity: 0.85 }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
