import React, { useEffect, useState, useMemo } from 'react';
import { getTickets } from '../utils/api';
import { PRIORITY_SORT_MAPPING } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_CHIP_COLORS = {
  OPEN: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  RESOLVED: { bg: '#dcfce7', color: '#14532d', border: '#bbf7d0' },
  CLOSED: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};

export default function TicketList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [ascending, setAscending] = useState(false);

  useEffect(() => {
    getTickets()
      .then(d => { setTickets(d); setError(''); })
      .catch(() => setError('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    all: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
  }), [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(t => {
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch = !q ||
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.createdBy && t.createdBy.toLowerCase().includes(q)) ||
          String(t.id).includes(q);
        return matchesStatus && matchesPriority && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'createdAt') {
          return ascending
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'priority') {
          return ascending
            ? PRIORITY_SORT_MAPPING[a.priority] - PRIORITY_SORT_MAPPING[b.priority]
            : PRIORITY_SORT_MAPPING[b.priority] - PRIORITY_SORT_MAPPING[a.priority];
        }
        return 0;
      });
  }, [tickets, statusFilter, priorityFilter, searchTerm, sortBy, ascending]);

  const stripCards = [
    { label: 'All Tickets', count: counts.all, cls: 'c-all', val: 'ALL' },
    { label: 'Open', count: counts.open, cls: 'c-open', val: 'OPEN' },
    { label: 'In Progress', count: counts.inProgress, cls: 'c-prog', val: 'IN_PROGRESS' },
    { label: 'Resolved', count: counts.resolved, cls: 'c-res', val: 'RESOLVED' },
  ];

  return (
    <div className="tickets-page">
      {/* Header */}
      <div className="tickets-header">
        <div>
          <h2>Public Support Tickets</h2>
          <p style={{ fontSize: 13.5, color: 'var(--slate-500)', marginTop: 4 }}>
            {user ? `Welcome back, ${user.name}` : 'Browse all community and public support requests'}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/tickets/new')}
          data-testid="create-ticket-nav"
        >
          + Submit New Ticket
        </button>
      </div>

      {/* Metric Cards */}
      <div className="stats-strip">
        {stripCards.map(s => (
          <div
            key={s.val}
            className={`stat-strip-card ${s.cls} ${statusFilter === s.val ? 'active' : ''}`}
            onClick={() => setStatusFilter(s.val)}
          >
            <div className="strip-count">{s.count}</div>
            <div className="strip-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 260 }}>
          <span className="search-wrap-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search tickets by keyword, author, or #ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>

        <select
          className="filter-select"
          id="sort-by"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          data-testid="sort-by-select"
        >
          <option value="createdAt">Sort: Created Date</option>
          <option value="priority">Sort: Priority</option>
        </select>

        <button className="btn-sort" onClick={() => setAscending(a => !a)} data-testid="sort-direction">
          {ascending ? '↑ Asc' : '↓ Desc'}
        </button>

        {searchTerm && (
          <button className="btn-secondary" onClick={() => setSearchTerm('')}>
            Clear
          </button>
        )}
      </div>

      {/* Loading & Errors */}
      {loading && <div className="loading-text">Loading support tickets...</div>}
      {error && (
        <div className="table-empty">
          <div className="table-empty-icon">⚠️</div>
          <h3>{error}</h3>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="table-container">
          {filteredTickets.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon">📭</div>
              <h3>No tickets match your filters</h3>
              <p>Try searching for a different keyword or resetting your status filter.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Subject & Details</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Responses</th>
                  <th>Date Logged</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(t => {
                  const sc = STATUS_CHIP_COLORS[t.status] || STATUS_CHIP_COLORS.CLOSED;
                  return (
                    <tr
                      key={t.id}
                      data-testid={`ticket-row-${t.id}`}
                      onClick={() => navigate(`/tickets/${t.id}`)}
                    >
                      <td style={{ fontWeight: 800, color: 'var(--slate-700)' }}>
                        #{t.id}
                      </td>
                      <td className="cell-subject">
                        <strong>{t.subject}</strong>
                      </td>
                      <td>
                        <span className={`pill ${t.priority}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                          data-testid={`ticket-status-${t.id}`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--slate-600)' }}>
                        👤 {t.createdBy}
                      </td>
                      <td>
                        <span className="responses-count">
                          💬 {t.responses?.length || 0}
                        </span>
                      </td>
                      <td className="cell-date">
                        {formatDate(t.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-row-action view"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/tickets/${t.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
