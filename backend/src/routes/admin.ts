import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import {
  getAdminOrders,
  getAdminOrderById,
  getOrderStats,
  updateOrderStatus,
  updateOrderNotes,
  getShippingSettings,
  updateShippingSettings,
  getAdminAnalytics,
} from '../controllers/admin';

const router = Router();

// All admin routes require auth + admin check
router.use(requireAuth, requireAdmin);

// Shipping settings
router.get('/shipping-settings', getShippingSettings);
router.patch('/shipping-settings', updateShippingSettings);

// Analytics
router.get('/analytics', getAdminAnalytics);

// Order management
router.get('/orders/stats', getOrderStats);
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/notes', updateOrderNotes);

export default router;
