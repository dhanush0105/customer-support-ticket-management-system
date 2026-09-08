import React, { useState } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import {
  ArrowLeft,
  Bold,
  Italic,
  Link2,
  Paperclip,
  Send,
  Sparkles,
  Lock,
  Mail,
  Building2,
  Trash2
} from 'lucide-react';
import { STATUSES, PRIORITIES } from '../../services/mockData';

export default function TicketDetailPage() {
  const {
    selectedTicket,
    setActiveNav,
    updateTicketStatus,
    updateTicketPriority,
    addTicketMessage,
    deleteTicket,
    addToast
  } = useSupportFlow();

  const [composerMode, setComposerMode] = useState('reply'); // 'reply' | 'internal'
  const [messageText, setMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!selectedTicket) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>No ticket selected</h3>
        <p style={{ fontSize: 13, color: 'var(--sf-text-muted)', marginTop: 4 }}>
          Select an incident from the tickets table to inspect details.
        </p>
        <button
          className="sf-btn sf-btn-secondary"
          onClick={() => setActiveNav('tickets')}
          style={{ marginTop: 14 }}
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSubmitting(true);
    try {
      await addTicketMessage(selectedTicket.id, messageText.trim(), composerMode === 'internal');
      setMessageText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm(`Permanently delete ticket #${selectedTicket.id}?`)) return;
    await deleteTicket(selectedTicket.id);
    setActiveNav('tickets');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Back Navigation Bar */}
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="sf-btn sf-btn-ghost sf-btn-sm"
          onClick={() => setActiveNav('tickets')}
          style={{ padding: '0 4px', color: 'var(--sf-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Tickets
        </button>

        <button
          className="sf-btn sf-btn-danger sf-btn-sm"
          onClick={handleDeleteTicket}
        >
          <Trash2 size={13} />
          Delete Ticket
        </button>
      </div>

      {/* Ticket Header & Quick Actions */}
      <div className="sf-ticket-detail-header">
        <div className="sf-ticket-detail-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sf-ticket-id" style={{ fontSize: 14 }}>#{selectedTicket.id}</span>
            <span className={`sf-badge sf-priority-${selectedTicket.priority.toLowerCase()}`}>
              {selectedTicket.priority} Priority
            </span>
            <span className={`sf-badge sf-badge-${selectedTicket.status.toLowerCase().replace('_', '-')}`}>
              <span className="sf-badge-dot" />
              {selectedTicket.status.replace('_', ' ')}
            </span>
          </div>

          {/* Quick Select Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--sf-text-secondary)', fontWeight: 500 }}>Status:</span>
              <select
                className="sf-select sf-btn-sm"
                value={selectedTicket.status}
                onChange={e => updateTicketStatus(selectedTicket.id, e.target.value)}
                style={{ height: 28, fontSize: 12 }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--sf-text-secondary)', fontWeight: 500 }}>Priority:</span>
              <select
                className="sf-select sf-btn-sm"
                value={selectedTicket.priority}
                onChange={e => updateTicketPriority(selectedTicket.id, e.target.value)}
                style={{ height: 28, fontSize: 12 }}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <h2 className="sf-ticket-detail-title">{selectedTicket.subject}</h2>
      </div>

      {/* Main 2-Column Support Workspace */}
      <div className="sf-workspace-grid">
        {/* Left Column: Conversation & Composer */}
        <div>
          {/* Conversation Stream */}
          <div className="sf-conversation-card">
            <div className="sf-card-header">
              <div className="sf-card-title">Conversation Timeline</div>
              <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>
                {(selectedTicket.responses ? selectedTicket.responses.length : 0) + 1} item(s)
              </span>
            </div>

            <div className="sf-convo-stream">
              {/* Initial ticket inquiry from database */}
              <div className="sf-convo-msg">
                <div className="sf-msg-avatar">
                  {(selectedTicket.createdBy || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="sf-msg-content-wrap">
                  <div className="sf-msg-header">
                    <span className="sf-msg-author">{selectedTicket.createdBy}</span>
                    <span className="sf-msg-role">Requester</span>
                    <span className="sf-msg-time">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                  <div className="sf-msg-bubble">{selectedTicket.description}</div>
                </div>
              </div>

              {/* Real Responses from Database */}
              {selectedTicket.responses && selectedTicket.responses.map(resp => (
                <div key={resp.id} className="sf-convo-msg">
                  <div className="sf-msg-avatar agent">
                    {(resp.respondedBy || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  <div className="sf-msg-content-wrap">
                    <div className="sf-msg-header">
                      <span className="sf-msg-author">{resp.respondedBy}</span>
                      <span className="sf-msg-role">Staff Specialist</span>
                      <span className="sf-msg-time">{formatDate(resp.respondedAt)}</span>
                    </div>

                    <div className="sf-msg-bubble">
                      {resp.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Composer Card */}
          <div className="sf-composer-card">
            <div className="sf-composer-tabs">
              <button
                type="button"
                className={`sf-composer-tab ${composerMode === 'reply' ? 'active' : ''}`}
                onClick={() => setComposerMode('reply')}
              >
                Reply to Customer
              </button>
              <button
                type="button"
                className={`sf-composer-tab internal ${composerMode === 'internal' ? 'active' : ''}`}
                onClick={() => setComposerMode('internal')}
              >
                <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
                Add Internal Note
              </button>
            </div>

            {/* Mock Rich Text Toolbar */}
            <div className="sf-composer-toolbar">
              <button type="button" className="sf-composer-tool-btn" title="Bold" onClick={() => setMessageText(prev => prev + ' **bold**')}>
                <Bold size={13} />
              </button>
              <button type="button" className="sf-composer-tool-btn" title="Italic" onClick={() => setMessageText(prev => prev + ' *italic*')}>
                <Italic size={13} />
              </button>
              <button type="button" className="sf-composer-tool-btn" title="Insert Link" onClick={() => setMessageText(prev => prev + ' [link](url)')}>
                <Link2 size={13} />
              </button>
              <button type="button" className="sf-composer-tool-btn" title="Attach File" onClick={() => addToast('Attachment selector initialized.')}>
                <Paperclip size={13} />
              </button>
              <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--sf-text-muted)' }}>
                {composerMode === 'internal'
                  ? 'Internal notes saved to ticket audit thread'
                  : 'Response persisted to database and sent to customer'}
              </span>
            </div>

            <form onSubmit={handleSend}>
              <textarea
                className="sf-composer-textarea"
                rows={4}
                placeholder={
                  composerMode === 'internal'
                    ? 'Write private engineering or triage notes for internal staff...'
                    : 'Compose response to customer...'
                }
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                maxLength={500}
                required
              />

              <div className="sf-composer-footer">
                <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>
                  {messageText.length} / 500 characters
                </span>

                <button
                  type="submit"
                  className={`sf-btn ${composerMode === 'internal' ? 'sf-btn-secondary' : 'sf-btn-primary'}`}
                  disabled={submitting || !messageText.trim()}
                >
                  {submitting ? 'Saving...' : composerMode === 'internal' ? (
                    <>
                      <Lock size={13} />
                      Save Internal Note
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Practical Assist recommendation (Non-glowing) */}
          <div className="sf-assist-panel">
            <div className="sf-assist-header">
              <div className="sf-assist-title">
                <Sparkles size={13} color="var(--sf-primary)" />
                Quick Macros
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="sf-btn sf-btn-secondary sf-btn-sm"
                onClick={() => setMessageText("Hello! We are actively looking into this issue and will update you shortly.")}
              >
                Under Investigation
              </button>
              <button
                type="button"
                className="sf-btn sf-btn-secondary sf-btn-sm"
                onClick={() => setMessageText("Could you please share any error screenshots or browser console messages?")}
              >
                Request Screenshots
              </button>
              <button
                type="button"
                className="sf-btn sf-btn-secondary sf-btn-sm"
                onClick={() => setMessageText("This issue has been resolved in our latest update. Please verify and confirm.")}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Information & Customer Profile */}
        <div className="sf-info-sidebar">
          {/* Customer Card */}
          <div className="sf-info-block">
            <div className="sf-info-block-title">Requester Details</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="sf-user-avatar" style={{ width: 36, height: 36, backgroundColor: '#E2E8F0', color: '#1E293B' }}>
                {(selectedTicket.createdBy || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sf-text-primary)' }}>
                  {selectedTicket.createdBy}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--sf-text-muted)' }}>Requester Account</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--sf-text-secondary)' }}>
                <Mail size={13} color="var(--sf-text-muted)" />
                <span>{selectedTicket.createdBy.includes('@') ? selectedTicket.createdBy : `${selectedTicket.createdBy.toLowerCase()}@client.internal`}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--sf-text-secondary)' }}>
                <Building2 size={13} color="var(--sf-text-muted)" />
                <span>SupportFlow User Directory</span>
              </div>
            </div>
          </div>

          {/* Ticket Metadata */}
          <div className="sf-info-block">
            <div className="sf-info-block-title">Ticket Information</div>
            <div className="sf-info-row">
              <span className="sf-info-label">Ticket ID</span>
              <span className="sf-info-value">#{selectedTicket.id}</span>
            </div>
            <div className="sf-info-row">
              <span className="sf-info-label">Priority</span>
              <span className="sf-info-value">{selectedTicket.priority}</span>
            </div>
            <div className="sf-info-row">
              <span className="sf-info-label">Status</span>
              <span className="sf-info-value">{selectedTicket.status.replace('_', ' ')}</span>
            </div>
            <div className="sf-info-row">
              <span className="sf-info-label">Created By</span>
              <span className="sf-info-value">{selectedTicket.createdBy}</span>
            </div>
            <div className="sf-info-row">
              <span className="sf-info-label">Created At</span>
              <span className="sf-info-value">{formatDate(selectedTicket.createdAt)}</span>
            </div>
            <div className="sf-info-row">
              <span className="sf-info-label">Last Updated</span>
              <span className="sf-info-value">{formatDate(selectedTicket.updatedAt || selectedTicket.createdAt)}</span>
            </div>
          </div>

          {/* SLA Tracking */}
          <div className="sf-info-block">
            <div className="sf-info-block-title">SLA Status</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                <span className="sf-info-label">Current State</span>
                <span style={{ fontWeight: 600, color: selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? 'var(--sf-success)' : 'var(--sf-primary)' }}>
                  {selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? 'Completed ✓' : 'In SLA Window'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--sf-text-muted)' }}>
                {selectedTicket.responses && selectedTicket.responses.length > 0
                  ? `${selectedTicket.responses.length} response(s) logged`
                  : 'Pending response'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
