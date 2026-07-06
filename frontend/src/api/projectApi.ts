import { axiosClient } from './axiosClient';

export const projectApi = {
  list: async () => axiosClient.get('/projects'),
  create: async () => axiosClient.post('/projects'),
};
