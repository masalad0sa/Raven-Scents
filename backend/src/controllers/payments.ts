import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabaseAdmin } from '../services/supabase';
import { handleError, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// ── Razorpay Instance ─────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ── Validation Schemas ────────────────────────────────────
const createOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().int().min(0),
  })).min(1),
  shipping_address: z.object({
    full_name: z.string().min(1),
    address_line1: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^[0-9]{6}$/),
    phone: z.string().regex(/^[0-9]{10}$/),
  }),
  coupon_code: z.string().optional().nullable(),
  discount: z.number().int().min(0).default(0),
});

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  order_id: z.string().uuid(),
});

// ── POST /api/payments/create-order ───────────────────────
// Creates a Supabase order + Razorpay order, returns both IDs
export async function createPaymentOrder(req: AuthRequest, res: Response) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message || 'Invalid request body',
      });
    }

    const { items, shipping_address, coupon_code, discount } = parsed.data;

    // Calculate total (in paise for Razorpay, rupees for DB)
    const subtotal = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const shippingFee = subtotal >= 5000 ? 0 : 299;
    const total = Math.max(0, subtotal + shippingFee - discount);
    const totalPaise = total * 100; // Razorpay wants paise

    // 1. Create the order in Supabase with status "pending_payment"
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: req.userId || null,
        status: 'pending_payment',
        total,
        shipping_addr: shipping_address,
        coupon_code: coupon_code || null,
        discount,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(items.map(item => ({ ...item, order_id: order.id })));

    if (itemsError) throw itemsError;

    // 3. Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: order.id,
      notes: {
        order_id: order.id,
        customer: shipping_address.full_name,
      },
    });

    // 4. Store Razorpay order ID on our order
    await supabaseAdmin
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    res.status(201).json({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: totalPaise,
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// ── POST /api/payments/verify ─────────────────────────────
// Verifies the Razorpay signature and marks order as confirmed
export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = parsed.data;

    // 1. Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark order as failed
      await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', order_id);

      throw new AppError(400, 'Payment verification failed — invalid signature');
    }

    // 2. Update order to confirmed
    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'confirmed',
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .select()
      .single();

    if (error) throw error;

    // 3. Update coupon usage if applicable
    if (updated.coupon_code) {
      await supabaseAdmin.rpc('increment_coupon_usage', {
        coupon_code_param: updated.coupon_code,
      });
    }

    res.json({
      success: true,
      order_id: updated.id,
      status: updated.status,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// ── GET /api/payments/key ─────────────────────────────────
// Returns the Razorpay publishable key to the frontend
export function getRazorpayKey(_req: AuthRequest, res: Response) {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID });
}
