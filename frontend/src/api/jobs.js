import apiClient from './apiClient';

// Jobs API functions
export const getJobs = async (filters = {}) => {
  try {
    const response = await apiClient.get('/jobs', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getJobById = async (id) => {
  try {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await apiClient.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateJob = async (id, jobData) => {
  try {
    const response = await apiClient.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const publishJob = async (id) => {
  try {
    const response = await apiClient.put(`/jobs/${id}/publish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const unpublishJob = async (id) => {
  try {
    const response = await apiClient.put(`/jobs/${id}/unpublish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getJobsByRecruiter = async (recruiterId) => {
  try {
    const response = await apiClient.get('/jobs', { params: { postedBy: recruiterId } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getRecommendedJobs = async (userId) => {
  try {
    const response = await apiClient.get(`/jobs/recommended/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const searchJobs = async (query, filters = {}) => {
  try {
    const response = await apiClient.get('/jobs/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getJobStats = async () => {
  try {
    const response = await apiClient.get('/jobs/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const saveJob = async (jobId) => {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/save`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const unsaveJob = async (jobId) => {
  try {
    const response = await apiClient.delete(`/jobs/${jobId}/save`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSavedJobs = async () => {
  try {
    const response = await apiClient.get('/jobs/saved');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getRecruiterJobs = async (status = null, recruiterId = null) => {
  try {
    const params = {};
    if (status) {
      params.status = status;
    }
    // For recruiter dashboard, pass the recruiter ID to show their jobs
    if (recruiterId) {
      params.postedBy = recruiterId;
    }
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const debugJobs = async () => {
  try {
    const response = await apiClient.get('/jobs/debug');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
