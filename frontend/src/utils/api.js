import { apiRequest } from '../lib/queryClient';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// API utility functions
const api = {
  // Auth endpoints
  login: (credentials) => apiRequest('POST', '/api/auth/login', credentials),
  register: (userData) => apiRequest('POST', '/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return apiRequest('POST', '/api/auth/logout');
  },
  getProfile: () => apiRequest('GET', '/api/users/profile'),
  updateProfile: (data) => apiRequest('PUT', '/api/users/profile', data),
  changePassword: (data) => apiRequest('PUT', '/api/users/change-password', data),
  
  // Jobs endpoints
  getJobs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest('GET', `/api/jobs?${queryString}`);
  },
  getJob: (id) => apiRequest('GET', `/api/jobs/${id}`),
  
  // Applications endpoints
  getApplications: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest('GET', `/api/users/applications?${queryString}`);
  },
  applyToJob: (jobId, data) => apiRequest('POST', `/api/applications`, { ...data, job_id: jobId }),
  deleteApplication: (id) => apiRequest('DELETE', `/api/applications/${id}`),
};

export default api;
