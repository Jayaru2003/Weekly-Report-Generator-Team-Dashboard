import { axiosClient } from './axiosClient';
import type {
  DashboardSummary,
  TeamReport,
  TrendData,
  SubmissionStatus,
  WorkloadByProject,
  ActivityItem,
} from '../types/dashboard';

export const dashboardApi = {
  summary: (week?: string, projectId?: string) =>
    axiosClient.get<DashboardSummary>('/dashboard/summary', { params: { week, projectId } }).then(r => r.data),

  reports: (params: {
    week?: string;
    userId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }) => axiosClient.get<TeamReport[]>('/dashboard/reports', { params }).then(r => r.data),

  trends: (params: { startDate?: string; endDate?: string; userId?: string; projectId?: string }) =>
    axiosClient.get<TrendData[]>('/dashboard/trends', { params }).then(r => r.data),

  submissionStatus: (week?: string, projectId?: string) =>
    axiosClient.get<SubmissionStatus[]>('/dashboard/submission-status', { params: { week, projectId } }).then(r => r.data),

  workloadByProject: (week?: string, projectId?: string) =>
    axiosClient.get<WorkloadByProject[]>('/dashboard/workload-by-project', { params: { week, projectId } }).then(r => r.data),

  activityFeed: (limit?: number) =>
    axiosClient.get<ActivityItem[]>('/dashboard/activity-feed', { params: { limit } }).then(r => r.data),
};
