import React, { useState, useRef } from 'react';
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
  Trash2,
  Clock,
  Star,
  FileText,
  X,
  Download,
  CheckCircle2
} from 'lucide-react';
import { STATUSES, PRIORITIES } from '../../services/mockData';
import { calculateTicketSLA, SLA_POLICIES } from '../../utils/sla';

export default function TicketDetailPage() {
  const {
    selectedTicket,
    setActiveNav,
    updateTicketStatus,
    updateTicketPriority,
    addTicketMessage,
    deleteTicket,
    addToast,
    currentUser,
    csatRatings,
    submitCSAT
  } = useSupportFlow();

  const [composerMode, setComposerMode] = useState('reply'); // 'reply' | 'internal'
  const [messageText, setMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  // CSAT state for this ticket
  const existingCSAT = selectedTicket ? csatRatings[selectedTicket.id] : null;
  const [selectedRating, setSelectedRating] = useState(existingCSAT ? existingCSAT.rating : 5);
  const [feedbackText, setFeedbackText] = useState(existingCSAT ? existingCSAT.feedback : '');

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

  const sla = calculateTicketSLA(selectedTicket);

  const MACROS = [
    {
      id: 'logs',
      label: 'Diagnostic Logs',
      text: `Hello ${selectedTicket.createdBy},\n\nCould you please provide your application or browser console logs so we can diagnose this issue accurately?\n\nBest regards,\n${currentUser.name}`
    },
    {
      id: 'billing',
      label: 'Billing SOP',
      text: `Hello ${selectedTicket.createdBy},\n\nWe have verified your account billing records. The transaction has been updated accordingly.\n\nThank you,\n${currentUser.name}`
    },
    {
      id: 'escalate',
      label: 'Escalate Tier-2',
      text: `Hello ${selectedTicket.createdBy},\n\nI have escalated ticket #${selectedTicket.id} to Tier-2 Engineering for detailed investigation. We will update you shortly.`
    },
    {
      id: 'reset',
      label: 'Password SOP',
      text: `Hello ${selectedTicket.createdBy},\n\nWe have generated a password reset request for your account. Please follow the instructions sent to your email.`
    },
    {
      id: 'resolve',
      label: 'Confirm Resolution',
      text: `Hello ${selectedTicket.createdBy},\n\nWe have resolved ticket #${selectedTicket.id}. Please test and confirm everything is working smoothly on your end.`
    }
  ];

  const applyMacro = (macroText) => {
    setMessageText(macroText);
    addToast('Macro template applied to composer.');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be under 5MB.', 'danger');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        dataUrl: reader.result
      });
      addToast(`Attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachment) return;
    setSubmitting(true);
    try {
      let finalMessage = messageText.trim();
      if (attachment) {
        finalMessage = finalMessage
          ? `${finalMessage}\n\n[Attachment: ${attachment.name} (${attachment.size})]`
          : `[Attachment: ${attachment.name} (${attachment.size})]`;
      }
      await addTicketMessage(selectedTicket.id, finalMessage, composerMode === 'internal');
      setMessageText('');
      setAttachment(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCSATSubmit = (e) => {
    e.preventDefault();
    submitCSAT(selectedTicket.id, selectedRating, feedbackText);
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

  const renderMessageText = (text) => {
    if (!text) return null;
    const attachMatch = text.match(/\[Attachment:\s*(.+?)\s*\((.+?)\)\]/);
    if (!attachMatch) {
      return <div>{text}</div>;
    }
    const cleanText = text.replace(/\[Attachment:\s*(.+?)\s*\((.+?)\)\]/, '').trim();
    const fileName = attachMatch[1];
    const fileSize = attachMatch[2];
    return (
      <div>
        {cleanText && <div style={{ marginBottom: 8 }}>{cleanText}</div>}
        <div className="sf-attachment-pill" title="Download attachment" onClick={() => addToast(`Downloading ${fileName}...`)}>
          <FileText size={13} color="var(--sf-primary)" />
          <span style={{ fontWeight: 500 }}>{fileName}</span>
          <span style={{ color: 'var(--sf-text-muted)', fontSize: 11 }}>({fileSize})</span>
          <Download size={12} style={{ marginLeft: 4 }} />
        </div>
      </div>
    );
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

      {/* SLA Target Banner */}
      <div className={`sf-sla-banner ${sla.badgeClass}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={15} />
          <span>
            <strong>SLA Target:</strong> {sla.statusLabel} — {sla.countdownText}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
          <span>Policy: {SLA_POLICIES[selectedTicket.priority]?.label || 'Standard'}</span>
        </div>
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
                      {renderMessageText(resp.message)}
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

            {/* Hidden file input for attachments */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {/* Rich Text Toolbar */}
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
              <button
                type="button"
                className="sf-composer-tool-btn"
                title="Attach file or screenshot (Max 5MB)"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Paperclip size={13} />
              </button>
              <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--sf-text-muted)' }}>
                {composerMode === 'internal'
                  ? 'Internal notes saved to ticket audit thread'
                  : 'Response persisted to database and sent to customer'}
              </span>
            </div>

            {/* Attachment preview chip */}
            {attachment && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', backgroundColor: 'var(--sf-bg-subtle)', borderBottom: '1px solid var(--sf-border)', fontSize: 12 }}>
                <Paperclip size={13} color="var(--sf-primary)" />
                <span style={{ fontWeight: 600, color: 'var(--sf-text-primary)' }}>{attachment.name}</span>
                <span style={{ color: 'var(--sf-text-muted)' }}>({attachment.size})</span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: 2 }}
                  title="Remove attachment"
                >
                  <X size={13} color="var(--sf-text-muted)" />
                </button>
              </div>
            )}

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
                required={!attachment}
              />

              <div className="sf-composer-footer">
                <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>
                  {messageText.length} / 500 characters
                </span>

                <button
                  type="submit"
                  className={`sf-btn ${composerMode === 'internal' ? 'sf-btn-secondary' : 'sf-btn-primary'}`}
                  disabled={submitting || (!messageText.trim() && !attachment)}
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

          {/* Quick Macro Templates Bar */}
          <div className="sf-assist-panel">
            <div className="sf-assist-header">
              <div className="sf-assist-title">
                <Sparkles size={13} color="var(--sf-primary)" />
                Canned Response Macros
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MACROS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className="sf-btn sf-btn-secondary sf-btn-sm"
                  onClick={() => applyMacro(m.text)}
                  title="Insert macro template into composer"
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive CSAT Survey Card */}
          {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && (
            <div className="sf-csat-card">
              <div className="sf-csat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <span className="sf-csat-title">Customer Satisfaction Survey (CSAT)</span>
                </div>
                {existingCSAT && (
                  <span className="sf-badge" style={{ backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                    <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                    Feedback Recorded
                  </span>
                )}
              </div>

              <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 12 }}>
                How would you rate the resolution quality for Ticket #{selectedTicket.id}?
              </p>

              <form onSubmit={handleCSATSubmit}>
                <div className="sf-csat-scale">
                  {[
                    { val: 1, label: '1 - Poor' },
                    { val: 2, label: '2 - Fair' },
                    { val: 3, label: '3 - Good' },
                    { val: 4, label: '4 - Very Good' },
                    { val: 5, label: '5 - Excellent' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      className={`sf-csat-btn ${selectedRating === opt.val ? 'active' : ''}`}
                      onClick={() => setSelectedRating(opt.val)}
                    >
                      <Star size={13} fill={selectedRating >= opt.val ? 'currentColor' : 'none'} />
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <input
                    className="sf-input"
                    style={{ flex: 1, height: 36, fontSize: 13 }}
                    placeholder="Optional feedback comment on the service provided..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                  <button type="submit" className="sf-btn sf-btn-primary sf-btn-sm" style={{ height: 36 }}>
                    Submit CSAT
                  </button>
                </div>
              </form>
            </div>
          )}
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
