import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, ArrowRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function OrderConfirm() {
  const orderId = 'RVN' + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <>
      <Header />
      <main style={{ paddingTop: 72, background: 'var(--color-ivory)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 560 }}>
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 120 }}
            style={{
              width: 96, height: 96,
              borderRadius: '50%',
              background: 'var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: '0 0 0 16px rgba(212, 175, 55, 0.12)',
            }}
          >
            <Check size={36} strokeWidth={2.5} color="#0A0A0A" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
              Order Confirmed
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '1rem' }}>
              Thank You for Your Order!
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--color-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Your fragrance journey begins. We'll send an email confirmation with tracking details shortly.
            </p>

            {/* Order Details */}
            <div style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8, padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
              {[
                { label: 'Order ID', value: orderId },
                { label: 'Estimated Delivery', value: '5–7 business days' },
                { label: 'Shipping Method', value: 'Express Delivery' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #333' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Status Steps */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {[
                { icon: '✓', label: 'Order Placed', done: true },
                { icon: Package, label: 'Processing', done: false },
                { icon: '→', label: 'Shipped', done: false },
                { icon: '🏠', label: 'Delivered', done: false },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: s.done ? 'var(--color-gold)' : '#333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                    color: s.done ? '#0D0D0D' : '#666',
                    fontWeight: 700,
                  }}>
                    {typeof s.icon === 'string' ? s.icon : <Package size={14} />}
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s.done ? 'var(--color-text)' : 'var(--color-muted)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-primary">Back to Home <ArrowRight size={14} /></Link>
              <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
