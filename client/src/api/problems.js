import apiClient from './client';

export const problemsAPI = {
  getAll(params = {}) {
    return apiClient.get('/problems', { params });
  },

  getBySlug(slug) {
    return apiClient.get(`/problems/${slug}`);
  },

  create(data) {
    return apiClient.post('/problems', data);
  },

  update(id, data) {
    return apiClient.put(`/problems/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/problems/${id}`);
  },
};
