import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const PERFORMANCES_API_URL = `${API_URL}/api/performances`;
const BOOKINGS_API_URL = `${API_URL}/api/performance_bookings`;

export const createCard = async (data, token, onProgress) => {
  try {
    const response = await axiosInstance.post(PERFORMANCES_API_URL, data, {
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
    console.error('Error creating card:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchActiveCards = async () => {
  const res = await axiosInstance.get(`${PERFORMANCES_API_URL}/active`);
  return res.data;
};

export const fetchPerformanceById = async (performanceId) => {
  try {
    const response = await axiosInstance.get(`${PERFORMANCES_API_URL}/${performanceId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching performance details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const fetchCards = async (params = {}) => {
  try {
    const endpoint = `${PERFORMANCES_API_URL}/recommended`;
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

export const fetchMyCards = async (logoutCallback) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.get(`${PERFORMANCES_API_URL}/myCards`, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Token expired or unauthorized. Logging out...');
    if (logoutCallback) logoutCallback(); // Trigger logout
  }    
    throw error;
  }
};

export const fetchAllCardBookings = async () => { // Fetch all bookings
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
    console.error('Error fetching all card bookings:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchCardBookings = async (cardId) => { // Fetch bookings for a specific card
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.get(`${BOOKINGS_API_URL}?cardId=${cardId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching card bookings:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateCard = async (id, data, token, onProgress) => {
  try {
    const response = await axiosInstance.put(`${PERFORMANCES_API_URL}/${id}`, data, {
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
    console.error('Error updating card:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteCard = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.delete(`${PERFORMANCES_API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting card:', error.response ? error.response.data : error.message);
    throw error;
  }
};

  //Admin functions
export const getAllCards = async () => {
  try{
    const token = localStorage.getItem('adminToken');
    const config = { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    };
    const response = await axiosInstance.get(PERFORMANCES_API_URL, config);
    return response.data;
    } catch (error) {
      console.error('Error fetching cards:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

export const deleteCardById = async (cardId) => {
  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axiosInstance.delete(
    `${PERFORMANCES_API_URL}/${cardId}`, config);
  return response.data;
};

export const getBookingsByCardId = async (cardId) => {
  try{
    const token = localStorage.getItem('adminToken');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axiosInstance.get(`${BOOKINGS_API_URL}?cardId=${cardId}`, config);
    return response.data;
    } catch (error) {
      console.error('Error fetching card bookings:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

export const updatePerformanceStatus = async (cardId, status) => {
  const token = localStorage.getItem('adminToken');
  const response = await axiosInstance.patch(
    `${PERFORMANCES_API_URL}/${cardId}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
