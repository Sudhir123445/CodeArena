import apiClient from './client';

export const contestsAPI = {
  getAll() {
    return apiClient.get('/contests');
  },
  
  getBySlug(slug) {
    return apiClient.get(`/contests/${slug}`);
  },

  register(slug) {
    return apiClient.post(`/contests/${slug}/register`);
  },

  getLeaderboard(slug) {
    return apiClient.get(`/contests/${slug}/leaderboard`);
  }
};
