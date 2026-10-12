export const paymentService = {
  // Simple payment validation
  async processPayment({ orderId, amount, paymentMethod }) {
    if (paymentMethod === 'cod') {
      return {
        success: true,
        transactionId: `COD-${orderId}`,
        status: 'Pending',
        message: 'Order placed with Cash on Delivery. Payment to be collected upon doorstep delivery.',
      };
    }

    // Default digital payment confirmation
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      status: 'Paid',
      message: 'Payment verified and recorded.',
    };
  },
};

export default paymentService;
