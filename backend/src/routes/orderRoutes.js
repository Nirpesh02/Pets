import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Admin-only order status transition
router.patch('/:id/status', protect, verifyAdmin, updateOrderStatus);

export default router;
