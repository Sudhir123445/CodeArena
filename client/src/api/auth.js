import apiClient from './client';

export const authAPI = {
  register(data) {
    return apiClient.post('/auth/register', data);
  },

  login(data) {
    return apiClient.post('/auth/login', data);
  },

  refresh(refreshToken) {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiClient.post('/auth/logout', { refreshToken });
  },
};
