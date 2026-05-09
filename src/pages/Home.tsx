import { useFeaturedProducts, useBestsellers } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import {
  HeroSection,
  FeaturedSection,
  BrandStory,
  BestsellersSection,
  ScentMarquee,
} from "../components/home";

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
        <BrandStory />
        <BestsellersSection bestsellers={bestsellers} isMobile={isMobile} />
        <ScentMarquee />
      </main>
      <Footer />
    </>
  );
}
