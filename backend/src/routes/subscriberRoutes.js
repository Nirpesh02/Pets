import express from 'express';
import {
  joinExclusiveOffers,
  getSubscribers,
  approveSubscriber,
  bulkApproveSubscribers,
  rejectSubscriber,
  deleteSubscriber,
  validateCoupon,
  getNotifications,
  markNotificationsRead,
} from '../controllers/subscriberController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public / Client routes
router.post('/join', joinExclusiveOffers);
router.post('/validate-coupon', validateCoupon);
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationsRead);

// Protected Admin management routes
router.get('/', protect, verifyAdmin, getSubscribers);
router.post('/bulk-approve', protect, verifyAdmin, bulkApproveSubscribers);
router.patch('/:id/approve', protect, verifyAdmin, approveSubscriber);
router.patch('/:id/reject', protect, verifyAdmin, rejectSubscriber);
router.delete('/:id', protect, verifyAdmin, deleteSubscriber);

export default router;
