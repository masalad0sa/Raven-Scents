import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/product/ProductCard";
import { ProductGallery } from "../components/product/ProductGallery";
import { ProductInfo } from "../components/product/ProductInfo";
import { ProductTabs } from "../components/product/ProductTabs";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";
import { SEO } from "../components/seo/SEO";

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
        <div
          style={{
            paddingTop: 100,
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-muted)",
            }}
          >
            Loading fragrance...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div
          style={{
            paddingTop: 100,
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              color: "var(--color-primary)",
              marginBottom: "1rem",
            }}
          >
            Product not found
          </h1>
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
      <main
        style={{
          paddingTop: 72,
          background: "var(--color-ivory)",
          minHeight: "100vh",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            background: "var(--color-surface)",
            padding: "0.45rem 0",
            borderBottom: "1px solid rgba(212,175,55,0.15)",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Link
              to="/shop"
              style={{
                color: "var(--color-muted)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <ChevronLeft size={12} /> Shop
            </Link>
            <span style={{ color: "var(--color-muted)" }}>/</span>
            <span style={{ color: "var(--color-text)", fontWeight: 600 }}>
              {product.name}
            </span>
          </div>
        </div>

        <div
          className="container"
          style={{ padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "52% 1fr",
              gap: isMobile ? "1.25rem" : "3rem",
              alignItems: "start",
            }}
          >
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
            <div style={{ marginTop: isMobile ? "1.5rem" : "2rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: isMobile ? "1.5rem" : "2rem",
                  fontWeight: 300,
                  color: "var(--color-text)",
                  marginBottom: isMobile ? "1rem" : "2rem",
                }}
              >
                You May Also Like
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: isMobile ? "0.75rem" : "1.25rem",
                }}
              >
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
