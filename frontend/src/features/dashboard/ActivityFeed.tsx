import type { ActivityItem } from '../../types/dashboard';
import { formatRelativeTime } from '../../utils/dateUtils';

interface ActivityFeedProps {
  feed: ActivityItem[];
  loading: boolean;
}

const getAvatarGradient = (name: string) => {
  const gradients = [
    'linear-gradient(135deg, #6366f1, #4f46e5)', // Indigo
    'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
    'linear-gradient(135deg, #10b981, #059669)', // Emerald
    'linear-gradient(135deg, #f59e0b, #d97706)', // Amber
    'linear-gradient(135deg, #ec4899, #db2777)', // Pink
    'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Purple
    'linear-gradient(135deg, #14b8a6, #0f766e)', // Teal
    'linear-gradient(135deg, #f97316, #ea580c)', // Orange
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
};

const getInitials = (name: string) => {
  if (!name) return 'M';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function ActivityFeed({ feed, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="activity-feed-horizontal">
        <div className="activity-feed-header">
          <h3 className="section-title" style={{ margin: 0 }}>Recent Activity</h3>
        </div>
        <div className="activity-feed-loading">Loading activity feed…</div>
      </div>
    );
  }

  return (
    <div className="activity-feed-horizontal">
      <div className="activity-feed-header">
        <h3 className="section-title" style={{ margin: 0 }}>Recent Activity</h3>
        {feed.length > 0 && (
          <span className="activity-feed-count">{feed.length} updates</span>
        )}
      </div>
      {feed.length === 0 ? (
        <div className="empty-feed">
          <span className="empty-feed-icon">📣</span>
          <p className="muted">No recent activity to show.</p>
        </div>
      ) : (
        <div className="activity-feed-scroll">
          {feed.map((item, idx) => (
            <div key={idx} className="activity-feed-card-item">
              <div 
                className="feed-avatar"
                style={{ background: getAvatarGradient(item.userName || '') }}
              >
                {getInitials(item.userName || '')}
              </div>
              <div className="feed-details">
                <p className="feed-message">
                  <strong>{item.userName}</strong>
                </p>
                <p className="feed-submessage">
                  submitted for{' '}
                  <span className="feed-project-tag">{item.projectName}</span>
                </p>
                <span className="feed-time" title={new Date(item.submittedAt).toLocaleString()}>
                  {formatRelativeTime(item.submittedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
