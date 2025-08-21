export const API_BASE_URL = 'http://localhost:8080';

export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

export const TICKET_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
];

export const STATUS_COLORS = {
  OPEN: '#ef4444', // red
  IN_PROGRESS: '#fbbf24', // yellow
  RESOLVED: '#22c55e', // green
  CLOSED: '#9ca3af', // gray
};

export const PRIORITY_SORT_MAPPING = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};
