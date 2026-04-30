import axiosInstance from './axiosInstance';
import { parseApiError } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL;
const FOLLOW_API_URL = `${API_URL}/api/follow`;

/**
 * Follow a user (guest or authenticated)
 * @param {string} userId - ID of user to follow
 * @param {object} data - { name, email } for guest or empty for authenticated users
 */
export const followUser = async (userId, data = {}) => {
  try {
    const response = await axiosInstance.post(`${FOLLOW_API_URL}/${userId}/follow`, data);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Unfollow a user (authenticated users only)
 * @param {string} userId - ID of user to unfollow
 */
export const unfollowUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`${FOLLOW_API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get follower count for a user
 * @param {string} userId - ID of user
 */
export const getFollowerCount = async (userId) => {
  try {
    const response = await axiosInstance.get(`${FOLLOW_API_URL}/${userId}/count`);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get paginated followers list
 * @param {string} userId - ID of user
 * @param {number} page - Page number (0-indexed)
 */
export const getFollowers = async (userId, page = 0) => {
  try {
    const response = await axiosInstance.get(
      `${FOLLOW_API_URL}/${userId}/followers`,
      { params: { page } }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Check if email is following a user
 * @param {string} userId - ID of user
 * @param {string} email - Email to check
 */
export const isFollowing = async (userId, email) => {
  try {
    const response = await axiosInstance.get(
      `${FOLLOW_API_URL}/${userId}/is-following`,
      { params: { email } }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Send broadcast email to all followers
 * @param {string} userId - ID of creator/user
 * @param {object} data - { subject, message, htmlContent }
 */
export const sendBroadcastEmail = async (userId, data) => {
  try {
    const response = await axiosInstance.post(
      `${FOLLOW_API_URL}/${userId}/broadcast`,
      data
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get follower analytics for a user
 * @param {string} userId - ID of user
 */
export const getFollowerAnalytics = async (userId) => {
  try {
    const response = await axiosInstance.get(
      `${FOLLOW_API_URL}/${userId}/analytics`
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get follower growth chart data (last 30 days)
 * @param {string} userId - ID of user
 */
export const getFollowerGrowth = async (userId) => {
  try {
    const response = await axiosInstance.get(
      `${FOLLOW_API_URL}/${userId}/growth`
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Unsubscribe from emails via token link
 * @param {string} token - Unsubscribe token
 */
export const unsubscribeFromEmails = async (token) => {
  try {
    const response = await axiosInstance.get(
      `${FOLLOW_API_URL}/unsubscribe/${token}`
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Unfollow via email link
 * @param {string} token - Unfollow token
 */
export const unfollowFromEmail = async (token) => {
  try {
    const response = await axiosInstance.get(
      `${FOLLOW_API_URL}/unfollow/${token}`
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};
