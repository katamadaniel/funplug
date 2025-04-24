import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const EVENTS_API_URL = `${API_URL}/api/events`;
const TICKET_PURCHASES_API_URL = `${API_URL}/api/ticket_purchases`;

export const createEvent = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.post(EVENTS_API_URL, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchEvents = async () => {
  try {
    const response = await axios.get(EVENTS_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchMyEvents = async (logoutCallback) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${EVENTS_API_URL}/myevents`, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Token expired or unauthorized. Logging out...');
      if (logoutCallback) logoutCallback(); // Trigger logout
    }
    throw error;
  }
};

export const fetchAllTicketPurchases = async () => { // Fetch all ticket purchases
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${TICKET_PURCHASES_API_URL}/purchases`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching all ticket purchases:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchTicketPurchases = async (eventId) => { // Fetch ticket purchases for a specific event
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${TICKET_PURCHASES_API_URL}?eventId=${eventId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket purchases:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateEvent = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.put(`${EVENTS_API_URL}/${id}`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.delete(`${EVENTS_API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error.response ? error.response.data : error.message);
    throw error;
  }
};
