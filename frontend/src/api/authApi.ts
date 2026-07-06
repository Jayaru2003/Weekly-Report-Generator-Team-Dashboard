import { axiosClient } from './axiosClient';

export const authApi = {
  login: async () => axiosClient.post('/auth/login'),
  register: async () => axiosClient.post('/auth/register'),
};
