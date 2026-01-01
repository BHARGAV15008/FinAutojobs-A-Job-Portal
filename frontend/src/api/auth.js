import apiClient from "./apiClient";

// Authentication API functions
export const login = async (credentials) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProfile = async () => {
  try {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put("/auth/profile", profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.put("/auth/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post("/auth/refresh");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await apiClient.post("/auth/verify-email", { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
