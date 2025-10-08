import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://finautojobs-a-job-portal-w714.onrender.com',
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
    console.log('🔍 API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword, confirmPassword) => 
    api.put('/api/auth/change-password-test', { currentPassword, newPassword, confirmPassword }),
  changeUsername: (newUsername, password) => 
    api.put('/api/auth/change-username-test', { newUsername, password }),
  // Test endpoint to verify connectivity
  testFrontendConnection: (testData) => 
    api.post('/api/auth/test-frontend', testData),
  // Test PUT endpoint
  testPutEndpoint: (testData) => 
    api.put('/api/auth/test-put', testData),
  checkAvailability: (field, value, role) => api.post('/api/auth/check-availability', { field, value, role }),
  generateUsername: (firstName, lastName, role) => api.post('/api/auth/generate-username', { firstName, lastName, role }),
  validateUsername: (username) => api.post('/api/auth/validate-username', { username }),
  sendOTPEmail: (email) => api.post('/api/auth/send-otp-email', { email }),
  sendOTPSMS: (phone) => api.post('/api/auth/send-otp-sms', { phone }),
  verifyOTP: (identifier, otp, type) => api.post('/api/auth/verify-otp', { identifier, otp, type }),
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Dashboard API
export const dashboardAPI = {
  getApplicantDashboard: () => api.get('/api/dashboard/applicant'),
  getRecruiterDashboard: () => api.get('/api/dashboard/recruiter'),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => api.get('/api/jobs', { params }),
  getJob: (id) => api.get(`/api/jobs/${id}`),
  createJob: (jobData) => api.post('/api/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/api/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/api/jobs/${id}`),
  searchJobs: (query, filters) => api.post('/api/jobs/search', { query, filters }),
  getSavedJobs: () => api.get('/api/jobs/saved'),
  saveJob: (jobId) => api.post(`/api/jobs/${jobId}/save`),
  unsaveJob: (jobId) => api.delete(`/api/jobs/${jobId}/save`),
  getRecommendedJobs: () => api.get('/api/jobs/recommended'),
  getJobAnalytics: (jobId) => api.get(`/api/jobs/${jobId}/analytics`),
};

// Applications API
export const applicationsAPI = {
  getApplications: (params) => api.get('/api/applications', { params }),
  getApplication: (id) => api.get(`/api/applications/${id}`),
  createApplication: (applicationData) => api.post('/api/applications', applicationData),
  updateApplication: (id, data) => api.put(`/api/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/api/applications/${id}`),
  getApplicationsByJob: (jobId) => api.get(`/api/applications/job/${jobId}`),
  updateApplicationStatus: (id, status) => api.put(`/api/applications/${id}/status`, { status }),
  bulkUpdateApplications: (applicationIds, status) => 
    api.put('/api/applications/bulk-update', { applicationIds, status }),
};

// Candidates API
export const candidatesAPI = {
  getCandidates: (params) => api.get('/api/applications', { params }),
  getCandidate: (id) => api.get(`/api/applications/${id}`),
  updateCandidateStatus: (id, status, notes = '') => api.put(`/api/applications/${id}/status`, { status, notes }),
  sendEmail: (id, emailData) => api.post(`/api/candidates/${id}/send-email`, emailData),
  downloadResume: (id) => api.get(`/api/candidates/${id}/resume/download`, { responseType: 'blob' }),
  getStats: () => api.get('/api/candidates/stats'),
  bulkUpdate: (candidateIds, updateData) => api.put('/api/candidates/bulk-update', { candidateIds, ...updateData }),
  searchCandidates: (query, filters) => api.post('/api/candidates/search', { query, filters }),
  getCandidateNotes: (id) => api.get(`/api/candidates/${id}/notes`),
  addCandidateNote: (id, note) => api.post(`/api/candidates/${id}/notes`, { note }),
  updateCandidateNote: (id, noteId, note) => api.put(`/api/candidates/${id}/notes/${noteId}`, { note }),
  deleteCandidateNote: (id, noteId) => api.delete(`/api/candidates/${id}/notes/${noteId}`),
};

// Users API (Admin)
export const usersAPI = {
  getUsers: (params) => api.get('/api/users', { params }),
  getUser: (id) => api.get(`/api/users/${id}`),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/api/users/${id}/status`, { status }),
  getUserAnalytics: () => api.get('/api/users/analytics'),
  exportUsers: (filters) => api.post('/api/users/export', filters, { responseType: 'blob' }),
};

// Companies API
export const companiesAPI = {
  getCompanies: (params) => api.get('/api/companies', { params }),
  getCompany: (id) => api.get(`/api/companies/${id}`),
  createCompany: (companyData) => api.post('/api/companies', companyData),
  updateCompany: (id, companyData) => api.put(`/api/companies/${id}`, companyData),
  deleteCompany: (id) => api.delete(`/api/companies/${id}`),
  verifyCompany: (id) => api.put(`/api/companies/${id}/verify`),
  getCompanyAnalytics: (id) => api.get(`/api/companies/${id}/analytics`),
};

// Interviews API
export const interviewsAPI = {
  getInterviews: (params) => api.get('/api/interviews', { params }),
  getInterview: (id) => api.get(`/api/interviews/${id}`),
  scheduleInterview: (interviewData) => api.post('/api/interviews', interviewData),
  updateInterview: (id, data) => api.put(`/api/interviews/${id}`, data),
  cancelInterview: (id) => api.delete(`/api/interviews/${id}`),
  getInterviewFeedback: (id) => api.get(`/api/interviews/${id}/feedback`),
  submitInterviewFeedback: (id, feedback) => api.post(`/api/interviews/${id}/feedback`, feedback),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/api/notifications', { params }),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
  getNotificationSettings: () => api.get('/api/notifications/settings'),
  updateNotificationSettings: (settings) => api.put('/api/notifications/settings', settings),
  sendBulkNotification: (data) => api.post('/api/notifications/bulk', data),
};

// File Upload API
export const filesAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/api/files/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/api/files/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCompanyLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/api/files/company-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFile: (fileId) => api.delete(`/api/files/${fileId}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardAnalytics: (role) => api.get(`/api/analytics/dashboard/${role || ''}`),
  getPlatformAnalytics: (period) => api.get(`/api/analytics/platform?period=${period}`),
  getUserAnalytics: (userId, period) => api.get(`/api/analytics/user/${userId}?period=${period}`),
  getJobAnalytics: (jobId, period) => api.get(`/api/analytics/job/${jobId}?period=${period}`),
  getCompanyAnalytics: (companyId, period) => api.get(`/api/analytics/company/${companyId}?period=${period}`),
  getRecruitmentFunnel: () => api.get('/api/analytics/recruitment-funnel'),
  getSkillsAnalytics: () => api.get('/api/analytics/skills'),
  getSalaryInsights: (filters) => api.post('/api/analytics/salary-insights', filters),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (settings) => api.put('/api/settings', settings),
  getSystemSettings: () => api.get('/api/settings/system'),
  updateSystemSettings: (settings) => api.put('/api/settings/system', settings),
  getEmailTemplates: () => api.get('/api/settings/email-templates'),
  updateEmailTemplate: (id, template) => api.put(`/api/settings/email-templates/${id}`, template),
};


// Search API
export const searchAPI = {
  globalSearch: (query) => api.get(`/api/search?q=${encodeURIComponent(query)}`),
  searchJobs: (query, filters) => api.post('/api/search/jobs', { query, filters }),
  searchCandidates: (query, filters) => api.post('/api/search/candidates', { query, filters }),
  searchCompanies: (query, filters) => api.post('/api/search/companies', { query, filters }),
  getSearchSuggestions: (query, type) => api.get(`/api/search/suggestions?q=${query}&type=${type}`),
};

// Recommendations API
export const recommendationsAPI = {
  getJobRecommendations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/recommendations/jobs?${queryString}`);
  },
  getRecommendationStats: () => api.get('/api/recommendations/stats'),
};

// Reports API
export const reportsAPI = {
  generateReport: (type, filters) => api.post('/api/reports/generate', { type, filters }),
  getReports: () => api.get('/api/reports'),
  getReport: (id) => api.get(`/api/reports/${id}`),
  downloadReport: (id) => api.get(`/api/reports/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id) => api.delete(`/api/reports/${id}`),
};

// Contact API
export const contactAPI = {
  sendMessage: (messageData) => api.post('/api/contact/send-message', messageData),
  sendEmail: (emailData) => api.post('/api/contact/send-email', emailData),
  sendBulkMessage: (bulkData) => api.post('/api/contact/bulk-message', bulkData),
  getTemplates: () => api.get('/api/contact/templates'),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/api/messages/conversations'),
  getConversation: (userId, limit = 50) => api.get(`/api/messages/conversation/${userId}?limit=${limit}`),
  sendMessage: (messageData) => api.post('/api/messages', messageData),
  markAsRead: (messageId) => api.put(`/api/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/api/messages/${messageId}`),
  getStats: () => api.get('/api/messages/stats'),
};

// Admin API
export const adminAPI = {
  // User Management
  getUsers: (params) => api.get('/api/admin/users', { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/api/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  suspendUser: (id, reason) => api.post(`/api/admin/users/${id}/suspend`, { reason }),
  activateUser: (id) => api.post(`/api/admin/users/${id}/activate`),
  getUserStats: () => api.get('/api/admin/users/stats'),
  
  // Job Management
  getJobs: (params) => api.get('/api/admin/jobs', { params }),
  getJob: (id) => api.get(`/api/admin/jobs/${id}`),
  updateJob: (id, jobData) => api.put(`/api/admin/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/api/admin/jobs/${id}`),
  approveJob: (id) => api.post(`/api/admin/jobs/${id}/approve`),
  rejectJob: (id, reason) => api.post(`/api/admin/jobs/${id}/reject`, { reason }),
  getJobStats: () => api.get('/api/admin/jobs/stats'),
  
  // System Analytics
  getSystemAnalytics: (params) => api.get('/api/admin/analytics/system', { params }),
  
  // Content Moderation
  getModerationItems: (params) => api.get('/api/admin/moderation/items', { params }),
  approveModerationItem: (id, data) => api.post(`/api/admin/moderation/${id}/approve`, data),
  rejectModerationItem: (id, data) => api.post(`/api/admin/moderation/${id}/reject`, data),
  
  // System Settings
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (settings) => api.put('/api/admin/settings', settings),
  createBackup: () => api.post('/api/admin/settings/backup'),
  restoreBackup: (backupId) => api.post('/api/admin/settings/restore', { backupId }),
  
  // Dashboard
  getDashboard: () => api.get('/api/admin/dashboard'),
  getStats: () => api.get('/api/admin/stats'),
};

export default api;