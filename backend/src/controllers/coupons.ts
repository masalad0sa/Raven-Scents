import { Response } from 'express';
import { supabase, supabaseAdmin } from '../services/supabase';
import { handleError, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// POST /api/coupons/validate
export async function validateCoupon(req: AuthRequest, res: Response) {
  try {
    const { code, cart_total } = req.body;
    if (!code) throw new AppError(400, 'Coupon code is required');

    const cleanCode = code.toUpperCase().trim();

    // Check if it is a first-order welcome coupon
    if (cleanCode === 'WELCOME15') {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'Please log in to apply the first-order discount code.');
      }
      const { count, error: countErr } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('status', 'in', '("cancelled","pending_payment")');

      if (countErr) throw countErr;
      if (count && count > 0) {
        throw new AppError(400, 'This welcome code is only valid for your first order.');
      }
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
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
