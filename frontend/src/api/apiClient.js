import axios from 'axios';
import API_BASE_URL from '../services/apiConfig';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for slow backend responses
  // Don't set default Content-Type - let browser set it based on data type
});

// Request interceptor to add auth token and set content type
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set Content-Type for JSON data, but let browser set it for FormData
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers['retry-after'];
      const message = error.response?.data?.message || 'Too many requests';
      console.log('⚠️ Rate limited:', message);
      if (retryAfter) {
        console.log(`💡 Retry after ${retryAfter} seconds`);
      }
      return Promise.reject(error);
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      const url = error.config?.url || '';
      
      console.log('🔍 401 Error Details:', {
        url,
        code: errorCode,
        message: error.response?.data?.message
      });
      
      // Check if it's a token expiry or invalid token
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'INVALID_TOKEN_FORMAT') {
        console.log('🔄 Token issue detected, clearing auth data and redirecting to login');
        
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Show user-friendly message
        if (errorCode === 'TOKEN_EXPIRED') {
          alert('Your session has expired. Please log in again.');
        } else {
          alert('Authentication error. Please log in again.');
        }
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // Only logout for auth-related endpoints, not for optional features
        const isAuthEndpoint = url.includes('/auth/') || url.includes('/profile');
        
        if (isAuthEndpoint) {
          // Token expired or invalid for critical auth endpoints
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } else {
          // For optional features like job-alerts, just log the error
          console.warn('401 error for optional feature:', url);
        }
      }
    }
    
    // Handle network errors and timeouts
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('⚠️ Request timeout - backend may be slow or unavailable');
        console.log('💡 Consider using mock mode for testing');
      } else {
        console.error('Network error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
