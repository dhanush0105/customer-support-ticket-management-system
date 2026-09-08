import React, { useState, useMemo } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { Search, Plus, ArrowUpRight, Users } from 'lucide-react';
import CustomerProfileModal from './CustomerProfileModal';

export default function CustomersPage() {
  const { customers, navigateToCustomer, selectedCustomerId, setSelectedCustomerId, setIsCreateTicketOpen } = useSupportFlow();
  const [search, setSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div>
      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Customers</h1>
          <p className="sf-page-subtitle">Directory of clients derived dynamically from active tickets in the database.</p>
        </div>

        <button className="sf-btn sf-btn-primary" onClick={() => setIsCreateTicketOpen(true)}>
          <Plus size={14} />
          Create Ticket for Client
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="sf-filter-bar">
        <div className="sf-search-box">
          <Search className="sf-search-box-icon" />
          <input
            className="sf-search-box-input"
            placeholder="Search clients by name, email, or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="sf-table-wrapper">
        {filteredCustomers.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--sf-text-muted)' }}>
            <Users size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>No customer accounts on record</div>
            <p style={{ fontSize: 12.5, marginTop: 4 }}>Customer records are automatically registered when support tickets are created.</p>
          </div>
        ) : (
          <table className="sf-table">
            <thead>
              <tr>
                <th>Customer & Company</th>
                <th>Contact Email</th>
                <th>Total Tickets</th>
                <th>Open</th>
                <th>Resolved</th>
                <th style={{ textAlign: 'right' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(cust => (
                <tr key={cust.id} onClick={() => navigateToCustomer(cust.id)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="sf-user-avatar" style={{ width: 30, height: 30, backgroundColor: '#E2E8F0', color: '#17211F', fontSize: 11.5 }}>
                        {cust.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--sf-text-primary)' }}>{cust.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--sf-text-muted)' }}>{cust.company}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--sf-text-secondary)', fontSize: 13 }}>{cust.email}</td>
                  <td style={{ fontWeight: 600 }}>{cust.totalTickets}</td>
                  <td>
                    {cust.openTickets > 0 ? (
                      <span className="sf-badge sf-badge-open">{cust.openTickets} open</span>
                    ) : (
                      <span style={{ color: 'var(--sf-text-muted)', fontSize: 12 }}>0</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--sf-success)', fontWeight: 600 }}>{cust.resolvedTickets}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="sf-btn sf-btn-ghost sf-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToCustomer(cust.id);
                      }}
                    >
                      View CRM
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Profile CRM Modal */}
      {activeCustomer && (
        <CustomerProfileModal
          customer={activeCustomer}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}
