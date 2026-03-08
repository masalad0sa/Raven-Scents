import { useFeaturedProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import {
  AboutHero,
  ManifestoStrip,
  StoryTimeline,
  ValuesGrid,
  ProcessSection,
  AboutCTA,
} from "../components/about";
import type { Product } from "../types";
import s from "./styles/About.module.css";

export default function About() {
  const { data: featured } = useFeaturedProducts();
  const isMobile = useIsMobile();
  const processImages = (featured ?? [])
    .slice(0, 3)
    .map((p: Product) => p.images?.[0])
    .filter(Boolean);

  return (
    <>
      <SEO
        title="About Raven Scents"
        description="Learn about Raven Scents — our story, philosophy, and commitment to crafting exceptional fragrances."
      />
      <Header />
      <main className={s.main}>
        <AboutHero />
        <ManifestoStrip />
        <StoryTimeline isMobile={isMobile} />
        <ValuesGrid />
        <ProcessSection processImages={processImages} isMobile={isMobile} />
        <AboutCTA />
      </main>
      <Footer />
    </>
  );
}
