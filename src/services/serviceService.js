import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const SERVICES_API_URL = `${API_URL}/api/services`;
const BOOKINGS_API_URL = `${API_URL}/api/service_bookings`;

export const createService = async (data, token, onProgress) => {
  try {
    const response = await axiosInstance.post(SERVICES_API_URL, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating venue:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchActiveServices = async () => {
  const res = await axiosInstance.get(`${SERVICES_API_URL}/active`);
  return res.data;
};

export const fetchServices = async (params = {}) => {
  try {
    const endpoint = `${SERVICES_API_URL}/recommended`;
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching events:",
      error.response ? error.response.data : error.message
    );
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

export const updateService = async (id, data, token, onProgress) => {
  try {
    const response = await axiosInstance.put(`${SERVICES_API_URL}/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
    },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      },    
    });
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
  try{
  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axiosInstance.get(SERVICES_API_URL, config);
  return response.data;
  } catch (error) {
    console.error('Error fetching service:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteServiceById = async (serviceId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axiosInstance.delete(`${SERVICES_API_URL}/${serviceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getBookingsByServiceId = async (serviceId) => {
  try{
  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axiosInstance.get(`${BOOKINGS_API_URL}?serviceId=${serviceId}`, config);
  return response.data;
  } catch (error) {
    console.error('Error fetching service bookings:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateServiceStatus = async (serviceId, status) => {
  const token = localStorage.getItem('adminToken');
  const response = await axiosInstance.patch(
    `${SERVICES_API_URL}/${serviceId}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
