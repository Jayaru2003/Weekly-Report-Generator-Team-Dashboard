import { axiosClient } from './axiosClient';
import type { Project, ProjectRequest } from '../types/project';

export const projectApi = {
  list: () =>
    axiosClient.get<Project[]>('/projects').then(r => r.data),

  create: (data: ProjectRequest) =>
    axiosClient.post<Project>('/projects', data).then(r => r.data),

  update: (id: string, data: ProjectRequest) =>
    axiosClient.put<Project>(`/projects/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    axiosClient.delete(`/projects/${id}`),
};
