import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { handleError, AppError } from '../middleware/errorHandler';

// POST /api/coupons/validate
export async function validateCoupon(req: Request, res: Response) {
  try {
    const { code, cart_total } = req.body;
    if (!code) throw new AppError(400, 'Coupon code is required');

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) throw new AppError(404, 'Invalid coupon code');

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      throw new AppError(410, 'This coupon has expired');
    }

    // Check usage limit
    if (data.max_uses && data.used_count >= data.max_uses) {
      throw new AppError(410, 'This coupon has reached its usage limit');
    }

    const discount = Math.floor((cart_total * data.discount_pct) / 100);

    res.json({
      valid: true,
      code: data.code,
      discount_pct: data.discount_pct,
      discount_amount: discount,
      message: `${data.discount_pct}% off applied!`,
    });
  } catch (err) {
    handleError(err, res);
  }
}
