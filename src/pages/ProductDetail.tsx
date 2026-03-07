import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import {
  ProductCard,
  ProductGallery,
  ProductInfo,
  ProductTabs,
} from "../components/product";
import s from "./styles/ProductDetail.module.css";

export default function ProductDetail() {
  const { slug } = useParams();
  const isMobile = useIsMobile();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: allData } = useProducts();
  const allProducts = allData?.products || [];

  if (isLoading) {
    return (
      <>
        <Header />
        <div className={s.loadingState}>
          <p className={s.loadingText}>Loading fragrance...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className={s.loadingState}>
          <h1 className={s.notFoundTitle}>Product not found</h1>
          <Link to="/shop" className="btn btn-primary">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const related = allProducts
    .filter(
      (p: any) =>
        p.id !== product.id &&
        (p.brand === product.brand || p.scentFamily === product.scentFamily),
    )
    .slice(0, 4);

  const defaultVariant = product.variants[1] ?? product.variants[0];

  return (
    <>
      <SEO
        title={product.name}
        description={
          product.shortDescription || product.description?.slice(0, 160)
        }
        image={product.images?.[0]}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription || product.description,
          image: product.images,
          brand: { "@type": "Brand", name: product.brand },
          offers: defaultVariant
            ? {
                "@type": "Offer",
                price: defaultVariant.price,
                priceCurrency: "INR",
                availability:
                  defaultVariant.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
              }
            : undefined,
          aggregateRating: product.rating
            ? {
                "@type": "AggregateRating",
                ratingValue: product.rating.toFixed(1),
                reviewCount: product.reviewCount ?? 0,
              }
            : undefined,
        }}
      />
      <Header />
      <main className={s.main}>
        {/* Breadcrumb */}
        <div className={s.breadcrumb}>
          <div className={`${s.breadcrumbInner} container`}>
            <Link to="/shop" className={s.breadcrumbLink}>
              <ChevronLeft size={12} /> Shop
            </Link>
            <span className={s.breadcrumbSep}>/</span>
            <span className={s.breadcrumbCurrent}>{product.name}</span>
          </div>
        </div>

        <div className={`${s.content} container`}>
          <div className={s.grid}>
            <ProductGallery
              images={product.images}
              name={product.name}
              isMobile={isMobile}
            />
            <ProductInfo product={product} isMobile={isMobile} />
          </div>

          {/* Tabs */}
          <ProductTabs product={product} isMobile={isMobile} />

          {/* Related Products */}
          {related.length > 0 && (
            <div className={s.relatedSection}>
              <h2 className={s.relatedTitle}>You May Also Like</h2>
              <div className={s.relatedGrid}>
                {related.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
