import React, { useState } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import {
  User,
  Building,
  Bell,
  Users,
  Sliders,
  Clock,
  Tag,
  Shield,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, addToast } = useSupportFlow();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [firstResponseTarget, setFirstResponseTarget] = useState('30');
  const [resolutionTarget, setResolutionTarget] = useState('4');
  const [autoAssign, setAutoAssign] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(true);

  const handleSave = (section) => {
    addToast(`${section} settings saved successfully.`);
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account & Organization', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team Roles & Routing', icon: Users },
    { id: 'ticket-settings', label: 'Ticket Settings', icon: Sliders },
    { id: 'sla-settings', label: 'SLA Policies', icon: Clock },
    { id: 'categories', label: 'Categories & Tags', icon: Tag },
    { id: 'security', label: 'Security & Access', icon: Shield },
  ];

  return (
    <div>
      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Settings</h1>
          <p className="sf-page-subtitle">Configure organization preferences, SLA thresholds, routing policies, and credentials.</p>
        </div>
      </div>

      {/* Settings Layout: Sub-Sidebar + Form Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Settings Sub-Sidebar */}
        <div className="sf-card" style={{ padding: '8px 0', overflow: 'hidden' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--sf-primary)' : 'var(--sf-text-secondary)',
                  backgroundColor: isActive ? 'var(--sf-primary-light)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--sf-primary)' : '3px solid transparent',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={15} color={isActive ? 'var(--sf-primary)' : 'var(--sf-text-muted)'} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Settings Body */}
        <div className="sf-card" style={{ padding: 24 }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>User Profile</h2>
              <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 20 }}>
                Manage your personal details, display name, and avatar initials.
              </p>

              <div className="sf-form-grid-2">
                <div className="sf-form-group">
                  <label className="sf-form-label">Full Name</label>
                  <input
                    className="sf-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="sf-form-group">
                  <label className="sf-form-label">Work Email Address</label>
                  <input
                    className="sf-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="sf-form-grid-2">
                <div className="sf-form-group">
                  <label className="sf-form-label">Support Role Title</label>
                  <input
                    className="sf-input"
                    value={currentUser.role}
                    disabled
                    style={{ width: '100%', backgroundColor: '#F8FAF9' }}
                  />
                </div>
                <div className="sf-form-group">
                  <label className="sf-form-label">Timezone</label>
                  <select className="sf-select" defaultValue="UTC-5" style={{ width: '100%' }}>
                    <option value="UTC-5">Eastern Time (US & Canada) (UTC-05:00)</option>
                    <option value="UTC+5.5">India Standard Time (IST) (UTC+05:30)</option>
                    <option value="UTC+0">Coordinated Universal Time (UTC)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <button className="sf-btn sf-btn-primary" onClick={() => handleSave('Profile')}>
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SLA Policies Tab */}
          {activeTab === 'sla-settings' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>SLA Policies & Escalation Targets</h2>
              <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 20 }}>
                Configure contractual service level agreement thresholds for response and resolution.
              </p>

              <div className="sf-form-grid-2">
                <div className="sf-form-group">
                  <label className="sf-form-label">First Response Target (Minutes)</label>
                  <input
                    className="sf-input"
                    type="number"
                    value={firstResponseTarget}
                    onChange={e => setFirstResponseTarget(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: 11.5, color: 'var(--sf-text-muted)' }}>
                    Breach warning triggers at 75% elapsed duration
                  </span>
                </div>

                <div className="sf-form-group">
                  <label className="sf-form-label">Resolution Target (Hours)</label>
                  <input
                    className="sf-input"
                    type="number"
                    value={resolutionTarget}
                    onChange={e => setResolutionTarget(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: 11.5, color: 'var(--sf-text-muted)' }}>
                    Standard enterprise SLA window is 4.0 hours
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <button className="sf-btn sf-btn-primary" onClick={() => handleSave('SLA Policies')}>
                  <Save size={14} />
                  Save SLA Policies
                </button>
              </div>
            </div>
          )}

          {/* Ticket Settings Tab */}
          {activeTab === 'ticket-settings' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Ticket Routing & Triage Automation</h2>
              <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 20 }}>
                Automatic dispatching, round-robin assignments, and closed ticket retention rules.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={autoAssign}
                    onChange={e => setAutoAssign(e.target.checked)}
                    style={{ accentColor: 'var(--sf-primary)' }}
                  />
                  <span>Enable round-robin auto-assignment to available online agents</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{ accentColor: 'var(--sf-primary)' }}
                  />
                  <span>Auto-close resolved tickets after 5 business days of customer inactivity</span>
                </label>
              </div>

              <button className="sf-btn sf-btn-primary" onClick={() => handleSave('Ticket')}>
                <Save size={14} />
                Save Routing Settings
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Security & Authentication</h2>
              <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 20 }}>
                Enforce multi-factor verification, SAML single sign-on, and audit logging.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={mfaRequired}
                    onChange={e => setMfaRequired(e.target.checked)}
                    style={{ accentColor: 'var(--sf-primary)' }}
                  />
                  <span>Enforce mandatory TOTP Two-Factor Authentication for all staff accounts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{ accentColor: 'var(--sf-primary)' }}
                  />
                  <span>Enforce SAML 2.0 Identity Provider authentication (Okta / Azure AD)</span>
                </label>
              </div>

              <button className="sf-btn sf-btn-primary" onClick={() => handleSave('Security')}>
                <Save size={14} />
                Save Security Settings
              </button>
            </div>
          )}

          {/* Other tabs fallback */}
          {!['profile', 'sla-settings', 'ticket-settings', 'security'].includes(activeTab) && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>
                {activeTab.replace('-', ' ')}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--sf-text-secondary)', marginBottom: 20 }}>
                Configure preferences and custom policies for this section.
              </p>

              <div style={{ padding: '24px', backgroundColor: '#F8FAF9', borderRadius: 6, border: '1px solid var(--sf-border-subtle)', textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 13 }}>
                Configuration settings for {activeTab.replace('-', ' ')} are actively managed by SupportFlow Enterprise Policies.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
