import axiosClient from './axiosClient';

export const petProfileApi = {
  // Get all pets for user
  async getPetProfiles(userId = null) {
    try {
      const response = await axiosClient.get('/pets', { params: { userId } });
      return response.data?.pets || [];
    } catch (error) {
      console.warn('Backend API /pets error:', error.message);
      return [];
    }
  },

  // Get single pet
  async getPetProfileById(id) {
    try {
      const response = await axiosClient.get(`/pets/${id}`);
      return response.data?.pet || null;
    } catch (error) {
      console.warn('Backend API /pets/:id error:', error.message);
      return null;
    }
  },

  // Create pet profile
  async createPetProfile(petData) {
    const response = await axiosClient.post('/pets', petData);
    return response.data?.pet || response.data;
  },

  // Update pet profile
  async updatePetProfile(id, petData) {
    const response = await axiosClient.put(`/pets/${id}`, petData);
    return response.data?.pet || response.data;
  },

  // Delete pet profile
  async deletePetProfile(id) {
    const response = await axiosClient.delete(`/pets/${id}`);
    return response;
  },

  // Get recommendations for pet
  async getPetRecommendations(id) {
    try {
      const response = await axiosClient.get(`/pets/${id}/recommendations`);
      return response.data?.products || [];
    } catch (error) {
      console.warn('Backend API /pets/:id/recommendations error:', error.message);
      return [];
    }
  },
};

export default petProfileApi;
