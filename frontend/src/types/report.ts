export type ReportStatus = 'DRAFT' | 'SUBMITTED';

export interface WeeklyReport {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string;
  hoursWorked?: number | null;
  notes?: string | null;
  status: ReportStatus;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRequest {
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string;
  hoursWorked?: number | null;
  notes?: string | null;
}
