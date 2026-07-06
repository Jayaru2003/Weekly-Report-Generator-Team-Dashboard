import { useState, useEffect, useCallback } from 'react';
import { reportApi } from '../../api/reportApi';
import { projectApi } from '../../api/projectApi';
import type { WeeklyReport } from '../../types/report';
import type { Project } from '../../types/project';
import { ReportForm } from './ReportForm';
import type { ReportFormValues } from './ReportForm';
import { ReportHistory } from './ReportHistory';
import { Navbar } from '../../components/layout/Navbar';

export function MyReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const data = await reportApi.listMine();
      setReports(data);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
    projectApi.list().then(setProjects).catch(() => {});
  }, [loadReports]);

  // ── Save Draft ─────────────────────────────────────────────────────────────

  async function handleSaveDraft(formData: ReportFormValues) {
    setSaving(true);
    try {
      const parsedHours = formData.hoursWorked ? parseFloat(formData.hoursWorked) : null;
      const payload = {
        projectId: formData.projectId,
        weekStartDate: formData.weekStartDate,
        weekEndDate: formData.weekEndDate,
        tasksCompleted: formData.tasksCompleted,
        tasksPlanned: formData.tasksPlanned,
        blockers: formData.blockers,
        hoursWorked: parsedHours,
        notes: formData.notes || null,
      };

      let saved: WeeklyReport;
      if (editingReport && editingReport.status !== 'SUBMITTED') {
        saved = await reportApi.update(editingReport.id, payload);
      } else {
        saved = await reportApi.create(payload);
      }
      setEditingReport(saved);
      await loadReports();
      showToast('Draft saved successfully');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to save draft';
      showToast('Error: ' + msg);
    } finally {
      setSaving(false);
    }
  }

  // ── Submit Report ──────────────────────────────────────────────────────────

  async function handleSubmitReport(formData: ReportFormValues) {
    setSaving(true);
    try {
      const parsedHours = formData.hoursWorked ? parseFloat(formData.hoursWorked) : null;
      const payload = {
        projectId: formData.projectId,
        weekStartDate: formData.weekStartDate,
        weekEndDate: formData.weekEndDate,
        tasksCompleted: formData.tasksCompleted,
        tasksPlanned: formData.tasksPlanned,
        blockers: formData.blockers,
        hoursWorked: parsedHours,
        notes: formData.notes || null,
      };

      let targetId: string;
      if (editingReport && editingReport.status !== 'SUBMITTED') {
        // Save first, then submit
        const saved = await reportApi.update(editingReport.id, payload);
        targetId = saved.id;
      } else {
        const created = await reportApi.create(payload);
        targetId = created.id;
      }

      const submitted = await reportApi.submit(targetId);
      setEditingReport(submitted);
      await loadReports();
      showToast('Report submitted successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to submit report';
      showToast('Error: ' + msg);
    } finally {
      setSaving(false);
    }
  }

  function handleNewReport() {
    setEditingReport(null);
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Reports</h1>
            <p className="page-subtitle">Create, edit and submit your weekly reports</p>
          </div>
          {editingReport && (
            <button className="btn btn-ghost" onClick={handleNewReport}>
              + New Report
            </button>
          )}
        </div>

        <div className="my-reports-layout">
          <ReportForm
            projects={projects}
            initial={editingReport}
            onSaveDraft={handleSaveDraft}
            onSubmitReport={handleSubmitReport}
            saving={saving}
          />

          <div className="history-section">
            {loadingReports ? (
              <div className="loading-spinner">Loading history…</div>
            ) : (
              <ReportHistory
                reports={reports}
                onEdit={report => setEditingReport(report)}
              />
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>
          {toast}
        </div>
      )}
    </>
  );
}
