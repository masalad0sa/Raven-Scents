-- ═══════════════════════════════════════════════════════════
-- LuxeScent Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Products ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  short_desc    TEXT,
  description   TEXT,
  price         INTEGER NOT NULL,           -- stored in paise (₹9500 = 950000? No: just store ₹9500 as 9500)
  compare_price INTEGER,
  images        TEXT[] DEFAULT '{}',
  category      TEXT,
  gender        TEXT CHECK (gender IN ('masculine', 'feminine', 'unisex')),
  scent_family  TEXT,
  concentration TEXT,
  sillage       TEXT,
  longevity     TEXT,
  tags          TEXT[] DEFAULT '{}',
  notes_top     TEXT[] DEFAULT '{}',
  notes_middle  TEXT[] DEFAULT '{}',
  notes_base    TEXT[] DEFAULT '{}',
  rating        NUMERIC(3,2) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new        BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ── Product Variants ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  size       INTEGER NOT NULL,
  unit       TEXT DEFAULT 'ml',
  price      INTEGER NOT NULL,
  stock      INTEGER DEFAULT 0,
  sku        TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- ── Orders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  total         INTEGER NOT NULL,
  shipping_addr JSONB,
  coupon_code   TEXT,
  discount      INTEGER DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ── Order Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id  UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ── Reviews ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating     INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  title      TEXT,
  body       TEXT,
  verified   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_product ON reviews(user_id, product_id);

-- ── Coupons ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,
  discount_pct INTEGER NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  max_uses     INTEGER,
  used_count   INTEGER DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);
CREATE POLICY "Variants are publicly readable" ON product_variants FOR SELECT USING (true);

-- Coupons: anyone can read active coupons (for validation)
CREATE POLICY "Active coupons readable" ON coupons FOR SELECT USING (is_active = true);

-- Orders: users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: visible if order is visible  
CREATE POLICY "Order items via order" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Order items insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Reviews: anyone can read, authenticated users can insert
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can review" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
