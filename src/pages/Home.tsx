import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { SEO } from "../components/seo/SEO";
import { HeroSection } from "../components/home/HeroSection";
import { FeaturedSection } from "../components/home/FeaturedSection";
import { BrandStory } from "../components/home/BrandStory";
import { BestsellersSection } from "../components/home/BestsellersSection";
import { ScentMarquee } from "../components/home/ScentMarquee";
import { useFeaturedProducts, useBestsellers } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";

export default function Home() {
  const { data: featuredProducts = [] } = useFeaturedProducts();
  const { data: bestsellers = [] } = useBestsellers();
  const isMobile = useIsMobile();

  return (
    <>
      <SEO
        title="Luxury Perfumes & Niche Fragrances"
        description="Discover premium and niche fragrances at Raven Scents. Explore our curated collection of luxury perfumes for every occasion."
      />
      <Header />
      <main>
        <HeroSection isMobile={isMobile} />
        <FeaturedSection
          featuredProducts={featuredProducts}
          isMobile={isMobile}
        />
        <BrandStory isMobile={isMobile} />
        <BestsellersSection bestsellers={bestsellers} isMobile={isMobile} />
        <ScentMarquee />
      </main>
      <Footer />
    </>
  );
}
