import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TrendData } from '../../../types/dashboard';

interface TasksTrendChartProps {
  data: TrendData[];
  loading: boolean;
  onWeekClick?: (weekStart: string) => void;
}

export function TasksTrendChart({ data, loading, onWeekClick }: TasksTrendChartProps) {
  if (loading) {
    return <div className="chart-loading">Loading trend chart…</div>;
  }

  // Format weekStartDate label to a shorter format, e.g. MM/DD
  const formattedData = data.map(item => {
    const date = new Date(item.weekStartDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return {
      ...item,
      label: `${month}/${day}`,
    };
  });

  return (
    <div className="chart-card chart-card-wide">
      <h3 className="chart-title">Tasks Completed Trend (Click points to switch week)</h3>
      <div className="chart-container chart-container-lg" style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }}
              labelStyle={{ fontWeight: 600, color: '#94a3b8' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="tasksCompletedCount"
              name="Completed Tasks"
              stroke="#2563eb"
              strokeWidth={3}
              activeDot={{
                r: 8,
                style: { cursor: 'pointer' },
                onClick: (_, payload: any) => {
                  if (payload && payload.payload) {
                    onWeekClick?.(payload.payload.weekStartDate);
                  }
                }
              }}
              dot={{
                stroke: '#2563eb',
                strokeWidth: 2,
                r: 4,
                fill: '#fff',
                style: { cursor: 'pointer' }
              }}
              style={{ cursor: 'pointer' }}
              onClick={(state: any) => {
                if (state && state.payload) {
                  onWeekClick?.(state.payload.weekStartDate);
                }
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
