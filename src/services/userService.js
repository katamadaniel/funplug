import axiosInstance from './axiosInstance';
const API_URL = process.env.REACT_APP_API_URL;
const USERS_API_URL = `${API_URL}/api/users`;

export const signup = async (formData) => {
  try {
    const response = await axiosInstance.post(`${USERS_API_URL}/signup`, formData);
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const login = async (formData) => {
  try {
    const response = await axiosInstance.post(`${USERS_API_URL}/login`, formData);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchProfile = async () => {
  try {
    const response = await axiosInstance.get(`${USERS_API_URL}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateProfile = async (formData) => {
  try {
    const response = await axiosInstance.put(`${USERS_API_URL}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await axiosInstance.post(`${USERS_API_URL}/resend-verification`, { email });
    return response.data;
  } catch (error) {
    console.error('Error resending verification:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axiosInstance.put(`${USERS_API_URL}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteUser = async (password) => {
  try {
    await axiosInstance.delete(`${USERS_API_URL}/profile`, {
      data: { password },
    });
  } catch (error) {
    console.error('Error deleting user:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logoutUser = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };
