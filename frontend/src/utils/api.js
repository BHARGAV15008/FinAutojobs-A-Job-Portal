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
  login: (credentials) => handleResponse(apiRequest('POST', '/auth/login', credentials)),
  register: (userData) => handleResponse(apiRequest('POST', '/auth/register', userData)),
  logout: () => {
    localStorage.removeItem('token');
    return handleResponse(apiRequest('POST', '/auth/logout'));
  },
  getProfile: () => handleResponse(apiRequest('GET', '/auth/profile')),
  updateProfile: (data) => handleResponse(apiRequest('PUT', '/auth/profile', data)),
  changePassword: (data) => handleResponse(apiRequest('PUT', '/auth/change-password', data)),
  getProfileAnalytics: () => handleResponse(apiRequest('GET', '/users/profile/analytics')),
  getProfileActivity: () => handleResponse(apiRequest('GET', '/users/profile/activity')),
  
  // OTP verification endpoints
  sendEmailOTP: (email) => handleResponse(apiRequest('POST', '/otp/send', { email, purpose: 'registration', userData: { firstName: 'User' } })),
  verifyEmailOTP: (email, otp) => handleResponse(apiRequest('POST', '/otp/verify', { email, otp, purpose: 'registration' })),
  sendSMSOTP: (phone) => handleResponse(apiRequest('POST', '/auth/send-sms-otp', { phone })),
  verifySMSOTP: (phone, otp) => handleResponse(apiRequest('POST', '/auth/verify-sms-otp', { phone, otp })),
  
  // Password reset endpoints
  forgotPassword: (email) => handleResponse(apiRequest('POST', '/auth/forgot-password', { email })),
  resetPassword: (token, newPassword) => handleResponse(apiRequest('POST', '/auth/reset-password', { token, newPassword })),
  
  // Jobs endpoints
  getJobs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return handleResponse(apiRequest('GET', `/jobs?${queryString}`));
  },
  searchJobs: (query, filters = {}) => {
    const searchParams = { 
      search: query,
      ...filters
    };
    const queryString = new URLSearchParams(searchParams).toString();
    return handleResponse(apiRequest('GET', `/jobs?${queryString}`));
  },
  getJob: (id) => handleResponse(apiRequest('GET', `/jobs/${id}`)),
  
  // Companies endpoints
  getCompanies: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return handleResponse(apiRequest('GET', `/companies?${queryString}`));
  },
  searchCompanies: (query, filters = {}) => {
    const searchParams = { 
      search: query,
      ...filters
    };
    const queryString = new URLSearchParams(searchParams).toString();
    return handleResponse(apiRequest('GET', `/companies?${queryString}`));
  },
  getCompany: (id) => handleResponse(apiRequest('GET', `/companies/${id}`)),
  
  // Applications endpoints
  getApplications: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return handleResponse(apiRequest('GET', `/applications${queryString ? '?' + queryString : ''}`));
  },
  applyToJob: (jobId, data) => handleResponse(apiRequest('POST', `/applications`, { ...data, job_id: jobId })),
  deleteApplication: (id) => handleResponse(apiRequest('DELETE', `/applications/${id}`)),
  
  // Recruiter endpoints
  createJob: (data) => handleResponse(apiRequest('POST', '/jobs', data)),
  updateJob: (id, data) => handleResponse(apiRequest('PUT', `/jobs/${id}`, data)),
  deleteJob: (id) => handleResponse(apiRequest('DELETE', `/jobs/${id}`)),
};

export default api;
