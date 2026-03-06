import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ProductCard } from "../components/product/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useIsMobile } from "../hooks/useIsMobile";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export default function Shop() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  const { data, isLoading } = useProducts();
  const products = data?.products || [];

  const scentFamilies = useMemo(
    () =>
      [
        ...new Set(products.map((p: any) => p.scentFamily).filter(Boolean)),
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

  const checkStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.35rem 0",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "0.85rem",
    color: active ? "var(--color-text)" : "var(--color-muted)",
    fontWeight: active ? 600 : 400,
    transition: "color 0.2s",
  });

  const filterSection = (title: string, children: React.ReactNode) => (
    <div
      style={{
        marginBottom: "1.5rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
      }}
    >
      <h4
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.62rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );

  return (
    <>
      <Header />
      <main
        style={{
          paddingTop: 72,
          background: "var(--color-ivory)",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid rgba(212,175,55,0.2)",
            background: "var(--color-surface)",
            padding: "2rem 0",
          }}
        >
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-gold)",
                  marginBottom: "0.5rem",
                }}
              >
                Discover
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 300,
                  color: "var(--color-text)",
                }}
              >
                All Fragrances
              </h1>
            </motion.div>
          </div>
        </div>

        <div
          className="container"
          style={{ padding: isMobile ? "1rem" : "2rem 2rem" }}
        >
          {/* Controls bar */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{ position: "relative", flex: "1 1 260px", maxWidth: 360 }}
            >
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-muted)",
                }}
              />
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
              Filters{" "}
              {hasFilters && (
                <span
                  style={{
                    background: "var(--color-gold)",
                    color: "var(--color-primary)",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                  }}
                >
                  ●
                </span>
              )}
            </button>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                color: "var(--color-muted)",
                marginLeft: "auto",
              }}
            >
              {filtered.length} RESULTS
            </span>
          </div>

          <div
            style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}
          >
            {/* Sidebar — overlay on mobile, inline on desktop */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  {/* Mobile overlay backdrop */}
                  {isMobile && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        zIndex: 998,
                      }}
                    />
                  )}
                  <motion.aside
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{
                      width: isMobile ? "85vw" : 240,
                      maxWidth: isMobile ? 320 : 240,
                      flexShrink: 0,
                      background: "#1a1a1a",
                      borderRadius: isMobile ? 0 : 6,
                      padding: "1.5rem",
                      border: isMobile
                        ? "none"
                        : "1px solid rgba(212,175,55,0.15)",
                      ...(isMobile
                        ? {
                            position: "fixed" as const,
                            top: 0,
                            left: 0,
                            bottom: 0,
                            zIndex: 999,
                            overflowY: "auto" as const,
                          }
                        : {
                            position: "sticky" as const,
                            top: 92,
                            maxHeight: "calc(100vh - 110px)",
                            overflowY: "auto" as const,
                          }),
                    }}
                    className="no-scrollbar"
                  >
                    {isMobile && (
                      <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-muted)",
                        }}
                      >
                        <X size={20} />
                      </button>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.7rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "var(--color-text)",
                        }}
                      >
                        Filters
                      </h3>
                      {hasFilters && (
                        <button
                          onClick={clearAll}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--color-gold)",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                          }}
                        >
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
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--color-gold)",
                          }}
                        >
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
                          <label key={label} style={checkStyle(val)}>
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
                            style={checkStyle(selectedGender.includes(g))}
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
                      <h4
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--color-muted)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Scent Family
                      </h4>
                      {scentFamilies.map((sf) => (
                        <label
                          key={sf}
                          style={checkStyle(selectedScentFamilies.includes(sf))}
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
            <div style={{ flex: 1 }}>
              {isLoading ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: isMobile ? "0.75rem" : "1.25rem",
                  }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: isMobile ? 240 : 380,
                        borderRadius: 6,
                        background: "rgba(212,175,55,0.06)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  ))}
                  <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem 0" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.5rem",
                      color: "var(--color-muted)",
                      marginBottom: "1rem",
                    }}
                  >
                    No fragrances match your filters
                  </p>
                  <button onClick={clearAll} className="btn btn-primary">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: isMobile ? "0.75rem" : "1.25rem",
                  }}
                >
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
