import { GradientBlob } from "../effects";
import s from "./ProcessSection.module.css";

const steps = [
  {
    step: "01",
    title: "Concept",
    desc: "Every fragrance begins with a feeling — a memory, a landscape, an emotion.",
  },
  {
    step: "02",
    title: "Formula",
    desc: "Our perfumers blend and test hundreds of ingredient combinations until the balance is exact.",
  },
  {
    step: "03",
    title: "Refinement",
    desc: "We live with each formula for weeks, adjusting top, heart, and base notes on real skin.",
  },
  {
    step: "04",
    title: "Bottling",
    desc: "Small-batch bottled with care, every bottle leaves our studio ready to tell its story.",
  },
];

export function ProcessSection({
  processImages,
  isMobile,
}: {
  processImages: string[];
  isMobile: boolean;
}) {
  return (
    <section className={`section ${s.section}`}>
      <div className={s.blobWrap}>
        <GradientBlob size={500} reactToMouse={false} />
      </div>
      <div className={`container ${s.inner}`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2rem" : "5rem",
            alignItems: "center",
          }}
        >
          <div>
            <p className={s.tagline}>Our Process</p>
            <h2 className={s.heading}>
              100+ Iterations
              <br />
              <em className={s.headingEm}>Until It's Perfect</em>
            </h2>
            {steps.map((item) => (
              <div key={item.step} className={s.stepRow}>
                <span className={s.stepNum}>{item.step}</span>
                <div>
                  <p className={s.stepTitle}>{item.title}</p>
                  <p className={s.stepDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={s.imgGrid}>
            {processImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                loading="lazy"
                className={s.processImg}
                style={{ marginTop: i % 2 === 1 ? "1.5rem" : 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
