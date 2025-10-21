import apiClient from './apiClient';

// Notifications API functions
export const getNotifications = async (filters = {}) => {
  try {
    const response = await apiClient.get('/notifications', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getNotificationById = async (id) => {
  try {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markAsUnread = async (id) => {
  try {
    const response = await apiClient.put(`/notifications/${id}/unread`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteAllNotifications = async () => {
  try {
    const response = await apiClient.delete('/notifications/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await apiClient.post('/notifications', notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getNotificationSettings = async () => {
  try {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateNotificationSettings = async (settings) => {
  try {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const subscribeToNotifications = async (subscription) => {
  try {
    const response = await apiClient.post('/notifications/subscribe', subscription);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const unsubscribeFromNotifications = async () => {
  try {
    const response = await apiClient.post('/notifications/unsubscribe');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
