import axiosClient from './axiosClient';

export const subscriberApi = {
  // Public join exclusive offers
  async joinExclusiveOffers(email) {
    const response = await axiosClient.post('/subscribers/join', { email });
    return response.data || response;
  },

  // Validate coupon (requires joined & approved email)
  async validateCoupon(code, email) {
    const response = await axiosClient.post('/subscribers/validate-coupon', { code, email });
    return response.data || response;
  },

  // Get notifications for user email
  async getNotifications(email) {
    try {
      const response = await axiosClient.get('/subscribers/notifications', {
        params: { email },
      });
      return response.data?.notifications || response.notifications || [];
    } catch {
      return [];
    }
  },

  // Mark notifications read
  async markNotificationsRead(email) {
    try {
      const response = await axiosClient.patch('/subscribers/notifications/read', { email });
      return response.data || response;
    } catch {
      return null;
    }
  },

  // Admin APIs
  async getSubscribers() {
    const response = await axiosClient.get('/subscribers');
    return response.data?.subscribers || response.subscribers || [];
  },

  async approveSubscriber(id, { couponCode, discountPercent, validityMinutes, expiresAt }) {
    const response = await axiosClient.patch(`/subscribers/${id}/approve`, {
      couponCode,
      discountPercent,
      validityMinutes,
      expiresAt,
    });
    return response.data || response;
  },

  async bulkApproveSubscribers({ ids, couponCode, discountPercent, validityMinutes, expiresAt }) {
    const response = await axiosClient.post('/subscribers/bulk-approve', {
      ids,
      couponCode,
      discountPercent,
      validityMinutes,
      expiresAt,
    });
    return response.data || response;
  },

  async rejectSubscriber(id) {
    const response = await axiosClient.patch(`/subscribers/${id}/reject`);
    return response.data || response;
  },

  async deleteSubscriber(id) {
    const response = await axiosClient.delete(`/subscribers/${id}`);
    return response.data || response;
  },
};

export default subscriberApi;
