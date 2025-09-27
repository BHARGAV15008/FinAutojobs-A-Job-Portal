import { apiRequest } from '../lib/queryClient';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Helper function to handle API responses
const handleResponse = async (responsePromise) => {
  const response = await responsePromise;
  return await response.json();
};

// API utility functions
const api = {
  // Auth endpoints
  login: (credentials) => handleResponse(apiRequest('POST', '/api/auth/login', credentials)),
  register: (userData) => handleResponse(apiRequest('POST', '/api/auth/register', userData)),
  logout: () => {
    localStorage.removeItem('token');
    return handleResponse(apiRequest('POST', '/api/auth/logout'));
  },
  getProfile: () => handleResponse(apiRequest('GET', '/api/auth/profile')),
  updateProfile: (data) => handleResponse(apiRequest('PUT', '/api/auth/profile', data)),
  changePassword: (data) => handleResponse(apiRequest('PUT', '/api/users/change-password', data)),
  getProfileAnalytics: () => handleResponse(apiRequest('GET', '/api/users/profile/analytics')),
  getProfileActivity: () => handleResponse(apiRequest('GET', '/api/users/profile/activity')),
  
  // OTP verification endpoints
  sendEmailOTP: (email) => handleResponse(apiRequest('POST', '/api/auth/send-email-otp', { email })),
  verifyEmailOTP: (email, otp) => handleResponse(apiRequest('POST', '/api/auth/verify-email-otp', { email, otp })),
  sendSMSOTP: (phone) => handleResponse(apiRequest('POST', '/api/auth/send-sms-otp', { phone })),
  verifySMSOTP: (phone, otp) => handleResponse(apiRequest('POST', '/api/auth/verify-sms-otp', { phone, otp })),
  
  // Password reset endpoints
  forgotPassword: (email) => handleResponse(apiRequest('POST', '/api/auth/forgot-password', { email })),
  resetPassword: (token, newPassword) => handleResponse(apiRequest('POST', '/api/auth/reset-password', { token, newPassword })),
  
  // Jobs endpoints
  getJobs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return handleResponse(apiRequest('GET', `/api/jobs?${queryString}`));
  },
  getJob: (id) => handleResponse(apiRequest('GET', `/api/jobs/${id}`)),
  
  // Companies endpoints
  getCompanies: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return handleResponse(apiRequest('GET', `/api/companies?${queryString}`));
  },
  getCompany: (id) => handleResponse(apiRequest('GET', `/api/companies/${id}`)),
  
  // Applications endpoints
  getApplications: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return handleResponse(apiRequest('GET', `/api/applications${queryString ? '?' + queryString : ''}`));
  },
  applyToJob: (jobId, data) => handleResponse(apiRequest('POST', `/api/applications`, { ...data, job_id: jobId })),
  deleteApplication: (id) => handleResponse(apiRequest('DELETE', `/api/applications/${id}`)),
  
  // Recruiter endpoints
  createJob: (data) => handleResponse(apiRequest('POST', '/api/jobs', data)),
  updateJob: (id, data) => handleResponse(apiRequest('PUT', `/api/jobs/${id}`, data)),
  deleteJob: (id) => handleResponse(apiRequest('DELETE', `/api/jobs/${id}`)),
};

export default api;
