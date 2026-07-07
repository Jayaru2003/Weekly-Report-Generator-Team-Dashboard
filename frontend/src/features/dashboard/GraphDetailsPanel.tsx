import { useState, useEffect, useRef } from 'react';
import type { TeamReport, SubmissionStatus, TrendData, WorkloadByProject } from '../../types/dashboard';
import type { Project } from '../../types/project';

interface GraphDetailsPanelProps {
  detail: {
    type: 'week' | 'status' | 'project';
    value: string;
  };
  onClose: () => void;
  reports: TeamReport[];
  projects: Project[];
  submissionStatus: SubmissionStatus[];
  trends: TrendData[];
  workload: WorkloadByProject[];
}

export function GraphDetailsPanel({
  detail,
  onClose,
  reports,
  projects,
  submissionStatus,
  trends,
  workload,
}: GraphDetailsPanelProps) {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [detail]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  };

  const getInitialsFromName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase();
    }
    return (parts[0]?.[0] || '').toUpperCase();
  };

  const formatWeekDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Use T00:00:00 to parse local date correctly
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSendReminder = (userId: string, userName: string) => {
    setSendingReminderId(userId);
    setTimeout(() => {
      showToast(`✉️ Reminder sent successfully to ${userName}!`);
      setSendingReminderId(null);
    }, 800);
  };

  const handleRemindAll = () => {
    setBroadcasting(true);
    setTimeout(() => {
      showToast(`📢 Broadcast reminder sent to all pending team members!`);
      setBroadcasting(false);
    }, 1200);
  };

  // Render logic based on the click target type
  const renderContent = () => {
    switch (detail.type) {
      case 'week': {
        const weekStart = detail.value;
        const matchingTrends = trends.find(t => t.weekStartDate === weekStart);
        const tasksCompleted = matchingTrends ? matchingTrends.tasksCompletedCount : 0;
        
        const weekReports = reports.filter(r => r.weekStartDate === weekStart);
        const totalSubmissions = weekReports.filter(r => r.status === 'SUBMITTED' || r.status === 'APPROVED' || r.status === 'REJECTED').length;
        const totalHours = weekReports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
        
        const totalUsers = submissionStatus.length;
        const submissionRate = totalUsers > 0 ? Math.round((totalSubmissions / totalUsers) * 100) : 0;
        
        const blockerReports = weekReports.filter(r => {
          if (!r.blockers) return false;
          const b = r.blockers.toLowerCase().trim();
          return b !== 'none' && b !== 'n/a' && b !== '' && b !== 'no' && b !== 'no blockers';
        });

        return (
          <>
            <div className="graph-details-metrics-grid">
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Tasks Completed</span>
                <div className="graph-details-metric-value text-primary">
                  <span>✅ {tasksCompleted}</span>
                </div>
                <span className="graph-details-metric-subtext">For this week</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Submissions</span>
                <div className="graph-details-metric-value text-success">
                  <span>📄 {totalSubmissions} / {totalUsers}</span>
                </div>
                <span className="graph-details-metric-subtext">{submissionRate}% Compliance rate</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Hours Logged</span>
                <div className="graph-details-metric-value text-warning">
                  <span>⏱️ {totalHours} hrs</span>
                </div>
                <span className="graph-details-metric-subtext">Across all projects</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Active Blockers</span>
                <div className={`graph-details-metric-value ${blockerReports.length > 0 ? 'text-danger-value' : 'muted'}`}>
                  <span>⚠️ {blockerReports.length}</span>
                </div>
                <span className="graph-details-metric-subtext">Require attention</span>
              </div>
            </div>

            <div className="graph-details-section-title-container">
              <h4 className="graph-details-section-title">Submitted Reports for this Week</h4>
            </div>

            {weekReports.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📁</span>
                <p>No reports submitted for the week starting {formatWeekDate(weekStart)}.</p>
              </div>
            ) : (
              <div className="graph-details-list graph-details-list-grid">
                {weekReports.map((report) => (
                  <div key={report.reportId || report.userId} className="graph-details-item-card">
                    <div className="graph-details-item-top">
                      <div className="graph-details-user-info">
                        <div className="graph-details-avatar">
                          {getInitials(report.firstName, report.lastName)}
                        </div>
                        <div>
                          <span className="graph-details-username">{report.firstName} {report.lastName}</span>
                          <span className="graph-details-useremail">{report.email}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span className={`badge ${
                          report.status === 'APPROVED' ? 'badge-approved' :
                          report.status === 'REJECTED' ? 'badge-rejected' :
                          report.status === 'SUBMITTED' ? 'badge-submitted' :
                          report.status === 'LATE' ? 'badge-late' : 'badge-pending'
                        }`}>
                          {report.status}
                        </span>
                        {report.hoursWorked !== null && (
                          <span className="graph-details-tag">{report.hoursWorked} hours</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {report.projectName && (
                        <div>
                          <span className="graph-details-tag project">{report.projectName}</span>
                        </div>
                      )}
                      
                      {report.tasksCompleted && (
                        <div className="graph-details-item-body">
                          <span className="graph-details-label-heading">Completed Tasks</span>
                          <p className="graph-details-text-content">{report.tasksCompleted}</p>
                        </div>
                      )}

                      {report.tasksPlanned && (
                        <div className="graph-details-item-body">
                          <span className="graph-details-label-heading">Planned Tasks</span>
                          <p className="graph-details-text-content">{report.tasksPlanned}</p>
                        </div>
                      )}

                      {report.blockers && !['none', 'n/a', '', 'no', 'no blockers'].includes(report.blockers.toLowerCase().trim()) && (
                        <div className="graph-details-blocker-warning">
                          <span className="graph-details-label-heading" style={{ color: '#b91c1c' }}>⚠️ Blocker</span>
                          <p className="graph-details-text-content" style={{ marginTop: '0.15rem' }}>{report.blockers}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      }

      case 'status': {
        const statusVal = detail.value as 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'LATE';
        const matchingMembers = submissionStatus.filter(s => s.status === statusVal);
        const totalMembers = submissionStatus.length;
        const percentage = totalMembers > 0 ? Math.round((matchingMembers.length / totalMembers) * 100) : 0;
        
        let statusColor = '#2563eb'; // blue for submitted (awaiting review)
        let statusIcon = '📤';
        if (statusVal === 'APPROVED') {
          statusColor = '#16a34a'; // green
          statusIcon = '✅';
        } else if (statusVal === 'REJECTED') {
          statusColor = '#dc2626'; // red
          statusIcon = '❌';
        } else if (statusVal === 'PENDING') {
          statusColor = '#f59e0b'; // amber
          statusIcon = '⏳';
        } else if (statusVal === 'LATE') {
          statusColor = '#ef4444'; // red
          statusIcon = '🚨';
        }

        return (
          <>
            <div className="graph-details-metrics-grid">
              <div className="graph-details-metric-card" style={{ borderLeft: `4px solid ${statusColor}` }}>
                <span className="graph-details-metric-label">Status Category</span>
                <div className="graph-details-metric-value" style={{ color: statusColor }}>
                  <span>{statusIcon} {statusVal}</span>
                </div>
                <span className="graph-details-metric-subtext">Currently selected</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Team Count</span>
                <div className="graph-details-metric-value">
                  <span>👤 {matchingMembers.length}</span>
                </div>
                <span className="graph-details-metric-subtext">Members in this status</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Team Proportion</span>
                <div className="graph-details-metric-value">
                  <span>📊 {percentage}%</span>
                </div>
                <span className="graph-details-metric-subtext">Of the entire team</span>
              </div>
            </div>

            <div className="graph-details-section-title-container">
              <h4 className="graph-details-section-title">Team Members - {statusVal} ({matchingMembers.length})</h4>
              {(statusVal === 'PENDING' || statusVal === 'LATE') && matchingMembers.length > 0 && (
                <button 
                  className="graph-details-remind-all-btn"
                  onClick={handleRemindAll}
                  disabled={broadcasting}
                >
                  {broadcasting ? 'Sending...' : '📢 Remind All'}
                </button>
              )}
            </div>

            {matchingMembers.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎉</span>
                <p>No team members are currently in the "{statusVal}" status.</p>
              </div>
            ) : (
              <div className="graph-details-list graph-details-list-grid">
                {matchingMembers.map((member) => {
                  // Find detailed report if available
                  const userReport = reports.find(r => r.userId === member.userId);
                  
                  return (
                    <div key={member.userId} className="graph-details-item-card">
                      <div className="graph-details-item-top">
                        <div className="graph-details-user-info">
                          <div className="graph-details-avatar">
                            {getInitialsFromName(member.userName)}
                          </div>
                          <div>
                            <span className="graph-details-username">{member.userName}</span>
                            {userReport?.email && (
                              <span className="graph-details-useremail">{userReport.email}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={`badge ${
                            member.status === 'APPROVED' ? 'badge-approved' :
                            member.status === 'REJECTED' ? 'badge-rejected' :
                            member.status === 'SUBMITTED' ? 'badge-submitted' :
                            member.status === 'LATE' ? 'badge-late' : 'badge-pending'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: '0.25rem' }}>
                        {(member.status === 'SUBMITTED' || member.status === 'APPROVED' || member.status === 'REJECTED') && userReport ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {userReport.projectName && (
                              <div>
                                <span className="graph-details-tag project">{userReport.projectName}</span>
                                {userReport.hoursWorked !== null && (
                                  <span className="graph-details-tag" style={{ marginLeft: '0.5rem' }}>
                                    ⏱️ {userReport.hoursWorked} hrs
                                  </span>
                                )}
                              </div>
                            )}
                            {userReport.tasksCompleted && (
                              <div className="graph-details-item-body">
                                <span className="graph-details-label-heading">Tasks Summary</span>
                                <p className="graph-details-text-content" style={{ fontSize: '0.82rem' }}>
                                  {userReport.tasksCompleted.length > 140 
                                    ? reportExcerpt(userReport.tasksCompleted, 140) 
                                    : userReport.tasksCompleted}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <span className="muted" style={{ fontSize: '0.8rem' }}>
                              {member.status === 'LATE' ? '⚠️ Submission is overdue' : '⌛ No report submitted yet'}
                            </span>
                            <button
                              className="graph-details-remind-btn"
                              onClick={() => handleSendReminder(member.userId, member.userName)}
                              disabled={sendingReminderId === member.userId}
                            >
                              {sendingReminderId === member.userId ? 'Sending...' : '✉️ Remind'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      }

      case 'project': {
        const projectName = detail.value;
        // When viewing project details, 'workload' now contains member-wise data for that project.
        // So we sum them up to get the total project workload.
        const totalHours = workload.reduce((sum, w) => sum + w.totalHours, 0);
        const totalReports = workload.reduce((sum, w) => sum + w.reportCount, 0);
        const avgHours = totalReports > 0 ? Math.round((totalHours / totalReports) * 10) / 10 : 0;

        // Find contributors of this project
        const projectContributors = reports.filter(r => r.projectName === projectName);

        return (
          <>
            <div className="graph-details-metrics-grid">
              <div className="graph-details-metric-card" style={{ borderLeft: '4px solid #2563eb' }}>
                <span className="graph-details-metric-label">Project Focus</span>
                <div className="graph-details-metric-value text-primary">
                  <span>💼 {projectName}</span>
                </div>
                <span className="graph-details-metric-subtext">Selected workload</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Total Workload</span>
                <div className="graph-details-metric-value text-warning">
                  <span>⏱️ {totalHours} hrs</span>
                </div>
                <span className="graph-details-metric-subtext">Logged this week</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Submissions</span>
                <div className="graph-details-metric-value text-success">
                  <span>📄 {totalReports}</span>
                </div>
                <span className="graph-details-metric-subtext">Submitted report(s)</span>
              </div>
              <div className="graph-details-metric-card">
                <span className="graph-details-metric-label">Average Intensity</span>
                <div className="graph-details-metric-value" style={{ color: '#8b5cf6' }}>
                  <span>📈 {avgHours} hrs</span>
                </div>
                <span className="graph-details-metric-subtext">Per member submission</span>
              </div>
            </div>

            <div className="graph-details-section-title-container">
              <h4 className="graph-details-section-title">Contributors this Week ({projectContributors.length})</h4>
            </div>

            {projectContributors.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p>No contributors found for {projectName} in this week.</p>
              </div>
            ) : (
              <div className="graph-details-list graph-details-list-grid">
                {projectContributors.map((contrib) => (
                  <div key={contrib.reportId || contrib.userId} className="graph-details-item-card">
                    <div className="graph-details-item-top">
                      <div className="graph-details-user-info">
                        <div className="graph-details-avatar">
                          {getInitials(contrib.firstName, contrib.lastName)}
                        </div>
                        <div>
                          <span className="graph-details-username">{contrib.firstName} {contrib.lastName}</span>
                          <span className="graph-details-useremail">{contrib.email}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {contrib.hoursWorked !== null && (
                          <span className="graph-details-tag project">{contrib.hoursWorked} hours logged</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {contrib.tasksCompleted && (
                        <div className="graph-details-item-body">
                          <span className="graph-details-label-heading">Tasks Completed</span>
                          <p className="graph-details-text-content" style={{ fontSize: '0.85rem' }}>{contrib.tasksCompleted}</p>
                        </div>
                      )}

                      {contrib.blockers && !['none', 'n/a', '', 'no', 'no blockers'].includes(contrib.blockers.toLowerCase().trim()) && (
                        <div className="graph-details-blocker-warning">
                          <span className="graph-details-label-heading" style={{ color: '#b91c1c' }}>⚠️ Blocker reported</span>
                          <p className="graph-details-text-content" style={{ marginTop: '0.15rem', fontSize: '0.85rem' }}>{contrib.blockers}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  const reportExcerpt = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  const getPanelTitle = () => {
    switch (detail.type) {
      case 'week':
        return `📅 Week Deep-Dive`;
      case 'status':
        return `📊 Submission Status Detail`;
      case 'project':
        return `💼 Project Workload Detail`;
      default:
        return 'Selection Detail';
    }
  };

  const getPanelSubtitle = () => {
    switch (detail.type) {
      case 'week':
        return `Detailed overview for the week starting ${formatWeekDate(detail.value)}`;
      case 'status':
        return `Analyzing team members categorized under "${detail.value}" status`;
      case 'project':
        return `Workload contribution details for project: "${detail.value}"`;
      default:
        return '';
    }
  };

  return (
    <div ref={panelRef} className="graph-details-panel">
      {/* Toast Alert */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`} style={{ bottom: '2rem', right: '2rem' }}>
          {toast.msg}
        </div>
      )}

      <div className="graph-details-header">
        <div className="graph-details-title-container">
          <h3 className="graph-details-title">{getPanelTitle()}</h3>
          <span className="graph-details-subtitle">{getPanelSubtitle()}</span>
        </div>
        <button 
          className="graph-details-close-btn"
          onClick={onClose}
          aria-label="Close details panel"
          title="Close details"
        >
          ✕
        </button>
      </div>

      <div className="graph-details-content">
        {renderContent()}
      </div>
    </div>
  );
}
