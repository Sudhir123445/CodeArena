import apiClient from './client';

export const usersAPI = {
  getLeaderboard(params = {}) {
    // The backend route is /leaderboard mounted on the root api, or is it /users/leaderboard?
    // Let me check index.js: `router.get('/leaderboard', UserController.getLeaderboard);`
    // It's mounted directly on the main api router, so the path is /leaderboard.
    return apiClient.get('/leaderboard', { params });
  },

  getProfile(username) {
    return apiClient.get(`/users/${username}`);
  },
};
