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
  getProfile: () => apiRequest('GET', '/api/auth/me'),
  updateProfile: (data) => apiRequest('PUT', '/api/users/profile', data),
  changePassword: (data) => apiRequest('PUT', '/api/users/change-password', data),
  getProfileAnalytics: () => apiRequest('GET', '/api/users/profile/analytics'),
  getProfileActivity: () => apiRequest('GET', '/api/users/profile/activity'),
  
  // OTP verification endpoints
  sendEmailOTP: (email) => apiRequest('POST', '/api/auth/send-email-otp', { email }),
  verifyEmailOTP: (email, otp) => apiRequest('POST', '/api/auth/verify-email-otp', { email, otp }),
  sendSMSOTP: (phone) => apiRequest('POST', '/api/auth/send-sms-otp', { phone }),
  verifySMSOTP: (phone, otp) => apiRequest('POST', '/api/auth/verify-sms-otp', { phone, otp }),
  
  // Password reset endpoints
  forgotPassword: (email) => apiRequest('POST', '/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiRequest('POST', '/api/auth/reset-password', { token, newPassword }),
  
  // Jobs endpoints
  getJobs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest('GET', `/api/jobs?${queryString}`);
  },
  getJob: (id) => apiRequest('GET', `/api/jobs/${id}`),
  
  // Companies endpoints
  getCompanies: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest('GET', `/api/companies?${queryString}`);
  },
  getCompany: (id) => apiRequest('GET', `/api/companies/${id}`),
  
  // Applications endpoints
  getApplications: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiRequest('GET', `/api/applications${queryString ? '?' + queryString : ''}`);
  },
  applyToJob: (jobId, data) => apiRequest('POST', `/api/applications`, { ...data, job_id: jobId }),
  deleteApplication: (id) => apiRequest('DELETE', `/api/applications/${id}`),
  
  // Recruiter endpoints
  createJob: (data) => apiRequest('POST', '/api/jobs', data),
  updateJob: (id, data) => apiRequest('PUT', `/api/jobs/${id}`, data),
  deleteJob: (id) => apiRequest('DELETE', `/api/jobs/${id}`),
};

export default api;
