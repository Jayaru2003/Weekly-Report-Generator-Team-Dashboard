import type { DashboardSummary } from '../../types/dashboard';

interface SummaryCardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
  activeFilter?: 'ALL' | 'SUBMITTED' | 'BLOCKERS';
  onCardClick?: (type: 'ALL' | 'SUBMITTED' | 'BLOCKERS') => void;
}

export function SummaryCards({ summary, loading, activeFilter = 'ALL', onCardClick }: SummaryCardsProps) {
  if (loading || !summary) {
    return (
      <div className="summary-cards-grid">
        <div className="summary-card loading-skeleton-card">
          <div className="skeleton-bar title"></div>
          <div className="skeleton-bar value"></div>
        </div>
        <div className="summary-card loading-skeleton-card">
          <div className="skeleton-bar title"></div>
          <div className="skeleton-bar value"></div>
        </div>
        <div className="summary-card loading-skeleton-card">
          <div className="skeleton-bar title"></div>
          <div className="skeleton-bar value"></div>
        </div>
      </div>
    );
  }

  const complianceStatus = summary.complianceRate >= 90 
    ? { text: 'Optimal', className: 'stat-badge-up' } 
    : { text: 'Needs Action', className: 'stat-badge-warning' };

  return (
    <div className="summary-cards-grid">
      <div 
        className={`summary-card interactive-card submitted ${activeFilter === 'SUBMITTED' ? 'active-card' : ''}`}
        onClick={() => onCardClick?.(activeFilter === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
        title="Click to filter reports by SUBMITTED status"
      >
        <div className="summary-card-header">
          <div className="summary-card-icon reports">📄</div>
          <span className="summary-card-label">Submitted Reports</span>
        </div>
        <div className="summary-card-body">
          <div>
            <span className="summary-card-value">{summary.totalReportsSubmitted}</span>
            <span className="summary-card-stat-badge stat-badge-up">
              {(summary.totalTeamMembers > 0 ? (summary.totalReportsSubmitted / summary.totalTeamMembers) * 100 : 0).toFixed(0)}%
            </span>
          </div>
          <span className="summary-card-subtext">of {summary.totalTeamMembers} members (Click to filter)</span>
        </div>
      </div>

      <div 
        className="summary-card"
        title="Overall team report submission compliance rate"
      >
        <div className="summary-card-header">
          <div className="summary-card-icon compliance">📈</div>
          <span className="summary-card-label">Compliance Rate</span>
        </div>
        <div className="summary-card-body">
          <div className="summary-card-row">
            <span className="summary-card-value">{summary.complianceRate}%</span>
            <span className={`summary-card-stat-badge ${complianceStatus.className}`}>
              {complianceStatus.text}
            </span>
          </div>
          <div className="compliance-progress-bar-bg">
            <div 
              className="compliance-progress-bar-fill" 
              style={{ width: `${Math.min(summary.complianceRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div 
        className={`summary-card interactive-card blockers ${activeFilter === 'BLOCKERS' ? 'active-card' : ''} ${summary.openBlockersCount > 0 ? 'has-blockers-alert' : ''}`}
        onClick={() => onCardClick?.(activeFilter === 'BLOCKERS' ? 'ALL' : 'BLOCKERS')}
        title="Click to filter reports showing active blockers"
      >
        <div className="summary-card-header">
          <div className="summary-card-icon blockers">⚠️</div>
          <span className="summary-card-label">Open Blockers</span>
        </div>
        <div className="summary-card-body">
          <div>
            <span className={`summary-card-value ${summary.openBlockersCount > 0 ? 'text-danger-value' : ''}`}>
              {summary.openBlockersCount}
            </span>
            {summary.openBlockersCount > 0 && (
              <span className="summary-card-stat-badge stat-badge-warning">
                Alert
              </span>
            )}
          </div>
          <span className="summary-card-subtext">requiring attention (Click to filter)</span>
        </div>
      </div>
    </div>
  );
}
