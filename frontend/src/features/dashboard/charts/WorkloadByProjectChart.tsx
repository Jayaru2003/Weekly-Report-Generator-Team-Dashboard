import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WorkloadByProject } from '../../../types/dashboard';

interface WorkloadByProjectChartProps {
  data: WorkloadByProject[];
  loading: boolean;
  activeProjectName?: string | null;
  onProjectClick?: (projectName: string | null) => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function WorkloadByProjectChart({
  data,
  loading,
  activeProjectName = null,
  onProjectClick,
}: WorkloadByProjectChartProps) {
  if (loading) {
    return <div className="chart-loading">Loading workload chart…</div>;
  }

  // Filter out projects with 0 hours, or use reportCount if all totalHours are 0
  const hasHours = data.some(item => item.totalHours > 0);
  const chartData = data.map(item => ({
    name: item.projectName,
    value: hasHours ? item.totalHours : item.reportCount,
    metric: hasHours ? 'hours' : 'reports',
  })).filter(item => item.value > 0);

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        {activeProjectName 
          ? `Workload by Member (${hasHours ? 'Hours' : 'Submissions'}) for ${activeProjectName}`
          : `Workload by Project (${hasHours ? 'Hours' : 'Submissions'}) (Click slices to filter)`}
      </h3>
      <div className="chart-container chart-container-md" style={{ width: '100%', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {chartData.length === 0 ? (
          <div className="empty-chart">
            <span style={{ fontSize: '2rem' }}>📊</span>
            <p className="muted" style={{ marginTop: '0.5rem' }}>No workload data available.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                style={{ cursor: activeProjectName ? 'default' : 'pointer' }}
                onClick={(entry) => {
                  if (!activeProjectName && entry && entry.name) {
                    onProjectClick?.(activeProjectName === entry.name ? null : entry.name);
                  }
                }}
              >
                {chartData.map((entry, index) => {
                  const isActive = activeProjectName === null || activeProjectName === entry.name;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      opacity={isActive ? 1.0 : 0.35}
                      style={{ transition: 'opacity 0.2s' }}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value: any, name: any, props: any) => [
                  `${value} ${props.payload.metric}`,
                  name,
                ]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
