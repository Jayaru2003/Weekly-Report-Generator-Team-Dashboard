import { axiosClient } from './axiosClient';
import type { ProjectMember } from '../types/project';

export const userApi = {
  list: (role?: string) =>
    axiosClient.get<ProjectMember[]>('/users', { params: { role } }).then(r => r.data),
};
