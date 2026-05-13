import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import {
  createPaymentOrder,
  verifyPayment,
  getRazorpayKey,
} from '../controllers/payments';

const router = Router();

// Get the publishable key (no auth needed)
router.get('/key', getRazorpayKey);

// Create a Razorpay order (optional auth — guest checkout supported)
router.post('/create-order', optionalAuth, createPaymentOrder);

// Verify payment after Razorpay checkout completes
router.post('/verify', optionalAuth, verifyPayment);

export default router;
