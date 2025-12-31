import apiClient from './apiClient';

// Applications API functions
export const getApplications = async (filters = {}) => {
  try {
    const response = await apiClient.get('/applications', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getApplicationById = async (id) => {
  try {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createApplication = async (applicationData) => {
  try {
    const response = await apiClient.post('/applications', applicationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateApplication = async (id, applicationData) => {
  try {
    const response = await apiClient.put(`/applications/${id}`, applicationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteApplication = async (id) => {
  try {
    const response = await apiClient.delete(`/applications/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const applyToJob = async (jobId, applicationData = {}) => {
  try {
    // Add jobId to the application data
    const data = { ...applicationData, jobId };
    const response = await apiClient.post('/applications', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const withdrawApplication = async (id) => {
  try {
    const response = await apiClient.put(`/applications/${id}/withdraw`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getApplicationsByJob = async (jobId) => {
  try {
    const response = await apiClient.get(`/applications/job/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getApplicationsByUser = async (userId) => {
  try {
    const response = await apiClient.get('/applications', { params: { userId } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getApplicationStats = async () => {
  try {
    const response = await apiClient.get('/applications/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
