/**
 * Job Service API
 * Handles all job-related API calls
 */

import api from './api';

class JobService {
  constructor() {
    this.baseURL = '/api/jobs';
  }

  /**
   * Get all jobs with optional filters
   */
  async getAllJobs(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`${this.baseURL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId) {
    try {
      const response = await api.get(`${this.baseURL}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      throw error;
    }
  }

  /**
   * Create new job (recruiter only)
   */
  async createJob(jobData) {
    try {
      const response = await api.post(this.baseURL, jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Update job (recruiter only)
   */
  async updateJob(jobId, jobData) {
    try {
      const response = await api.put(`${this.baseURL}/${jobId}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  /**
   * Delete job (recruiter only)
   */
  async deleteJob(jobId) {
    try {
      const response = await api.delete(`${this.baseURL}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  /**
   * Get recommended jobs for applicant
   */
  async getRecommendedJobs(applicantId) {
    try {
      const response = await api.get(`${this.baseURL}/recommended/${applicantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      throw error;
    }
  }

  /**
   * Get similar jobs
   */
  async getSimilarJobs(jobId) {
    try {
      const response = await api.get(`${this.baseURL}/${jobId}/similar`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
      throw error;
    }
  }

  /**
   * Search jobs
   */
  async searchJobs(searchQuery, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('search', searchQuery);
      
      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`${this.baseURL}/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  /**
   * Get jobs by recruiter
   */
  async getJobsByRecruiter(recruiterId) {
    try {
      const response = await api.get(`${this.baseURL}/recruiter/${recruiterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs by recruiter:', error);
      throw error;
    }
  }

  /**
   * Add job to favorites
   */
  async addToFavorites(userId, jobId) {
    try {
      const response = await api.post('/api/favorites', {
        userId,
        jobId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove job from favorites
   */
  async removeFromFavorites(userId, jobId) {
    try {
      const response = await api.delete(`/api/favorites/${jobId}`, {
        data: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite jobs
   */
  async getFavoriteJobs(userId) {
    try {
      const response = await api.get(`/api/favorites/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite jobs:', error);
      throw error;
    }
  }

  /**
   * Check if job is favorited by user
   */
  async isFavorited(userId, jobId) {
    try {
      const response = await api.get(`/api/favorites/check/${userId}/${jobId}`);
      return response.data.isFavorited;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(jobId) {
    try {
      const response = await api.get(`${this.baseURL}/${jobId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  }

  /**
   * Update job status (active, draft, closed)
   */
  async updateJobStatus(jobId, status) {
    try {
      const response = await api.patch(`${this.baseURL}/${jobId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }

  /**
   * Duplicate job
   */
  async duplicateJob(jobId) {
    try {
      const response = await api.post(`${this.baseURL}/${jobId}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating job:', error);
      throw error;
    }
  }

  /**
   * Get job applications count
   */
  async getApplicationsCount(jobId) {
    try {
      const response = await api.get(`${this.baseURL}/${jobId}/applications/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching applications count:', error);
      return 0;
    }
  }

  /**
   * Get job view count
   */
  async getViewCount(jobId) {
    try {
      const response = await api.get(`${this.baseURL}/${jobId}/views`);
      return response.data.views;
    } catch (error) {
      console.error('Error fetching view count:', error);
      return 0;
    }
  }

  /**
   * Increment job view count
   */
  async incrementViewCount(jobId) {
    try {
      const response = await api.post(`${this.baseURL}/${jobId}/view`);
      return response.data;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw error for view tracking
      return null;
    }
  }

  /**
   * Get jobs by category
   */
  async getJobsByCategory(category) {
    try {
      const response = await api.get(`${this.baseURL}/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs by category:', error);
      throw error;
    }
  }

  /**
   * Get jobs by location
   */
  async getJobsByLocation(location) {
    try {
      const response = await api.get(`${this.baseURL}/location/${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs by location:', error);
      throw error;
    }
  }

  /**
   * Get featured jobs
   */
  async getFeaturedJobs() {
    try {
      const response = await api.get(`${this.baseURL}/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw error;
    }
  }

  /**
   * Get recent jobs
   */
  async getRecentJobs(limit = 10) {
    try {
      const response = await api.get(`${this.baseURL}/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
      throw error;
    }
  }

  /**
   * Report job
   */
  async reportJob(jobId, reason, description) {
    try {
      const response = await api.post(`${this.baseURL}/${jobId}/report`, {
        reason,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting job:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const jobService = new JobService();
export default jobService;
