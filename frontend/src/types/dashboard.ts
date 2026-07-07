export interface DashboardSummary {
  totalReportsSubmitted: number;
  totalTeamMembers: number;
  complianceRate: number;
  openBlockersCount: number;
}

export interface TeamReport {
  reportId: string | null;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  projectId: string | null;
  projectName: string | null;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string | null;
  tasksPlanned: string | null;
  blockers: string | null;
  hoursWorked: number | null;
  notes: string | null;
  status: 'SUBMITTED' | 'PENDING' | 'LATE' | 'APPROVED' | 'REJECTED';
  submittedAt: string | null;
}

export interface TrendData {
  weekStartDate: string;
  tasksCompletedCount: number;
}

export interface SubmissionStatus {
  userId: string;
  userName: string;
  status: 'SUBMITTED' | 'PENDING' | 'LATE' | 'APPROVED' | 'REJECTED';
}

export interface WorkloadByProject {
  projectName: string;
  reportCount: number;
  totalHours: number;
}

export interface ActivityItem {
  userName: string;
  projectName: string;
  submittedAt: string;
}
