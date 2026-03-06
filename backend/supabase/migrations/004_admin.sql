-- ═══════════════════════════════════════════════════════════
-- Migration 004: Admin Dashboard Support
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── Add brand column to products ──────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'RAVEN';

-- ── Add is_admin flag to profiles ─────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- ── Admin RLS: Products ───────────────────────────────────
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── Admin RLS: Product Variants ───────────────────────────
CREATE POLICY "Admins can insert variants" ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update variants" ON product_variants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete variants" ON product_variants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── Storage: product-images bucket ───────────────────────
-- NOTE: Also create the bucket manually in Supabase Dashboard →
--       Storage → New Bucket → Name: "product-images" → Public: ON
--       (Or run the INSERT below if using service role key)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10 MB per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS Policies ──────────────────────────────────
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── Grant yourself admin rights ───────────────────────────
-- Run this with your user's UUID from: Auth → Users in Supabase dashboard
-- UPDATE profiles SET is_admin = true WHERE id = 'your-user-uuid-here';
