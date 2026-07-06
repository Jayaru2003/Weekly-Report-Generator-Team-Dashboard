import { useState, useEffect } from 'react';
import { projectApi } from '../../api/projectApi';
import type { Project, ProjectRequest } from '../../types/project';
import { Navbar } from '../../components/layout/Navbar';

interface ProjectModalProps {
  initial?: Project | null;
  onClose: () => void;
  onSave: (data: ProjectRequest) => Promise<void>;
}

function ProjectModal({ initial, onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), description: description.trim() || undefined });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to save project';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Project' : 'New Project'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="proj-name">Name *</label>
            <input
              id="proj-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Project name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="proj-desc">Description</label>
            <textarea
              id="proj-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await projectApi.list();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(data: ProjectRequest) {
    if (editing) {
      await projectApi.update(editing.id, data);
    } else {
      await projectApi.create(data);
    }
    await load();
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    try {
      await projectApi.remove(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeleteId(null);
    }
  }

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(p: Project) { setEditing(p); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage active projects for your team</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Project
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📁</span>
            <p>No active projects yet. Create your first one!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td className="td-name">{p.name}</td>
                    <td className="td-desc">{p.description ?? <span className="muted">—</span>}</td>
                    <td className="td-date">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="td-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleteId === p.id}
                      >
                        {deleteId === p.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalOpen && (
        <ProjectModal
          initial={editing}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </>
  );
}
