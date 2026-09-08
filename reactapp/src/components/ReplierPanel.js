import React, { useEffect, useState, useMemo } from 'react';
import { getTickets, addResponse, updateTicketStatus, getTicketById } from '../utils/api';
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
  OPEN: { bg: '#fee2e2', color: '#991b1b' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#92400e' },
  RESOLVED: { bg: '#dcfce7', color: '#14532d' },
  CLOSED: { bg: '#f1f5f9', color: '#475569' },
};

const CANNED_REPLIES = [
  "Looking into this now — an update is coming shortly.",
  "Could you please share a screenshot or browser console logs?",
  "This issue has been resolved in our latest deployment. Please verify.",
  "Issue escalated to Tier-2 engineering — expect resolution within 24h.",
  "Please clear your browser cache and cookies, then try again."
];

export default function ReplierPanel() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('UNRESOLVED');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const replierName = user?.name || 'Agent';

  const showToast = (msg, type = 'success-toast') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
      if (selectedTicket) {
        const fresh = data.find(t => t.id === selectedTicket.id);
        if (fresh) setSelectedTicket(fresh);
      } else if (data.length > 0) {
        setSelectedTicket(data[0]);
      }
    } catch {
      showToast('Failed to load tickets', 'error-toast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTicket = async (t) => {
    try {
      const fresh = await getTicketById(t.id);
      setSelectedTicket(fresh);
    } catch {
      setSelectedTicket(t);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setSubmitting(true);
    try {
      await addResponse(selectedTicket.id, {
        message: replyMessage.trim(),
        respondedBy: replierName
      });
      setReplyMessage('');
      showToast(`Reply sent to Ticket #${selectedTicket.id}`, 'success-toast');

      const updated = await getTicketById(selectedTicket.id);
      setSelectedTicket(updated);
      const all = await getTickets();
      setTickets(all);
    } catch (err) {
      showToast(`Error sending reply: ${err.message}`, 'error-toast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      await updateTicketStatus(selectedTicket.id, status);
      showToast(`Ticket #${selectedTicket.id} marked ${status}`, 'success-toast');
      const updated = await getTicketById(selectedTicket.id);
      setSelectedTicket(updated);
      const all = await getTickets();
      setTickets(all);
    } catch (err) {
      showToast(`Status update failed: ${err.message}`, 'error-toast');
    }
  };

  const insertCannedReply = (text) => {
    setReplyMessage(prev => prev ? `${prev} ${text}` : text);
  };

  // Queue classification
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesTab =
        activeTab === 'UNRESOLVED' ? (t.status === 'OPEN' || t.status === 'IN_PROGRESS') :
        activeTab === 'OPEN' ? (t.status === 'OPEN') :
        activeTab === 'URGENT' ? (t.priority === 'HIGH' && t.status !== 'CLOSED') :
        true;

      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        (t.subject && t.subject.toLowerCase().includes(term)) ||
        (t.createdBy && t.createdBy.toLowerCase().includes(term)) ||
        String(t.id).includes(term);

      return matchesTab && matchesSearch;
    });
  }, [tickets, activeTab, searchTerm]);

  const sc = selectedTicket ? (STATUS_CHIP_COLORS[selectedTicket.status] || STATUS_CHIP_COLORS.CLOSED) : {};

  return (
    <div className="replier-page">
      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Hero Header */}
      <div className="replier-hero">
        <div>
          <h2>⚡ Support Agent Workspace</h2>
          <p>Rapid response triage, canned macros, live ticket stream, and single-click resolution management.</p>
        </div>
        <div className="replier-agent-pill">
          <span className="agent-status-dot" />
          Active Agent: {replierName}
        </div>
      </div>

      {/* Split Workspace */}
      <div className="workspace-split">
        {/* Left Triage Queue */}
        <div className="queue-panel">
          <div className="queue-header">
            <div className="queue-title">Triage Queue ({filteredTickets.length})</div>
            <div className="queue-search">
              <span className="queue-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Filter queue..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="queue-tab-bar">
              <button
                className={`q-tab ${activeTab === 'UNRESOLVED' ? 'active' : ''}`}
                onClick={() => setActiveTab('UNRESOLVED')}
              >
                Needs Action
              </button>
              <button
                className={`q-tab ${activeTab === 'OPEN' ? 'active' : ''}`}
                onClick={() => setActiveTab('OPEN')}
              >
                Open
              </button>
              <button
                className={`q-tab ${activeTab === 'URGENT' ? 'active' : ''}`}
                onClick={() => setActiveTab('URGENT')}
              >
                🔥 Urgent
              </button>
              <button
                className={`q-tab ${activeTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                All
              </button>
            </div>
          </div>

          <div className="queue-list">
            {loading && <div className="loading-text">Loading queue...</div>}
            {!loading && filteredTickets.length === 0 && (
              <div className="empty-workspace" style={{ padding: '32px 16px' }}>
                <div className="empty-workspace-icon">🎉</div>
                <h3>Queue Clear!</h3>
                <p>No tickets needing action in this view.</p>
              </div>
            )}
            {!loading && filteredTickets.map(t => {
              const chip = STATUS_CHIP_COLORS[t.status] || STATUS_CHIP_COLORS.CLOSED;
              return (
                <div
                  key={t.id}
                  className={`q-ticket-card ${selectedTicket?.id === t.id ? 'active' : ''}`}
                  onClick={() => selectTicket(t)}
                >
                  <div className="q-card-top">
                    <span className="q-ticket-id">#{t.id}</span>
                    <span className={`pill ${t.priority}`}>{t.priority}</span>
                  </div>
                  <div className="q-subject">{t.subject}</div>
                  <div className="q-card-footer">
                    <span className="pill" style={{ background: chip.bg, color: chip.color, fontSize: '10px' }}>
                      {t.status.replace('_', ' ')}
                    </span>
                    <span className="q-author">{t.createdBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Conversation Panel */}
        <div className="conversation-panel">
          {!selectedTicket ? (
            <div className="empty-workspace">
              <div className="empty-workspace-icon">📬</div>
              <h3>No Ticket Selected</h3>
              <p>Choose an incident from the triage queue to inspect details and transmit replies.</p>
            </div>
          ) : (
            <>
              {/* Ticket Top Bar */}
              <div className="convo-top-bar">
                <div className="convo-meta-left">
                  <div className="convo-title">#{selectedTicket.id}: {selectedTicket.subject}</div>
                  <div className="convo-tag-row">
                    <span className="convo-tag"><strong>From:</strong> {selectedTicket.createdBy}</span>
                    <span className="pill" style={{ background: sc.bg, color: sc.color }}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`pill ${selectedTicket.priority}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="convo-tag" style={{ color: 'var(--slate-400)' }}>
                      Logged {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="convo-actions-bar">
                  {selectedTicket.status !== 'IN_PROGRESS' && (
                    <button className="btn-status-action progress" onClick={() => handleQuickStatus('IN_PROGRESS')}>
                      In Progress
                    </button>
                  )}
                  {selectedTicket.status !== 'RESOLVED' && (
                    <button className="btn-status-action resolve" onClick={() => handleQuickStatus('RESOLVED')}>
                      Resolve ✓
                    </button>
                  )}
                  {selectedTicket.status !== 'CLOSED' && (
                    <button className="btn-status-action close-t" onClick={() => handleQuickStatus('CLOSED')}>
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Message Stream */}
              <div className="convo-stream">
                {/* Initial Client Issue */}
                <div className="issue-card">
                  <div className="issue-card-header">
                    <div className="issue-card-author">👤 Requester: {selectedTicket.createdBy}</div>
                    <span className="issue-date">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                  <div className="issue-body">{selectedTicket.description}</div>
                </div>

                {/* Activity Thread */}
                {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                  <>
                    <div className="thread-label">
                      Activity Thread ({selectedTicket.responses.length} responses)
                    </div>
                    {selectedTicket.responses.map(r => (
                      <div key={r.id} className="response-bubble">
                        <div className="bubble-avatar">
                          {(r.respondedBy || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="bubble-body-wrap">
                          <div className="bubble-header-row">
                            <span className="bubble-name">{r.respondedBy}</span>
                            <span className="bubble-time">{formatDate(r.respondedAt)}</span>
                          </div>
                          <div className="bubble-message">{r.message}</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="thread-label">No replies yet — be the first to respond below</div>
                )}
              </div>

              {/* Canned Macro Row */}
              <div className="canned-row">
                <span className="canned-label">⚡ Macros:</span>
                {CANNED_REPLIES.map((macro, i) => (
                  <button
                    key={i}
                    type="button"
                    className="canned-btn"
                    onClick={() => insertCannedReply(macro)}
                  >
                    {macro.slice(0, 36)}...
                  </button>
                ))}
              </div>

              {/* Reply Composer */}
              <div className="reply-composer">
                <form onSubmit={handleSendReply}>
                  <div className="composer-inner">
                    <textarea
                      rows="3"
                      placeholder={`Compose response as ${replierName}... (Enter solution, questions, or updates)`}
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      maxLength={500}
                      required
                    />
                    <div className="composer-footer-bar">
                      <span className="composer-char">
                        {replyMessage.length}/500 characters
                      </span>
                      <button
                        type="submit"
                        className="btn-send"
                        disabled={submitting || !replyMessage.trim()}
                      >
                        {submitting ? 'Sending...' : '🚀 Send Reply'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
