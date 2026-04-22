import axiosInstance from './axiosInstance';
import { parseApiError } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL;
const USERS_API_URL = `${API_URL}/api/users`;

/**
 * Sign up a new user
 * @param {Object} formData - User signup data
 * @returns {Promise<Object>} - Response with token and user data
 * @throws {Object} - Error with parsed validation errors
 */
export const signup = async (formData) => {
  try {
    const response = await axiosInstance.post(`${USERS_API_URL}/signup`, formData);
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error signing up:', parsedError);
    throw parsedError;
  }
};

/**
 * Login user
 * @param {Object} formData - User login credentials (email, password)
 * @returns {Promise<Object>} - Response with token and user data
 * @throws {Object} - Error with parsed validation errors
 */
export const login = async (formData) => {
  try {
    const response = await axiosInstance.post(`${USERS_API_URL}/login`, formData);
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error logging in:', parsedError);
    throw parsedError;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get(USERS_API_URL);
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error fetching users:', parsedError);
    throw parsedError;
  }
};

export const fetchProfile = async () => {
  try {
    const response = await axiosInstance.get(`${USERS_API_URL}/profile`);
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error fetching user profile:', parsedError);
    throw parsedError;
  }
};

/**
 * Update user profile
 * @param {FormData} formData - Profile data including avatar file
 * @returns {Promise<Object>} - Updated profile
 * @throws {Object} - Error with parsed validation errors
 */
export const updateProfile = async (formData) => {
  try {
    const response = await axiosInstance.put(`${USERS_API_URL}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error updating profile:', parsedError);
    throw parsedError;
  }
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<Object>} - Response
 * @throws {Object} - Error with parsed validation errors
 */
export const resendVerification = async (email) => {
  try {
    const response = await axiosInstance.post(`${USERS_API_URL}/resend-verification`, { email });
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error resending verification:', parsedError);
    throw parsedError;
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Current and new password
 * @returns {Promise<Object>} - Response
 * @throws {Object} - Error with parsed validation errors
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axiosInstance.put(`${USERS_API_URL}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error changing password:', parsedError);
    throw parsedError;
  }
};

export const deleteUser = async (password) => {
  try {
    await axiosInstance.delete(`${USERS_API_URL}/profile`, {
      data: { password },
    });
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error deleting user:', parsedError);
    throw parsedError;
  }
};

export const logoutUser = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

    //Admin functions
/**
 * Ban a user
 * @param {string} userId - User ID
 * @param {string} reason - Ban reason
 * @param {number} duration - Ban duration in days
 * @returns {Promise<Object>} - Response
 * @throws {Object} - Error with parsed validation errors
 */
export const banUser = async (userId, reason, duration) => {
  try {
    return await axiosInstance.put(`${USERS_API_URL}/${userId}/ban`, { reason, duration });
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error banning user:', parsedError);
    throw parsedError;
  }
};

export const unbanUser = async (userId) => {
  try {
    return await axiosInstance.put(`${USERS_API_URL}/${userId}/unban`);
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error unbanning user:', parsedError);
    throw parsedError;
  }
};

/**
 * Send warning to user
 * @param {string} userId - User ID
 * @param {string} message - Warning message
 * @returns {Promise<Object>} - Response
 * @throws {Object} - Error with parsed validation errors
 */
export const warnUser = async (userId, message) => {
  try {
    return await axiosInstance.post(`${USERS_API_URL}/${userId}/warn`, { message });
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error warning user:', parsedError);
    throw parsedError;
  }
};

/**
 * Reset user password (admin action)
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Response
 * @throws {Object} - Error with parsed validation errors
 */
export const resetUserPassword = async (userId, newPassword) => {
  try {
    return await axiosInstance.put(`${USERS_API_URL}/${userId}/reset-password`, { newPassword });
  } catch (error) {
    const parsedError = parseApiError(error);
    console.error('Error resetting user password:', parsedError);
    throw parsedError;
  }
};

export const getAllUsers = async () => {
  const response = await axiosInstance.get(`${USERS_API_URL}`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`${USERS_API_URL}/${userId}`);
  return response.data;
};

export const fetchRecentUsers = async () => {
  let visitorId = localStorage.getItem("visitorId");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("visitorId", visitorId);
  }

  const response = await axiosInstance.get(`${USERS_API_URL}/recent`, {
    params: { visitorId },
  });

  return response.data;
};