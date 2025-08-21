import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, getResponsesForTicket, addResponse, updateTicketStatus } from '../utils/api';
import { TICKET_STATUSES, STATUS_COLORS } from '../utils/constants';
// import './TicketDetail.css'; <-- not required, styles are in App.css

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

const TicketDetail = () => {
  const { id } = useParams();
  const ticketId = id;
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respLoading, setRespLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [respError, setRespError] = useState('');
  const [form, setForm] = useState({ message: '', respondedBy: '' });
  const [formErr, setFormErr] = useState('');

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    getTicketById(ticketId)
      .then((data) => {
        setTicket(data);
        setError('');
      })
      .catch((e) => setError(typeof e === 'string' ? e : 'Failed to load ticket'))
      .finally(() => setLoading(false));
  }, [ticketId]);
  // Fetch responses
  useEffect(() => {
    if (!ticketId) return;
    getResponsesForTicket(ticketId)
      .then(data => {
        setResponses(data.sort((a, b) => new Date(b.respondedAt) - new Date(a.respondedAt)));
        setRespError('');
      })
      .catch(err => setRespError(typeof err === 'string' ? err : 'Failed to load responses'));
  }, [ticketId, ticket && ticket.updatedAt]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusLoading(true);
    setRespError('');
    try {
      const updated = await updateTicketStatus(ticketId, newStatus);
      setTicket(updated);
    } catch (e) {
      setRespError(typeof e === 'string' ? e : 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.message.trim() || !form.respondedBy.trim()) {
      setFormErr('Both fields required.');
      return false;
    }
    if (form.message.length > 500) {
      setFormErr('Message must not exceed 500 characters.');
      return false;
    }
    if (form.respondedBy.length < 2 || form.respondedBy.length > 50) {
      setFormErr('Responded By must be 2-50 characters.');
      return false;
    }
    setFormErr('');
    return true;
  };

  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setRespLoading(true);
    try {
      await addResponse(ticketId, form);
      // Responses reloaded via useEffect on updatedAt update
      setForm({ message: '', respondedBy: '' });
      setFormErr('');
      setRespError('');
      // Force ticket refresh (in case status changed)
      const updated = await getTicketById(ticketId);
      setTicket(updated);
    } catch (e) {
      setRespError(typeof e === 'string' ? e : 'Failed to add response');
    } finally {
      setRespLoading(false);
    }
  };

  return (
    <div className="ticket-detail-container">
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{marginBottom:8}}>← Back</button>
      {loading ? (
        <div className="empty-state">Loading ticket details...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : ticket && (
        <div>
          <h2>Ticket Details</h2>
          <div className="ticket-detail-block">
            <div><strong>ID:</strong> {ticket.id}</div>
            <div><strong>Subject:</strong> {ticket.subject}</div>
            <div><strong>Description:</strong> {ticket.description}</div>
            <div>
              <strong>Status:</strong> <span className="ticket-status-chip" style={{ background: STATUS_COLORS[ticket.status] || '#eee' }}>{ticket.status}</span>
              <select
                value={ticket.status}
                style={{ marginLeft: 8 }}
                disabled={statusLoading}
                onChange={handleStatusChange}
                data-testid="status-select"
              >
                {TICKET_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div><strong>Priority:</strong> {ticket.priority}</div>
            <div><strong>Created By:</strong> {ticket.createdBy}</div>
            <div><strong>Created At:</strong> {formatDate(ticket.createdAt)}</div>
            <div><strong>Updated At:</strong> {formatDate(ticket.updatedAt)}</div>
          </div>

          <h3>Responses</h3>
          {respError && <div className="error">{respError}</div>}
          {responses && responses.length === 0 && (
            <div className="empty-state">No responses yet.</div>
          )}
          {responses && responses.length > 0 && (
            <ul className="response-list">
              {responses.map(resp => (
                <li key={resp.id} className="response-item">
                  <div>{resp.message}</div>
                  <div style={{ color: '#64748b', fontSize: '0.96em' }}>
                    By <b>{resp.respondedBy}</b> at {formatDate(resp.respondedAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className="response-form" onSubmit={handleAddResponse} style={{ marginTop: '1.5em' }}>
            <label htmlFor="response-message">Message</label>
            <textarea
              name="message"
              id="response-message"
              maxLength={500}
              required
              value={form.message}
              onChange={handleFormChange}
              disabled={respLoading}
            />

            <label htmlFor="response-by">Responded By</label>
            <input
              type="text"
              name="respondedBy"
              id="response-by"
              maxLength={50}
              required
              value={form.respondedBy}
              onChange={handleFormChange}
              disabled={respLoading}
            />

            {formErr && <div className="error">{formErr}</div>}
            <button className="btn-primary" type="submit" disabled={respLoading} data-testid="add-response-btn">
              {respLoading ? 'Sending...' : 'Add Response'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
