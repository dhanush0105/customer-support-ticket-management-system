import React from 'react';
import './styles/supportflow.css';
import { SupportFlowProvider, useSupportFlow } from './context/SupportFlowContext';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import GlobalSearchModal from './components/layout/GlobalSearchModal';
import ToastContainer from './components/common/ToastContainer';
import CreateTicketModal from './components/tickets/CreateTicketModal';
import LoginPage from './components/auth/LoginPage';
import OverviewPage from './components/dashboard/OverviewPage';
import TicketsPage from './components/tickets/TicketsPage';
import TicketDetailPage from './components/tickets/TicketDetailPage';
import CustomersPage from './components/customers/CustomersPage';
import TeamPage from './components/team/TeamPage';
import KnowledgeBasePage from './components/knowledge/KnowledgeBasePage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import SettingsPage from './components/settings/SettingsPage';

function SupportFlowApp() {
  const { activeNav } = useSupportFlow();

  if (activeNav === 'login') {
    return <LoginPage />;
  }

  const renderMainView = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'ticket-detail':
        return <TicketDetailPage />;
      case 'customers':
        return <CustomersPage />;
      case 'team':
        return <TeamPage />;
      case 'knowledge':
        return <KnowledgeBasePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="sf-shell">
      {/* 240px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="sf-main">
        <TopNav />
        <main className="sf-content">
          {renderMainView()}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <GlobalSearchModal />
      <CreateTicketModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <SupportFlowProvider>
      <SupportFlowApp />
    </SupportFlowProvider>
  );
}
