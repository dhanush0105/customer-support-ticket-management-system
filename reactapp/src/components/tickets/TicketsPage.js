import React, { useMemo } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { Plus, Search, Filter, RefreshCw, Trash2, ArrowUpRight } from 'lucide-react';
import { PRIORITIES, STATUSES } from '../../services/mockData';

export default function TicketsPage() {
  const {
    tickets,
    loading,
    error,
    loadTickets,
    ticketFilters,
    setTicketFilters,
    navigateToTicket,
    setIsCreateTicketOpen,
    deleteTicket,
    addToast
  } = useSupportFlow();

  const handleFilterChange = (field, value) => {
    setTicketFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setTicketFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
      assignee: 'ALL'
    });
    addToast('Filters reset.');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete ticket #${id}?`)) return;
    await deleteTicket(id);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const q = ticketFilters.search.toLowerCase();
      const matchSearch =
        !q ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        String(t.id).includes(q) ||
        (t.createdBy && t.createdBy.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));

      const matchStatus =
        ticketFilters.status === 'ALL' || t.status === ticketFilters.status;

      const matchPriority =
        ticketFilters.priority === 'ALL' || t.priority === ticketFilters.priority;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, ticketFilters]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Tickets</h1>
          <p className="sf-page-subtitle">Track, prioritize and resolve customer requests from the database.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="sf-btn sf-btn-ghost sf-btn-sm" onClick={loadTickets} title="Reload tickets">
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            className="sf-btn sf-btn-primary"
            onClick={() => setIsCreateTicketOpen(true)}
          >
            <Plus size={15} />
            New Ticket
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 14, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: 'var(--sf-danger)', marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="sf-filter-bar">
        <div className="sf-search-box">
          <Search className="sf-search-box-icon" />
          <input
            className="sf-search-box-input"
            placeholder="Search tickets by subject, #ID, or creator..."
            value={ticketFilters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="sf-select"
          value={ticketFilters.status}
          onChange={e => handleFilterChange('status', e.target.value)}
        >
          <option value="ALL">Status: All</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          className="sf-select"
          value={ticketFilters.priority}
          onChange={e => handleFilterChange('priority', e.target.value)}
        >
          <option value="ALL">Priority: All</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Reset */}
        {(ticketFilters.search ||
          ticketFilters.status !== 'ALL' ||
          ticketFilters.priority !== 'ALL') && (
          <button className="sf-btn sf-btn-ghost sf-btn-sm" onClick={handleResetFilters}>
            <RefreshCw size={12} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Ticket Table */}
      <div className="sf-table-wrapper">
        <table className="sf-table">
          <thead>
            <tr>
              <th style={{ width: 85 }}>ID</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Responses</th>
              <th>Created At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--sf-text-muted)' }}>
                  Loading tickets from database...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--sf-text-muted)' }}>
                  <Filter size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>No tickets found</div>
                  <p style={{ fontSize: 12.5, marginTop: 4 }}>
                    {tickets.length === 0
                      ? 'The database is currently empty. Click "New Ticket" to create one.'
                      : 'No tickets match your active filter criteria.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => navigateToTicket(ticket.id)}>
                  <td className="sf-ticket-id">#{ticket.id}</td>
                  <td className="sf-ticket-subject-cell">
                    <div className="sf-ticket-subject-title">{ticket.subject}</div>
                  </td>
                  <td>
                    <span className={`sf-badge sf-priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`sf-badge sf-badge-${ticket.status.toLowerCase().replace('_', '-')}`}>
                      <span className="sf-badge-dot" />
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--sf-text-secondary)' }}>{ticket.createdBy}</td>
                  <td>
                    <span className="sf-badge" style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}>
                      💬 {ticket.responses ? ticket.responses.length : 0}
                    </span>
                  </td>
                  <td style={{ color: 'var(--sf-text-muted)', fontSize: 12.5 }}>
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        className="sf-btn sf-btn-ghost sf-btn-sm"
                        onClick={() => navigateToTicket(ticket.id)}
                        title="View Details"
                      >
                        <ArrowUpRight size={13} />
                      </button>
                      <button
                        className="sf-btn sf-btn-ghost sf-btn-sm"
                        onClick={e => handleDelete(ticket.id, e)}
                        title="Delete ticket"
                        style={{ color: 'var(--sf-danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--sf-text-muted)' }}>
        <span>Showing {filteredTickets.length} of {tickets.length} tickets in database</span>
        <span>Click any row to open the incident workspace and response thread</span>
      </div>
    </div>
  );
}
