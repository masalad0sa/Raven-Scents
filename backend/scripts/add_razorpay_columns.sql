-- Add Razorpay payment columns to orders table
-- Run this in Supabase SQL Editor

-- 1. Add new columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Fix the status CHECK constraint to include new statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending_payment',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ));

-- 3. Index for fast lookups by razorpay order ID
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id
  ON orders (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

-- 4. Helper function for incrementing coupon usage safely
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE code = coupon_code_param;
END;
$$ LANGUAGE plpgsql;
