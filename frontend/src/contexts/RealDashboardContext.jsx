import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import * as authAPI from "../api/auth";
import * as applicationsAPI from "../api/applications";
import * as jobsAPI from "../api/jobs";
import * as notificationsAPI from "../api/notifications";
import * as analyticsAPI from "../api/analytics";
import { calculateProfileCompletion } from "../utils/profileCompletion";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const { user: authUser, isAuthenticated: authIsAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Sync with AuthContext user changes
  useEffect(() => {
    if (authUser) {
      console.log('🔍 RealDashboardContext syncing with AuthContext user:', authUser);
      
      // Handle case where authUser might be API response object
      const actualUser = authUser.data ? authUser.data : authUser;
      console.log('🔍 Extracted actual user:', actualUser);
      
      setCurrentUser(actualUser);
      setUserRole(actualUser.role);
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  }, [authUser, authIsAuthenticated]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    console.log('🔍 RealDashboardContext checkAuthStatus, token:', token ? 'exists' : 'not found');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        const user = response.data.data?.user || response.data.user || response.data;
        setCurrentUser(user);
        setUserRole(user.role);
        setIsAuthenticated(true);
        await loadDashboardData(user.role);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const loadDashboardData = async (role) => {
    try {
      setLoading(true);

      // Fetch comprehensive analytics from the new analytics API
      console.log('🔍 Loading dashboard data for:', role);
      const analyticsResponse = await analyticsAPI.getDashboardAnalytics(role).catch((error) => {
        console.error('🔍 Analytics API error:', error.response?.status, error.message);
        return null;
      });

      // Fetch basic data for display (jobs, applications, notifications)
      const [jobsResponse, applicationsResponse, notificationsResponse] = await Promise.all([
        jobsAPI.getJobs({ limit: 50 }).catch((error) => {
          console.error('🔍 Jobs API error:', error.response?.status, error.message);
          return { data: { data: [] } };
        }),
        applicationsAPI.getApplications({ limit: 10 }).catch(() => ({ data: { data: [] } })),
        notificationsAPI.getNotifications({ limit: 5 }).catch(() => ({ data: { data: [] } }))
      ]);

      // Extract data from responses
      const extractedJobs = jobsResponse.data?.jobs || jobsResponse.data?.data?.jobs || jobsResponse.data?.data || [];
      const extractedApplications = applicationsResponse.data?.applications || applicationsResponse.data?.data?.applications || applicationsResponse.data?.data || [];
      const extractedNotifications = notificationsResponse.data?.notifications || notificationsResponse.data?.data?.notifications || notificationsResponse.data?.data || [];

      // Use analytics data if available, otherwise fall back to calculated stats
      let stats;
      if (analyticsResponse && analyticsResponse.success) {
        console.log('📊 Using analytics API data:', analyticsResponse.data);
        const analyticsData = analyticsResponse.data.analytics || analyticsResponse.data;
        stats = analyticsData.overview || analyticsData;
      } else {
        console.log('📊 Falling back to calculated stats, analytics response was:', analyticsResponse);
        stats = calculateStats(role, {
          jobs: extractedJobs,
          applications: extractedApplications,
          users: [],
        });
      }

      // Debug logging
      console.log('🔍 API Responses:', {
        analytics: analyticsResponse?.success ? 'Success' : 'Failed',
        jobs: jobsResponse.data,
        applications: applicationsResponse.data,
        notifications: notificationsResponse.data
      });

      console.log('🔍 Extracted data:', {
        jobs: extractedJobs.length,
        applications: extractedApplications.length,
        notifications: extractedNotifications.length
      });

      const dashboardDataToSet = {
        stats,
        analytics: analyticsResponse?.success ? analyticsResponse.data.analytics : null,
        recentJobs: extractedJobs,
        applications: extractedApplications,
        notifications: extractedNotifications,
        users: [],
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
          profileCompletion: calculateProfileCompletion(currentUser, "applicant"),
          appliedJobs: applicationsArray.filter((app) => app.status === "applied")
            .length,
          shortlisted: applicationsArray.filter(
            (app) => app.status === "shortlisted"
          ).length,
          interviews: applicationsArray.filter(
            (app) => app.status === "interview"
          ).length,
          totalApplications: applicationsArray.length,
          savedJobs: 0, // Will be fetched from API later
          viewedJobs: 0, // Will be fetched from API later
        };

      case "recruiter":
        console.log('🔍 Calculating recruiter stats with jobs:', jobs.length, 'applications:', applicationsArray.length);
        const activeJobs = jobs.filter((job) => job.status === "active" || job.status === "Active").length;
        const totalJobs = jobs.length;
        console.log('🔍 Active jobs:', activeJobs, 'Total jobs:', totalJobs);
        return {
          profileCompletion: calculateProfileCompletion(currentUser, "recruiter"),
          activeJobs,
          totalJobs,
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

    // Add null safety check for dashboardData.stats
    if (!dashboardData || !dashboardData.stats) {
      // Return role-specific default stats with dynamic profile completion
      if (role === 'applicant') {
        return {
          profileCompletion: calculateProfileCompletion(currentUser, "applicant"),
          appliedJobs: 0,
          shortlisted: 0,
          interviews: 0
        };
      }
      return {
        profileCompletion: calculateProfileCompletion(currentUser, "recruiter"),
        activeJobs: 0,
        totalApplications: 0,
        shortlisted: 0,
        hired: 0
      };
    }

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

  // Refresh current user data from server
  const refreshCurrentUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.data?.user || response.data.user || response.data;
      console.log('🔄 Refreshed current user:', user);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('❌ Failed to refresh current user:', error);
      throw error;
    }
  };

  // Refresh real-time statistics without full data reload
  const refreshStats = async () => {
    try {
      if (!isAuthenticated || !userRole) return;
      
      const statsResponse = await analyticsAPI.getRealTimeStats(userRole);
      if (statsResponse.success) {
        setDashboardData(prevData => ({
          ...prevData,
          stats: {
            ...prevData?.stats,
            ...statsResponse.data.stats
          }
        }));
        console.log('📊 Real-time stats updated:', statsResponse.data.stats);
      }
    } catch (error) {
      console.error('❌ Failed to refresh stats:', error);
    }
  };

  // Job management functions
  const postJob = async (jobData) => {
    try {
      setLoading(true);
      const response = await jobsAPI.createJob(jobData);
      
      // Immediately add the new job to local state for instant feedback
      const newJob = response.data.data?.job || response.data.job || response.data;
      if (newJob) {
        setDashboardData(prevData => ({
          ...prevData,
          recentJobs: [newJob, ...(prevData.recentJobs || [])]
        }));
      }
      
      // Refresh stats to reflect the new job
      await refreshStats();
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
      
      // Update the job in local state immediately
      setDashboardData(prevData => ({
        ...prevData,
        recentJobs: prevData.recentJobs?.map(job => 
          job._id === jobId ? { ...job, ...updateData } : job
        ) || []
      }));
      
      // Refresh stats to reflect changes
      await refreshStats();
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
      
      // Remove the job from local state immediately
      setDashboardData(prevData => ({
        ...prevData,
        recentJobs: prevData.recentJobs?.filter(job => job._id !== jobId) || []
      }));
      
      // Refresh stats to reflect deletion
      await refreshStats();
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
    refreshCurrentUser,
    refreshStats,
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
