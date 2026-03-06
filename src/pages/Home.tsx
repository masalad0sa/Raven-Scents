import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { GradientBlob } from '../components/effects/GradientBlob';
import { ProductCard } from '../components/product/ProductCard';
import { products } from '../data/products';
import { useFeaturedProducts, useBestsellers } from '../hooks/useProducts';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

function CollectionCard({ title, subtitle, image, link }: { title: string; subtitle: string; image: string; link: string }) {
  return (
    <Link to={link} style={{ textDecoration: 'none', display: 'block', position: 'relative', aspectRatio: '3/4', overflow: 'hidden', borderRadius: 6, background: '#111' }}>
      <img
        src={image} alt={title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75, transition: 'transform 0.6s ease, opacity 0.4s ease' }}
        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)'; (e.currentTarget as HTMLImageElement).style.opacity = '0.6'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLImageElement).style.opacity = '0.75'; }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,10,46,0.88) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.75rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.4rem' }}>{subtitle}</p>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400, color: '#fff', lineHeight: 1.2, marginBottom: '0.75rem' }}>{title}</h3>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Shop Now <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { data: featuredProducts = [] } = useFeaturedProducts();
  const { data: bestsellers = [] } = useBestsellers();

  return (
    <>
      <Header />
      <main>
        {/* ── Hero ────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(120deg, var(--color-ivory) 45%, #ede8f5 100%)' }}>
          {/* HUD Circles */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            {[800, 550, 300].map((size, i) => (
              <div key={i} className="hud-circle" style={{ width: size, height: size, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            ))}
          </div>

          {/* Gradient Blob */}
          <div style={{ position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none' }}>
            <GradientBlob size={700} />
          </div>

          {/* Content */}
          <div className="container" style={{ position: 'relative', zIndex: 4, padding: '8rem 2rem 6rem' }}>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0}
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
              New Collection — 2025
            </motion.p>

            <div style={{ lineHeight: 0.9, marginBottom: '2.5rem' }}>
              {['DISCOVER', 'YOUR', 'SCENT'].map((word, i) => (
                <motion.div key={word} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(4rem, 11vw, 9rem)',
                    fontWeight: 300,
                    color: i === 1 ? 'var(--color-gold)' : 'var(--color-primary)',
                    fontStyle: i === 1 ? 'italic' : 'normal',
                    letterSpacing: '-0.02em',
                    display: 'block',
                    lineHeight: 1.05,
                  }}>
                  {word}
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3rem', flexWrap: 'wrap' }}>
              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={4}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--color-muted)', maxWidth: 320, lineHeight: 1.8 }}>
                A curation of rare, niche, and luxury fragrances. From fresh citrus to deep oud — find your signature scent.
              </motion.p>
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/shop" className="btn btn-primary">
                  Explore Fragrances <ArrowRight size={14} />
                </Link>
                <Link to="/shop?filter=new" className="btn btn-ghost">
                  New Arrivals →
                </Link>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              style={{ position: 'absolute', bottom: '-2rem', right: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 1, height: 60, background: 'linear-gradient(to bottom, transparent, var(--color-gold))', animation: 'scrollLine 1.5s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Scroll</span>
            </motion.div>
          </div>

          {/* Stats bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: '1px solid rgba(26,10,46,0.08)', background: 'rgba(250, 246, 238, 0.9)', backdropFilter: 'blur(12px)', padding: '1.25rem 0', zIndex: 4 }}>
            <div className="container no-scrollbar" style={{ display: 'flex', gap: '3rem', overflowX: 'auto' }}>
              {[
                { value: '50+', label: 'Luxury Fragrances' },
                { value: '100%', label: 'In-House Crafted' },
                { value: '12K+', label: 'Happy Customers' },
                { value: '100%', label: 'Authentic Guarantee' },
              ].map(stat => (
                <div key={stat.label} style={{ flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--color-primary)' }}>{stat.value}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes scrollLine {
              0%,100% { transform: scaleY(0.5); opacity: 0.3; }
              50% { transform: scaleY(1); opacity: 1; }
            }
          `}</style>
        </section>

        {/* ── Featured Collections ─────────────────────── */}
        <section className="section" style={{ background: 'var(--color-surface)' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              style={{ marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>Curated for You</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: 'var(--color-primary)', lineHeight: 1.1 }}>Featured<br /><em>Collections</em></h2>
              </div>
              <Link to="/shop" className="btn btn-outline">View All →</Link>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              <CollectionCard title="Floral Fantasies" subtitle="For Her" image="https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80" link="/shop?gender=feminine" />
              <CollectionCard title="Dark & Woody" subtitle="For Him" image="https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&q=80" link="/shop?gender=masculine" />
              <CollectionCard title="Oriental Oud" subtitle="Unisex" image="https://images.unsplash.com/photo-1588776814546-1ffbb172c5e4?w=600&q=80" link="/shop" />
              <CollectionCard title="Fresh Aquatics" subtitle="Summer Picks" image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" link="/shop" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {featuredProducts.map((product: any) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>

        {/* ── Brand Story ──────────────────────────────── */}
        <section className="section" style={{ background: 'var(--color-primary)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-200px', top: '-200px', opacity: 0.15, pointerEvents: 'none' }}>
            <GradientBlob size={600} reactToMouse={false} />
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Our Philosophy</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 300, color: 'var(--color-ivory)', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                  Fragrance is the<br /><em style={{ color: 'var(--color-gold)' }}>language of memory</em>
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'rgba(250,246,238,0.65)', lineHeight: 1.9, marginBottom: '2.5rem' }}>
                  We craft every fragrance with intention — sourcing the finest ingredients from Grasse, Arabia, and beyond. Each bottle is a story, each note a chapter.
                </p>
                <Link to="/about" className="btn btn-gold">Our Story →</Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=400&q=80',
                  'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400&q=80',
                  'https://images.unsplash.com/photo-1594035491768-73b0cbb7c0fa?w=400&q=80',
                  'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&q=80',
                ].map((url, i) => (
                  <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, marginTop: i % 2 === 1 ? '2rem' : 0 }} loading="lazy" />
                ))}
              </motion.div>
            </div>
          </div>
          <style>{`@media(max-width:900px){.brand-story-section > .container > div{grid-template-columns:1fr!important}}`}</style>
        </section>

        {/* ── Bestsellers ──────────────────────────────── */}
        <section className="section" style={{ background: 'var(--color-ivory)' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>Most Loved</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: 'var(--color-primary)', lineHeight: 1.1 }}>Bestsellers</h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {bestsellers.map((product: any) => <ProductCard key={product.id} product={product} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/shop" className="btn btn-primary">View All Fragrances <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        {/* ── Scent Families Marquee ───────────────────── */}
        <section style={{ background: 'var(--color-surface)', padding: '3rem 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '3rem', animation: 'marquee 22s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
            {[...Array(3)].flatMap(() =>
              ['Floral', 'Woody', 'Oriental', 'Aquatic', 'Gourmand', 'Citrus', 'Leather', 'Aromatic', 'Chypre'].map((s, i) => (
                <span key={`${s}${i}`} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: i % 2 === 0 ? 'var(--color-primary)' : 'rgba(26,10,46,0.15)', fontStyle: 'italic' }}>{s} ·&nbsp;</span>
              ))
            )}
          </div>
          <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
        </section>
      </main>
      <Footer />
    </>
  );
}
