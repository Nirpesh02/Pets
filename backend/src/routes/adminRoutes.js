import express from 'express';
import {
  getDashboardStats,
  getInventoryWarnings,
  getCustomers,
  toggleBlockCustomer,
  deleteCustomer,
  changeUserRole,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Executive dashboard & inventory report
router.get('/stats', getDashboardStats);
router.get('/inventory/warnings', getInventoryWarnings);

// Customer & Admin Staff management
router.get('/customers', protect, verifyAdmin, getCustomers);
router.patch('/customers/:id/role', protect, verifyAdmin, changeUserRole);
router.patch('/customers/:id/block', protect, verifyAdmin, toggleBlockCustomer);
router.delete('/customers/:id', protect, verifyAdmin, deleteCustomer);

export default router;
