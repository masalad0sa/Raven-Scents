-- ═══════════════════════════════════════════════════════════
-- Migration 009: Server-Side Coupon Validation & Discount Recalculation
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION create_order_atomic(
  p_user_id       UUID,
  p_shipping_addr JSONB,
  p_coupon_code   TEXT,
  p_discount      INTEGER,  -- ignored for calculation; recalculated server-side
  p_items         JSONB     -- [{product_id: uuid, variant_id: uuid, quantity: int}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id    UUID;
  item          JSONB;
  v_price       INTEGER;
  v_stock       INTEGER;
  v_subtotal    INTEGER := 0;
  v_shipping    INTEGER;
  v_discount    INTEGER := 0;
  v_total       INTEGER;

  -- Coupon record variables
  v_coupon_pct  INTEGER;
  v_max_uses    INTEGER;
  v_used_count  INTEGER;
  v_expires_at  TIMESTAMPTZ;
  v_is_active   BOOLEAN;
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

  -- ── Step 2: Server-side Coupon Validation & Discount Calculation ──
  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
    SELECT discount_pct, max_uses, used_count, expires_at, is_active
    INTO v_coupon_pct, v_max_uses, v_used_count, v_expires_at, v_is_active
    FROM coupons
    WHERE UPPER(code) = UPPER(TRIM(p_coupon_code));

    IF NOT FOUND OR NOT v_is_active THEN
      RAISE EXCEPTION 'Invalid or inactive coupon code'
        USING ERRCODE = 'P0004';
    END IF;

    IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
      RAISE EXCEPTION 'Coupon code has expired'
        USING ERRCODE = 'P0004';
    END IF;

    IF v_max_uses IS NOT NULL AND v_used_count >= v_max_uses THEN
      RAISE EXCEPTION 'Coupon limit reached'
        USING ERRCODE = 'P0004';
    END IF;

    -- Calculate discount strictly server-side from DB percentage
    v_discount := FLOOR((v_subtotal * v_coupon_pct) / 100);
  END IF;

  -- ── Step 3: Calculate total (server-side, tamper-proof) ──
  v_shipping := CASE WHEN v_subtotal >= 5000 THEN 0 ELSE 299 END;
  v_total    := GREATEST(0, v_subtotal + v_shipping - v_discount);

  -- ── Step 4: Create the order ──────────────────────────────
  INSERT INTO orders (user_id, status, total, shipping_addr, coupon_code, discount)
  VALUES (
    p_user_id,
    'pending_payment',
    v_total,
    p_shipping_addr,
    NULLIF(TRIM(p_coupon_code), ''),
    v_discount
  )
  RETURNING id INTO v_order_id;

  -- ── Step 5: Insert order_items and decrement stock ────────
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
    'total',    v_total,
    'discount', v_discount
  );
END;
$$;
