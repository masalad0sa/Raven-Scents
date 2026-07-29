-- ═══════════════════════════════════════════════════════════
-- Migration 007: Cancel Order & Restore Stock Function
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Called when the user abandons the Razorpay modal or payment fails.
-- Restores each variant's stock using the quantities already recorded in order_items,
-- then marks the order as cancelled.
-- Only works on orders still in 'pending_payment' status to prevent double-restores.
CREATE OR REPLACE FUNCTION cancel_order_and_restore_stock(
  p_order_id UUID,
  p_user_id  UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Guard: ensure the order exists, belongs to this user, and is still pending payment
  IF NOT EXISTS (
    SELECT 1 FROM orders
    WHERE id        = p_order_id
      AND user_id   = p_user_id
      AND status    = 'pending_payment'
  ) THEN
    RAISE EXCEPTION 'Order % not found or cannot be cancelled', p_order_id
      USING ERRCODE = 'P0003';
  END IF;

  -- Restore stock: add back the quantity from each order_item
  UPDATE product_variants pv
  SET    stock = stock + oi.quantity
  FROM   order_items oi
  WHERE  oi.variant_id = pv.id
    AND  oi.order_id   = p_order_id;

  -- Mark the order as cancelled
  UPDATE orders
  SET    status     = 'cancelled',
         updated_at = NOW()
  WHERE  id = p_order_id;
END;
$$;
