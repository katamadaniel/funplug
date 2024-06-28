// src/services/userService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

export const signup = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/Signup`, formData); // Adjusted to lowercase 'signup'
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const login = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/Login`, formData); // Adjusted to lowercase 'login'
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/Profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  // Add any necessary logic for logging out, such as clearing tokens or informing the server
  return Promise.resolve();
};