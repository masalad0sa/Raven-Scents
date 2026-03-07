import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { useFeaturedProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { SEO } from "../components/seo/SEO";
import { AboutHero, ManifestoStrip } from "../components/about/AboutHero";
import { StoryTimeline } from "../components/about/StoryTimeline";
import { ValuesGrid } from "../components/about/ValuesGrid";
import { ProcessSection } from "../components/about/ProcessSection";
import { AboutCTA } from "../components/about/AboutCTA";

export default function About() {
  const { data: featured } = useFeaturedProducts();
  const isMobile = useIsMobile();
  const processImages = (featured ?? [])
    .slice(0, 3)
    .map((p: any) => p.images?.[0])
    .filter(Boolean);

  return (
    <>
      <SEO
        title="About Raven Scents"
        description="Learn about Raven Scents — our story, philosophy, and commitment to crafting exceptional fragrances."
      />
      <Header />
      <main style={{ paddingTop: 72, background: "var(--color-ivory)" }}>
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
