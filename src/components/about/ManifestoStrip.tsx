import s from "./ManifestoStrip.module.css";

export function ManifestoStrip() {
  return (
    <section className={s.strip}>
      <div className={s.track}>
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
          ].map((t, i) => (
            <span key={`${t}${i}`} className={s.word}>
              {t}
            </span>
          )),
        )}
      </div>
    </section>
  );
}
