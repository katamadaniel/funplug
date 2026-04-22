import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const ADMIN_API_URL = `${API_URL}/api/admins`;
const PROFILE_API_URL = `${ADMIN_API_URL}/profile`;
const REVIEWS_API_URL = `${API_URL}/api/reviews`;
const VERIFICATIONS_API_URL = `${API_URL}/api/users/verification-requests`;
const EMAIL_API_URL = `${API_URL}/api/emails`;
const PAYMENTS_API_URL = `${API_URL}/api/payments`;
const TASKS_API_URL = `${API_URL}/api/admin/tasks`;

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
  const response = await axiosInstance.delete(`${ADMIN_API_URL}/${adminId}`);
  return response.data;
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

  //Reviews moderation
export const fetchPendingReviews = async () => {
  const response = await axiosInstance.get(`${REVIEWS_API_URL}/pending`);
  return response.data;
};


export const updateReviewStatus = async (reviewId, status) => {
  const res = await axiosInstance.patch(`${REVIEWS_API_URL}/${reviewId}`, {
    status,
  });
  return res.data;
};

   //USER VERIFICATION
export const fetchVerificationRequests = async () => {
  const response = await axiosInstance.get(`${VERIFICATIONS_API_URL}`);
  return response.data;
};


export const updateUserVerificationStatus = async (userId, verificationStatus) => {
  const res = await axiosInstance.patch(`${VERIFICATIONS_API_URL}/${userId}`, {
    verificationStatus,
  });
  return res.data;
};

  //EMAIL LOGS
export const fetchEmailLogs = async (params = {}) => {
  const response = await axiosInstance.get(`${EMAIL_API_URL}`, { params });
  return response.data;
};

export const resendEmail = async (emailId) => {
  const response = await axiosInstance.post(`${EMAIL_API_URL}/${emailId}/resend`);
  return response.data;
};

export const respondToEmail = async (emailId, message) => {
  const response = await axiosInstance.post(`${EMAIL_API_URL}/${emailId}/respond`, { message });
  return response.data;
};

  //PAYMENTS AUDIT
  export const getPaymentsAudits = async (params) => {
    const response = await axiosInstance.get(`${PAYMENTS_API_URL}`, { params });
    return response.data;
  };
  
  export const getPaymentAuditDetails = async (auditId) => {
    const response = await axiosInstance.get(`${PAYMENTS_API_URL}/${auditId}`);
    return response.data;
  };
  
  export const markPaymentAuditRefunded = async (auditId, payload) => {
    const response = await axiosInstance.patch(
      `${PAYMENTS_API_URL}/${auditId}/mark-refunded`,
      payload
    );
    return response.data;
  };
  
  export const ignorePaymentAudit = async (auditId, payload) => {
    const response = await axiosInstance.patch(`${PAYMENTS_API_URL}/${auditId}/ignore`, payload);
    return response.data;
  };
  
  export const updatePaymentAuditNotes = async (auditId, payload) => {
    const response = await axiosInstance.patch(`${PAYMENTS_API_URL}/${auditId}/notes`, payload);
    return response.data;
  };
  
  export const getPaymentsAuditStats = async (params) => {
    const response = await axiosInstance.get(`${PAYMENTS_API_URL}/stats/summary`, {params});
    return response.data;
  };

  // ADMIN TASKS
export const assignAdminTask = async (payload) => {
  const res = await axiosInstance.post(TASKS_API_URL, payload);
  return res.data;
};

export const updateAdminTask = async (taskId, payload) => {
  const res = await axiosInstance.patch(`${TASKS_API_URL}/${taskId}`, payload);
  return res.data;
};

export const fetchAllAdminTasks = async () => {
  const res = await axiosInstance.get(TASKS_API_URL);
  return res.data;
};

export const fetchMyAdminTasks = async () => {
  const res = await axiosInstance.get(`${TASKS_API_URL}/my`);
  return res.data;
};

export const updateAdminTaskStatus = async (taskId, status) => {
  const res = await axiosInstance.patch(`${TASKS_API_URL}/${taskId}/status`, { status });
  return res.data;
};

export const deleteAdminTask = async (taskId) => {
  const res = await axiosInstance.delete(`${TASKS_API_URL}/${taskId}`);
  return res.data;
};
