import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { projectApi } from '../../api/projectApi';
import type { Project } from '../../types/project';
import type {
  DashboardSummary,
  TeamReport,
  TrendData,
  SubmissionStatus,
  WorkloadByProject,
  ActivityItem,
} from '../../types/dashboard';
import { getWeekRange } from '../../utils/dateUtils';
import { Navbar } from '../../components/layout/Navbar';
import { FilterBar } from './FilterBar';
import { SummaryCards } from './SummaryCards';
import { TasksTrendChart } from './charts/TasksTrendChart';
import { SubmissionStatusChart } from './charts/SubmissionStatusChart';
import { WorkloadByProjectChart } from './charts/WorkloadByProjectChart';
import { ActivityFeed } from './ActivityFeed';
import { SubmissionStatusTable } from './SubmissionStatusTable';
import { GraphDetailsPanel } from './GraphDetailsPanel';

export function TeamDashboardPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>(() => getWeekRange(new Date()).start);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus[]>([]);
  const [workload, setWorkload] = useState<WorkloadByProject[]>([]);
  const [reports, setReports] = useState<TeamReport[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  // Interactive UI filter states (applied in frontend over reports data)
  const [cardFilter, setCardFilter] = useState<'ALL' | 'SUBMITTED' | 'BLOCKERS'>('ALL');
  const [chartStatusFilter, setChartStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'LATE'>('ALL');
  const [clickedDetail, setClickedDetail] = useState<{
    type: 'week' | 'status' | 'project';
    value: string;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time synchronization states
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(15);

  // Load Projects list once on mount
  useEffect(() => {
    projectApi.list().then(setProjects).catch(() => {});
  }, []);

  // Reset selected member if they are not in the selected project
  useEffect(() => {
    if (selectedProjectId && selectedMemberId) {
      const selectedProj = projects.find(p => p.id === selectedProjectId);
      const isMemberInProj = selectedProj?.members?.some(m => m.id === selectedMemberId);
      if (!isMemberInProj) {
        setSelectedMemberId('');
      }
    }
  }, [selectedProjectId, selectedMemberId, projects]);

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }
    try {
      // Parse week start (Monday) and compute trend range (last 8 weeks)
      const dateParts = selectedWeek.split('-');
      const selectedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      
      const trendEndDate = new Date(selectedDate.getTime());
      trendEndDate.setDate(selectedDate.getDate() + 6); // Sunday of selected week
      
      const trendStartDate = new Date(selectedDate.getTime());
      trendStartDate.setDate(selectedDate.getDate() - 7 * 7); // Monday of 8 weeks ago

      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const tStart = formatDate(trendStartDate);
      const tEnd = formatDate(trendEndDate);

      const [
        summaryData,
        statusData,
        workloadData,
        reportsData,
        trendsData,
        feedData,
      ] = await Promise.all([
        dashboardApi.summary(selectedWeek, selectedProjectId || undefined),
        dashboardApi.submissionStatus(selectedWeek, selectedProjectId || undefined),
        dashboardApi.workloadByProject(selectedWeek, selectedProjectId || undefined),
        dashboardApi.reports({
          week: selectedWeek,
          userId: selectedMemberId || undefined,
          projectId: selectedProjectId || undefined,
        }),
        dashboardApi.trends({
          startDate: tStart,
          endDate: tEnd,
          userId: selectedMemberId || undefined,
          projectId: selectedProjectId || undefined,
        }),
        dashboardApi.activityFeed(10),
      ]);

      setSummary(summaryData);
      setSubmissionStatus(statusData);
      setWorkload(workloadData);
      setReports(reportsData);
      setTrends(trendsData);
      setActivityFeed(feedData);
      setLastSyncedAt(new Date());
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [selectedWeek, selectedMemberId, selectedProjectId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Live Auto-Refresh polling effect
  useEffect(() => {
    if (!isAutoRefresh) return;

    setCountdown(15);
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadDashboardData(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isAutoRefresh, loadDashboardData]);

  // Handle project slice clicks by matching projectName back to selectedProjectId
  const handleChartProjectClick = (projectName: string | null) => {
    if (!projectName) {
      setSelectedProjectId('');
      if (clickedDetail?.type === 'project') {
        setClickedDetail(null);
      }
    } else {
      const matched = projects.find(p => p.name === projectName);
      if (matched) {
        setSelectedProjectId(matched.id);
        setClickedDetail({ type: 'project', value: projectName });
      }
    }
  };

  // Filter reports in the frontend for interactive visual states
  const filteredReports = reports.filter(r => {
    // 1. Card Filter
    if (cardFilter === 'SUBMITTED' && r.status !== 'SUBMITTED' && r.status !== 'APPROVED') {
      return false;
    }
    if (cardFilter === 'BLOCKERS') {
      if (r.status === 'APPROVED') return false; // Approved reports do not have open blockers
      if (!r.blockers) return false;
      const b = r.blockers.toLowerCase().trim();
      if (b === 'none' || b === 'n/a' || b === '' || b === 'no' || b === 'no blockers') {
        return false;
      }
    }

    // 2. Chart Status Filter
    if (chartStatusFilter !== 'ALL') {
      if (r.status !== chartStatusFilter) {
        return false;
      }
    }

    return true;
  });

  const hasInteractiveFilter = cardFilter !== 'ALL' || chartStatusFilter !== 'ALL' || clickedDetail !== null;
  const clearInteractiveFilters = () => {
    setCardFilter('ALL');
    setChartStatusFilter('ALL');
    setClickedDetail(null);
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Team Dashboard</h1>
            <p className="page-subtitle">
              Monitor submissions, track project workloads, and view completed tasks trend.
            </p>
          </div>
        </div>

        <FilterBar
          members={submissionStatus}
          projects={projects}
          selectedMemberId={selectedMemberId}
          selectedProjectId={selectedProjectId}
          selectedWeek={selectedWeek}
          onMemberChange={setSelectedMemberId}
          onProjectChange={setSelectedProjectId}
          onWeekChange={setSelectedWeek}
          onClearAll={() => {
            setSelectedMemberId('');
            setSelectedProjectId('');
            setSelectedWeek(getWeekRange(new Date()).start);
            setClickedDetail(null);
          }}
        />

        <div className="sync-controls">
          {isSyncing && (
            <span className="data-syncing-banner" style={{ marginRight: 'auto' }}>
              <span className="spin-icon">🔄</span> Syncing data...
            </span>
          )}
          
          {lastSyncedAt && (
            <div className="sync-status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAutoRefresh && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600 }}>
                  <span className="live-pulse-dot" />
                  Live (Auto-updates in {countdown}s)
                </span>
              )}
              <span>Last Synced: {lastSyncedAt.toLocaleTimeString()}</span>
            </div>
          )}

          <label className="sync-switch-label">
            <input
              type="checkbox"
              className="sync-switch-input"
              checked={isAutoRefresh}
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
            />
            <span className="sync-switch-slider" />
            <span>Live Sync</span>
          </label>

          <button
            className="btn-refresh"
            onClick={() => loadDashboardData(true)}
            disabled={loading || isSyncing}
            title="Fetch latest updates manually"
          >
            <span className={isSyncing ? "spin-icon" : ""}>🔄</span> Refresh
          </button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <div className={`dashboard-interactive-content ${isSyncing ? 'fade-updating' : ''}`}>
          <SummaryCards 
            summary={summary} 
            loading={loading} 
            activeFilter={cardFilter}
            onCardClick={setCardFilter}
          />

          <div className="charts-grid">
            <TasksTrendChart 
              data={trends} 
              loading={loading} 
              onWeekClick={(weekStart) => {
                setSelectedWeek(weekStart);
                setClickedDetail({ type: 'week', value: weekStart });
              }} 
            />
            <SubmissionStatusChart 
              data={submissionStatus} 
              loading={loading} 
              activeStatusFilter={chartStatusFilter}
              onStatusClick={(status) => {
                setChartStatusFilter(status);
                if (status === 'ALL') {
                  if (clickedDetail?.type === 'status') setClickedDetail(null);
                } else {
                  setClickedDetail({ type: 'status', value: status });
                }
              }}
            />
            <WorkloadByProjectChart 
              data={workload} 
              loading={loading} 
              activeProjectName={projects.find(p => p.id === selectedProjectId)?.name || null}
              onProjectClick={handleChartProjectClick}
            />
          </div>

          {clickedDetail && (
            <GraphDetailsPanel
              detail={clickedDetail}
              onClose={() => setClickedDetail(null)}
              reports={reports}
              projects={projects}
              submissionStatus={submissionStatus}
              trends={trends}
              workload={workload}
            />
          )}

          {hasInteractiveFilter && (
            <div className="interactive-badge-indicator">
              <span>
                Active Filter:{' '}
                {cardFilter === 'BLOCKERS' && '⚠️ Open Blockers'}
                {cardFilter === 'SUBMITTED' && '📄 Submitted Reports'}
                {chartStatusFilter !== 'ALL' && `Status: ${chartStatusFilter}`}
              </span>
              <button 
                className="interactive-badge-clear" 
                onClick={clearInteractiveFilters}
                title="Clear interactive filter"
              >
                ✕ Clear
              </button>
            </div>
          )}

          <ActivityFeed feed={activityFeed} loading={loading} />

          <div className="dashboard-bottom-section">
            <SubmissionStatusTable reports={filteredReports} projects={projects} loading={loading} onRefresh={() => loadDashboardData(true)} />
          </div>
        </div>
      </main>
    </>
  );
}
