import axiosClient from './axiosClient';

export const uploadApi = {
  // Upload single image (e.g. for Banner)
  async uploadSingle(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axiosClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.url || res.url;
  },

  // Upload multiple images (e.g. for Product gallery)
  async uploadMultiple(files) {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    const res = await axiosClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.urls || res.urls || [];
  },
};

export default uploadApi;
