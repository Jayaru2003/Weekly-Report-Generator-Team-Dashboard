import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { SubmissionStatus } from '../../../types/dashboard';

interface SubmissionStatusChartProps {
  data: SubmissionStatus[];
  loading: boolean;
  activeStatusFilter?: 'ALL' | 'SUBMITTED' | 'PENDING' | 'LATE';
  onStatusClick?: (status: 'SUBMITTED' | 'PENDING' | 'LATE' | 'ALL') => void;
}

export function SubmissionStatusChart({
  data,
  loading,
  activeStatusFilter = 'ALL',
  onStatusClick,
}: SubmissionStatusChartProps) {
  if (loading) {
    return <div className="chart-loading">Loading status chart…</div>;
  }

  // Aggregate counts of Submitted, Pending, and Late
  const counts = data.reduce(
    (acc, cur) => {
      if (cur.status === 'SUBMITTED' || cur.status === 'APPROVED' || cur.status === 'REJECTED') acc.submitted++;
      else if (cur.status === 'LATE') acc.late++;
      else acc.pending++;
      return acc;
    },
    { submitted: 0, pending: 0, late: 0 }
  );

  const chartData = [
    { name: 'Submitted', count: counts.submitted, color: '#10b981', statusVal: 'SUBMITTED' },
    { name: 'Pending', count: counts.pending, color: '#f59e0b', statusVal: 'PENDING' },
    { name: 'Late', count: counts.late, color: '#ef4444', statusVal: 'LATE' },
  ];

  return (
    <div className="chart-card">
      <h3 className="chart-title">Submission Status Distribution (Click bars to filter)</h3>
      <div className="chart-container chart-container-md" style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }}
            />
            <Bar 
              dataKey="count" 
              name="Members" 
              radius={[6, 6, 0, 0]}
              style={{ cursor: 'pointer' }}
              onClick={(entry) => {
                const statusVal = entry?.statusVal || entry?.payload?.statusVal;
                if (statusVal) {
                  const clickedStatus = statusVal as 'SUBMITTED' | 'PENDING' | 'LATE';
                  onStatusClick?.(activeStatusFilter === clickedStatus ? 'ALL' : clickedStatus);
                }
              }}
            >
              {chartData.map((entry, index) => {
                const isActive = activeStatusFilter === 'ALL' || activeStatusFilter === entry.statusVal;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    opacity={isActive ? 1.0 : 0.35}
                    style={{ transition: 'opacity 0.2s' }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
