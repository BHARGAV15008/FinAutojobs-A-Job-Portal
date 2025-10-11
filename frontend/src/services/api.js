import axios from 'axios';

// Create axios instance with base configuration
// Cache bust: 2025-01-08-10:58 - Fixed double API prefix issue
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://finautojobs-backend.onrender.com/api',
  timeout: 60000, // Increased timeout for slow backend responses
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
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  // Test POST endpoint
  testPostEndpoint: (testData) => 
    api.post('/auth/test-frontend', testData),
  // Test PUT endpoint
  testPutEndpoint: (testData) => 
    api.put('/auth/test-put', testData),
  checkAvailability: (field, value, role) => api.post('/auth/check-availability', { field, value, role }),
  generateUsername: (firstName, lastName, role) => api.post('/auth/generate-username', { firstName, lastName, role }),
  validateUsername: (username) => api.post('/auth/validate-username', { username }),
  sendOTPEmail: (email) => api.post('/auth/send-otp-email', { email }, { timeout: 60000 }),
  sendOTPSMS: (phone) => api.post('/auth/send-otp-sms', { phone }, { timeout: 60000 }),
  verifyOTP: (identifier, otp, type) => api.post('/auth/verify-otp', { identifier, otp, type }),
  refreshToken: () => api.post('/auth/refresh'),
};

// Dashboard API
export const dashboardAPI = {
  getApplicantDashboard: () => api.get('/dashboard/applicant'),
  getRecruiterDashboard: () => api.get('/dashboard/recruiter'),
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
  getApplicationsByJob: (jobId) => api.get(`/applications/job/${jobId}`),
  updateApplicationStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
  bulkUpdateApplications: (applicationIds, status) => 
    api.put('/applications/bulk-update', { applicationIds, status }),
};

// Candidates API
export const candidatesAPI = {
  getCandidates: (params) => api.get('/applications', { params }),
  getCandidate: (id) => api.get(`/applications/${id}`),
  updateCandidateStatus: (id, status, notes = '') => api.put(`/applications/${id}/status`, { status, notes }),
  sendEmail: (id, emailData) => api.post(`/candidates/${id}/send-email`, emailData),
  downloadResume: async (id) => {
    try {
      const response = await api.get(`/candidates/${id}/resume/download`, { 
        responseType: 'blob',
        timeout: 30000 // 30 second timeout for file downloads
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'resume.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Resume downloaded successfully' };
    } catch (error) {
      console.error('Resume download error:', error);
      throw error;
    }
  },
  getStats: () => api.get('/candidates/stats'),
  bulkUpdate: (candidateIds, updateData) => api.put('/candidates/bulk-update', { candidateIds, ...updateData }),
  searchCandidates: (query, filters) => api.post('/candidates/search', { query, filters }),
  getCandidateNotes: (id) => api.get(`/candidates/${id}/notes`),
  addCandidateNote: (id, note) => api.post(`/candidates/${id}/notes`, { note }),
  updateCandidateNote: (id, noteId, note) => api.put(`/candidates/${id}/notes/${noteId}`, { note }),
  deleteCandidateNote: (id, noteId) => api.delete(`/candidates/${id}/notes/${noteId}`),
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
  getDashboardAnalytics: (role) => api.get(`/analytics/dashboard/${role || ''}`),
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

// Recommendations API
export const recommendationsAPI = {
  getJobRecommendations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/recommendations/jobs?${queryString}`);
  },
  getRecommendationStats: () => api.get('/recommendations/stats'),
};

// Reports API
export const reportsAPI = {
  generateReport: (type, filters) => api.post('/reports/generate', { type, filters }),
  getReports: () => api.get('/reports'),
  getReport: (id) => api.get(`/reports/${id}`),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

// Contact API
export const contactAPI = {
  sendMessage: (messageData) => api.post('/contact/send-message', messageData),
  sendEmail: (emailData) => api.post('/contact/send-email', emailData),
  sendBulkMessage: (bulkData) => api.post('/contact/bulk-message', bulkData),
  getTemplates: () => api.get('/contact/templates'),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId, limit = 50) => api.get(`/messages/conversation/${userId}?limit=${limit}`),
  sendMessage: (messageData) => api.post('/messages', messageData),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getStats: () => api.get('/messages/stats'),
};

// Admin API
export const adminAPI = {
  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  suspendUser: (id, reason) => api.post(`/admin/users/${id}/suspend`, { reason }),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  getUserStats: () => api.get('/admin/users/stats'),
  
  // Job Management
  getJobs: (params) => api.get('/admin/jobs', { params }),
  getJob: (id) => api.get(`/admin/jobs/${id}`),
  updateJob: (id, jobData) => api.put(`/admin/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  approveJob: (id) => api.post(`/admin/jobs/${id}/approve`),
  rejectJob: (id, reason) => api.post(`/admin/jobs/${id}/reject`, { reason }),
  getJobStats: () => api.get('/admin/jobs/stats'),
  
  // System Analytics
  getSystemAnalytics: (params) => api.get('/admin/analytics/system', { params }),
  
  // Content Moderation
  getModerationItems: (params) => api.get('/admin/moderation/items', { params }),
  approveModerationItem: (id, data) => api.post(`/admin/moderation/${id}/approve`, data),
  rejectModerationItem: (id, data) => api.post(`/admin/moderation/${id}/reject`, data),
  
  // System Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
  createBackup: () => api.post('/admin/settings/backup'),
  restoreBackup: (backupId) => api.post('/admin/settings/restore', { backupId }),
  
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: () => api.get('/admin/stats'),
};

export default api;