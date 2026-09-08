import React from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { X, Mail, Phone, Building2, Plus } from 'lucide-react';

export default function CustomerProfileModal({ customer, onClose }) {
  const { tickets, navigateToTicket, setIsCreateTicketOpen, addToast } = useSupportFlow();

  const customerTickets = tickets.filter(
    t => t.customerEmail === customer.email || t.customer === customer.name
  );

  return (
    <div className="sf-modal-overlay" onClick={onClose}>
      <div className="sf-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 740, maxHeight: '92vh' }}>
        {/* Header */}
        <div className="sf-modal-header" style={{ backgroundColor: '#F8FAF9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              className="sf-user-avatar"
              style={{ width: 44, height: 44, backgroundColor: '#17211F', color: '#FFFFFF', fontSize: 16 }}
            >
              {customer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sf-text-primary)' }}>
                  {customer.name}
                </h3>
                <span className="sf-badge sf-badge-in-progress">{customer.tier} Tier</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sf-text-secondary)', marginTop: 2 }}>
                Customer since {customer.customerSince} &bull; {customer.company}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="sf-btn sf-btn-primary sf-btn-sm"
              onClick={() => {
                onClose();
                setIsCreateTicketOpen(true);
              }}
            >
              <Plus size={13} />
              Create Ticket
            </button>
            <button
              className="sf-btn-ghost"
              style={{ width: 28, height: 28, padding: 0 }}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="sf-modal-body" style={{ padding: 20 }}>
          {/* Metadata chips */}
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18, padding: '10px 14px', backgroundColor: '#F8FAF9', borderRadius: 6, border: '1px solid var(--sf-border-subtle)', fontSize: 12.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} color="var(--sf-text-muted)" />
              <span>{customer.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={13} color="var(--sf-text-muted)" />
              <span>{customer.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={13} color="var(--sf-text-muted)" />
              <span>{customer.company}</span>
            </div>
          </div>

          {/* CRM Metric Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            <div style={{ padding: '10px 12px', border: '1px solid var(--sf-border)', borderRadius: 6, backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: 11, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Tickets</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{customer.totalTickets}</div>
            </div>
            <div style={{ padding: '10px 12px', border: '1px solid var(--sf-border)', borderRadius: 6, backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: 11, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Open Incidents</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: customer.openTickets > 0 ? 'var(--sf-info)' : 'inherit' }}>
                {customer.openTickets}
              </div>
            </div>
            <div style={{ padding: '10px 12px', border: '1px solid var(--sf-border)', borderRadius: 6, backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: 11, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Resolved</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: 'var(--sf-success)' }}>
                {customer.resolvedTickets}
              </div>
            </div>
            <div style={{ padding: '10px 12px', border: '1px solid var(--sf-border)', borderRadius: 6, backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: 11, color: 'var(--sf-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CSAT Score</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: 'var(--sf-success)' }}>
                {customer.csat}%
              </div>
            </div>
          </div>

          {/* Ticket History */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sf-text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ticket History ({customerTickets.length})
            </div>

            {customerTickets.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 12.5, backgroundColor: '#F8FAF9', borderRadius: 6 }}>
                No active tickets on record for this customer.
              </div>
            ) : (
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assignee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerTickets.map(t => (
                      <tr
                        key={t.id}
                        onClick={() => {
                          onClose();
                          navigateToTicket(t.id);
                        }}
                      >
                        <td className="sf-ticket-id">#{t.id}</td>
                        <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.subject}
                        </td>
                        <td>
                          <span className={`sf-badge sf-priority-${t.priority.toLowerCase()}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`sf-badge sf-badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--sf-text-secondary)' }}>{t.assignee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sf-text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CRM Activity Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: 'var(--sf-text-secondary)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--sf-text-muted)', width: 90, flexShrink: 0 }}>Today, 10:42 AM</span>
                <span>Submitted ticket #TK-1024 regarding credit card payment deduction.</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--sf-text-muted)', width: 90, flexShrink: 0 }}>05 Sep 2026</span>
                <span>Customer rated resolution on ticket #TK-0984 with 5 stars CSAT.</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--sf-text-muted)', width: 90, flexShrink: 0 }}>18 Aug 2026</span>
                <span>Account upgraded to Enterprise Tier with Dedicated Support SLA.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sf-modal-footer">
          <button className="sf-btn sf-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="sf-btn sf-btn-secondary"
            onClick={() => addToast(`Customer account profile exported for ${customer.name}.`)}
          >
            Export Profile
          </button>
        </div>
      </div>
    </div>
  );
}
