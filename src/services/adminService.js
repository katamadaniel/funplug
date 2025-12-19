import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const ADMIN_API_URL = `${API_URL}/api/admins`;
const PROFILE_API_URL = `${ADMIN_API_URL}/profile`;

/**
 * Log in an admin user.
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await axiosInstance.post(`${ADMIN_API_URL}/login`, { email, password });

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
 */
export const registerAdmin = async (name, email, password) => {
  const response = await axiosInstance.post(`${ADMIN_API_URL}/register`, { name, email, password });
  return response.data;
};

/**
 * Fetch the profile of the currently logged-in admin.
 */
export const fetchAdminProfile = async () => {
  try {
    const response = await axiosInstance.get(PROFILE_API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch profile.');
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
 */
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

export const fetchAllAdmins = async () => {
  const response = await axiosInstance.get(ADMIN_API_URL);
  return response.data;
};

export const createAdmin = async (adminData) => {
  const response = await axiosInstance.post(ADMIN_API_URL, adminData);
  return response.data;
};

export const deleteAdminById = async (adminId) => {
  await axiosInstance.delete(`${ADMIN_API_URL}/${adminId}`);
};

export const updateProfile = async (data) => {
  const response = await axiosInstance.put(PROFILE_API_URL, data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axiosInstance.post(`${PROFILE_API_URL}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const removeAvatar = async () => {
  const response = await axiosInstance.delete(`${PROFILE_API_URL}/avatar`);
  return response.data;
};

export const fetchPendingReviews = async () => {
  const res = await axiosInstance.get(
    `${API_URL}/api/admin/reviews/pending`
  );
  return res.data;
};

export const approveReview = async (reviewId) => {
  const res = await axiosInstance.post(
    `${API_URL}/api/admin/reviews/${reviewId}/approve`
  );
  return res.data;
};

export const rejectReview = async (reviewId) => {
  const res = await axiosInstance.post(
    `${API_URL}/api/admin/reviews/${reviewId}/reject`
  );
  return res.data;
};

   //USER VERIFICATION
export const fetchPendingVerifications = async () => {
  const res = await axiosInstance.get(
    `${API_URL}/api/admin/users/verifications`
  );
  return res.data;
};

export const approveVerification = async (userId) => {
  const res = await axiosInstance.post(
    `${API_URL}/api/admin/users/verifications/${userId}/approve`
  );
  return res.data;
};

export const rejectVerification = async (userId) => {
  const res = await axiosInstance.post(
    `${API_URL}/api/admin/users/verifications/${userId}/reject`
  );
  return res.data;
};
export default {
  fetchAdminProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  fetchPendingReviews,
  approveReview,
  rejectReview,
  fetchPendingVerifications,
  approveVerification,
  rejectVerification,
};
