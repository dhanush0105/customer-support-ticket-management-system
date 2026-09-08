import React from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { UserCheck } from 'lucide-react';

export default function TeamPage() {
  const { agents, tickets } = useSupportFlow();

  const totalAgents = agents.length;
  const onlineCount = agents.filter(a => a.status === 'Online').length;
  const busyCount = agents.filter(a => a.status === 'Busy').length;

  return (
    <div>
      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Support Team</h1>
          <p className="sf-page-subtitle">Staff rosters and live workload computed across {tickets.length} database tickets.</p>
        </div>
      </div>

      {/* Top statistics */}
      <div className="sf-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">Active Support Specialists</span>
            <UserCheck className="sf-kpi-icon" />
          </div>
          <div className="sf-kpi-value">{totalAgents}</div>
          <div className="sf-kpi-footer">Configured service specialists</div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">Online & Available</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--sf-success)' }} />
          </div>
          <div className="sf-kpi-value" style={{ color: 'var(--sf-success)' }}>{onlineCount}</div>
          <div className="sf-kpi-footer">Accepting incoming triage</div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">Busy / Engaged</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--sf-warning)' }} />
          </div>
          <div className="sf-kpi-value" style={{ color: 'var(--sf-warning)' }}>{busyCount}</div>
          <div className="sf-kpi-footer">Resolving active incidents</div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="sf-table-wrapper">
        <div className="sf-card-header">
          <div className="sf-card-title">Staff Rosters & Workload</div>
          <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>Connected to database</span>
        </div>

        <table className="sf-table">
          <thead>
            <tr>
              <th>Specialist & Role</th>
              <th>Status</th>
              <th>Assigned / Handled</th>
              <th>Resolved</th>
              <th>Response SLA</th>
              <th style={{ textAlign: 'right' }}>Quality CSAT</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="sf-user-avatar" style={{ width: 32, height: 32 }}>
                      {agent.avatar}
                      <span
                        className="sf-online-dot"
                        style={{
                          backgroundColor:
                            agent.status === 'Online'
                              ? 'var(--sf-success)'
                              : 'var(--sf-warning)'
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--sf-text-primary)' }}>{agent.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--sf-text-muted)' }}>{agent.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`sf-badge ${
                      agent.status === 'Online'
                        ? 'sf-badge-resolved'
                        : 'sf-badge-pending'
                    }`}
                  >
                    <span className="sf-badge-dot" />
                    {agent.status}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{agent.assignedCount} tickets</td>
                <td style={{ color: 'var(--sf-text-secondary)' }}>{agent.resolvedCount}</td>
                <td style={{ color: 'var(--sf-text-secondary)' }}>15m avg</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--sf-success)' }}>
                  98.2%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
