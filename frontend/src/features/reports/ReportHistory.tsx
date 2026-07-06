import type { WeeklyReport } from '../../types/report';

interface ReportHistoryProps {
  reports: WeeklyReport[];
  onEdit: (report: WeeklyReport) => void;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const e = new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} – ${e}`;
}

export function ReportHistory({ reports, onEdit }: ReportHistoryProps) {
  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📄</span>
        <p>No reports yet. Create your first report above!</p>
      </div>
    );
  }

  return (
    <div className="report-history">
      <h2 className="section-title">Report History</h2>

      <div className="history-list">
        {reports.map(report => (
          <div key={report.id} className="history-card">
            <div className="history-card-left">
              <span className="history-week">{formatDateRange(report.weekStartDate, report.weekEndDate)}</span>
              <span className="project-tag">{report.projectName}</span>
            </div>

            <div className="history-card-right">
              <span className={`badge ${report.status === 'SUBMITTED' ? 'badge-submitted' : 'badge-draft'}`}>
                {report.status === 'SUBMITTED' ? '✅ Submitted' : '✏️ Draft'}
              </span>

              <button
                className={`btn btn-sm ${report.status === 'SUBMITTED' ? 'btn-ghost' : 'btn-outline'}`}
                onClick={() => onEdit(report)}
              >
                {report.status === 'SUBMITTED' ? 'View' : 'Edit'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
