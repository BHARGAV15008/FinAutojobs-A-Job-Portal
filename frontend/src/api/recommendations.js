import apiClient from './apiClient';

// Get recommended jobs for applicant based on skill matching
export const getRecommendedJobs = async (params = {}) => {
  try {
    const { limit = 20, minMatchPercentage = 10 } = params;
    
    const response = await apiClient.get('/recommendations/jobs', {
      params: {
        limit,
        minMatchPercentage
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    throw error;
  }
};

// Get recommendation statistics
export const getRecommendationStats = async () => {
  try {
    const response = await apiClient.get('/recommendations/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendation stats:', error);
    throw error;
  }
};

// Get job details with match score
export const getJobWithMatchScore = async (jobId) => {
  try {
    // First get recommended jobs to find the match score
    const recommendations = await getRecommendedJobs({ limit: 100 });
    const matchedJob = recommendations.data.jobs.find(job => job.id === jobId);
    
    if (matchedJob) {
      return {
        success: true,
        data: matchedJob
      };
    } else {
      // If not in recommendations, get basic job details
      const response = await apiClient.get(`/jobs/${jobId}`);
      return {
        success: true,
        data: {
          ...response.data.data,
          matchScore: {
            overall: 0,
            skills: { matchPercentage: 0, matchedSkills: [], missingSkills: [] },
            location: 0,
            experience: 0
          }
        }
      };
    }
  } catch (error) {
    console.error('Error fetching job with match score:', error);
    throw error;
  }
};

export default {
  getRecommendedJobs,
  getRecommendationStats,
  getJobWithMatchScore
};
