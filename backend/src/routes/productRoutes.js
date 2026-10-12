import express from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only endpoints
router.post('/', protect, verifyAdmin, createProduct);
router.put('/:id', protect, verifyAdmin, updateProduct);
router.delete('/:id', protect, verifyAdmin, deleteProduct);

export default router;
