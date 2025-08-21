import React, { useState } from 'react';
import { createTicket } from '../utils/api';
import { TICKET_PRIORITIES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
// import './CreateTicket.css';

const INIT_FORM = {
  subject: '',
  description: '',
  priority: 'LOW',
  createdBy: '',
};

const CreateTicket = () => {
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let errs = {};
    if (!form.subject.trim()) errs.subject = 'Required';
    if (form.subject.length < 5 || form.subject.length > 100) errs.subject = '5-100 characters required';
    if (!form.description.trim()) errs.description = 'Required';
    if (form.description.length < 10 || form.description.length > 1000) errs.description = '10-1000 characters required';
    if (!form.createdBy.trim()) errs.createdBy = 'Required';
    if (form.createdBy.length < 2 || form.createdBy.length > 50) errs.createdBy = '2-50 characters required';
    if (!form.priority) errs.priority = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await createTicket(form);
      navigate('/');
    } catch (e) {
      setApiError(typeof e === 'string' ? e : 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-container">
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{marginBottom:8}}>← Back</button>
      <form className="create-ticket-form" onSubmit={handleSubmit}>
        <h2>Create Ticket</h2>
        <label htmlFor="subject-input">Subject</label>
        <input
          id="subject-input"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          disabled={loading}
          type="text"
          required
          maxLength={100}
          data-testid="subject-input"
        />
        {errors.subject && <div className="error">{errors.subject}</div>}

        <label htmlFor="description-input">Description</label>
        <textarea
          id="description-input"
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={loading}
          maxLength={1000}
          required
          data-testid="description-input"
        />
        {errors.description && <div className="error">{errors.description}</div>}

        <label htmlFor="priority-select">Priority</label>
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
        {errors.priority && <div className="error">{errors.priority}</div>}

        <label htmlFor="createdBy-input">Created By</label>
        <input
          id="createdBy-input"
          name="createdBy"
          value={form.createdBy}
          onChange={handleChange}
          disabled={loading}
          type="text"
          required
          maxLength={50}
          data-testid="createdBy-input"
        />
        {errors.createdBy && <div className="error">{errors.createdBy}</div>}

        {apiError && <div className="error">{apiError}</div>}
        <button className="btn-primary" type="submit" data-testid="create-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;
