import { Response } from 'express';
import { supabaseAdmin } from '../services/supabase';
import { handleError, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// ── Validation Schemas ────────────────────────────────────
const statusSchema = z.object({
  status: z.enum([
    'pending_payment',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
});

const notesSchema = z.object({
  notes: z.string().max(2000),
});

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: [],
};

// ── GET /api/admin/orders ──────────────────────────────────
export async function getAdminOrders(req: AuthRequest, res: Response) {
  try {
    const {
      status,
      search,
      date_from,
      date_to,
      page = '1',
      limit = '20',
      sort = 'created_at',
      order = 'desc',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('orders')
      .select(
        '*, order_items(*, products(name, images, slug))',
        { count: 'exact' }
      );

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by date range
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Search by order ID or customer name in shipping_addr
    if (search) {
      // Search across order id and shipping address name
      query = query.or(
        `id.eq.${search},shipping_addr->>full_name.ilike.%${search}%`
      );
    }

    // Sorting
    const sortColumn = ['created_at', 'total', 'status'].includes(sort) ? sort : 'created_at';
    query = query.order(sortColumn, { ascending: order === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch user emails for each order
    const userIds = [...new Set((data || []).map((o: any) => o.user_id).filter(Boolean))];
    let userEmails: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profiles) {
        userEmails = profiles.reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = { email: p.email, full_name: p.full_name };
          return acc;
        }, {});
      }
    }

    // Enrich orders with customer info
    const enrichedOrders = (data || []).map((order: any) => ({
      ...order,
      customer: userEmails[order.user_id] || null,
    }));

    res.json({
      orders: enrichedOrders,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (err) {
    handleError(err, res);
  }
}

// ── GET /api/admin/orders/stats ────────────────────────────
export async function getOrderStats(_req: AuthRequest, res: Response) {
  try {
    // Get all orders for stats
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, total, discount, created_at');

    if (error) throw error;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const allOrders = orders || [];

    // Status counts
    const statusCounts: Record<string, number> = {};
    allOrders.forEach((o: any) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Revenue calculations (exclude cancelled/refunded)
    const revenueOrders = allOrders.filter(
      (o: any) => !['cancelled', 'refunded', 'pending_payment'].includes(o.status)
    );

    const totalRevenue = revenueOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const todayOrders = allOrders.filter(
      (o: any) => new Date(o.created_at) >= today
    );

    const thisMonthOrders = revenueOrders.filter(
      (o: any) => new Date(o.created_at) >= thisMonth
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum: number, o: any) => sum + (o.total || 0),
      0
    );

    const lastMonthOrders = revenueOrders.filter(
      (o: any) => {
        const d = new Date(o.created_at);
        return d >= lastMonth && d <= lastMonthEnd;
      }
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum: number, o: any) => sum + (o.total || 0),
      0
    );

    // Revenue trend (percentage change)
    const revenueTrend = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0;

    // Average order value
    const avgOrderValue = revenueOrders.length > 0
      ? Math.round(totalRevenue / revenueOrders.length)
      : 0;

    // Total discount given
    const totalDiscount = allOrders.reduce(
      (sum: number, o: any) => sum + (o.discount || 0),
      0
    );

    res.json({
      totalOrders: allOrders.length,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueTrend,
      avgOrderValue,
      totalDiscount,
      todayOrders: todayOrders.length,
      statusCounts,
      pendingOrders: (statusCounts['pending_payment'] || 0) + (statusCounts['confirmed'] || 0),
    });
  } catch (err) {
    handleError(err, res);
  }
}

// ── GET /api/admin/orders/:id ──────────────────────────────
export async function getAdminOrderById(req: AuthRequest, res: Response) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(
        '*, order_items(*, products(name, images, slug, brand), product_variants(size, unit, sku))'
      )
      .eq('id', req.params.id)
      .single();

    if (error || !order) throw new AppError(404, 'Order not found');

    // Fetch customer profile
    let customer = null;
    if (order.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, created_at')
        .eq('id', order.user_id)
        .single();

      if (profile) {
        // Get customer's total order count & spend
        const { data: customerOrders } = await supabaseAdmin
          .from('orders')
          .select('id, total, status')
          .eq('user_id', order.user_id);

        const validOrders = (customerOrders || []).filter(
          (o: any) => !['cancelled', 'refunded', 'pending_payment'].includes(o.status)
        );

        customer = {
          ...profile,
          totalOrders: (customerOrders || []).length,
          totalSpend: validOrders.reduce((s: number, o: any) => s + (o.total || 0), 0),
        };
      }
    }

    res.json({ ...order, customer });
  } catch (err) {
    handleError(err, res);
  }
}

// ── PATCH /api/admin/orders/:id/status ─────────────────────
export async function updateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const { status: newStatus } = parsed.data;

    // Get current order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !order) throw new AppError(404, 'Order not found');

    // Validate status transition
    const allowed = STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        error: `Cannot transition from "${order.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`,
      });
    }

    // Update order status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(updated);
  } catch (err) {
    handleError(err, res);
  }
}

// ── PATCH /api/admin/orders/:id/notes ──────────────────────
export async function updateOrderNotes(req: AuthRequest, res: Response) {
  try {
    const parsed = notesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid notes' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update({
        notes: parsed.data.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) throw new AppError(404, 'Order not found');

    res.json(updated);
  } catch (err) {
    handleError(err, res);
  }
}

// ── GET /api/admin/analytics ──────────────────────────────
export async function getAdminAnalytics(req: AuthRequest, res: Response) {
  try {
    // 1. Get all orders for general stats & timeline
    const { data: orders, error: ordersErr } = await supabaseAdmin
      .from('orders')
      .select('id, status, total, discount, created_at')
      .order('created_at', { ascending: true });

    if (ordersErr) throw ordersErr;

    const allOrders = orders || [];

    // 2. Fetch order items with product details for product-level analytics
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .select('quantity, unit_price, products(id, name, scent_family, images)');

    if (itemsErr) throw itemsErr;
    const allItems = items || [];

    // Calculate core statistics
    const activeOrders = allOrders.filter(
      (o: any) => !['cancelled', 'refunded', 'pending_payment'].includes(o.status)
    );
    const totalOrders = allOrders.length;
    const totalRevenue = activeOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const avgOrderValue = activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;
    const totalDiscount = allOrders.reduce((sum: number, o: any) => sum + (o.discount || 0), 0);

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    allOrders.forEach((o: any) => {
      statusDistribution[o.status] = (statusDistribution[o.status] || 0) + 1;
    });

    // Timeline calculations: group active orders by date (last 30 days)
    const timelineData: Record<string, { date: string; revenue: number; orders: number }> = {};
    
    // Pre-populate last 30 days to ensure no gaps
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const isoStr = d.toISOString().split('T')[0];
      timelineData[isoStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    activeOrders.forEach((o: any) => {
      const isoStr = o.created_at.split('T')[0];
      if (timelineData[isoStr]) {
        timelineData[isoStr].revenue += o.total || 0;
        timelineData[isoStr].orders += 1;
      }
    });

    const timeline = Object.values(timelineData);

    // Top selling products & Scent family counts
    const productCounts: Record<string, { name: string; qty: number; revenue: number; image: string | null }> = {};
    const scentFamilyCounts: Record<string, { family: string; qty: number; revenue: number }> = {};

    allItems.forEach((item: any) => {
      const qty = item.quantity || 1;
      const price = item.unit_price || 0;
      const rev = qty * price;
      const prod = Array.isArray(item.products) ? item.products[0] : item.products;
      
      if (prod) {
        const name = prod.name || "Unknown Product";
        const family = prod.scent_family || "Other";
        const image = prod.images?.[0] || null;

        // Products
        if (!productCounts[name]) {
          productCounts[name] = { name, qty: 0, revenue: 0, image };
        }
        productCounts[name].qty += qty;
        productCounts[name].revenue += rev;

        // Scent Family
        if (!scentFamilyCounts[family]) {
          scentFamilyCounts[family] = { family, qty: 0, revenue: 0 };
        }
        scentFamilyCounts[family].qty += qty;
        scentFamilyCounts[family].revenue += rev;
      }
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const scentFamilies = Object.values(scentFamilyCounts)
      .sort((a, b) => b.qty - a.qty);

    // Fetch low stock alerts (variants with stock <= 5)
    const { data: lowStockData } = await supabaseAdmin
      .from('product_variants')
      .select('id, size, unit, stock, sku, products(id, name, slug, images)')
      .lte('stock', 5)
      .order('stock', { ascending: true })
      .limit(10);

    const lowStockAlerts = (lowStockData || []).map((item: any) => {
      const prod = Array.isArray(item.products) ? item.products[0] : item.products;
      return {
        id: item.id,
        size: item.size,
        unit: item.unit,
        stock: item.stock,
        sku: item.sku,
        productName: prod?.name || "Unknown Product",
        productImage: prod?.images?.[0] || null,
      };
    });

    res.json({
      summary: {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        totalDiscount,
        pendingOrders: (statusDistribution['pending_payment'] || 0) + (statusDistribution['confirmed'] || 0),
      },
      statusDistribution,
      timeline,
      topProducts,
      scentFamilies,
      lowStockAlerts,
    });
  } catch (err) {
    handleError(err, res);
  }
}

