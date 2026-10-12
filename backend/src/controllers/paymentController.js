import Order from '../models/Order.js';
import paymentService from '../services/paymentService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Process or verify payment (COD / standard validation)
// @route   POST /api/v1/payments/verify
export const processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;

    const result = await paymentService.processPayment({
      orderId,
      amount,
      paymentMethod: paymentMethod || 'cod',
    });

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && result.status === 'Paid') {
        order.paymentStatus = 'Paid';
        await order.save();
      }
    }

    return sendSuccess(res, { paymentResult: result }, result.message);
  } catch (error) {
    next(error);
  }
};
