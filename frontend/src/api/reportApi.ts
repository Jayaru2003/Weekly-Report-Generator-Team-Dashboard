import { axiosClient } from './axiosClient';
import type { WeeklyReport, ReportRequest } from '../types/report';

export interface ReportFilters {
  projectId?: string;
  weekStart?: string;
  weekEnd?: string;
}

export const reportApi = {
  listMine: (filters?: ReportFilters) =>
    axiosClient.get<WeeklyReport[]>('/reports/me', { params: filters }).then(r => r.data),

  create: (data: ReportRequest) =>
    axiosClient.post<WeeklyReport>('/reports', data).then(r => r.data),

  update: (id: string, data: ReportRequest) =>
    axiosClient.put<WeeklyReport>(`/reports/${id}`, data).then(r => r.data),

  submit: (id: string) =>
    axiosClient.post<WeeklyReport>(`/reports/${id}/submit`).then(r => r.data),
};
