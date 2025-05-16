import axios from 'axios';
import { decodeToken } from '../utils/decodeToken';

const axiosInstance = axios.create();

// Request Interceptor – attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    const activeToken = token || adminToken;
    if (activeToken) {
      const decoded = decodeToken(activeToken);
      const now = Date.now() / 1000;
      if (decoded?.exp && decoded.exp < now) {
        console.warn('Token expired. Clearing local storage.');
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('adminId');
      } else {
        config.headers.Authorization = `Bearer ${activeToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor – handle 401/403
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token invalid or expired — force logout
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('adminId');
      window.location.href = '/login'; // or '/admin' if admin
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
