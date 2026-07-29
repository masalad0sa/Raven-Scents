import { Router } from "express";
import { getOrders } from "../controllers/orders";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = Router();

// router.post('/', optionalAuth, createOrder);
router.get("/", requireAuth, getOrders);
// router.get('/:id', requireAuth, getOrderById);

export default router;
