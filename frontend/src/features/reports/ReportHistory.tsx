import { useState, useEffect } from 'react';
import type { WeeklyReport } from '../../types/report';
import type { ReportComment } from '../../types/comment';
import { reportApi } from '../../api/reportApi';
import { CommentsPanel } from '../dashboard/CommentsPanel';

interface ReportHistoryProps {
  reports: WeeklyReport[];
  onEdit: (report: WeeklyReport) => void;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const e = new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} – ${e}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: string; label: string }> = {
    DRAFT:     { cls: 'badge-draft',     icon: '✏️',  label: 'Draft' },
    SUBMITTED: { cls: 'badge-submitted', icon: '📤',  label: 'Submitted' },
    APPROVED:  { cls: 'badge-approved',  icon: '✅',  label: 'Approved' },
    REJECTED:  { cls: 'badge-rejected',  icon: '❌',  label: 'Rejected' },
  };
  const cfg = map[status] ?? { cls: 'badge-draft', icon: '❓', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>;
}

function RejectionComment({ reportId }: { reportId: string }) {
  const [comments, setComments] = useState<ReportComment[]>([]);
  useEffect(() => {
    reportApi.getComments(reportId).then(setComments).catch(() => {});
  }, [reportId]);

  const first = comments[0];
  if (!first) return null;

  return (
    <div style={{
      marginTop: '0.65rem',
      padding: '0.6rem 0.85rem',
      background: '#fff1f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      fontSize: '0.83rem',
    }}>
      <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: '3px' }}>
        💬 Manager feedback ({first.authorName}):
      </div>
      <p style={{ margin: 0, color: '#7f1d1d', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
        {first.content}
      </p>
    </div>
  );
}

export function ReportHistory({ reports, onEdit }: ReportHistoryProps) {
  const [commentsTarget, setCommentsTarget] = useState<WeeklyReport | null>(null);

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📄</span>
        <p>No reports yet. Create your first report above!</p>
      </div>
    );
  }

  const canEdit = (r: WeeklyReport) =>
    r.status === 'DRAFT' || r.status === 'REJECTED';

  return (
    <>
      <div className="report-history">
        <h2 className="section-title">Report History</h2>
        <div className="history-list">
          {reports.map(report => (
            <div key={report.id} className={`history-card ${report.status === 'REJECTED' ? 'history-card-rejected' : ''}`}>
              <div className="history-card-left" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="history-week">{formatDateRange(report.weekStartDate, report.weekEndDate)}</span>
                  <span className="project-tag">{report.projectName}</span>
                </div>

                {/* Inline rejection comment */}
                {report.status === 'REJECTED' && <RejectionComment reportId={report.id} />}

                {/* Review info for approved */}
                {report.status === 'APPROVED' && report.reviewedByName && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#16a34a' }}>
                    ✅ Approved by {report.reviewedByName}
                    {report.reviewedAt && ` · ${new Date(report.reviewedAt).toLocaleDateString()}`}
                  </div>
                )}
              </div>

              <div className="history-card-right" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <StatusBadge status={report.status} />

                <div style={{ display: 'flex', gap: '6px' }}>
                  {/* Comments button for submitted/approved/rejected */}
                  {['SUBMITTED', 'APPROVED', 'REJECTED'].includes(report.status) && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setCommentsTarget(report)}
                      title="View manager comments"
                    >
                      💬
                    </button>
                  )}

                  <button
                    className={`btn btn-sm ${canEdit(report) ? 'btn-outline' : 'btn-ghost'}`}
                    onClick={() => onEdit(report)}
                  >
                    {canEdit(report) ? (report.status === 'REJECTED' ? '✏️ Revise' : 'Edit') : 'View'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {commentsTarget && (
        <CommentsPanel
          reportId={commentsTarget.id}
          memberName="your report"
          role="MEMBER"
          onClose={() => setCommentsTarget(null)}
        />
      )}
    </>
  );
}
