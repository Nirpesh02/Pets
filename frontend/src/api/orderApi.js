import axiosClient from './axiosClient';

export const orderApi = {
  // Get all orders or filter by userId/status
  async getOrders(params = {}) {
    try {
      const response = await axiosClient.get('/orders', { params });
      return response.data?.orders || [];
    } catch (error) {
      console.warn('Backend API /orders error:', error.message);
      return [];
    }
  },

  // Get single order by ID
  async getOrderById(id) {
    try {
      const response = await axiosClient.get(`/orders/${id}`);
      return response.data?.order || null;
    } catch (error) {
      console.warn('Backend API /orders/:id error:', error.message);
      return null;
    }
  },

  // Create new order
  async createOrder(orderPayload) {
    const response = await axiosClient.post('/orders', orderPayload);
    return response.data?.order || response.data;
  },

  // Update order status (Admin)
  async updateOrderStatus(orderId, status) {
    const response = await axiosClient.patch(`/orders/${orderId}/status`, { status });
    return response.data?.order || response.data;
  },
};

export default orderApi;
