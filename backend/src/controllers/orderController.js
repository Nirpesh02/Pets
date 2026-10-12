import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Subscriber from '../models/Subscriber.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Create new order
// @route   POST /api/v1/orders
export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      petId,
      petName,
      subtotal,
      shippingFee,
      discount,
      promoCode,
      totalAmount,
      paymentMethod,
      deliveryZone,
      shippingAddress,
    } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, 'No items in order', 400);
    }

    const finalEmail = (customerEmail || (req.user ? req.user.email : '')).trim().toLowerCase();

    // Strict Coupon Validation on Backend
    let verifiedDiscount = 0;
    let verifiedPromoCode = null;

    if (promoCode) {
      const codeUpper = promoCode.trim().toUpperCase();
      const subscriber = await Subscriber.findOne({
        email: finalEmail,
        couponCode: codeUpper,
      });

      if (!subscriber || subscriber.status !== 'approved') {
        return sendError(
          res,
          'Please join this related email and only accept for this coupan',
          400
        );
      }

      if (subscriber.expiresAt && new Date() > new Date(subscriber.expiresAt)) {
        return sendError(
          res,
          `Coupon code "${codeUpper}" has expired. Discount cannot be applied to this order.`,
          400
        );
      }

      verifiedPromoCode = subscriber.couponCode;
      verifiedDiscount = Math.round((Number(subtotal) * (subscriber.discountPercent || 15)) / 100);
    }

    const safeShipping = Number(shippingFee) || 0;
    const calculatedTotal = Math.max(0, Number(subtotal) + safeShipping - verifiedDiscount);

    const orderData = {
      user: req.user ? req.user.id : null,
      customerName,
      customerPhone,
      customerEmail: finalEmail,
      items,
      petId: petId || null,
      petName: petName || null,
      subtotal: Number(subtotal),
      shippingFee: safeShipping,
      discount: verifiedDiscount,
      promoCode: verifiedPromoCode,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      deliveryZone: deliveryZone || 'Kathmandu Valley',
      shippingAddress,
      status: 'pending',
    };

    const order = await Order.create(orderData);

    // Decrement product inventory
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockCount: -item.quantity },
        });
      }
    }

    return sendSuccess(res, { order }, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders (User's own orders or all for admin)
// @route   GET /api/v1/orders
export const getOrders = async (req, res, next) => {
  try {
    let query = {};

    // If customer role, only return their own orders
    if (req.user && req.user.role === 'customer') {
      query.user = req.user.id;
    } else if (req.query.userId) {
      query.user = req.query.userId;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const orders = await Order.find(query).sort('-createdAt');
    return sendSuccess(res, { count: orders.length, orders }, 'Orders fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      // Also try searching by orderId string e.g. ORD-NP-8831
      const byOrderId = await Order.findOne({ orderId: req.params.id });
      if (!byOrderId) {
        return sendError(res, 'Order not found', 404);
      }
      return sendSuccess(res, { order: byOrderId }, 'Order fetched');
    }
    return sendSuccess(res, { order }, 'Order fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/v1/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'Paid';
    }

    await order.save();
    return sendSuccess(res, { order }, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};
