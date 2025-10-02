import apiClient from './apiClient';

// Get comprehensive dashboard analytics with retry logic
export const getDashboardAnalytics = async (role = null, retryCount = 0) => {
  try {
    const endpoint = role ? `/analytics/dashboard/${role}` : '/analytics/dashboard';
    console.log('🔍 Fetching dashboard analytics from:', endpoint);
    
    const response = await apiClient.get(endpoint);
    console.log('✅ Dashboard analytics response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard analytics:', error);
    
    // Retry logic for network errors
    if (error.code === 'ERR_NETWORK' && retryCount < 2) {
      console.log(`🔄 Retrying dashboard analytics request (attempt ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return getDashboardAnalytics(role, retryCount + 1);
    }
    
    // If all retries failed, return fallback data
    if (error.code === 'ERR_NETWORK') {
      console.log('⚠️ Using fallback analytics due to network error');
      return {
        success: true,
        data: {
          analytics: {
            overview: {
              totalJobs: 0,
              activeJobs: 0,
              totalApplications: 0,
              shortlisted: 0,
              hired: 0
            },
            trends: {
              jobsThisMonth: 0,
              applicationsThisMonth: 0,
              hireRate: 0
            }
          },
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw error;
  }
};

// Get real-time statistics with retry logic
export const getRealTimeStats = async (role = null, retryCount = 0) => {
  try {
    const endpoint = role ? `/analytics/realtime/${role}` : '/analytics/realtime';
    console.log('🔍 Fetching real-time stats from:', endpoint);
    
    const response = await apiClient.get(endpoint);
    console.log('✅ Real-time stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching real-time stats:', error);
    
    // Retry logic for network errors
    if (error.code === 'ERR_NETWORK' && retryCount < 2) {
      console.log(`🔄 Retrying real-time stats request (attempt ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return getRealTimeStats(role, retryCount + 1);
    }
    
    // If all retries failed, return fallback data
    if (error.code === 'ERR_NETWORK') {
      console.log('⚠️ Using fallback stats due to network error');
      return {
        success: true,
        data: {
          stats: {
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            pending: 0,
            shortlisted: 0,
            interviewed: 0,
            hired: 0
          },
          timestamp: new Date().toISOString()
        }
      };
    }
    
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
