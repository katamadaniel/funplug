import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const SERVICES_API_URL = `${API_URL}/api/services`;
const BOOKINGS_API_URL = `${API_URL}/api/service_bookings`;

export const createService = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.post(SERVICES_API_URL, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating venue:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchServices = async () => {
  try {
    const response = await axiosInstance.get(SERVICES_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching cards:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchMyServices = async (logoutCallback) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.get(`${SERVICES_API_URL}/myServices`, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Token expired or unauthorized. Logging out...');
    if (logoutCallback) logoutCallback(); // Trigger logout
  }    
    throw error;
  }
};

export const fetchAllServiceBookings = async () => { // Fetch all bookings
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
    console.error('Error fetching all service bookings:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchServiceBookings = async (serviceId) => { // Fetch bookings for a specific service
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.get(`${BOOKINGS_API_URL}?serviceId=${serviceId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching service bookings:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateService = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.put(`${SERVICES_API_URL}/${id}`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating service:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.delete(`${SERVICES_API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting service:', error.response ? error.response.data : error.message);
    throw error;
  }
};

  //Admin functions

export const getAllServices = async () => {
  const response = await axiosInstance.get(SERVICES_API_URL);
  return response.data;
};

export const deleteServiceById = async (serviceId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axiosInstance.delete(`${SERVICES_API_URL}/${serviceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getBookingsByServiceId = async (serviceId) => {
  const response = await axiosInstance.get(`${BOOKINGS_API_URL}?serviceId=${serviceId}`);
  return response.data;
};
