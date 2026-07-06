import { axiosClient } from './axiosClient';

export const reportApi = {
  list: async () => axiosClient.get('/reports'),
  create: async () => axiosClient.post('/reports'),
  update: async () => axiosClient.put('/reports'),
};
