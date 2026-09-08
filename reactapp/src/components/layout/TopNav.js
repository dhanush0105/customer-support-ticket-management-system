import React from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import {
  Search,
  Bell,
  HelpCircle,
  Plus,
  CheckCheck
} from 'lucide-react';

export default function TopNav() {
  const {
    activeNav,
    setActiveNav,
    setIsSearchOpen,
    setIsCreateTicketOpen,
    isNotifOpen,
    setIsNotifOpen,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
    navigateToTicket,
    currentUser
  } = useSupportFlow();

  const getBreadcrumbTitle = () => {
    switch (activeNav) {
      case 'overview': return 'Overview';
      case 'tickets': return 'Tickets';
      case 'ticket-detail': return 'Ticket Workspace';
      case 'customers': return 'Customers';
      case 'team': return 'Support Team';
      case 'knowledge': return 'Knowledge Base';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Overview';
    }
  };

  return (
    <header className="sf-top-nav">
      {/* Breadcrumbs */}
      <div className="sf-breadcrumb">
        <span>SupportFlow</span>
        <span>/</span>
        <span className="sf-breadcrumb-active">{getBreadcrumbTitle()}</span>
      </div>

      {/* Center / Right controls */}
      <div className="sf-top-right">
        {/* Global search trigger */}
        <div
          className="sf-search-trigger"
          onClick={() => setIsSearchOpen(true)}
          title="Global search (Ctrl + K)"
        >
          <Search size={14} />
          <span>Search tickets, customers, articles...</span>
          <kbd className="sf-search-kbd">Ctrl K</kbd>
        </div>

        {/* Create Ticket CTA */}
        <button
          className="sf-btn sf-btn-primary sf-btn-sm"
          onClick={() => setIsCreateTicketOpen(true)}
        >
          <Plus size={14} />
          New Ticket
        </button>

        {/* Notifications Icon with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="sf-icon-btn"
            onClick={() => setIsNotifOpen(prev => !prev)}
            title="Notifications"
          >
            <Bell size={15} />
            {unreadNotifCount > 0 && <span className="sf-notif-dot" />}
          </button>

          {isNotifOpen && (
            <div className="sf-notif-popover">
              <div className="sf-notif-header">
                <span>Notifications ({unreadNotifCount} unread)</span>
                {unreadNotifCount > 0 && (
                  <button
                    className="sf-btn-ghost"
                    style={{ fontSize: 11, padding: '2px 6px', height: 'auto' }}
                    onClick={markAllNotificationsRead}
                  >
                    <CheckCheck size={12} style={{ marginRight: 4 }} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="sf-notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`sf-notif-item ${notif.unread ? 'unread' : ''}`}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.ticketId) {
                          navigateToTicket(notif.ticketId);
                          setIsNotifOpen(false);
                        }
                      }}
                    >
                      <div className="sf-notif-item-title">{notif.title}</div>
                      <div className="sf-notif-item-body">{notif.body}</div>
                      <div className="sf-notif-item-time">{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Center icon */}
        <button
          className="sf-icon-btn"
          title="Knowledge Base & Help"
          onClick={() => setActiveNav('knowledge')}
        >
          <HelpCircle size={15} />
        </button>

        {/* User avatar */}
        <div
          className="sf-user-avatar"
          style={{ width: 32, height: 32, cursor: 'pointer' }}
          title={`Signed in as ${currentUser.name} (${currentUser.role})`}
          onClick={() => setActiveNav('settings')}
        >
          {currentUser.avatar}
        </div>
      </div>
    </header>
  );
}
