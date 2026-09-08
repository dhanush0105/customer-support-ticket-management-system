import React from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCheck,
  BookOpen,
  BarChart3,
  Inbox,
  AlertTriangle,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeNav,
    setActiveNav,
    currentUser,
    tickets,
    setTicketFilters
  } = useSupportFlow();

  const myTicketsCount = tickets.filter(
    t => t.assignee === currentUser.name && t.status !== 'Closed'
  ).length;

  const unassignedCount = tickets.filter(
    t => t.assignee === 'Unassigned' && t.status !== 'Closed'
  ).length;

  const breachedCount = tickets.filter(
    t => t.slaStatus === 'breached' && t.status !== 'Closed'
  ).length;

  const handleWorkspaceFilter = (type) => {
    if (type === 'my') {
      setTicketFilters(prev => ({ ...prev, assignee: currentUser.name, status: 'ALL' }));
      setActiveNav('tickets');
    } else if (type === 'unassigned') {
      setTicketFilters(prev => ({ ...prev, assignee: 'Unassigned', status: 'ALL' }));
      setActiveNav('tickets');
    } else if (type === 'breached') {
      setTicketFilters(prev => ({ ...prev, status: 'ALL', priority: 'ALL' }));
      setActiveNav('tickets');
    }
  };

  return (
    <aside className="sf-sidebar">
      {/* Sidebar Header with Geometric Logo */}
      <div className="sf-sidebar-header">
        <div className="sf-logo-mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" />
            <path d="M13 17v2" />
            <path d="M13 11v2" />
          </svg>
        </div>
        <div className="sf-logo-text">SupportFlow</div>
      </div>

      {/* Main Navigation */}
      <div className="sf-sidebar-nav">
        <div
          className={`sf-nav-item ${activeNav === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveNav('overview')}
        >
          <span className="sf-nav-item-icon">
            <LayoutDashboard size={16} />
          </span>
          Overview
        </div>

        <div
          className={`sf-nav-item ${activeNav === 'tickets' || activeNav === 'ticket-detail' ? 'active' : ''}`}
          onClick={() => setActiveNav('tickets')}
        >
          <span className="sf-nav-item-icon">
            <Ticket size={16} />
          </span>
          Tickets
          <span className="sf-nav-badge">{tickets.length}</span>
        </div>

        <div
          className={`sf-nav-item ${activeNav === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveNav('customers')}
        >
          <span className="sf-nav-item-icon">
            <Users size={16} />
          </span>
          Customers
        </div>

        <div
          className={`sf-nav-item ${activeNav === 'team' ? 'active' : ''}`}
          onClick={() => setActiveNav('team')}
        >
          <span className="sf-nav-item-icon">
            <UserCheck size={16} />
          </span>
          Team
        </div>

        <div
          className={`sf-nav-item ${activeNav === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveNav('knowledge')}
        >
          <span className="sf-nav-item-icon">
            <BookOpen size={16} />
          </span>
          Knowledge Base
        </div>

        <div
          className={`sf-nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveNav('analytics')}
        >
          <span className="sf-nav-item-icon">
            <BarChart3 size={16} />
          </span>
          Analytics
        </div>

        {/* WORKSPACE Filter Section */}
        <div className="sf-sidebar-section-title">Workspace</div>

        <div
          className="sf-nav-item"
          onClick={() => handleWorkspaceFilter('my')}
        >
          <span className="sf-nav-item-icon">
            <Inbox size={16} />
          </span>
          My Tickets
          {myTicketsCount > 0 && <span className="sf-nav-badge">{myTicketsCount}</span>}
        </div>

        <div
          className="sf-nav-item"
          onClick={() => handleWorkspaceFilter('unassigned')}
        >
          <span className="sf-nav-item-icon">
            <Inbox size={16} />
          </span>
          Unassigned
          {unassignedCount > 0 && <span className="sf-nav-badge">{unassignedCount}</span>}
        </div>

        <div
          className="sf-nav-item"
          onClick={() => handleWorkspaceFilter('breached')}
        >
          <span className="sf-nav-item-icon">
            <AlertTriangle size={16} />
          </span>
          SLA Breaches
          {breachedCount > 0 && <span className="sf-nav-badge danger">{breachedCount}</span>}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <div
            className={`sf-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
          >
            <span className="sf-nav-item-icon">
              <Settings size={16} />
            </span>
            Settings
          </div>

          <div
            className="sf-nav-item"
            onClick={() => setActiveNav('knowledge')}
          >
            <span className="sf-nav-item-icon">
              <HelpCircle size={16} />
            </span>
            Help Center
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="sf-sidebar-footer">
        <div className="sf-user-tile">
          <div className="sf-user-avatar">
            {currentUser.avatar}
            <span className="sf-online-dot" />
          </div>
          <div className="sf-user-details">
            <div className="sf-user-name">{currentUser.name}</div>
            <div className="sf-user-role">{currentUser.role}</div>
          </div>
          <button
            className="sf-btn-ghost"
            title="Sign out / Switch account"
            style={{ width: 28, height: 28, padding: 0, color: '#97A3A0' }}
            onClick={() => setActiveNav('login')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
