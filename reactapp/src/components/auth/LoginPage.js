import React, { useState } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { switchPersona, setActiveNav, tickets } = useSupportFlow();
  const [email, setEmail] = useState('alice@supportflow.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    switchPersona('ADMIN');
    setActiveNav('overview');
  };

  const handleDemoLogin = (role) => {
    switchPersona(role);
    if (role === 'CUSTOMER') {
      setActiveNav('tickets');
    } else {
      setActiveNav('overview');
    }
  };

  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const resolutionRate = tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 100;

  return (
    <div className="sf-login-wrap">
      {/* Left Panel: Enterprise Identity */}
      <div className="sf-login-brand-panel">
        <div className="sf-login-brand-top">
          <div className="sf-logo-mark" style={{ width: 32, height: 32 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.02, color: '#FFFFFF' }}>
            SupportFlow
          </span>
        </div>

        <div className="sf-login-brand-hero">
          <h1>Resolve customer issues faster.</h1>
          <p>
            Connected directly to your MySQL Spring Boot backend. Manage real customer requests,
            collaborate with support specialists, and track SLAs from one unified workspace.
          </p>

          <div className="sf-login-stats-grid">
            <div className="sf-login-stat-card">
              <div className="sf-login-stat-num">{tickets.length}</div>
              <div className="sf-login-stat-desc">Live DB Tickets</div>
            </div>
            <div className="sf-login-stat-card">
              <div className="sf-login-stat-num">{resolvedCount}</div>
              <div className="sf-login-stat-desc">Resolved Incidents</div>
            </div>
            <div className="sf-login-stat-card">
              <div className="sf-login-stat-num">{resolutionRate}%</div>
              <div className="sf-login-stat-desc">Resolution Rate</div>
            </div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#97A3A0' }}>
              <CheckCircle2 size={15} color="var(--sf-primary)" />
              <span>Real-time REST API synchronization with Spring Boot & MySQL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#97A3A0' }}>
              <CheckCircle2 size={15} color="var(--sf-primary)" />
              <span>Direct ticket creation, status transitions, and response timeline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#97A3A0' }}>
              <ShieldCheck size={15} color="var(--sf-primary)" />
              <span>Enterprise role-based authentication and audit tracking</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#556461' }}>
          &copy; {new Date().getFullYear()} SupportFlow Inc. Enterprise Edition.
        </div>
      </div>

      {/* Right Panel: Sign In form */}
      <div className="sf-login-form-panel">
        <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
          <h2 className="sf-login-title">Sign in to your account</h2>
          <p className="sf-login-sub">Enter your corporate credentials to access the workspace.</p>

          <form onSubmit={handleSubmit}>
            <div className="sf-form-group">
              <label className="sf-form-label">Work Email Address</label>
              <input
                className="sf-input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="sf-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label className="sf-form-label" style={{ margin: 0 }}>Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact your IT administrator to reset credentials.'); }} style={{ fontSize: 12, color: 'var(--sf-primary)', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <input
                className="sf-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 20px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--sf-primary)' }}
              />
              <label htmlFor="remember" style={{ fontSize: 13, color: 'var(--sf-text-secondary)', cursor: 'pointer' }}>
                Remember this device for 30 days
              </label>
            </div>

            <button
              className="sf-btn sf-btn-primary"
              type="submit"
              style={{ width: '100%', height: 38, fontSize: 14 }}
            >
              Sign In to Workspace
              <ArrowRight size={15} />
            </button>
          </form>

          <div style={{ marginTop: 18, fontSize: 12.5, color: 'var(--sf-text-muted)', textAlign: 'center' }}>
            Don't have an account? <span style={{ color: 'var(--sf-text-secondary)', fontWeight: 500 }}>Contact your administrator</span>
          </div>

          {/* Demo Persona Switcher */}
          <div className="sf-demo-selector">
            <div className="sf-demo-title">Fast Demo Access</div>
            <div className="sf-demo-btn-group">
              <button
                type="button"
                className="sf-btn sf-btn-secondary sf-btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleDemoLogin('ADMIN')}
              >
                Admin (Alice)
              </button>
              <button
                type="button"
                className="sf-btn sf-btn-secondary sf-btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleDemoLogin('AGENT')}
              >
                Agent (Bob)
              </button>
              <button
                type="button"
                className="sf-btn sf-btn-secondary sf-btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleDemoLogin('CUSTOMER')}
              >
                Customer (Charlie)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
