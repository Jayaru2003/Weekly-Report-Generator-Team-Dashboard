import React, { useState, useCallback } from 'react';
import type { TeamReport } from '../../types/dashboard';
import type { Project } from '../../types/project';
import { reportApi } from '../../api/reportApi';
import { RejectModal } from './RejectModal';
import { CommentsPanel } from './CommentsPanel';

interface SubmissionStatusTableProps {
  reports: TeamReport[];
  projects: Project[];
  loading: boolean;
  onRefresh?: () => void;
}

export function SubmissionStatusTable({ reports, projects, loading, onRefresh }: SubmissionStatusTableProps) {
  const [selectedReport, setSelectedReport] = useState<TeamReport | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TeamReport | null>(null);
  const [commentsTarget, setCommentsTarget] = useState<TeamReport | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const getAssignedProjects = (userId: string) =>
    projects.filter(p => p.members?.some(m => m.id === userId));

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'LATE'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'status' | 'project' | 'hours' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':  return 'badge-submitted';
      case 'APPROVED':   return 'badge-approved';
      case 'REJECTED':   return 'badge-rejected';
      case 'LATE':       return 'badge-late';
      case 'PENDING':
      default:           return 'badge-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':  return '📤';
      case 'APPROVED':   return '✅';
      case 'REJECTED':   return '❌';
      case 'LATE':       return '⏰';
      case 'PENDING':    return '⏳';
      default:           return '';
    }
  };

  const handleSort = (field: 'name' | 'status' | 'project' | 'hours') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  // ── Approve ──────────────────────────────────────────────────────────────────
  async function handleApprove(report: TeamReport) {
    if (!report.reportId) return;
    setActionLoading(report.reportId);
    try {
      await reportApi.approve(report.reportId);
      showToast(`✅ Report approved for ${report.firstName} ${report.lastName}`);
      onRefresh?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to approve report';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  }

  // ── Reject ───────────────────────────────────────────────────────────────────
  async function handleRejectConfirm(comment: string) {
    if (!rejectTarget?.reportId) return;
    setActionLoading(rejectTarget.reportId);
    try {
      await reportApi.reject(rejectTarget.reportId, comment);
      showToast(`❌ Report rejected for ${rejectTarget.firstName} ${rejectTarget.lastName}`);
      setRejectTarget(null);
      onRefresh?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to reject report';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="table-section">
        <h3 className="section-title">Team Submission Status</h3>
        <div className="loading-spinner">Loading member statuses…</div>
      </div>
    );
  }

  const localFilteredReports = reports.filter(r => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const email = r.email.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedReports = [...localFilteredReports].sort((a, b) => {
    if (!sortField) return 0;
    let cmp = 0;
    if (sortField === 'name') cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortField === 'project') cmp = (a.projectName || '').localeCompare(b.projectName || '');
    else if (sortField === 'hours') cmp = (a.hoursWorked ?? 0) - (b.hoursWorked ?? 0);
    return sortAsc ? cmp : -cmp;
  });

  const statusFilters = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PENDING', 'LATE'] as const;

  return (
    <div className="table-section">
      <h3 className="section-title">Team Submission Status</h3>
      <div className="table-wrapper">
        <div className="table-controls-row">
          <div className="table-search-box">
            <span className="table-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search team members by name or email..."
              className="table-search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-filter-pills">
            {statusFilters.map(filter => (
              <button
                key={filter}
                className={`filter-pill ${statusFilter === filter ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable-th" onClick={() => handleSort('name')}>
                Team Member <span className="sort-icon-indicator">{sortField === 'name' ? (sortAsc ? '▲' : '▼') : '↕'}</span>
              </th>
              <th className="sortable-th" onClick={() => handleSort('status')}>
                Status <span className="sort-icon-indicator">{sortField === 'status' ? (sortAsc ? '▲' : '▼') : '↕'}</span>
              </th>
              <th className="sortable-th" onClick={() => handleSort('project')}>
                Project <span className="sort-icon-indicator">{sortField === 'project' ? (sortAsc ? '▲' : '▼') : '↕'}</span>
              </th>
              <th className="sortable-th" onClick={() => handleSort('hours')}>
                Hours <span className="sort-icon-indicator">{sortField === 'hours' ? (sortAsc ? '▲' : '▼') : '↕'}</span>
              </th>
              <th>Blockers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">No members matched the filter criteria.</td>
              </tr>
            ) : (
              sortedReports.map((r, idx) => {
                const hasBlockers = r.blockers &&
                  !['none', 'n/a', '', 'no', 'no blockers'].includes(r.blockers.toLowerCase().trim());
                const isSubmitted = r.status === 'SUBMITTED';
                const isActionLoading = actionLoading === r.reportId;
                const hasReport = !!r.reportId;
                const rowClasses = [
                  hasBlockers ? 'row-has-blockers' : '',
                  hasReport ? 'clickable-row' : ''
                ].filter(Boolean).join(' ');

                return (
                  <tr
                    key={idx}
                    className={rowClasses}
                    onClick={hasReport ? () => setSelectedReport(r) : undefined}
                  >
                    <td className="td-name">
                      <div>{r.firstName} {r.lastName}</div>
                      <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 400 }}>{r.email}</div>
                      {(() => {
                        const assigned = getAssignedProjects(r.userId);
                        if (assigned.length === 0) return null;
                        return (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {assigned.map(ap => (
                              <span key={ap.id} style={{
                                fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px',
                                background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 500
                              }}>{ap.name}</span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(r.status)}`}>
                        {getStatusIcon(r.status)} {r.status}
                      </span>
                    </td>
                    <td>
                      {r.projectName ? (
                        <span className="project-tag">{r.projectName}</span>
                      ) : (
                        (() => {
                          const assigned = getAssignedProjects(r.userId);
                          if (assigned.length === 0) return <span className="muted">—</span>;
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {assigned.map(ap => (
                                <span key={ap.id} className="project-tag project-tag-assigned" style={{
                                  opacity: 0.75, border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#64748b'
                                }}>{ap.name}</span>
                              ))}
                            </div>
                          );
                        })()
                      )}
                    </td>
                    <td>{r.hoursWorked != null ? `${r.hoursWorked} hrs` : <span className="muted">—</span>}</td>
                    <td className="td-desc">
                      {r.blockers ? (
                        <span className={hasBlockers ? 'text-danger-value' : 'muted'}>{r.blockers}</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="td-actions" style={{ minWidth: '200px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {r.reportId && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => { e.stopPropagation(); setSelectedReport(r); }}
                          >
                            🔍 View
                          </button>
                        )}
                        {r.reportId && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => { e.stopPropagation(); setCommentsTarget(r); }}
                            title="View / add comments"
                          >
                            💬
                          </button>
                        )}
                        {isSubmitted && r.reportId && (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#16a34a', color: 'white', opacity: isActionLoading ? 0.6 : 1 }}
                              onClick={(e) => { e.stopPropagation(); handleApprove(r); }}
                              disabled={isActionLoading}
                              title="Approve this report"
                            >
                              {isActionLoading ? '…' : '✅'}
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#dc2626', color: 'white', opacity: isActionLoading ? 0.6 : 1 }}
                              onClick={(e) => { e.stopPropagation(); setRejectTarget(r); }}
                              disabled={isActionLoading}
                              title="Reject this report"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {!r.reportId && (
                          <button className="btn btn-ghost btn-sm" disabled>No Submission</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Report View Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Weekly Report Detail</h2>
                <p className="page-subtitle">
                  Submitted by {selectedReport.firstName} {selectedReport.lastName}
                </p>
              </div>
              <button className="modal-close" onClick={() => setSelectedReport(null)}>&times;</button>
            </div>
            <div className="modal-body-scrollable">
              <div className="modal-detail-row">
                <strong>Status:</strong>{' '}
                <span className={`badge ${getStatusBadgeClass(selectedReport.status)}`}>
                  {getStatusIcon(selectedReport.status)} {selectedReport.status}
                </span>
              </div>
              <div className="modal-detail-row">
                <strong>Project:</strong>{' '}
                <span className="project-tag">{selectedReport.projectName}</span>
              </div>
              <div className="modal-detail-row">
                <strong>Week Range:</strong> {selectedReport.weekStartDate} to {selectedReport.weekEndDate}
              </div>
              {selectedReport.hoursWorked != null && (
                <div className="modal-detail-row">
                  <strong>Hours Worked:</strong> {selectedReport.hoursWorked} hrs
                </div>
              )}
              {selectedReport.submittedAt && (
                <div className="modal-detail-row">
                  <strong>Submitted At:</strong> {new Date(selectedReport.submittedAt).toLocaleString()}
                </div>
              )}
              <hr className="modal-divider" />
              <div className="modal-section-content">
                <h4>Tasks Completed</h4>
                <p className="pre-wrap">{selectedReport.tasksCompleted}</p>
              </div>
              <div className="modal-section-content">
                <h4>Tasks Planned</h4>
                <p className="pre-wrap">{selectedReport.tasksPlanned}</p>
              </div>
              <div className="modal-section-content">
                <h4>Blockers</h4>
                <p className={`pre-wrap ${selectedReport.blockers?.toLowerCase() !== 'none' ? 'text-danger-value' : ''}`}>
                  {selectedReport.blockers}
                </p>
              </div>
              {selectedReport.notes && (
                <div className="modal-section-content">
                  <h4>Notes</h4>
                  <p className="pre-wrap">{selectedReport.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          memberName={`${rejectTarget.firstName} ${rejectTarget.lastName}`}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
          loading={actionLoading === rejectTarget.reportId}
        />
      )}

      {/* Comments Panel */}
      {commentsTarget && commentsTarget.reportId && (
        <CommentsPanel
          reportId={commentsTarget.reportId}
          memberName={`${commentsTarget.firstName} ${commentsTarget.lastName}`}
          role="MANAGER"
          onClose={() => setCommentsTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
