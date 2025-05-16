import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const VENUES_API_URL = `${API_URL}/api/venues`;
const BOOKINGS_API_URL = `${API_URL}/api/venue_bookings`;

export const createVenue = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.post(VENUES_API_URL, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating venue:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchVenues = async () => {
  try {
    const response = await axiosInstance.get(VENUES_API_URL);
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
    const response = await axiosInstance.get(`${VENUES_API_URL}/myvenues`, config);
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
    const response = await axiosInstance.get(`${BOOKINGS_API_URL}/bookings`, config);
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
    const response = await axiosInstance.get(`${BOOKINGS_API_URL}?venueId=${venueId}`, config);
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
    const response = await axiosInstance.put(`${VENUES_API_URL}/${id}`, formData, config);
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
    const response = await axiosInstance.delete(`${VENUES_API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting venue:', error.response ? error.response.data : error.message);
    throw error;
  }
};

  //Admin functions

export const getAllVenues = async () => {
  const response = await axiosInstance.get(VENUES_API_URL);
  return response.data;
};

export const deleteVenueById = async (venueId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axiosInstance.delete(`${VENUES_API_URL}/${venueId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVenueBookingsByVenueId = async (venueId) => {
  const response = await axiosInstance.get(`${BOOKINGS_API_URL}?venueId=${venueId}`);
  return response.data;
};
