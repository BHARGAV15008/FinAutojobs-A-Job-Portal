import { apiClient } from '../api/apiClient';
import { log } from '../utils/logger';

// Application Service initialized

// Application Service
export const applicationService = {
  // Submit job application
  submitApplication: async (applicationData) => {
    try {
      log.fetch('Submitting application', applicationData);
      
      const response = await apiClient.post('/applications', applicationData);
      
      log.success('Application submitted successfully', response.data);
      return response.data;
    } catch (error) {
      log.error('Error submitting application', error);
      throw error;
    }
  },

  // Get user's applications (role-based filtering handled by backend)
  getUserApplications: async (limit = 10, page = 1, status = null) => {
    try {
      let url = `/applications?limit=${limit}&page=${page}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user applications:', error);
      throw error;
    }
  },

  // Get application by ID
  getApplicationById: async (applicationId) => {
    try {
      const response = await apiClient.get(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching application:', error);
      throw error;
    }
  },

  // Update application status (for recruiters)
  updateApplicationStatus: async (applicationId, status, notes = '') => {
    try {
      const response = await apiClient.put(`/applications/${applicationId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      throw error;
    }
  },

  // Withdraw application
  withdrawApplication: async (applicationId) => {
    try {
      const response = await apiClient.delete(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error withdrawing application:', error);
      throw error;
    }
  },

  // Check if user has already applied to a job
  checkApplicationStatus: async (jobId, userId) => {
    try {
      const response = await apiClient.get(`/applications/check?jobId=${jobId}&userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking application status:', error);
      return { hasApplied: false };
    }
  },

  // Get applications for a specific job (for recruiters)
  getJobApplications: async (jobId) => {
    try {
      const response = await apiClient.get(`/applications/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching job applications:', error);
      throw error;
    }
  },

  // Get application statistics
  getApplicationStats: async (userId, userRole) => {
    try {
      const response = await apiClient.get(`/applications/stats?userId=${userId}&role=${userRole}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching application stats:', error);
      throw error;
    }
  },
};

export default applicationService;
