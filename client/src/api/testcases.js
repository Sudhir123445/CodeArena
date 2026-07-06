import apiClient from './client';

export const testcasesAPI = {
  getByProblem(problemId) {
    return apiClient.get(`/testcases/problem/${problemId}`);
  },

  create(data) {
    return apiClient.post('/testcases', data);
  },

  delete(id) {
    return apiClient.delete(`/testcases/${id}`);
  },
};
