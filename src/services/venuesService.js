// services/venuesService.js
import axios from 'axios';

const VENUES_API_URL = 'http://localhost:5000/api/venues';
const BOOKINGS_API_URL = 'http://localhost:5000/api/venue_bookings';

export const createVenue = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.post(VENUES_API_URL, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating venue:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchVenues = async () => {
  try {
    const response = await axios.get(VENUES_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching venues:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchMyVenues = async (logoutCallback) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${VENUES_API_URL}/myvenues`, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Token expired or unauthorized. Logging out...');
    if (logoutCallback) logoutCallback(); // Trigger logout
  }    
    throw error;
  }
};

export const fetchAllVenueBookings = async () => { // Fetch all bookings
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${BOOKINGS_API_URL}/bookings`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching all venue bookings:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchVenueBookings = async (venueId) => { // Fetch bookings for a specific venue
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${BOOKINGS_API_URL}?venueId=${venueId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching venue bookings:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateVenue = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.put(`${VENUES_API_URL}/${id}`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating venue:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteVenue = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.delete(`${VENUES_API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting venue:', error.response ? error.response.data : error.message);
    throw error;
  }
};
