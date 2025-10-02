import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
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
    // Handle common errors
    if (error.response?.status === 401) {
      // Only logout for auth-related endpoints, not for optional features
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/') || url.includes('/profile');
      
      if (isAuthEndpoint) {
        // Token expired or invalid for critical auth endpoints
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // For optional features like job-alerts, just log the error
        console.warn('401 error for optional feature:', url);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
