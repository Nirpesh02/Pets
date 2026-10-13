import axiosClient from './axiosClient';

export const adminApi = {
  // Get executive KPI stats
  async getDashboardStats() {
    try {
      const response = await axiosClient.get('/admin/stats');
      return response.data || {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrdersCount: 0,
        lowStockCount: 0,
        expiringCount: 0,
        activePetsCount: 0,
        totalCustomersCount: 0,
        recentOrders: [],
        lowStockProducts: [],
        expiringProducts: [],
        salesTrend: [],
      };
    } catch (error) {
      console.warn('Backend API /admin/stats error:', error.message);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrdersCount: 0,
        lowStockCount: 0,
        expiringCount: 0,
        activePetsCount: 0,
        totalCustomersCount: 0,
        recentOrders: [],
        lowStockProducts: [],
        expiringProducts: [],
        salesTrend: [],
      };
    }
  },

  // Get inventory & batch expiry report
  async getInventoryWarnings() {
    try {
      const response = await axiosClient.get('/admin/inventory/warnings');
      return response.data?.warnings || [];
    } catch (error) {
      console.warn('Backend API /admin/inventory/warnings error:', error.message);
      return [];
    }
  },

  // Promotional banners
  async getDogImages() {
    try {
      const response = await axiosClient.get('/banners/dog-images');
      return response.data?.dogImages || response.dogImages || [];
    } catch {
      return [];
    }
  },

  async getBanners(email) {
    try {
      const response = await axiosClient.get('/banners', {
        params: email ? { email } : {},
      });
      return response.data?.banners || response.banners || [];
    } catch (error) {
      console.warn('Backend API /banners error:', error.message);
      return [];
    }
  },

  async getAllBanners() {
    try {
      const response = await axiosClient.get('/banners/all');
      return response.data?.banners || response.banners || response || [];
    } catch (error) {
      console.warn('Backend API /banners/all error:', error.message);
      return [];
    }
  },

  async addBanner(bannerData) {
    const response = await axiosClient.post('/banners', bannerData);
    return response.data?.banner || response.data;
  },

  async updateBanner(id, bannerData) {
    const response = await axiosClient.put(`/banners/${id}`, bannerData);
    return response.data?.banner || response.data;
  },

  async updateBanners(banners) {
    return banners;
  },

  async deleteBanner(id) {
    const response = await axiosClient.delete(`/banners/${id}`);
    return response;
  },

  // Customers directory
  async getCustomers() {
    try {
      const response = await axiosClient.get('/admin/customers');
      return response.data?.customers || [];
    } catch (error) {
      console.warn('Backend API /admin/customers error:', error.message);
      return [];
    }
  },

  async toggleBlockCustomer(id) {
    const response = await axiosClient.patch(`/admin/customers/${id}/block`);
    return response.data || response;
  },

  async deleteCustomer(id) {
    const response = await axiosClient.delete(`/admin/customers/${id}`);
    return response.data || response;
  },

  async changeUserRole(id, role) {
    const response = await axiosClient.patch(`/admin/customers/${id}/role`, { role });
    return response.data || response;
  },
};

export default adminApi;
