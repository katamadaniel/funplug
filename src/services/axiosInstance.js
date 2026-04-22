import axios from 'axios';
import { decodeToken } from '../utils/decodeToken';

const axiosInstance = axios.create({
  // Automatically include credentials with requests
  withCredentials: false,
});

// Request Interceptor – attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    const activeToken = token || adminToken;
    
    if (activeToken) {
      try {
        const decoded = decodeToken(activeToken);
        const now = Date.now() / 1000;
        
        // Check if token is expired
        if (decoded?.exp && decoded.exp < now) {
          console.warn('Token expired. Clearing local storage.');
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('adminId');
          // Redirect to login
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        } else {
          config.headers.Authorization = `Bearer ${activeToken}`;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor – handle 401/403/429
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // Handle 401 Unauthorized
      if (status === 401) {
        // Token invalid or expired — force logout
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('adminId');
        window.location.href = '/login';
      }
      // Handle 403 Forbidden
      else if (status === 403) {
        console.warn('Access forbidden:', error.response.data);
      }
      // Handle 429 Too Many Requests
      else if (status === 429) {
        console.warn('Rate limit exceeded');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
