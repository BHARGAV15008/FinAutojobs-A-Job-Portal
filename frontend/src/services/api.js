import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Dashboard API
export const dashboardAPI = {
  getApplicantDashboard: () => api.get('/dashboard/applicant'),
  getRecruiterDashboard: () => api.get('/dashboard/recruiter'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getUserPreferences: () => api.get('/dashboard/preferences'),
  updateUserPreferences: (preferences) => api.put('/dashboard/preferences', preferences),
  getAnalytics: (type, period) => api.get(`/dashboard/analytics/${type}?period=${period}`),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  searchJobs: (query, filters) => api.post('/jobs/search', { query, filters }),
  getSavedJobs: () => api.get('/jobs/saved'),
  saveJob: (jobId) => api.post(`/jobs/${jobId}/save`),
  unsaveJob: (jobId) => api.delete(`/jobs/${jobId}/save`),
  getRecommendedJobs: () => api.get('/jobs/recommended'),
  getJobAnalytics: (jobId) => api.get(`/jobs/${jobId}/analytics`),
};

// Applications API
export const applicationsAPI = {
  getApplications: (params) => api.get('/applications', { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  createApplication: (applicationData) => api.post('/applications', applicationData),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
  getApplicationsByJob: (jobId) => api.get(`/jobs/${jobId}/applications`),
  updateApplicationStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
  bulkUpdateApplications: (applicationIds, status) => 
    api.put('/applications/bulk-update', { applicationIds, status }),
};

// Users API (Admin)
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  getUserAnalytics: () => api.get('/users/analytics'),
  exportUsers: (filters) => api.post('/users/export', filters, { responseType: 'blob' }),
};

// Companies API
export const companiesAPI = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompany: (id) => api.get(`/companies/${id}`),
  createCompany: (companyData) => api.post('/companies', companyData),
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  verifyCompany: (id) => api.put(`/companies/${id}/verify`),
  getCompanyAnalytics: (id) => api.get(`/companies/${id}/analytics`),
};

// Interviews API
export const interviewsAPI = {
  getInterviews: (params) => api.get('/interviews', { params }),
  getInterview: (id) => api.get(`/interviews/${id}`),
  scheduleInterview: (interviewData) => api.post('/interviews', interviewData),
  updateInterview: (id, data) => api.put(`/interviews/${id}`, data),
  cancelInterview: (id) => api.delete(`/interviews/${id}`),
  getInterviewFeedback: (id) => api.get(`/interviews/${id}/feedback`),
  submitInterviewFeedback: (id, feedback) => api.post(`/interviews/${id}/feedback`, feedback),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getNotificationSettings: () => api.get('/notifications/settings'),
  updateNotificationSettings: (settings) => api.put('/notifications/settings', settings),
  sendBulkNotification: (data) => api.post('/notifications/bulk', data),
};

// File Upload API
export const filesAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/files/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/files/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCompanyLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/files/company-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
};

// Analytics API
export const analyticsAPI = {
  getPlatformAnalytics: (period) => api.get(`/analytics/platform?period=${period}`),
  getUserAnalytics: (userId, period) => api.get(`/analytics/user/${userId}?period=${period}`),
  getJobAnalytics: (jobId, period) => api.get(`/analytics/job/${jobId}?period=${period}`),
  getCompanyAnalytics: (companyId, period) => api.get(`/analytics/company/${companyId}?period=${period}`),
  getRecruitmentFunnel: () => api.get('/analytics/recruitment-funnel'),
  getSkillsAnalytics: () => api.get('/analytics/skills'),
  getSalaryInsights: (filters) => api.post('/analytics/salary-insights', filters),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
  getSystemSettings: () => api.get('/settings/system'),
  updateSystemSettings: (settings) => api.put('/settings/system', settings),
  getEmailTemplates: () => api.get('/settings/email-templates'),
  updateEmailTemplate: (id, template) => api.put(`/settings/email-templates/${id}`, template),
};

// Search API
export const searchAPI = {
  globalSearch: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
  searchJobs: (query, filters) => api.post('/search/jobs', { query, filters }),
  searchCandidates: (query, filters) => api.post('/search/candidates', { query, filters }),
  searchCompanies: (query, filters) => api.post('/search/companies', { query, filters }),
  getSearchSuggestions: (query, type) => api.get(`/search/suggestions?q=${query}&type=${type}`),
};

// Reports API
export const reportsAPI = {
  generateReport: (type, filters) => api.post('/reports/generate', { type, filters }),
  getReports: () => api.get('/reports'),
  getReport: (id) => api.get(`/reports/${id}`),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

export default api;
