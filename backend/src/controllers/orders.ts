import { Response } from 'express';
import { supabaseAdmin } from '../services/supabase';
import { handleError, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const orderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().int().min(0),
  })).min(1),
  shipping_address: z.object({
    full_name: z.string(),
    address_line1: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    phone: z.string(),
  }),
  coupon_code: z.string().optional(),
  discount: z.number().int().min(0).default(0),
});

// POST /api/orders
export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { items, shipping_address, coupon_code, discount } = parsed.data;

    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) - discount;

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: req.userId,
        status: 'confirmed',
        total: Math.max(0, total),
        shipping_addr: shipping_address,
        coupon_code: coupon_code || null,
        discount,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(items.map(item => ({ ...item, order_id: order.id })));

    if (itemsError) throw itemsError;

    // Update coupon usage if used
    if (coupon_code) {
      await supabaseAdmin
        .from('coupons')
        .update({ used_count: supabaseAdmin.rpc('increment', { row_id: coupon_code }) })
        .eq('code', coupon_code);
    }

    res.status(201).json({
      order_id: order.id,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// GET /api/orders
export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, images, slug))')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
}

// GET /api/orders/:id
export async function getOrderById(req: AuthRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, images, slug), product_variants(size, unit))')
      .eq('id', req.params.id)
      .eq('user_id', req.userId) // ensure user can only see their own orders
      .single();

    if (error || !data) throw new AppError(404, 'Order not found');
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
}
