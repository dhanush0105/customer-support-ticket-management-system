import React, { useState } from 'react';
import { createTicket } from '../utils/api';
import { TICKET_PRIORITIES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreateTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    createdBy: user?.name || '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    else if (form.subject.length < 5 || form.subject.length > 100) errs.subject = 'Must be between 5 and 100 characters';

    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.length < 10 || form.description.length > 1000) errs.description = 'Must be between 10 and 1000 characters';

    if (!form.createdBy.trim()) errs.createdBy = 'Your Name / Email is required';
    else if (form.createdBy.length < 2 || form.createdBy.length > 50) errs.createdBy = 'Must be between 2 and 50 characters';

    if (!form.priority) errs.priority = 'Priority is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await createTicket(form);
      const dest = user?.role === 'ADMIN' ? '/admin' : user?.role === 'REPLIER' ? '/replier' : '/';
      navigate(dest);
    } catch (e) {
      setApiError(typeof e === 'string' ? e : 'Failed to create ticket. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div style={{ marginBottom: 18 }}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2>Create Support Ticket</h2>
          <p>Submit your inquiry or incident details and our support team will respond promptly.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-card-body">
            {apiError && (
              <div className="error-banner">
                <span>⚠️</span> {apiError}
              </div>
            )}

            <div className="field">
              <label htmlFor="subject-input">Subject Summary *</label>
              <input
                id="subject-input"
                name="subject"
                placeholder="Brief, descriptive summary (e.g., Cannot connect to database)"
                value={form.subject}
                onChange={handleChange}
                disabled={loading}
                type="text"
                required
                maxLength={100}
                data-testid="subject-input"
              />
              {errors.subject && <span className="error-msg">{errors.subject}</span>}
            </div>

            <div className="field">
              <label htmlFor="description-input">Detailed Description *</label>
              <textarea
                id="description-input"
                name="description"
                placeholder="Provide steps to reproduce, error codes, and what you expected to happen..."
                value={form.description}
                onChange={handleChange}
                disabled={loading}
                maxLength={1000}
                rows={5}
                required
                data-testid="description-input"
              />
              {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            <div className="grid-2">
              <div className="field">
                <label htmlFor="priority-select">Priority Level *</label>
                <select
                  id="priority-select"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  disabled={loading}
                  data-testid="priority-select"
                  required
                >
                  {TICKET_PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.priority && <span className="error-msg">{errors.priority}</span>}
              </div>

              <div className="field">
                <label htmlFor="createdBy-input">Your Name or Email *</label>
                <input
                  id="createdBy-input"
                  name="createdBy"
                  placeholder="e.g. Jane Doe or user@example.com"
                  value={form.createdBy}
                  onChange={handleChange}
                  disabled={loading}
                  type="text"
                  required
                  maxLength={50}
                  data-testid="createdBy-input"
                />
                {errors.createdBy && <span className="error-msg">{errors.createdBy}</span>}
              </div>
            </div>
          </div>

          <div className="form-card-footer">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn-primary"
              type="submit"
              data-testid="create-btn"
              disabled={loading}
            >
              {loading ? 'Transmitting...' : '🚀 Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
