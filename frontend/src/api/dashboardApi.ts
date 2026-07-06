import { axiosClient } from './axiosClient';

export const dashboardApi = {
  summary: async () => axiosClient.get('/dashboard/summary'),
};
