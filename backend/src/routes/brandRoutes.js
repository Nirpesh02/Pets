import express from 'express';
import {
  getBrands,
  createBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getBrands);
router.post('/', protect, verifyAdmin, createBrand);
router.delete('/:id', protect, verifyAdmin, deleteBrand);

export default router;
