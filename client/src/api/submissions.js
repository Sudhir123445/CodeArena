import apiClient from './client';

export const submissionsAPI = {
  submit(data) {
    return apiClient.post('/submissions', data);
  },

  getById(id) {
    return apiClient.get(`/submissions/${id}`);
  },

  getAll(params = {}) {
    return apiClient.get('/submissions', { params });
  },
};
