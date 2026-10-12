import axiosClient from './axiosClient';

export const productApi = {
  // Fetch products with filters, search, sort
  async getProducts(params = {}) {
    try {
      const response = await axiosClient.get('/products', { params });
      return response.data?.products || [];
    } catch (error) {
      console.warn('Backend API /products not reachable or DB error:', error.message);
      return [];
    }
  },

  // Fetch product by ID
  async getProductById(id) {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data?.product || null;
    } catch (error) {
      console.warn('Backend API /products/:id error:', error.message);
      return null;
    }
  },

  // Get featured products
  async getFeaturedProducts() {
    try {
      const response = await axiosClient.get('/products/featured');
      return response.data?.products || [];
    } catch (error) {
      console.warn('Backend API /products/featured error:', error.message);
      return [];
    }
  },

  // Admin: Create product
  async createProduct(data) {
    const response = await axiosClient.post('/products', data);
    return response.data?.product || response.data;
  },

  // Admin: Update product
  async updateProduct(id, data) {
    const response = await axiosClient.put(`/products/${id}`, data);
    return response.data?.product || response.data;
  },

  // Admin: Delete product
  async deleteProduct(id) {
    const response = await axiosClient.delete(`/products/${id}`);
    return response;
  },
};

export default productApi;
