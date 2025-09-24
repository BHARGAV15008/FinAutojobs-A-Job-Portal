import React, { createContext, useContext, useState, useEffect } from "react";
import {
  dashboardAPI,
  jobsAPI,
  applicationsAPI,
  usersAPI,
  notificationsAPI,
  authAPI,
} from "../services/api";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentJobs: [],
    applications: [],
    notifications: [],
    users: [],
  });

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await authAPI.getProfile();
        const userData = response.data.data.user;
        setCurrentUser(userData);
        setUserRole(userData.role);
        setIsAuthenticated(true);
        await loadDashboardData(userData.role);
      } catch (error) {
        console.warn("Auth check failed, using fallback mode:", error);
        // Don't remove token immediately, might be network issue
        setIsAuthenticated(false);
        loadEmptyData(); // Show empty data when not authenticated
      }
    } else {
      setIsAuthenticated(false);
      loadEmptyData(); // Show empty data when not authenticated
    }
    setLoading(false);
  };

  const loadDashboardData = async (role) => {
    try {
      setLoading(true);

      // Fetch data based on user role
      const [jobsResponse, applicationsResponse, notificationsResponse] =
        await Promise.all([
          jobsAPI.getJobs({ limit: 10 }).catch(() => ({ data: { data: [] } })),
          applicationsAPI
            .getApplications({ limit: 10 })
            .catch(() => ({ data: { data: [] } })),
          notificationsAPI
            .getNotifications({ limit: 5 })
            .catch(() => ({ data: { data: [] } })),
        ]);

      let usersResponse = { data: { data: [] } };
      if (role === "admin") {
        usersResponse = await usersAPI
          .getUsers({ limit: 10 })
          .catch(() => ({ data: { data: [] } }));
      }

      // Calculate stats based on real data
      const stats = calculateStats(role, {
        jobs: jobsResponse.data.data?.jobs || jobsResponse.data.data || [],
        applications: applicationsResponse.data.data?.applications || applicationsResponse.data.data || [],
        users: usersResponse.data.data?.users || usersResponse.data.data || [],
      });

      // Debug logging
      console.log('🔍 API Responses:', {
        jobs: jobsResponse.data,
        applications: applicationsResponse.data,
        notifications: notificationsResponse.data
      });

      const dashboardDataToSet = {
        stats,
        recentJobs: jobsResponse.data.data?.jobs || jobsResponse.data.data || [],
        applications: applicationsResponse.data.data?.applications || applicationsResponse.data.data || [],
        notifications: notificationsResponse.data.data?.notifications || notificationsResponse.data.data || [],
        users: usersResponse.data.data?.users || usersResponse.data.data || [],
      };

      console.log('📊 Setting dashboard data:', dashboardDataToSet);
      setDashboardData(dashboardDataToSet);
    } catch (error) {
      console.warn("Failed to load dashboard data, using fallback:", error);
      setError("Failed to load dashboard data - using offline mode");
      loadEmptyData(); // Show empty data on error
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (role, data) => {
    const { jobs = [], applications = [], users = [] } = data;
    
    // Ensure applications is an array
    const applicationsArray = Array.isArray(applications) ? applications : [];

    switch (role) {
      case "applicant":
        return {
          profileCompletion: currentUser?.profileCompletion?.percentage || 0,
          appliedJobs: applicationsArray.filter((app) => app.status === "applied")
            .length,
          shortlisted: applicationsArray.filter(
            (app) => app.status === "shortlisted"
          ).length,
          interviews: applicationsArray.filter((app) => app.status === "interview")
            .length,
          totalApplications: applicationsArray.length,
          savedJobs: 0, // Will be fetched from API later
          viewedJobs: 0, // Will be fetched from API later
        };

      case "recruiter":
        return {
          activeJobs: jobs.filter((job) => job.status === "active").length,
          totalApplications: applicationsArray.length,
          shortlisted: applicationsArray.filter(
            (app) => app.status === "shortlisted"
          ).length,
          hired: applicationsArray.filter((app) => app.status === "hired").length,
          pendingReview: applicationsArray.filter((app) => app.status === "pending")
            .length,
          interviewsScheduled: applicationsArray.filter(
            (app) => app.status === "interview"
          ).length,
        };

      case "admin":
        return {
          totalUsers: users.length,
          activeJobs: jobs.filter((job) => job.status === "active").length,
          totalApplications: applicationsArray.length,
          systemHealth: 100, // Calculate based on actual system metrics
          newUsersToday: users.filter((user) => {
            const today = new Date().toDateString();
            return new Date(user.createdAt).toDateString() === today;
          }).length,
          jobsPostedToday: jobs.filter((job) => {
            const today = new Date().toDateString();
            return new Date(job.createdAt).toDateString() === today;
          }).length,
        };

      default:
        return {};
    }
  };

  const loadEmptyData = () => {
    // Empty data structure when not authenticated - show only real data
    setDashboardData({
      stats: {
        applicant: {
          profileCompletion: 0,
          appliedJobs: 0,
          shortlisted: 0,
          interviews: 0,
          totalApplications: 0,
          savedJobs: 0,
          viewedJobs: 0,
        },
        recruiter: {
          activeJobs: 0,
          totalApplications: 0,
          shortlisted: 0,
          hired: 0,
          pendingReview: 0,
          interviewsScheduled: 0,
        },
        admin: {
          totalUsers: 0,
          activeJobs: 0,
          totalApplications: 0,
          systemHealth: 0,
          newUsersToday: 0,
          jobsPostedToday: 0,
        },
      },
      recentJobs: [],
      applications: [],
      notifications: [],
      users: [],
    });
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      setCurrentUser(user);
      setUserRole(user.role);
      setIsAuthenticated(true);

      await loadDashboardData(user.role);
      return { success: true, user };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      loadEmptyData(); // Switch back to empty data
    }
  };

  // Get role-specific stats
  const getStats = (role = userRole) => {
    if (!role) return {};

    if (typeof dashboardData.stats === "object" && dashboardData.stats[role]) {
      return dashboardData.stats[role];
    }
    return dashboardData.stats;
  };

  // Refresh dashboard data
  const refreshData = async () => {
    if (isAuthenticated && userRole) {
      await loadDashboardData(userRole);
    } else {
      loadEmptyData();
    }
  };

  // Job management functions
  const postJob = async (jobData) => {
    try {
      setLoading(true);
      const response = await jobsAPI.createJob(jobData);
      await loadDashboardData(userRole); // Refresh data after posting
      return response.data;
    } catch (error) {
      console.error("Failed to post job:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobId, updateData) => {
    try {
      setLoading(true);
      const response = await jobsAPI.updateJob(jobId, updateData);
      await loadDashboardData(userRole); // Refresh data after updating
      return response.data;
    } catch (error) {
      console.error("Failed to update job:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      setLoading(true);
      const response = await jobsAPI.deleteJob(jobId);
      await loadDashboardData(userRole); // Refresh data after deleting
      return response.data;
    } catch (error) {
      console.error("Failed to delete job:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    // State
    loading,
    error,
    currentUser,
    isAuthenticated,
    userRole,
    dashboardData,

    // Data getters
    getStats,

    // Actions
    login,
    logout,
    refreshData,
    checkAuthStatus,

    // Job management
    postJob,
    updateJob,
    deleteJob,

    // Demo accounts for testing
    demoAccounts: [
      {
        email: "john.doe@email.com",
        password: "Password123!",
        role: "applicant",
      },
      {
        email: "sarah.wilson@email.com",
        password: "Password123!",
        role: "applicant",
      },
      {
        email: "mike.johnson@email.com",
        password: "Password123!",
        role: "applicant",
      },
      {
        email: "emily.brown@email.com",
        password: "Password123!",
        role: "applicant",
      },
      {
        email: "alex.smith@email.com",
        password: "Password123!",
        role: "applicant",
      },
    ],
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
