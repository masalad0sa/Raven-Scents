import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, Tag, ShoppingBag } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useCartStore } from '../store/cartStore';

const COUPONS: Record<string, number> = {
  LUXE10: 10,
  WELCOME15: 15,
  SCENT20: 20,
};

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 299;
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.pct / 100) : 0;
  const total = subtotal + shippingFee - discount;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon({ code, pct: COUPONS[code] });
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try LUXE10, WELCOME15, or SCENT20.');
    }
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: 72, background: 'var(--color-ivory)', minHeight: '100vh' }}>
        <div style={{ background: 'var(--color-surface)', padding: '2rem 0', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: 'var(--color-primary)' }}>Your Cart</h1>
          </div>
        </div>

        <div className="container" style={{ padding: '3rem 2rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <ShoppingBag size={64} strokeWidth={1} style={{ color: '#C5B89A', marginBottom: '1.5rem' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Your cart is empty</h2>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)', marginBottom: '2rem' }}>Begin your fragrance journey.</p>
              <Link to="/shop" className="btn btn-primary">Explore Fragrances</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
              {/* Items */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-muted)', padding: '0 0 1rem', borderBottom: '1px solid #EDE8DC', display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto', gap: '1rem' }}>
                  <span>Product</span><span>Size</span><span>Price</span><span>Qty</span><span></span>
                </div>

                {items.map((item) => (
                  <motion.div key={`${item.product.id}-${item.variant.sku}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid #EDE8DC' }}
                  >
                    {/* Product */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Link to={`/product/${item.product.slug}`}>
                        <img src={item.product.images[0]} alt={item.product.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4 }} />
                      </Link>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.2rem' }}>{item.product.brand}</p>
                        <Link to={`/product/${item.product.slug}`}>
                          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500, color: 'var(--color-primary)' }}>{item.product.name}</h3>
                        </Link>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-muted)' }}>{item.variant.size}{item.variant.unit}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>₹{item.variant.price.toLocaleString('en-IN')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #E0D5C5', borderRadius: 4, padding: '0.3rem 0.6rem', width: 'fit-content' }}>
                      <button onClick={() => updateQuantity(item.product.id, item.variant.sku, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex' }}><Minus size={12} /></button>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, minWidth: 20, textAlign: 'center', color: 'var(--color-primary)', fontSize: '0.85rem' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.variant.sku, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex' }}><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeItem(item.product.id, item.variant.sku)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C5B89A', display: 'flex', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#C5B89A'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}

                <div style={{ marginTop: '1.5rem' }}>
                  <Link to="/shop" className="btn btn-ghost">← Continue Shopping</Link>
                </div>
              </div>

              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', border: '1px solid #EDE8DC', borderRadius: 8, padding: '1.75rem', position: 'sticky', top: 92 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Order Summary</h2>

                {/* Coupon */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: '0.5rem' }}>Coupon Code</label>
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(46, 204, 113, 0.08)', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: 4 }}>
                      <Tag size={14} style={{ color: 'var(--color-success)' }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>{appliedCoupon.code} — {appliedCoupon.pct}% off</span>
                      <button onClick={() => { setAppliedCoupon(null); setCoupon(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', marginLeft: 'auto' }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter code" className="input" style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                      <button onClick={applyCoupon} className="btn btn-outline" style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Apply</button>
                    </div>
                  )}
                  {couponError && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.5rem' }}>{couponError}</p>}
                </div>

                {/* Totals */}
                {[
                  { label: 'Subtotal', val: `₹${subtotal.toLocaleString('en-IN')}`, muted: false },
                  { label: 'Shipping', val: shippingFee === 0 ? 'Free' : `₹${shippingFee}`, muted: false },
                  ...(appliedCoupon ? [{ label: `Discount (${appliedCoupon.pct}%)`, val: `-₹${discount.toLocaleString('en-IN')}`, muted: false }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-muted)' }}>{row.label}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: row.label.includes('Discount') ? 'var(--color-success)' : shippingFee === 0 && row.label === 'Shipping' ? 'var(--color-success)' : 'var(--color-primary)' }}>{row.val}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #EDE8DC', marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <Link to="/checkout" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', display: 'flex', textDecoration: 'none' }}>
                  Proceed to Checkout →
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>🔒</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--color-muted)' }}>Secure SSL encrypted checkout</span>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .cart-table { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
