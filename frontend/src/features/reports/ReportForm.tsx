import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { WeeklyReport } from '../../types/report';
import type { Project } from '../../types/project';

// ── Zod schema ────────────────────────────────────────────────────────────────
// Keep all fields as strings in the form; transformation happens in parent handlers.

const reportSchema = z
  .object({
    weekStartDate: z.string().min(1, 'Start date is required'),
    weekEndDate: z.string().min(1, 'End date is required'),
    projectId: z.string().min(1, 'Project is required'),
    tasksCompleted: z.string().min(1, 'Tasks completed is required'),
    tasksPlanned: z.string().min(1, 'Tasks planned is required'),
    blockers: z.string().min(1, 'Blockers field is required'),
    hoursWorked: z
      .string()
      .optional()
      .refine(v => v === '' || v === undefined || parseFloat(v) >= 0, {
        message: 'Hours must be 0 or more',
      }),
    notes: z.string().optional(),
  })
  .refine(d => d.weekEndDate > d.weekStartDate, {
    message: 'End date must be after start date',
    path: ['weekEndDate'],
  });

export type ReportFormValues = z.infer<typeof reportSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReportFormProps {
  projects: Project[];
  initial?: WeeklyReport | null;
  onSaveDraft: (data: ReportFormValues) => Promise<void>;
  onSubmitReport: (data: ReportFormValues) => Promise<void>;
  saving: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportForm({ projects, initial, onSaveDraft, onSubmitReport, saving }: ReportFormProps) {
  const isReadOnly = initial?.status === 'SUBMITTED';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      weekStartDate: initial?.weekStartDate ?? '',
      weekEndDate: initial?.weekEndDate ?? '',
      projectId: initial?.projectId ?? '',
      tasksCompleted: initial?.tasksCompleted ?? '',
      tasksPlanned: initial?.tasksPlanned ?? '',
      blockers: initial?.blockers ?? '',
      hoursWorked: initial?.hoursWorked != null ? String(initial.hoursWorked) : '',
      notes: initial?.notes ?? '',
    },
  });

  // Sync form when editing report changes
  useEffect(() => {
    reset({
      weekStartDate: initial?.weekStartDate ?? '',
      weekEndDate: initial?.weekEndDate ?? '',
      projectId: initial?.projectId ?? '',
      tasksCompleted: initial?.tasksCompleted ?? '',
      tasksPlanned: initial?.tasksPlanned ?? '',
      blockers: initial?.blockers ?? '',
      hoursWorked: initial?.hoursWorked != null ? String(initial.hoursWorked) : '',
      notes: initial?.notes ?? '',
    });
  }, [initial, reset]);

  return (
    <div className="report-form-card">
      <div className="report-form-header">
        <h2>{initial ? (isReadOnly ? 'View Report' : 'Edit Draft') : 'New Report'}</h2>
        {isReadOnly && <span className="badge badge-submitted">View Only</span>}
      </div>

      <form className="report-form">
        {/* Row: dates */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weekStartDate">Week Start *</label>
            <input
              id="weekStartDate"
              type="date"
              disabled={isReadOnly}
              {...register('weekStartDate')}
            />
            {errors.weekStartDate && <span className="field-error">{errors.weekStartDate.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="weekEndDate">Week End *</label>
            <input
              id="weekEndDate"
              type="date"
              disabled={isReadOnly}
              {...register('weekEndDate')}
            />
            {errors.weekEndDate && <span className="field-error">{errors.weekEndDate.message}</span>}
          </div>
        </div>

        {/* Project */}
        <div className="form-group">
          <label htmlFor="projectId">Project *</label>
          <select id="projectId" disabled={isReadOnly} {...register('projectId')}>
            <option value="">— Select a project —</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.projectId && <span className="field-error">{errors.projectId.message}</span>}
        </div>

        {/* Tasks Completed */}
        <div className="form-group">
          <label htmlFor="tasksCompleted">Tasks Completed *</label>
          <textarea
            id="tasksCompleted"
            rows={4}
            disabled={isReadOnly}
            placeholder="What did you accomplish this week?"
            {...register('tasksCompleted')}
          />
          {errors.tasksCompleted && <span className="field-error">{errors.tasksCompleted.message}</span>}
        </div>

        {/* Tasks Planned */}
        <div className="form-group">
          <label htmlFor="tasksPlanned">Tasks Planned *</label>
          <textarea
            id="tasksPlanned"
            rows={4}
            disabled={isReadOnly}
            placeholder="What will you work on next week?"
            {...register('tasksPlanned')}
          />
          {errors.tasksPlanned && <span className="field-error">{errors.tasksPlanned.message}</span>}
        </div>

        {/* Blockers */}
        <div className="form-group">
          <label htmlFor="blockers">Blockers *</label>
          <textarea
            id="blockers"
            rows={3}
            disabled={isReadOnly}
            placeholder="Any blockers or impediments? (write 'None' if clear)"
            {...register('blockers')}
          />
          {errors.blockers && <span className="field-error">{errors.blockers.message}</span>}
        </div>

        {/* Row: hours + notes */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="hoursWorked">Hours Worked</label>
            <input
              id="hoursWorked"
              type="number"
              min="0"
              step="0.5"
              disabled={isReadOnly}
              placeholder="e.g. 40"
              {...register('hoursWorked')}
            />
            {errors.hoursWorked && <span className="field-error">{errors.hoursWorked.message}</span>}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={3}
            disabled={isReadOnly}
            placeholder="Any additional notes (optional)"
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        {!isReadOnly && (
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={saving}
              onClick={handleSubmit(onSaveDraft)}
            >
              {saving ? 'Saving…' : '💾 Save Draft'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={handleSubmit(onSubmitReport)}
            >
              {saving ? 'Submitting…' : '✅ Submit Report'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
