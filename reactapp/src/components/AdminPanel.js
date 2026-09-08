import React, { useEffect, useState, useMemo } from 'react';
import { getTickets, deleteTicket, updateTicketStatus } from '../utils/api';
import { PRIORITY_SORT_MAPPING } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).replace(',', '');
}

const STATUS_CHIP_COLORS = {
  OPEN: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  RESOLVED: { bg: '#dcfce7', color: '#14532d', border: '#bbf7d0' },
  CLOSED: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [ascending, setAscending] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  const showToast = (msg, type = 'success-toast') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchTickets = () => {
    setLoading(true);
    getTickets()
      .then(data => {
        setTickets(data);
        setError('');
      })
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete ticket #${id}?`)) return;
    try {
      await deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast(`Ticket #${id} permanently deleted.`, 'success-toast');
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error-toast');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} selected ticket(s)?`)) return;
    const ids = Array.from(selectedIds);
    let count = 0;
    for (const id of ids) {
      try {
        await deleteTicket(id);
        count++;
      } catch (err) {
        console.error(err);
      }
    }
    setTickets(prev => prev.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    showToast(`Deleted ${count} ticket(s) in bulk.`, 'success-toast');
  };

  const handleBulkStatus = async (newStatus) => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        await updateTicketStatus(id, newStatus);
      } catch (err) {
        console.error(err);
      }
    }
    setTickets(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, status: newStatus } : t));
    setSelectedIds(new Set());
    showToast(`Updated ${ids.length} ticket(s) to ${newStatus}.`, 'success-toast');
  };

  const handleStatusChange = async (id, newStatus, e) => {
    e.stopPropagation();
    try {
      await updateTicketStatus(id, newStatus);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      showToast(`Ticket #${id} updated to ${newStatus}`, 'success-toast');
    } catch (err) {
      showToast(`Status update failed: ${err.message}`, 'error-toast');
    }
  };

  const toggleSelectAll = (filteredList) => {
    if (selectedIds.size === filteredList.length && filteredList.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(t => t.id)));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCSV = () => {
    if (tickets.length === 0) return;
    const headers = ['ID', 'Subject', 'Status', 'Priority', 'CreatedBy', 'CreatedAt', 'ResponsesCount'];
    const rows = tickets.map(t => [
      t.id,
      `"${(t.subject || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      `"${(t.createdBy || '').replace(/"/g, '""')}"`,
      t.createdAt,
      t.responses ? t.responses.length : 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `tickets_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV audit file successfully.', 'success-toast');
  };

  // KPIs
  const kpis = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    urgent: tickets.filter(t => t.priority === 'HIGH' && t.status !== 'CLOSED').length,
  }), [tickets]);

  // Filtered & Sorted Tickets
  const processedTickets = useMemo(() => {
    return tickets
      .filter(t => {
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term ||
          (t.subject && t.subject.toLowerCase().includes(term)) ||
          (t.createdBy && t.createdBy.toLowerCase().includes(term)) ||
          String(t.id).includes(term);
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

  const kpiCards = [
    { key: 'total', label: 'Total Tickets', sub: 'All logged incidents', icon: '📊', cls: 'c-total', filter: () => { setStatusFilter('ALL'); setPriorityFilter('ALL'); } },
    { key: 'open', label: 'Pending Open', sub: 'Awaiting initial response', icon: '🚨', cls: 'c-open', filter: () => setStatusFilter('OPEN') },
    { key: 'inProgress', label: 'In Progress', sub: 'Active staff engagement', icon: '⚙️', cls: 'c-prog', filter: () => setStatusFilter('IN_PROGRESS') },
    { key: 'resolved', label: 'Resolved', sub: 'Serviced successfully', icon: '✅', cls: 'c-res', filter: () => setStatusFilter('RESOLVED') },
    { key: 'urgent', label: 'High Priority', sub: 'Immediate SLA attention', icon: '🔥', cls: 'c-urgent', filter: () => setPriorityFilter('HIGH') },
  ];

  return (
    <div className="admin-page">
      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Hero Banner */}
      <div className="admin-hero">
        <div className="admin-hero-text">
          <h1>🛡️ Executive Admin Command Center</h1>
          <p>Supervise support tickets, track SLA KPIs, execute bulk operations, and audit records. Authenticated as <strong>{user?.name || 'Administrator'}</strong>.</p>
        </div>
        <div className="hero-actions">
          <button className="btn-hero-ghost" onClick={exportCSV}>📥 Export CSV</button>
          <button className="btn-hero-solid" onClick={() => navigate('/tickets/new')}>+ Create Ticket</button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="kpi-row">
        {kpiCards.map(k => (
          <div key={k.key} className={`kpi-card ${k.cls}`} onClick={k.filter}>
            <div className="kpi-icon-row">
              <span className="kpi-label">{k.label}</span>
              <span className="kpi-icon-box">{k.icon}</span>
            </div>
            <div className="kpi-number">{kpis[k.key]}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-label">⚡ {selectedIds.size} ticket{selectedIds.size > 1 ? 's' : ''} selected</span>
          <div className="bulk-actions">
            <button className="btn-bulk do-status" onClick={() => handleBulkStatus('IN_PROGRESS')}>Mark In Progress</button>
            <button className="btn-bulk do-resolve" onClick={() => handleBulkStatus('RESOLVED')}>Mark Resolved</button>
            <button className="btn-bulk do-purge" onClick={handleBulkDelete}>🗑 Delete Selected</button>
          </div>
        </div>
      )}

      {/* Modern Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="search-wrap">
          <span className="search-wrap-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by subject, creator, or ticket #ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-sep" />

        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">Status: All</option>
          <option value="OPEN">Status: OPEN</option>
          <option value="IN_PROGRESS">Status: IN_PROGRESS</option>
          <option value="RESOLVED">Status: RESOLVED</option>
          <option value="CLOSED">Status: CLOSED</option>
        </select>

        <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="ALL">Priority: All</option>
          <option value="HIGH">Priority: HIGH</option>
          <option value="MEDIUM">Priority: MEDIUM</option>
          <option value="LOW">Priority: LOW</option>
        </select>

        <div className="toolbar-sep" />

        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Sort: Created Date</option>
          <option value="priority">Sort: Priority</option>
        </select>

        <button className="btn-sort" onClick={() => setAscending(a => !a)}>
          {ascending ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      {/* Table Card */}
      <div className="table-container">
        {loading && <div className="loading-text">Loading tickets...</div>}
        {error && (
          <div className="table-empty">
            <div className="table-empty-icon">⚠️</div>
            <h3>{error}</h3>
          </div>
        )}
        {!loading && !error && processedTickets.length === 0 && (
          <div className="table-empty">
            <div className="table-empty-icon">📂</div>
            <h3>No tickets match your filter criteria</h3>
            <p>Try modifying your search keywords or resetting filters.</p>
          </div>
        )}

        {!loading && !error && processedTickets.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === processedTickets.length && processedTickets.length > 0}
                    onChange={() => toggleSelectAll(processedTickets)}
                  />
                </th>
                <th>Ticket ID</th>
                <th>Subject & Requester</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Responses</th>
                <th>Date Logged</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedTickets.map(ticket => {
                const isSelected = selectedIds.has(ticket.id);
                const sc = STATUS_CHIP_COLORS[ticket.status] || STATUS_CHIP_COLORS.CLOSED;
                return (
                  <tr
                    key={ticket.id}
                    className={isSelected ? 'row-selected' : ''}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => toggleSelectOne(ticket.id, e)}
                      />
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--slate-700)' }}>
                      #{ticket.id}
                    </td>
                    <td className="cell-subject">
                      <strong>{ticket.subject}</strong>
                      <span>by {ticket.createdBy}</span>
                    </td>
                    <td>
                      <span className={`pill ${ticket.priority}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="status-select"
                        value={ticket.status}
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                        onChange={e => handleStatusChange(ticket.id, e.target.value, e)}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td>
                      <span className="responses-count">
                        💬 {ticket.responses ? ticket.responses.length : 0}
                      </span>
                    </td>
                    <td className="cell-date">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-row-action view"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          View
                        </button>
                        <button
                          className="btn-row-action del"
                          onClick={e => handleDelete(ticket.id, e)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
