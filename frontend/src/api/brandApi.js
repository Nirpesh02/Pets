import axiosClient from './axiosClient';

export const brandApi = {
  // Fetch all brands from database
  async getBrands() {
    try {
      const response = await axiosClient.get('/brands');
      const list = response.data?.data?.brands || response.data?.brands || response.brands || [];
      return list;
    } catch (error) {
      console.warn('Backend API /brands error:', error.message);
      return [];
    }
  },

  // Admin: create/save a new brand to database
  async createBrand(data) {
    const response = await axiosClient.post('/brands', data);
    return response.data?.data?.brand || response.data?.brand || response.data;
  },

  // Admin: delete a brand by ID or Name
  async deleteBrand(idOrName) {
    const response = await axiosClient.delete(`/brands/${encodeURIComponent(idOrName)}`);
    return response.data;
  },
};

export default brandApi;
