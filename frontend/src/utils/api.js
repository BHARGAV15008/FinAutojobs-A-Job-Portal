import { apiRequest } from '../lib/queryClient';
import { sanitizeInput } from './validation';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Enhanced API request with better error handling
const enhancedApiRequest = async (method, url, data) => {
  try {
    // Sanitize input data
    const sanitizedData = data ? sanitizeInput(data) : data;
    
    const response = await apiRequest(method, url, sanitizedData);
    return response;
  } catch (error) {
    // Enhanced error handling
    if (error.message.includes('401')) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    
    if (error.message.includes('403')) {
      throw new Error('You don\'t have permission to perform this action.');
    }
    
    if (error.message.includes('404')) {
      throw new Error('The requested resource was not found.');
    }
    
    if (error.message.includes('429')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    if (error.message.includes('500')) {
      throw new Error('Server error. Please try again later.');
    }
    
    // Network errors
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }
    
    throw error;
  }
};
// API utility functions
const api = {
  // Auth endpoints
  login: (credentials) => enhancedApiRequest('POST', '/api/auth/login', credentials),
  register: (userData) => enhancedApiRequest('POST', '/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return enhancedApiRequest('POST', '/api/auth/logout');
  },
  getProfile: () => enhancedApiRequest('GET', '/api/auth/me'),
  updateProfile: (data) => enhancedApiRequest('PUT', '/api/users/profile', data),
  changePassword: (data) => enhancedApiRequest('PUT', '/api/users/change-password', data),
  getProfileAnalytics: () => enhancedApiRequest('GET', '/api/users/profile/analytics'),
  getProfileActivity: () => enhancedApiRequest('GET', '/api/users/profile/activity'),
  
  // OTP verification endpoints
  sendEmailOTP: (email) => enhancedApiRequest('POST', '/api/auth/send-email-otp', { email }),
  verifyEmailOTP: (email, otp) => enhancedApiRequest('POST', '/api/auth/verify-email-otp', { email, otp }),
  sendSMSOTP: (phone) => enhancedApiRequest('POST', '/api/auth/send-sms-otp', { phone }),
  verifySMSOTP: (phone, otp) => enhancedApiRequest('POST', '/api/auth/verify-sms-otp', { phone, otp }),
  
  // Password reset endpoints
  forgotPassword: (email) => enhancedApiRequest('POST', '/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => enhancedApiRequest('POST', '/api/auth/reset-password', { token, newPassword }),
  
  // Jobs endpoints
  getJobs: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return enhancedApiRequest('GET', `/api/jobs?${queryString}`);
  },
  getJob: (id) => enhancedApiRequest('GET', `/api/jobs/${id}`),
  
  // Companies endpoints
  getCompanies: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return enhancedApiRequest('GET', `/api/companies?${queryString}`);
  },
  getCompany: (id) => enhancedApiRequest('GET', `/api/companies/${id}`),
  
  // Applications endpoints
  getApplications: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return enhancedApiRequest('GET', `/api/applications${queryString ? '?' + queryString : ''}`);
  },
  applyToJob: (jobId, data) => enhancedApiRequest('POST', `/api/applications`, { ...data, job_id: jobId }),
  deleteApplication: (id) => enhancedApiRequest('DELETE', `/api/applications/${id}`),
  
  // Recruiter endpoints
  createJob: (data) => enhancedApiRequest('POST', '/api/jobs', data),
  updateJob: (id, data) => enhancedApiRequest('PUT', `/api/jobs/${id}`, data),
  deleteJob: (id) => enhancedApiRequest('DELETE', `/api/jobs/${id}`),
  
  // Health check
  healthCheck: () => enhancedApiRequest('GET', '/api/health'),
};

export default api;
