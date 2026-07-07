import { axiosClient } from './axiosClient';
import type { WeeklyReport, ReportRequest } from '../types/report';
import type { ReportComment } from '../types/comment';

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

  approve: (id: string) =>
    axiosClient.post<WeeklyReport>(`/reports/${id}/approve`).then(r => r.data),

  reject: (id: string, comment: string) =>
    axiosClient.post<WeeklyReport>(`/reports/${id}/reject`, { comment }).then(r => r.data),

  getComments: (reportId: string) =>
    axiosClient.get<ReportComment[]>(`/reports/${reportId}/comments`).then(r => r.data),

  addComment: (reportId: string, content: string) =>
    axiosClient.post<ReportComment>(`/reports/${reportId}/comments`, { content }).then(r => r.data),
};
