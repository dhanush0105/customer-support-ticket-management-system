import React, { useEffect, useState } from 'react';
import { getTickets } from '../utils/api';
import { STATUS_COLORS, PRIORITY_SORT_MAPPING } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
// import './TicketList.css'; // Not needed, styles are in App.css

function formatDate(dateStr) {
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
}

const sortTickets = (tickets, sortBy, ascending) => {
  if (sortBy === 'createdAt') {
    return [...tickets].sort((a,b) =>
      ascending
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortBy === 'priority') {
    return [...tickets].sort((a,b) =>
      ascending
        ? PRIORITY_SORT_MAPPING[a.priority] - PRIORITY_SORT_MAPPING[b.priority]
        : PRIORITY_SORT_MAPPING[b.priority] - PRIORITY_SORT_MAPPING[a.priority]
    );
  }
  return tickets;
};

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [ascending, setAscending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getTickets()
      .then(data => {
        setTickets(data);
        setError('');
      })
      .catch(err => {
        setError(typeof err === 'string' ? err : 'Failed to load tickets');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSort = sortField => {
    if (sortBy === sortField) {
      setAscending(a => !a);
    } else {
      setSortBy(sortField);
      setAscending(sortField === 'priority'); // priority: low-to-high default, date: newest first default
    }
  };

  const sortedTickets = sortTickets(tickets, sortBy, ascending);

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header-bar">
        <h2>Support Tickets</h2>
        <button
          className="btn-primary"
          onClick={() => navigate('/tickets/new')}
          style={{ marginLeft: 'auto' }}
          data-testid="create-ticket-nav"
        >Create New Ticket</button>
      </div>
      <div className="ticket-sort-controls">
        <label htmlFor="sort-by">Sort By: </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={e => handleSort(e.target.value)}
          data-testid="sort-by-select"
        >
          <option value="createdAt">Created Date</option>
          <option value="priority">Priority</option>
        </select>
        <button onClick={() => setAscending(a => !a)} data-testid="sort-direction">
          {ascending ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>
      {loading && <div className="empty-state">Loading tickets...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && sortedTickets.length === 0 && (
        <div className="empty-state">No tickets found.</div>
      )}
      {!loading && !error && sortedTickets.length > 0 && (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created By</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.map(ticket => (
              <tr
                className="ticket-list-row"
                key={ticket.id}
                data-testid={`ticket-row-${ticket.id}`}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>{ticket.id}</td>
                <td style={{overflowWrap: 'break-word', maxWidth: '14rem'}}>{ticket.subject}</td>
                <td>
                  <span
                    className="ticket-status-chip"
                    style={{background: STATUS_COLORS[ticket.status] || '#eee'}}
                    data-testid={`ticket-status-${ticket.id}`}
                  >{ticket.status}</span>
                </td>
                <td>{ticket.priority}</td>
                <td>{ticket.createdBy}</td>
                <td>{formatDate(ticket.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TicketList;
