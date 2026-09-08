import React, { useState, useRef } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { X, Paperclip, FileText } from 'lucide-react';
import { PRIORITIES } from '../../services/mockData';

export default function CreateTicketModal() {
  const { isCreateTicketOpen, setIsCreateTicketOpen, createTicket, currentUser } = useSupportFlow();

  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    createdBy: currentUser.name || ''
  });

  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isCreateTicketOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    else if (form.subject.length < 5 || form.subject.length > 100) errs.subject = 'Subject must be between 5 and 100 characters';

    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.length < 10 || form.description.length > 1000) errs.description = 'Description must be between 10 and 1000 characters';

    if (!form.createdBy.trim()) errs.createdBy = 'Your Name / Email is required';
    else if (form.createdBy.length < 2 || form.createdBy.length > 50) errs.createdBy = 'Must be between 2 and 50 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.');
      return;
    }
    setAttachment({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        description: attachment
          ? `${form.description.trim()}\n\n[Attachment: ${attachment.name} (${attachment.size})]`
          : form.description.trim()
      };
      await createTicket(payload);
      setIsCreateTicketOpen(false);
      setAttachment(null);
      setForm({
        subject: '',
        description: '',
        priority: 'MEDIUM',
        createdBy: currentUser.name || ''
      });
    } catch {
      // Error handled by addToast in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sf-modal-overlay" onClick={() => setIsCreateTicketOpen(false)}>
      <div className="sf-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="sf-modal-header">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--sf-text-primary)' }}>
              Create New Support Ticket
            </h3>
            <p style={{ fontSize: 12, color: 'var(--sf-text-muted)', marginTop: 2 }}>
              Saves directly to the MySQL backend database.
            </p>
          </div>
          <button
            className="sf-btn-ghost"
            style={{ width: 28, height: 28, padding: 0 }}
            onClick={() => setIsCreateTicketOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sf-modal-body">
            <div className="sf-form-group">
              <label className="sf-form-label">Requester Name / Email *</label>
              <input
                className="sf-input"
                placeholder="e.g. user@company.com"
                value={form.createdBy}
                onChange={e => setForm({ ...form, createdBy: e.target.value })}
                maxLength={50}
                style={{ width: '100%' }}
                disabled={submitting}
              />
              {errors.createdBy && (
                <span style={{ fontSize: 11.5, color: 'var(--sf-danger)' }}>{errors.createdBy}</span>
              )}
            </div>

            <div className="sf-form-group">
              <label className="sf-form-label">Subject Summary *</label>
              <input
                className="sf-input"
                placeholder="Brief summary of the issue (5-100 characters)..."
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                maxLength={100}
                style={{ width: '100%' }}
                disabled={submitting}
              />
              {errors.subject && (
                <span style={{ fontSize: 11.5, color: 'var(--sf-danger)' }}>{errors.subject}</span>
              )}
            </div>

            <div className="sf-form-group">
              <label className="sf-form-label">Detailed Description *</label>
              <textarea
                className="sf-textarea"
                rows={4}
                placeholder="Provide detailed description of the incident (10-1000 characters)..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                maxLength={1000}
                style={{ width: '100%' }}
                disabled={submitting}
              />
              {errors.description && (
                <span style={{ fontSize: 11.5, color: 'var(--sf-danger)' }}>{errors.description}</span>
              )}
            </div>

            <div className="sf-form-group">
              <label className="sf-form-label">Priority Level</label>
              <select
                className="sf-select"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Optional Attachment */}
            <div className="sf-form-group">
              <label className="sf-form-label">Attachment (Optional screenshot or error log)</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="sf-btn sf-btn-secondary sf-btn-sm"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={submitting}
                >
                  <Paperclip size={13} />
                  Choose File...
                </button>
                {attachment ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <FileText size={13} color="var(--sf-primary)" />
                    <span style={{ fontWeight: 600 }}>{attachment.name}</span>
                    <span style={{ color: 'var(--sf-text-muted)' }}>({attachment.size})</span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={12} color="var(--sf-text-muted)" />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>No file chosen (Max 5MB)</span>
                )}
              </div>
            </div>
          </div>

          <div className="sf-modal-footer">
            <button
              type="button"
              className="sf-btn sf-btn-secondary"
              onClick={() => setIsCreateTicketOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="sf-btn sf-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting to DB...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
