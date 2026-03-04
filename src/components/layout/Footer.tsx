import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      background: 'var(--color-primary)',
      color: 'var(--color-ivory)',
      padding: '4rem 0 2rem',
    }}>
      <div className="container">
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 400,
              marginBottom: '1rem',
              color: 'var(--color-ivory)',
            }}>
              LUXE<span style={{ color: 'var(--color-gold)' }}>SCENT</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              lineHeight: 1.8,
              color: 'rgba(250, 246, 238, 0.6)',
              maxWidth: 260,
            }}>
              Rare and luxury fragrances curated for the discerning nose. Discover your signature scent.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36,
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(250, 246, 238, 0.6)',
                  transition: 'all 0.25s',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(250, 246, 238, 0.6)';
                  }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Shop</h4>
            {[
              { label: 'All Fragrances', to: '/shop' },
              { label: 'Eau de Parfum', to: '/shop?category=eau-de-parfum' },
              { label: 'Niche Collections', to: '/shop?brand=LuxeScent' },
              { label: 'Bestsellers', to: '/shop?filter=bestseller' },
              { label: 'New Arrivals', to: '/shop?filter=new' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'rgba(250, 246, 238, 0.6)',
                textDecoration: 'none',
                marginBottom: '0.75rem',
                transition: 'color 0.25s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(250, 246, 238, 0.6)'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Company</h4>
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Brand Story', to: '/about' },
              { label: 'Sustainability', to: '/about' },
              { label: 'Contact', to: '/about' },
            ].map(item => (
              <Link key={item.label} to={item.to} style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'rgba(250, 246, 238, 0.6)',
                textDecoration: 'none',
                marginBottom: '0.75rem',
                transition: 'color 0.25s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(250, 246, 238, 0.6)'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Stay Inspired</h4>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'rgba(250, 246, 238, 0.6)', marginBottom: '1rem', lineHeight: 1.7 }}>
              New arrivals, expert guides, and exclusive offers — delivered monthly.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '3px',
                  color: 'var(--color-ivory)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button style={{
                background: 'var(--color-gold)',
                color: 'var(--color-primary)',
                border: 'none',
                borderRadius: '3px',
                padding: '0.75rem 1.25rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(250, 246, 238, 0.35)' }}>
            © 2025 LuxeScent. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                color: 'rgba(250, 246, 238, 0.35)',
                textDecoration: 'none',
                transition: 'color 0.25s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-ivory)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(250, 246, 238, 0.35)'}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
