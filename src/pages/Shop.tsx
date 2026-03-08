import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import { ProductCard } from "../components/product";
import type { Product } from "../types";
import s from "./styles/Shop.module.css";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export default function Shop() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  const { data, isLoading } = useProducts();
  const products = data?.products || [];

  const scentFamilies = useMemo(
    () =>
      [
        ...new Set(products.map((p: Product) => p.scentFamily).filter(Boolean)),
      ].sort() as string[],
    [products],
  );

  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedScentFamilies, setSelectedScentFamilies] = useState<string[]>(
    [],
  );
  const [priceMax, setPriceMax] = useState(50000);
  const [showNew, setShowNew] = useState(false);
  const [showBestseller, setShowBestseller] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.scentFamily.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q)),
      );
    }
    if (selectedGender.length > 0)
      result = result.filter((p) => selectedGender.includes(p.gender));
    if (selectedScentFamilies.length > 0)
      result = result.filter((p) =>
        selectedScentFamilies.includes(p.scentFamily),
      );
    result = result.filter((p) => p.price <= priceMax);
    if (showNew) result = result.filter((p) => p.isNew);
    if (showBestseller) result = result.filter((p) => p.isBestseller);

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return result;
  }, [
    products,
    search,
    selectedGender,
    selectedScentFamilies,
    priceMax,
    sort,
    showNew,
    showBestseller,
  ]);

  const toggleFilter = (
    arr: string[],
    val: string,
    setFn: (a: string[]) => void,
  ) => setFn(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const clearAll = () => {
    setSelectedGender([]);
    setSelectedScentFamilies([]);
    setPriceMax(50000);
    setShowNew(false);
    setShowBestseller(false);
    setSearch("");
  };

  const hasFilters =
    selectedGender.length > 0 ||
    selectedScentFamilies.length > 0 ||
    priceMax < 50000 ||
    showNew ||
    showBestseller ||
    search.trim().length > 0;

  const filterSection = (title: string, children: React.ReactNode) => (
    <div className={s.filterSection}>
      <h4 className={s.filterSectionTitle}>{title}</h4>
      {children}
    </div>
  );

  return (
    <>
      <SEO
        title="Shop Fragrances"
        description="Browse our curated collection of luxury perfumes. Filter by scent family, gender, and price to find your signature fragrance."
      />
      <Header />
      <main className={s.main}>
        <div className={s.banner}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className={s.bannerEyebrow}>Discover</p>
              <h1 className={s.bannerTitle}>All Fragrances</h1>
            </motion.div>
          </div>
        </div>

        <div className={`${s.content} container`}>
          {/* Controls bar */}
          <div className={s.controls}>
            <div className={s.searchWrap}>
              <Search size={14} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search fragrances..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="input"
              style={{ width: "auto", cursor: "pointer" }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
            </select>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline"
              style={{ gap: "0.5rem", padding: "0.75rem 1.25rem" }}
            >
              <SlidersHorizontal size={14} />
              Filters {hasFilters && <span className={s.filterBadge}>●</span>}
            </button>
            <span className={s.resultCount}>{filtered.length} RESULTS</span>
          </div>

          <div className={s.layout}>
            {/* Sidebar — overlay on mobile, inline on desktop */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  {/* Mobile overlay backdrop */}
                  <motion.div
                    className={s.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.aside
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`${s.sidebar} no-scrollbar`}
                  >
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className={s.sidebarClose}
                    >
                      <X size={20} />
                    </button>
                    <div className={s.sidebarHeader}>
                      <h3 className={s.sidebarTitle}>Filters</h3>
                      {hasFilters && (
                        <button onClick={clearAll} className={s.clearBtn}>
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Price — at top */}
                    {filterSection(
                      "Max Price",
                      <>
                        <input
                          type="range"
                          min={0}
                          max={50000}
                          step={500}
                          value={priceMax}
                          onChange={(e) => setPriceMax(Number(e.target.value))}
                          style={{
                            width: "100%",
                            accentColor: "var(--color-gold)",
                            display: "block",
                            marginBottom: "0.5rem",
                          }}
                        />
                        <span className={s.priceValue}>
                          Up to ₹{priceMax.toLocaleString("en-IN")}
                        </span>
                      </>,
                    )}

                    {/* Collection */}
                    {filterSection(
                      "Collection",
                      <>
                        {[
                          {
                            label: "New Arrivals",
                            val: showNew,
                            set: setShowNew,
                          },
                          {
                            label: "Bestsellers",
                            val: showBestseller,
                            set: setShowBestseller,
                          },
                        ].map(({ label, val, set }) => (
                          <label
                            key={label}
                            className={
                              val ? s.checkLabelActive : s.checkLabelInactive
                            }
                          >
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={() => set(!val)}
                              style={{ accentColor: "var(--color-gold)" }}
                            />
                            {label}
                          </label>
                        ))}
                      </>,
                    )}

                    {/* Gender */}
                    {filterSection(
                      "Gender",
                      <>
                        {["masculine", "feminine", "unisex"].map((g) => (
                          <label
                            key={g}
                            className={
                              selectedGender.includes(g)
                                ? s.checkLabelActive
                                : s.checkLabelInactive
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedGender.includes(g)}
                              onChange={() =>
                                toggleFilter(
                                  selectedGender,
                                  g,
                                  setSelectedGender,
                                )
                              }
                              style={{ accentColor: "var(--color-gold)" }}
                            />
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </label>
                        ))}
                      </>,
                    )}

                    {/* Scent Family */}
                    <div>
                      <h4 className={s.filterSectionTitle}>Scent Family</h4>
                      {scentFamilies.map((sf) => (
                        <label
                          key={sf}
                          className={
                            selectedScentFamilies.includes(sf)
                              ? s.checkLabelActive
                              : s.checkLabelInactive
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedScentFamilies.includes(sf)}
                            onChange={() =>
                              toggleFilter(
                                selectedScentFamilies,
                                sf,
                                setSelectedScentFamilies,
                              )
                            }
                            style={{ accentColor: "var(--color-gold)" }}
                          />
                          {sf}
                        </label>
                      ))}
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className={s.productGridArea}>
              {isLoading ? (
                <div className={s.loadingGrid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={s.shimmerCard} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className={s.emptyState}>
                  <p className={s.emptyTitle}>
                    No fragrances match your filters
                  </p>
                  <button onClick={clearAll} className="btn btn-primary">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={s.productGrid}>
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
