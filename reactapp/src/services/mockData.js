// SupportFlow - Real Service Constants & Documentation

export const CATEGORIES = [
  'General',
  'Technical',
  'Billing',
  'Account',
  'Payment',
  'Shipping',
  'Product',
  'Other'
];

export const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

// Real staff roster for SupportFlow
export const AGENTS = [
  {
    id: 'ag-1',
    name: 'Admin Alice',
    email: 'alice@supportflow.internal',
    role: 'Support Administrator',
    status: 'Online',
    avatar: 'AA'
  },
  {
    id: 'ag-2',
    name: 'Agent Bob',
    email: 'bob@supportflow.internal',
    role: 'Support Specialist',
    status: 'Online',
    avatar: 'AB'
  },
  {
    id: 'ag-3',
    name: 'Sarah Specialist',
    email: 'sarah@supportflow.internal',
    role: 'Tier-2 Technical Engineer',
    status: 'Busy',
    avatar: 'SS'
  },
  {
    id: 'ag-4',
    name: 'Customer Charlie',
    email: 'charlie@clientcorp.com',
    role: 'Enterprise Client',
    status: 'Online',
    avatar: 'CC'
  }
];

// Factual System Documentation
export const KNOWLEDGE_BASE_ARTICLES = [
  {
    id: 'art-1',
    category: 'General',
    title: 'SupportFlow User Guide & System Overview',
    views: 124,
    updatedAt: 'Today',
    readTime: '3 min read',
    content: 'Welcome to SupportFlow. This enterprise portal connects directly to the backend support database. You can track tickets, monitor SLAs, triage incoming requests, post public responses to customers, and log private internal notes.'
  },
  {
    id: 'art-2',
    category: 'Technical',
    title: 'Ticket Lifecycle: OPEN, IN_PROGRESS, RESOLVED, and CLOSED',
    views: 89,
    updatedAt: 'Today',
    readTime: '2 min read',
    content: 'Tickets transition through standard ITIL lifecycle states: OPEN (newly logged, awaiting response), IN_PROGRESS (staff assigned and troubleshooting), RESOLVED (solution delivered), and CLOSED (verified and finalized).'
  },
  {
    id: 'art-3',
    category: 'Technical',
    title: 'REST API Integration and Database Sync',
    views: 156,
    updatedAt: 'Today',
    readTime: '4 min read',
    content: 'SupportFlow frontend interacts with the Spring Boot REST API at http://localhost:8080/api/tickets. All ticket creation, status patches, and response logging persist directly to MySQL.'
  },
  {
    id: 'art-4',
    category: 'Billing',
    title: 'Invoice and Billing Inquiry Handling SOP',
    views: 45,
    updatedAt: 'Yesterday',
    readTime: '3 min read',
    content: 'Standard operating procedures for managing corporate invoice queries, tax identification verification, and payment gateway reconcilement.'
  }
];
