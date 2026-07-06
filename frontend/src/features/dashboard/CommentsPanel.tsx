import { useState, useEffect, useRef } from 'react';
import { reportApi } from '../../api/reportApi';
import type { ReportComment } from '../../types/comment';

interface CommentsPanelProps {
  reportId: string;
  memberName: string;
  role: 'MANAGER' | 'MEMBER';
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function CommentsPanel({ reportId, memberName, role, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    reportApi.getComments(reportId)
      .then(data => {
        setComments(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load comments.');
        setLoading(false);
      });
  }, [reportId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  async function handleSend() {
    if (!newComment.trim() || sending) return;
    setSending(true);
    try {
      const added = await reportApi.addComment(reportId, newComment.trim());
      setComments(prev => [...prev, added]);
      setNewComment('');
    } catch {
      setError('Failed to send comment.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />

      {/* Panel */}
      <div
        style={{
          position: 'relative',
          width: '420px',
          maxWidth: '95vw',
          height: '100%',
          background: 'var(--surface-color)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>💬 Comments</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Report by <strong>{memberName}</strong>
            </p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ marginTop: '-4px' }}
          >
            ×
          </button>
        </div>

        {/* Comment thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? (
            <div className="loading-spinner" style={{ margin: 'auto' }}>Loading comments…</div>
          ) : error ? (
            <div style={{ color: '#dc2626', textAlign: 'center', margin: 'auto' }}>{error}</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
              <p>No comments yet.</p>
              {role === 'MANAGER' && <p style={{ fontSize: '0.82rem' }}>Add the first comment below.</p>}
            </div>
          ) : (
            comments.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    👤 {c.authorName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {c.content}
                </p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area — manager only */}
        {role === 'MANAGER' && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
          }}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
              rows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {newComment.length}/1000 · Ctrl+Enter to send
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSend}
                disabled={!newComment.trim() || sending}
              >
                {sending ? 'Sending…' : '📤 Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
