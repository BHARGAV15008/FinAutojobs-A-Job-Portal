import apiClient from './apiClient';

// Job Alerts API functions
export const getJobAlerts = async () => {
  try {
    const response = await apiClient.get('/job-alerts');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createJobAlert = async (alertData) => {
  try {
    const response = await apiClient.post('/job-alerts', alertData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateJobAlert = async (id, alertData) => {
  try {
    const response = await apiClient.put(`/job-alerts/${id}`, alertData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteJobAlert = async (id) => {
  try {
    const response = await apiClient.delete(`/job-alerts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getJobMatches = async (limit = 10) => {
  try {
    const response = await apiClient.get(`/job-alerts/matches?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getJobAlertStats = async () => {
  try {
    const response = await apiClient.get('/job-alerts/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getJobAlerts,
  createJobAlert,
  updateJobAlert,
  deleteJobAlert,
  getJobMatches,
  getJobAlertStats
};
