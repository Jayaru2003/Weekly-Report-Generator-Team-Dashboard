import React from 'react';
import type { Project } from '../../types/project';
import type { SubmissionStatus } from '../../types/dashboard';
import { getWeekRange } from '../../utils/dateUtils';

interface FilterBarProps {
  members: SubmissionStatus[];
  projects: Project[];
  selectedMemberId: string;
  selectedProjectId: string;
  selectedWeek: string;
  onMemberChange: (id: string) => void;
  onProjectChange: (id: string) => void;
  onWeekChange: (weekStart: string) => void;
  onClearAll?: () => void;
}

function formatWeekLabel(weekStart: string): string {
  const parts = weekStart.split('-');
  const start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const end = new Date(start.getTime());
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function shiftWeek(weekStart: string, deltaWeeks: number): string {
  const parts = weekStart.split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  date.setDate(date.getDate() + deltaWeeks * 7);
  return getWeekRange(date).start;
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

export function FilterBar({
  members,
  projects,
  selectedMemberId,
  selectedProjectId,
  selectedWeek,
  onMemberChange,
  onProjectChange,
  onWeekChange,
  onClearAll,
}: FilterBarProps) {
  const startParts = selectedWeek.split('-');
  const startDateObj = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
  const endDateObj = new Date(startDateObj.getTime());
  endDateObj.setDate(startDateObj.getDate() + 6);

  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startDateStr = selectedWeek;
  const endDateStr = formatDateForInput(endDateObj);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const dateParts = val.split('-');
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      onWeekChange(getWeekRange(date).start);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const dateParts = val.split('-');
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      onWeekChange(getWeekRange(date).start);
    }
  };

  const thisWeekStart = getWeekRange(new Date()).start;
  const isThisWeek = selectedWeek === thisWeekStart;
  const hasActiveFilters = Boolean(selectedMemberId || selectedProjectId || !isThisWeek);

  const selectedMemberName = members.find(m => m.userId === selectedMemberId)?.userName;
  const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name;

  return (
    <div className="filter-bar">
      <div className="filter-bar-header">
        <div className="filter-bar-title">
          <span className="filter-bar-icon">🔍</span>
          <div>
            <h2 className="filter-bar-heading">Dashboard Filters</h2>
            <p className="filter-bar-subheading">Refine team data instantly</p>
          </div>
        </div>
        {hasActiveFilters && onClearAll && (
          <button type="button" className="filter-clear-all-btn" onClick={onClearAll}>
            ✕ Clear all filters
          </button>
        )}
      </div>

      <div className="filter-bar-controls">
        <div className="filter-group">
          <label htmlFor="memberSelect">
            <span className="filter-label-icon">👤</span> Team Member
          </label>
          <select
            id="memberSelect"
            className="filter-select"
            value={selectedMemberId}
            onChange={(e) => onMemberChange(e.target.value)}
          >
            <option value="">👤 All Members</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>
                {m.userName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="projectSelect">
            <span className="filter-label-icon">📁</span> Project
          </label>
          <select
            id="projectSelect"
            className="filter-select"
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
          >
            <option value="">📁 All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-group-week">
          <label>
            <span className="filter-label-icon">📅</span> Week Range
          </label>
          <div className="date-range-container">
            <div className="date-input-wrapper">
              <span className="date-input-label">Start Date</span>
              <input
                type="date"
                className="filter-date-input"
                value={startDateStr}
                onChange={handleStartDateChange}
              />
            </div>
            <span className="date-range-to">to</span>
            <div className="date-input-wrapper">
              <span className="date-input-label">End Date</span>
              <input
                type="date"
                className="filter-date-input"
                value={endDateStr}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
          <div className="week-quick-pills">
            <button
              type="button"
              className={`week-pill ${isThisWeek ? 'active' : ''}`}
              onClick={() => onWeekChange(thisWeekStart)}
            >
              This Week
            </button>
            <button
              type="button"
              className={`week-pill ${selectedWeek === shiftWeek(thisWeekStart, -1) ? 'active' : ''}`}
              onClick={() => onWeekChange(shiftWeek(thisWeekStart, -1))}
            >
              Last Week
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-active-chips">
          <span className="filter-chips-label">Active filters:</span>
          {!isThisWeek && (
            <span className="filter-chip">
              📅 {formatWeekLabel(selectedWeek)}
              <button type="button" onClick={() => onWeekChange(thisWeekStart)} aria-label="Clear week filter">×</button>
            </span>
          )}
          {selectedMemberName && (
            <span className="filter-chip">
              👤 {selectedMemberName}
              <button type="button" onClick={() => onMemberChange('')} aria-label="Clear member filter">×</button>
            </span>
          )}
          {selectedProjectName && (
            <span className="filter-chip">
              📁 {selectedProjectName}
              <button type="button" onClick={() => onProjectChange('')} aria-label="Clear project filter">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
