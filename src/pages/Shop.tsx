import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/product/ProductCard';
import { products, brands, scentFamilies } from '../data/products';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');

  // Active filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedScentFamilies, setSelectedScentFamilies] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showNew, setShowNew] = useState(false);
  const [showBestseller, setShowBestseller] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.scentFamily.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Brands
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Gender
    if (selectedGender.length > 0) {
      result = result.filter(p => selectedGender.includes(p.gender));
    }

    // Scent family
    if (selectedScentFamilies.length > 0) {
      result = result.filter(p => selectedScentFamilies.includes(p.scentFamily));
    }

    // Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // New / Bestseller
    if (showNew) result = result.filter(p => p.isNew);
    if (showBestseller) result = result.filter(p => p.isBestseller);

    // Sort
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [search, selectedBrands, selectedGender, selectedScentFamilies, priceRange, sort, showNew, showBestseller]);

  const toggleFilter = (arr: string[], val: string, setFn: (a: string[]) => void) => {
    setFn(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedGender([]);
    setSelectedScentFamilies([]);
    setPriceRange([0, 50000]);
    setShowNew(false);
    setShowBestseller(false);
    setSearch('');
  };

  const hasFilters = selectedBrands.length > 0 || selectedGender.length > 0 || selectedScentFamilies.length > 0 || showNew || showBestseller || search.trim().length > 0;

  const checkboxStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.35rem 0',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: active ? 'var(--color-primary)' : 'var(--color-muted)',
    fontWeight: active ? 600 : 400,
    transition: 'color 0.2s',
  } as React.CSSProperties);

  return (
    <>
      <Header />
      <main style={{ paddingTop: 72, background: 'var(--color-ivory)', minHeight: '100vh' }}>
        {/* Page Title Bar */}
        <div style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', background: 'var(--color-surface)', padding: '2rem 0' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
                Discover
              </p>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: 'var(--color-primary)' }}>
                All Fragrances
              </h1>
            </motion.div>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 2rem' }}>
          {/* Top controls */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder="Search fragrances..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="input"
              style={{ width: 'auto', cursor: 'pointer' }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline"
              style={{ gap: '0.5rem', padding: '0.75rem 1.25rem' }}
            >
              <SlidersHorizontal size={14} />
              Filters {hasFilters && <span style={{ background: 'var(--color-gold)', color: 'var(--color-primary)', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>●</span>}
            </button>

            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--color-muted)', marginLeft: 'auto' }}>
              {filtered.length} RESULTS
            </span>
          </div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Sidebar */}
            {sidebarOpen && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  width: 240,
                  flexShrink: 0,
                  background: '#fff',
                  borderRadius: 6,
                  padding: '1.5rem',
                  border: '1px solid #EDE8DC',
                  position: 'sticky',
                  top: 92,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Filters</h3>
                  {hasFilters && (
                    <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gold)', fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Clear All</button>
                  )}
                </div>

                {/* Show flags */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EDE8DC' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>Collection</h4>
                  {[{ label: 'New Arrivals', val: showNew, set: setShowNew }, { label: 'Bestsellers', val: showBestseller, set: setShowBestseller }].map(({ label, val, set }) => (
                    <label key={label} style={checkboxStyle(val)}>
                      <input type="checkbox" checked={val} onChange={() => set(!val)} style={{ accentColor: 'var(--color-gold)' }} />
                      {label}
                    </label>
                  ))}
                </div>

                {/* Brand */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EDE8DC' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>Brand</h4>
                  {brands.map(b => (
                    <label key={b} style={checkboxStyle(selectedBrands.includes(b))}>
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleFilter(selectedBrands, b, setSelectedBrands)} style={{ accentColor: 'var(--color-gold)' }} />
                      {b}
                    </label>
                  ))}
                </div>

                {/* Gender */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EDE8DC' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>Gender</h4>
                  {['masculine', 'feminine', 'unisex'].map(g => (
                    <label key={g} style={checkboxStyle(selectedGender.includes(g))}>
                      <input type="checkbox" checked={selectedGender.includes(g)} onChange={() => toggleFilter(selectedGender, g, setSelectedGender)} style={{ accentColor: 'var(--color-gold)' }} />
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </label>
                  ))}
                </div>

                {/* Scent Family */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EDE8DC' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>Scent Family</h4>
                  {scentFamilies.map(sf => (
                    <label key={sf} style={checkboxStyle(selectedScentFamilies.includes(sf))}>
                      <input type="checkbox" checked={selectedScentFamilies.includes(sf)} onChange={() => toggleFilter(selectedScentFamilies, sf, setSelectedScentFamilies)} style={{ accentColor: 'var(--color-gold)' }} />
                      {sf}
                    </label>
                  ))}
                </div>

                {/* Price range */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>Max Price</h4>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <input
                      type="range"
                      min={0}
                      max={50000}
                      step={500}
                      value={priceRange[1]}
                      onChange={e => setPriceRange([0, Number(e.target.value)])}
                      style={{ width: '100%', accentColor: 'var(--color-gold)' }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    Up to ₹{priceRange[1].toLocaleString('en-IN')}
                  </span>
                </div>
              </motion.aside>
            )}

            {/* Product Grid */}
            <div style={{ flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>No fragrances match your filters</p>
                  <button onClick={clearAll} className="btn btn-primary">Clear Filters</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
                  {filtered.map(product => (
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
