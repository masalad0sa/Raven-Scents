-- ═══════════════════════════════════════════════════════════
-- Migration 006: Atomic Order Creation with Stock Reservation
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Also add 'pending_payment' to the orders status check constraint if not already present
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending_payment', 'pending', 'confirmed', 'processing',
    'shipped', 'delivered', 'cancelled', 'refunded'
  ));

-- ── Atomic Order Creation Function ────────────────────────
-- Creates order + order_items + decrements stock in one transaction.
-- Prices are fetched server-side from product_variants — never trusts frontend prices.
-- Uses SELECT ... FOR UPDATE to lock variant rows and prevent overselling race conditions.
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_user_id       UUID,
  p_shipping_addr JSONB,
  p_coupon_code   TEXT,
  p_discount      INTEGER,
  p_items         JSONB   -- [{product_id: uuid, variant_id: uuid, quantity: int}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id   UUID;
  item         JSONB;
  v_price      INTEGER;
  v_stock      INTEGER;
  v_subtotal   INTEGER := 0;
  v_shipping   INTEGER;
  v_total      INTEGER;
BEGIN
  -- ── Step 1: Lock all variant rows and validate stock ──────
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price, stock
    INTO v_price, v_stock
    FROM product_variants
    WHERE id = (item->>'variant_id')::UUID
    FOR UPDATE;  -- row-level lock prevents concurrent modifications

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant % not found', item->>'variant_id'
        USING ERRCODE = 'P0002';
    END IF;

    IF v_stock < (item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for variant %', item->>'variant_id'
        USING ERRCODE = 'P0001';
    END IF;

    v_subtotal := v_subtotal + v_price * (item->>'quantity')::INTEGER;
  END LOOP;

  -- ── Step 2: Calculate total (server-side, never trusts frontend) ──
  v_shipping := CASE WHEN v_subtotal >= 5000 THEN 0 ELSE 299 END;
  v_total    := GREATEST(0, v_subtotal + v_shipping - COALESCE(p_discount, 0));

  -- ── Step 3: Create the order ──────────────────────────────
  INSERT INTO orders (user_id, status, total, shipping_addr, coupon_code, discount)
  VALUES (
    p_user_id,
    'pending_payment',
    v_total,
    p_shipping_addr,
    NULLIF(p_coupon_code, ''),
    COALESCE(p_discount, 0)
  )
  RETURNING id INTO v_order_id;

  -- ── Step 4: Insert order_items and decrement stock ────────
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price INTO v_price
    FROM product_variants
    WHERE id = (item->>'variant_id')::UUID;

    INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price)
    VALUES (
      v_order_id,
      (item->>'product_id')::UUID,
      (item->>'variant_id')::UUID,
      (item->>'quantity')::INTEGER,
      v_price
    );

    UPDATE product_variants
    SET stock = stock - (item->>'quantity')::INTEGER
    WHERE id = (item->>'variant_id')::UUID;
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total',    v_total
  );
END;
$$;
