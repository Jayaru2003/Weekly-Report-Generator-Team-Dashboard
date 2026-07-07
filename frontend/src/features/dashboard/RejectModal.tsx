import { useState } from 'react';

interface RejectModalProps {
  memberName: string;
  onConfirm: (comment: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export function RejectModal({ memberName, onConfirm, onClose, loading }: RejectModalProps) {
  const [comment, setComment] = useState('');
  const maxLength = 1000;

  function handleConfirm() {
    if (comment.trim()) {
      onConfirm(comment.trim());
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '520px', width: '90%' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ color: '#dc2626' }}>❌ Reject Report</h2>
            <p className="page-subtitle">
              Rejecting report from <strong>{memberName}</strong>
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-scrollable" style={{ padding: '1.25rem 1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Reason for rejection <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            id="reject-comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Explain why this report is being rejected so the team member can revise it..."
            maxLength={maxLength}
            rows={5}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--surface-color)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {comment.length} / {maxLength}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn"
            style={{
              background: comment.trim() ? '#dc2626' : '#fca5a5',
              color: 'white',
              cursor: comment.trim() ? 'pointer' : 'not-allowed',
            }}
            onClick={handleConfirm}
            disabled={!comment.trim() || loading}
          >
            {loading ? 'Rejecting...' : '❌ Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}
