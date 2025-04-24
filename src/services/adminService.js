// services/adminService.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const ADMIN_API_URL = `${API_URL}/api/admins`;

/**
 * Log in an admin user.
 * @param {string} email - Admin's email
 * @param {string} password - Admin's password
 * @returns {Promise<Object>} The response containing the token and admin data.
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await axios.post(`${ADMIN_API_URL}/login`, { email, password });
    // Store the token in localStorage
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Admin login failed.');
  }
};

 /**
  * Register a new admin user.
 * @param {string} name - Admin's name.
 * @param {string} email - Admin's email.
 * @param {string} password - Admin's password.
 * @returns {Promise<Object>} The response from the registration request.
 */
 export const registerAdmin = async (name, email, password) => {
  const response = await axios.post(`${ADMIN_API_URL}/register`, { name, email, password });
  return response.data;
};

/**
 * Fetch the profile of the currently logged-in admin.
 * @returns {Promise<Object>} The admin's profile data.
 */
export const fetchAdminProfile = async () => {
  const token = localStorage.getItem('adminToken');
  if (!token) throw new Error('Admin token not found.');

  try {
    const response = await axios.get(`${ADMIN_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch admin profile.');
  }
};

/**
 * Log out the currently logged-in admin.
 */
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

/**
 * Check if an admin is currently authenticated.
 * @returns {boolean} Whether the admin token is present in localStorage.
 */
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};
