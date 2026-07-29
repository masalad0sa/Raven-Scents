import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  createPaymentOrder,
  verifyPayment,
  cancelOrder,
  getRazorpayKey,
  handleRazorpayWebhook,
} from '../controllers/payments';

const router = Router();

// Get the publishable key (no auth needed)
router.get('/key', getRazorpayKey);

// Create a Razorpay order — atomically reserves stock before payment opens
// (optional auth — guest checkout supported)
router.post('/create-order', optionalAuth, createPaymentOrder);

// Verify payment after Razorpay checkout completes
router.post('/verify', optionalAuth, verifyPayment);

// Cancel a pending_payment order and restore reserved stock.
// Called when the user closes the Razorpay modal or payment fails.
router.post('/cancel', requireAuth, cancelOrder);

// Razorpay Webhook listener (unauthenticated, signature-verified)
router.post('/webhook', handleRazorpayWebhook);

export default router;
