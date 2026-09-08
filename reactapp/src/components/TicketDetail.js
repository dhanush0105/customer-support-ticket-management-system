import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, getResponsesForTicket, addResponse, updateTicketStatus } from '../utils/api';
import { TICKET_STATUSES } from '../utils/constants';
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

export default function TicketDetail() {
  const { id } = useParams();
  const ticketId = id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respLoading, setRespLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [respError, setRespError] = useState('');
  const [form, setForm] = useState({ message: '', respondedBy: user?.name || '' });
  const [formErr, setFormErr] = useState('');

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    getTicketById(ticketId)
      .then(data => {
        setTicket(data);
        setError('');
      })
      .catch(e => setError(typeof e === 'string' ? e : 'Failed to load ticket'))
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
  }, [ticketId, ticket?.updatedAt]);

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
      setFormErr('Both fields are required.');
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
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (formErr) setFormErr('');
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setRespLoading(true);
    try {
      await addResponse(ticketId, form);
      setForm({ message: '', respondedBy: user?.name || '' });
      setFormErr('');
      setRespError('');
      const updated = await getTicketById(ticketId);
      setTicket(updated);
      const resps = await getResponsesForTicket(ticketId);
      setResponses(resps.sort((a, b) => new Date(b.respondedAt) - new Date(a.respondedAt)));
    } catch (e) {
      setRespError(typeof e === 'string' ? e : 'Failed to add response');
    } finally {
      setRespLoading(false);
    }
  };

  const sc = ticket ? (STATUS_CHIP_COLORS[ticket.status] || STATUS_CHIP_COLORS.CLOSED) : {};

  return (
    <div className="detail-page">
      <div>
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {loading ? (
        <div className="loading-text">Loading ticket details...</div>
      ) : error ? (
        <div className="error-banner"><span>⚠️</span> {error}</div>
      ) : ticket && (
        <div className="detail-card">
          {/* Header */}
          <div className="detail-top">
            <div>
              <h2>#{ticket.id}: {ticket.subject}</h2>
              <div className="detail-tag-row">
                <span className={`pill ${ticket.priority}`}>{ticket.priority} Priority</span>
                <span className="pill" style={{ background: sc.bg, color: sc.color }}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Status:</span>
              <select
                className="status-select"
                value={ticket.status}
                disabled={statusLoading}
                style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                onChange={handleStatusChange}
                data-testid="status-select"
              >
                {TICKET_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="detail-grid">
            <div className="detail-grid-cell">
              <div className="cell-label">Requester</div>
              <div className="cell-value">👤 {ticket.createdBy}</div>
            </div>
            <div className="detail-grid-cell">
              <div className="cell-label">Date Submitted</div>
              <div className="cell-value">{formatDate(ticket.createdAt)}</div>
            </div>
            <div className="detail-grid-cell">
              <div className="cell-label">Ticket Reference ID</div>
              <div className="cell-value">#{ticket.id}</div>
            </div>
            <div className="detail-grid-cell">
              <div className="cell-label">Last Activity</div>
              <div className="cell-value">{formatDate(ticket.updatedAt || ticket.createdAt)}</div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-desc">
            <div className="section-label">Incident Description</div>
            <p>{ticket.description}</p>
          </div>

          {/* Responses Stream */}
          <div className="detail-responses">
            <div className="section-label">Communication Thread ({responses.length})</div>

            {respError && <div className="error-banner"><span>⚠️</span> {respError}</div>}

            {responses.length === 0 ? (
              <p style={{ color: 'var(--slate-400)', fontStyle: 'italic', margin: '8px 0 16px' }}>
                No replies recorded yet. Post an update using the form below.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '12px 0 24px' }}>
                {responses.map(resp => (
                  <div key={resp.id} className="response-bubble">
                    <div className="bubble-avatar">
                      {(resp.respondedBy || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="bubble-body-wrap">
                      <div className="bubble-header-row">
                        <span className="bubble-name">{resp.respondedBy}</span>
                        <span className="bubble-time">{formatDate(resp.respondedAt)}</span>
                      </div>
                      <div className="bubble-message">{resp.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Form */}
          <div className="response-form-area">
            <form onSubmit={handleAddResponse}>
              <div className="form-card-body" style={{ padding: 0, gap: 14 }}>
                <div className="section-label">Post a Public Reply</div>

                <div className="field">
                  <label htmlFor="response-message">Your Message</label>
                  <textarea
                    name="message"
                    id="response-message"
                    maxLength={500}
                    rows={4}
                    placeholder="Type your response or troubleshooting steps..."
                    required
                    value={form.message}
                    onChange={handleFormChange}
                    disabled={respLoading}
                  />
                </div>

                <div className="field" style={{ maxWidth: 320 }}>
                  <label htmlFor="response-by">Your Name / Agent Handle</label>
                  <input
                    type="text"
                    name="respondedBy"
                    id="response-by"
                    maxLength={50}
                    placeholder="Full name"
                    required
                    value={form.respondedBy}
                    onChange={handleFormChange}
                    disabled={respLoading}
                  />
                </div>

                {formErr && <div className="error-msg">{formErr}</div>}

                <div>
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={respLoading || !form.message.trim()}
                    data-testid="add-response-btn"
                  >
                    {respLoading ? 'Transmitting...' : '🚀 Submit Response'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
