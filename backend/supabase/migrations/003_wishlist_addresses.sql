-- ═══════════════════════════════════════════════════════════
-- Migration 003: Wishlists & User Addresses
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── Wishlists ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"   ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- ── User Addresses ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  street      TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'India',
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON user_addresses(user_id);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"   ON user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

-- ── User Profiles (display name, avatar) ─────────────────
-- Uses the special auth.users table via trigger to auto-create a row
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  avatar_url   TEXT,
  phone        TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
