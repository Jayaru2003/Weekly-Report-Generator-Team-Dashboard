import { useState, useEffect } from 'react';
import { projectApi } from '../../api/projectApi';
import { userApi } from '../../api/userApi';
import type { Project, ProjectRequest, ProjectMember } from '../../types/project';
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

interface AssignMembersModalProps {
  project: Project;
  allMembers: ProjectMember[];
  onClose: () => void;
  onSave: (userIds: string[]) => Promise<void>;
}

function AssignMembersModal({ project, allMembers, onClose, onSave }: AssignMembersModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => project.members?.map(m => m.id) ?? []
  );
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = allMembers.filter(m => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
  });

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSave(selectedIds);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to update project members');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 }}>Assign Members</h2>
            <p className="page-subtitle" style={{ margin: '4px 0 0' }}>{project.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members by name or email..."
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                fontSize: '0.92rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--input-color)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            maxHeight: '240px',
            overflowY: 'auto',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                No members found.
              </div>
            ) : (
              filtered.map(m => {
                const checked = selectedIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: checked ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      transition: 'background-color 0.15s'
                    }}
                    className="member-item-label"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(m.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {m.firstName} {m.lastName}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {m.email}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMembers, setAllMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [assigningProject, setAssigningProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [projData, memData] = await Promise.all([
        projectApi.list(),
        userApi.list('MEMBER')
      ]);
      setProjects(projData);
      setAllMembers(memData);
    } catch (err) {
      console.error(err);
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

  async function handleSaveMembers(userIds: string[]) {
    if (!assigningProject) return;
    await projectApi.updateMembers(assigningProject.id, userIds);
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
            <p className="page-subtitle">Manage active projects and assign team members</p>
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
                  <th>Assigned Members</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td className="td-name">{p.name}</td>
                    <td className="td-desc">{p.description ?? <span className="muted">—</span>}</td>
                    <td>
                      <div className="avatar-group">
                        {p.members && p.members.length > 0 ? (
                          p.members.slice(0, 3).map((m, idx) => {
                            const initials = `${m.firstName[0] ?? ''}${m.lastName[0] ?? ''}`.toUpperCase();
                            return (
                              <div
                                key={m.id}
                                className="avatar-circle"
                                title={`${m.firstName} ${m.lastName} (${m.email})`}
                                style={{ zIndex: 3 - idx }}
                              >
                                {initials}
                              </div>
                            );
                          })
                        ) : (
                          <span className="muted" style={{ fontSize: '0.85rem' }}>No members</span>
                        )}
                        {p.members && p.members.length > 3 && (
                          <div
                            className="avatar-circle avatar-more"
                            title={p.members.slice(3).map(m => `${m.firstName} ${m.lastName}`).join(', ')}
                            style={{ zIndex: 0 }}
                          >
                            +{p.members.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="td-date">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="td-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setAssigningProject(p)}
                      >
                        👥 Assign
                      </button>
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

      {assigningProject && (
        <AssignMembersModal
          project={assigningProject}
          allMembers={allMembers}
          onClose={() => setAssigningProject(null)}
          onSave={handleSaveMembers}
        />
      )}
    </>
  );
}
