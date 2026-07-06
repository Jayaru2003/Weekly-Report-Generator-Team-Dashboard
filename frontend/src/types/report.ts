export type ReportStatus = 'DRAFT' | 'SUBMITTED';

export type WeeklyReport = {
  id?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  tasksCompleted?: string;
  tasksPlanned?: string;
  blockers?: string;
  hoursWorked?: number;
  notes?: string;
  status?: ReportStatus;
};
