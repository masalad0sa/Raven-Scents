import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { GradientBlob } from '../components/effects/GradientBlob';

export default function About() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 72, background: 'var(--color-ivory)' }}>
        {/* Hero */}
        <section style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', background: 'var(--color-primary)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '-100px', bottom: '-200px', opacity: 0.2 }}>
            <GradientBlob size={600} reactToMouse={false} />
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>Our Story</p>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 300, color: 'var(--color-ivory)', lineHeight: 1.05, marginBottom: '1.5rem' }}>
                The Art of<br /><em style={{ color: 'var(--color-gold)' }}>Fragrance</em>
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'rgba(250,246,238,0.65)', maxWidth: 480, lineHeight: 1.9 }}>
                Born from a passion for rare and extraordinary scents, LuxeScent was founded to bring the world's finest perfumes to fragrance lovers everywhere.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="section" style={{ background: 'var(--color-ivory)' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>What We Believe</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 300, color: 'var(--color-primary)' }}>Our Core Values</h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
              {[
                { icon: '✦', title: 'Authenticity', desc: 'Every fragrance we carry is 100% authentic, sourced directly from authorized distributors and brand houses.' },
                { icon: '◈', title: 'Curation', desc: 'Our perfumers and fragrance experts hand-select each addition to our catalog, ensuring only the finest make it through.' },
                { icon: '◇', title: 'Education', desc: 'We believe in empowering fragrance lovers with knowledge — from fragrance pyramids to application techniques.' },
                { icon: '⊕', title: 'Sustainability', desc: 'We prioritize eco-conscious packaging and partner with brands that share our commitment to the planet.' },
              ].map(val => (
                <motion.div key={val.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ padding: '2rem', background: '#fff', borderRadius: 8, border: '1px solid #EDE8DC' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-gold)', marginBottom: '1rem' }}>{val.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>{val.title}</h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.8 }}>{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section" style={{ background: 'var(--color-surface)' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>The People</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 300, color: 'var(--color-primary)' }}>Behind LuxeScent</h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
              {[
                { name: 'Arjun Sharma', role: 'Founder & Chief Perfumer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
                { name: 'Priya Mehta', role: 'Head of Curation', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
                { name: 'Rohan Joshi', role: 'Brand Director', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
                { name: 'Ananya Kapoor', role: 'Customer Experience', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80' },
              ].map(person => (
                <motion.div key={person.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
                  <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1.25rem', border: '3px solid var(--color-gold)', boxShadow: '0 8px 24px rgba(26,10,46,0.1)' }}>
                    <img src={person.img} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-primary)', marginBottom: '0.3rem' }}>{person.name}</h3>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{person.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ background: 'var(--color-ivory)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 600 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 300, color: 'var(--color-primary)', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                Ready to Find Your<br /><em style={{ color: 'var(--color-gold)' }}>Signature Scent?</em>
              </h2>
              <Link to="/shop" className="btn btn-primary">Explore Our Collection <ArrowRight size={14} /></Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
