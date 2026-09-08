import axios from 'axios';
import { API_BASE_URL } from './constants';

export const getTickets = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tickets`);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch tickets');
  }
};

export const getTicketById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tickets/${id}`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) throw new Error('Ticket not found');
    throw new Error(err.response?.data?.message || 'Failed to fetch ticket');
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tickets`, ticketData);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to create ticket');
  }
};

export const updateTicketStatus = async (id, newStatus) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/tickets/${id}/status`, { status: newStatus });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to update status');
  }
};

export const addResponse = async (ticketId, responseData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tickets/${ticketId}/responses`, responseData);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to add response');
  }
};

export const getResponsesForTicket = async (ticketId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tickets/${ticketId}/responses`);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch responses');
  }
};

export const deleteTicket = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/tickets/${id}`);
    return true;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to delete ticket');
  }
};
