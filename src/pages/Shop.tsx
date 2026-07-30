import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Sun, Moon } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { Header, Footer } from "../components/layout";
import { SEO } from "../components/seo";
import { ProductCard } from "../components/product";
import type { Product } from "../types";
import s from "./styles/Shop.module.css";

type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating"
  | "category";

export default function Shop() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("raven-theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.body.classList.add("theme-light");
      localStorage.setItem("raven-theme", "light");
    } else {
      document.body.classList.remove("theme-light");
      localStorage.setItem("raven-theme", "dark");
    }
    return () => {
      document.body.classList.remove("theme-light");
    };
  }, [isLight]);

  const { data, isLoading } = useProducts();
  const products = data?.products || [];

  const categories = useMemo(
    () =>
      [
        ...new Set(products.map((p: Product) => p.category).filter(Boolean)),
      ].sort() as string[],
    [products],
  );

  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
    if (selectedCategories.length > 0)
      result = result.filter((p) => selectedCategories.includes(p.category));
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
      case "category":
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return result;
  }, [
    products,
    search,
    selectedGender,
    selectedCategories,
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
    setSelectedCategories([]);
    setPriceMax(50000);
    setShowNew(false);
    setShowBestseller(false);
    setSearch("");
  };

  const hasFilters =
    selectedGender.length > 0 ||
    selectedCategories.length > 0 ||
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
        title="Our Collections"
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
              <h1 className={s.bannerTitle}>The Collections</h1>
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
              <option value="category">Category</option>
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

                    {/* Category */}
                    <div>
                      <h4 className={s.filterSectionTitle}>Category</h4>
                      {categories.map((cat) => (
                        <label
                          key={cat}
                          className={
                            selectedCategories.includes(cat)
                              ? s.checkLabelActive
                              : s.checkLabelInactive
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() =>
                              toggleFilter(
                                selectedCategories,
                                cat,
                                setSelectedCategories,
                              )
                            }
                            style={{ accentColor: "var(--color-gold)" }}
                          />
                          {cat}
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

      {/* Floating Golden Theme Toggle */}
      <motion.button
        onClick={() => setIsLight((prev) => !prev)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 999,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "rgba(212, 175, 55, 0.12)",
          border: "1px solid var(--color-gold)",
          color: "var(--color-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          outline: "none",
        }}
        title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isLight ? "light" : "dark"}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex" }}
          >
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
