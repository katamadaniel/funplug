import axios from 'axios';
const USERS_API_URL = 'http://localhost:5000/api/users';

// User related APIs
export const signup = async (formData) => {
  try {
    const response = await axios.post(`${USERS_API_URL}/signup`, formData);
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const login = async (formData) => {
  try {
    const response = await axios.post(`${USERS_API_URL}/login`, formData);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchProfile = async (token) => {
  try {
    const response = await axios.get(`${USERS_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateProfile = async (formData, token) => {
  try {
    const response = await axios.put(`${USERS_API_URL}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    localStorage.removeItem('token');

    await fetch(`${USERS_API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return Promise.resolve();
  } catch (error) {
    console.error('Error logging out:', error);
    return Promise.reject(error);
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${USERS_API_URL}/change-password`,
      { currentPassword, newPassword },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteUser = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${USERS_API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error.response ? error.response.data : error.message);
    throw error;
  }
};