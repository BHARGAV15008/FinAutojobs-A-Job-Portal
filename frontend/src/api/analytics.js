import apiClient from './apiClient';

// Get comprehensive dashboard analytics
export const getDashboardAnalytics = async (role = null) => {
  try {
    const endpoint = role ? `/analytics/dashboard/${role}` : '/analytics/dashboard';
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard analytics:', error);
    throw error;
  }
};

// Get real-time statistics
export const getRealTimeStats = async (role = null) => {
  try {
    const endpoint = role ? `/analytics/realtime/${role}` : '/analytics/realtime';
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching real-time stats:', error);
    throw error;
  }
};

// Get applicant-specific analytics
export const getApplicantAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/dashboard/applicant');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching applicant analytics:', error);
    throw error;
  }
};

// Get recruiter-specific analytics
export const getRecruiterAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/dashboard/recruiter');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching recruiter analytics:', error);
    throw error;
  }
};

// Get admin analytics
export const getAdminAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/dashboard/admin');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching admin analytics:', error);
    throw error;
  }
};

export default {
  getDashboardAnalytics,
  getRealTimeStats,
  getApplicantAnalytics,
  getRecruiterAnalytics,
  getAdminAnalytics
};
