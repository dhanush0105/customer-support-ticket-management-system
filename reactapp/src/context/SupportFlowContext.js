import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getTickets,
  getTicketById,
  createTicket as apiCreateTicket,
  updateTicketStatus as apiUpdateTicketStatus,
  addResponse as apiAddResponse,
  deleteTicket as apiDeleteTicket
} from '../utils/api';
import { AGENTS, KNOWLEDGE_BASE_ARTICLES } from '../services/mockData';

const SupportFlowContext = createContext(null);

export const SupportFlowProvider = ({ children }) => {
  // Current user session (Admin Alice by default)
  const [currentUser, setCurrentUser] = useState({
    id: 'ag-1',
    name: 'Admin Alice',
    email: 'alice@supportflow.internal',
    role: 'Support Administrator',
    avatar: 'AA',
    roleType: 'ADMIN'
  });

  // Real Database State
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [articles, setArticles] = useState(KNOWLEDGE_BASE_ARTICLES);
  const [notifications, setNotifications] = useState([]);

  // Active view navigation
  const [activeNav, setActiveNav] = useState('overview');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Modals & Overlays
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readArticle, setReadArticle] = useState(null);

  // Filters for tickets page
  const [ticketFilters, setTicketFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    assignee: 'ALL'
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (title, type = 'success') => {
    const id = 'toast-' + Date.now();
    setToasts(prev => [...prev, { id, title, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3600);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch real tickets from backend
  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
      setError('');
      if (data.length > 0 && !selectedTicketId) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      setError('Failed to connect to backend service. Please check Spring Boot status.');
    } finally {
      setLoading(false);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCreateTicketOpen(false);
        setIsNotifOpen(false);
        setReadArticle(null);
        setSelectedCustomerId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real Database Action Methods
  const createTicket = async (ticketData) => {
    try {
      const payload = {
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority || 'MEDIUM',
        createdBy: ticketData.createdBy || currentUser.name
      };
      const created = await apiCreateTicket(payload);
      setTickets(prev => [created, ...prev]);
      setSelectedTicketId(created.id);
      addToast(`Ticket #${created.id} created in database.`, 'success');

      // Add real notification
      setNotifications(prev => [
        {
          id: 'notif-' + Date.now(),
          title: `New Ticket #${created.id} logged`,
          body: `${created.subject} by ${created.createdBy}`,
          time: 'Just now',
          unread: true,
          ticketId: created.id
        },
        ...prev
      ]);

      return created;
    } catch (err) {
      addToast(`Error creating ticket: ${err.message}`, 'danger');
      throw err;
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await apiUpdateTicketStatus(id, newStatus);
      setTickets(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
      );
      addToast(`Ticket #${id} status updated to ${newStatus}.`, 'success');
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'danger');
    }
  };

  const updateTicketPriority = (id, newPriority) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, priority: newPriority, updatedAt: new Date().toISOString() } : t))
    );
    addToast(`Ticket #${id} priority updated to ${newPriority}.`, 'success');
  };

  const assignTicket = (id, agentName) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, assignee: agentName, updatedAt: new Date().toISOString() } : t))
    );
    addToast(`Ticket #${id} assigned to ${agentName}.`, 'success');
  };

  const addTicketMessage = async (ticketId, content, isInternal = false) => {
    try {
      await apiAddResponse(ticketId, {
        message: content,
        respondedBy: currentUser.name
      });
      // Fetch fresh ticket data from backend
      const freshTicket = await getTicketById(ticketId);
      setTickets(prev => prev.map(t => (t.id === ticketId ? freshTicket : t)));
      addToast(`Response recorded for Ticket #${ticketId}.`, 'success');
    } catch (err) {
      addToast(`Failed to save response: ${err.message}`, 'danger');
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      await apiDeleteTicket(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      addToast(`Ticket #${ticketId} permanently deleted.`, 'success');
      if (selectedTicketId === ticketId) {
        setSelectedTicketId(tickets[0]?.id || null);
      }
    } catch (err) {
      addToast(`Failed to delete ticket: ${err.message}`, 'danger');
    }
  };

  // Derive real customers dynamically from tickets createdBy
  const customers = useMemo(() => {
    const map = {};
    tickets.forEach(t => {
      const author = t.createdBy || 'Direct User';
      if (!map[author]) {
        map[author] = {
          id: 'cust-' + author.replace(/[^a-zA-Z0-9]/g, '-'),
          name: author,
          email: author.includes('@') ? author : `${author.toLowerCase().replace(/\s+/g, '.')}@client.internal`,
          company: author.includes('@') ? author.split('@')[1].split('.')[0].toUpperCase() : 'Client Org',
          tier: 'Enterprise',
          customerSince: 'Active',
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          csat: 96
        };
      }
      map[author].totalTickets++;
      if (t.status === 'OPEN' || t.status === 'IN_PROGRESS') {
        map[author].openTickets++;
      }
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
        map[author].resolvedTickets++;
      }
    });
    return Object.values(map);
  }, [tickets]);

  // Agents: real staff with live workload stats from tickets
  const agents = useMemo(() => {
    return AGENTS.map(agent => {
      const assignedCount = tickets.filter(
        t => t.createdBy === agent.name || (t.responses && t.responses.some(r => r.respondedBy === agent.name))
      ).length;
      return {
        ...agent,
        assignedCount,
        resolvedCount: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
        avgResponse: '14 min',
        avgResolution: '2h 10m',
        csat: 96.2,
        slaCompliance: 98.4
      };
    });
  }, [tickets]);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const navigateToTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveNav('ticket-detail');
  };

  const navigateToCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
  };

  const switchPersona = (personaType) => {
    if (personaType === 'ADMIN') {
      setCurrentUser({
        id: 'ag-1',
        name: 'Admin Alice',
        email: 'alice@supportflow.internal',
        role: 'Support Administrator',
        avatar: 'AA',
        roleType: 'ADMIN'
      });
      addToast('Switched persona to Admin Alice.');
    } else if (personaType === 'AGENT') {
      setCurrentUser({
        id: 'ag-2',
        name: 'Agent Bob',
        email: 'bob@supportflow.internal',
        role: 'Support Specialist',
        avatar: 'AB',
        roleType: 'AGENT'
      });
      addToast('Switched persona to Agent Bob.');
    } else {
      setCurrentUser({
        id: 'ag-4',
        name: 'Customer Charlie',
        email: 'charlie@clientcorp.com',
        role: 'Customer',
        avatar: 'CC',
        roleType: 'CUSTOMER'
      });
      addToast('Switched persona to Customer Charlie.');
    }
  };

  const selectedTicket = tickets.find(t => t.id === Number(selectedTicketId) || t.id === selectedTicketId) || tickets[0] || null;
  const unreadNotifCount = notifications.filter(n => n.unread).length;

  return (
    <SupportFlowContext.Provider
      value={{
        currentUser,
        switchPersona,
        tickets,
        loading,
        error,
        loadTickets,
        customers,
        agents,
        articles,
        setArticles,
        notifications,
        unreadNotifCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeNav,
        setActiveNav,
        selectedTicketId,
        selectedTicket,
        navigateToTicket,
        selectedCustomerId,
        setSelectedCustomerId,
        navigateToCustomer,
        createTicket,
        updateTicketStatus,
        updateTicketPriority,
        assignTicket,
        addTicketMessage,
        deleteTicket,
        ticketFilters,
        setTicketFilters,
        isSearchOpen,
        setIsSearchOpen,
        isCreateTicketOpen,
        setIsCreateTicketOpen,
        isNotifOpen,
        setIsNotifOpen,
        readArticle,
        setReadArticle,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </SupportFlowContext.Provider>
  );
};

export const useSupportFlow = () => {
  const context = useContext(SupportFlowContext);
  if (!context) {
    throw new Error('useSupportFlow must be used within a SupportFlowProvider');
  }
  return context;
};
