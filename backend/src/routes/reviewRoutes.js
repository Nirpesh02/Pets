import express from 'express';
import {
  getProductReviews,
  getFeaturedHomeReviews,
  createOrUpdateReview,
  deleteReview,
  getAllReviewsAdmin,
  toggleFeaturedReview,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedHomeReviews);
router.get('/product/:productId', getProductReviews);

// Customer authenticated routes
router.post('/product/:productId', protect, createOrUpdateReview);
router.delete('/:id', protect, deleteReview);

// Admin-only management routes
router.get('/admin', protect, verifyAdmin, getAllReviewsAdmin);
router.patch('/:id/toggle-featured', protect, verifyAdmin, toggleFeaturedReview);

export default router;
