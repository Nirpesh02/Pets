import axiosClient from './axiosClient';

export const reviewApi = {
  // Get featured reviews for homepage ("Loved by 4,000+ Pet Parents in Nepal")
  async getFeaturedReviews() {
    try {
      const response = await axiosClient.get('/reviews/featured');
      return response.data?.reviews || response.reviews || [];
    } catch (error) {
      console.warn('Backend API /reviews/featured error:', error.message);
      return [];
    }
  },

  // Get reviews and rating stats for a specific product
  async getProductReviews(productId) {
    try {
      const response = await axiosClient.get(`/reviews/product/${productId}`);
      return response.data || {
        reviews: [],
        totalReviews: 0,
        avgRating: 5.0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    } catch (error) {
      console.warn('Backend API /reviews/product error:', error.message);
      return {
        reviews: [],
        totalReviews: 0,
        avgRating: 5.0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
  },

  // Create or update review for a product (Customer)
  async createReview(productId, reviewData) {
    const response = await axiosClient.post(`/reviews/product/${productId}`, reviewData);
    return response.data || response;
  },

  // Delete review (Customer or Admin)
  async deleteReview(reviewId) {
    const response = await axiosClient.delete(`/reviews/${reviewId}`);
    return response.data || response;
  },

  // Get all reviews for admin console with filters
  async getAdminReviews(params = {}) {
    try {
      const response = await axiosClient.get('/reviews/admin', { params });
      return response.data || {
        reviews: [],
        stats: { totalReviews: 0, featuredCount: 0, fiveStarCount: 0, avgRating: 5.0 },
      };
    } catch (error) {
      console.warn('Backend API /reviews/admin error:', error.message);
      return {
        reviews: [],
        stats: { totalReviews: 0, featuredCount: 0, fiveStarCount: 0, avgRating: 5.0 },
      };
    }
  },

  // Toggle "Add to client side" (Admin)
  async toggleFeaturedReview(reviewId, isFeaturedOnHome) {
    const response = await axiosClient.patch(`/reviews/${reviewId}/toggle-featured`, {
      isFeaturedOnHome,
    });
    return response.data || response;
  },
};

export default reviewApi;
