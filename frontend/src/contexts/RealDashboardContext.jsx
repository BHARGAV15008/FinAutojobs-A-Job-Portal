import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import API_BASE_URL from '../services/apiConfig';
import { useAuth } from './AuthContext.jsx';
import { applicationsAPI, authAPI } from '../services/api.js';
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

  // Add debouncing to prevent excessive API calls
  const loadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const DEBOUNCE_DELAY = 1000; // 1 second debounce

  const loadDashboardData = useCallback(async (role, user = null) => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('🔍 Dashboard load already in progress, skipping...');
      return;
    }

    // Debounce rapid successive calls
    const now = Date.now();
    if (now - lastLoadTimeRef.current < DEBOUNCE_DELAY) {
      console.log('🔍 Dashboard load debounced, too soon since last load');
      return;
    }

    try {
      loadingRef.current = true;
      lastLoadTimeRef.current = now;
      setLoading(true);

      // Fetch comprehensive analytics from the new analytics API
      console.log('🔍 Loading dashboard data for:', role);
      const analyticsResponse = await analyticsAPI.getDashboardAnalytics(role).catch((error) => {
        console.error('🔍 Analytics API error:', error.response?.status, error.message);
        return null;
      });

      // Prepare jobs API parameters - include recruiterId for recruiters to see all their jobs (including drafts)
      const jobsParams = { limit: 50 };
      const userToUse = user || currentUser;
      if (role === 'recruiter' && userToUse?._id) {
        jobsParams.recruiterId = userToUse._id;
        console.log('🔍 Adding recruiterId to jobs query:', userToUse._id);
      }

      // Fetch basic data for display (jobs, applications, notifications)
      const [jobsResponse, applicationsResponse, notificationsResponse] = await Promise.all([
        jobsAPI.getJobs(jobsParams).catch((error) => {
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
      
      console.log('🔍 Sample application data structure:', extractedApplications.slice(0, 1));

      const dashboardDataToSet = {
        stats,
        analytics: analyticsResponse?.success ? analyticsResponse.data.analytics : null,
        recentJobs: extractedJobs,
        applications: extractedApplications,
        notifications: extractedNotifications,
        users: [],
      };

      console.log('📊 Setting dashboard data:', dashboardDataToSet);
      console.log('📊 Final stats being set:', stats);
      setDashboardData(dashboardDataToSet);
      
      // Force a state update to ensure components re-render with new stats
      setTimeout(() => {
        console.log('🔄 Forcing stats refresh...');
        setDashboardData(prev => ({ ...prev, lastUpdated: Date.now() }));
      }, 100);
    } catch (error) {
      console.warn("Failed to load dashboard data, using fallback:", error);
      setError("Failed to load dashboard data - using offline mode");
      loadEmptyData(); // Show empty data on error
    } finally {
      setLoading(false);
      loadingRef.current = false; // Reset loading flag
    }
  }, []); // Empty dependency array since we handle user/role internally

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
        await loadDashboardData(user.role, user);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Sync with AuthContext user changes (optimized to prevent excessive re-renders)
  const prevAuthUserRef = useRef();
  useEffect(() => {
    // Only process if authUser actually changed
    if (authUser && authUser !== prevAuthUserRef.current) {
      console.log('🔍 RealDashboardContext syncing with AuthContext user:', authUser);
      
      // Handle case where authUser might be API response object
      const actualUser = authUser.data ? authUser.data : authUser;
      console.log('🔍 Extracted actual user:', actualUser);
      
      // Only update if user ID or role changed
      if (!currentUser || currentUser._id !== actualUser._id || currentUser.role !== actualUser.role) {
        setCurrentUser(actualUser);
        setUserRole(actualUser.role);
        setIsAuthenticated(true);
        
        // Reload dashboard data with the new user
        if (actualUser.role) {
          loadDashboardData(actualUser.role, actualUser);
        }
      }
      
      prevAuthUserRef.current = authUser;
    } else if (!authUser && authIsAuthenticated === false) {
      // Only clear if we actually had a user before
      if (currentUser) {
        setCurrentUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      }
    }
  }, [authUser?._id, authUser?.role, authIsAuthenticated, loadDashboardData]);

  const calculateStats = (role, data) => {
    const { jobs = [], applications = [], users = [] } = data;
    
    // Ensure applications is an array
    const applicationsArray = Array.isArray(applications) ? applications : [];

    switch (role) {
      case "applicant":
        return {
          profileCompletion: calculateProfileCompletion(currentUser, "applicant"),
          appliedJobs: applicationsArray.filter((app) => (app.applicationStatus || app.status) === "applied" || (app.applicationStatus || app.status) === "pending")
            .length,
          shortlisted: applicationsArray.filter(
            (app) => (app.applicationStatus || app.status) === "shortlisted"
          ).length,
          interviews: applicationsArray.filter(
            (app) => (app.applicationStatus || app.status) === "interview"
          ).length,
          hired: applicationsArray.filter((app) => (app.applicationStatus || app.status) === "hired").length,
          totalApplications: applicationsArray.length,
          savedJobs: 0, // Will be fetched from API later
          viewedJobs: 0, // Will be fetched from API later
        };

      case "recruiter":
        console.log('🔍 Calculating recruiter stats with jobs:', jobs.length, 'applications:', applicationsArray.length);
        console.log('🔍 Sample applications data:', applicationsArray.slice(0, 2));
        const activeJobs = jobs.filter((job) => job.status === "active" || job.status === "Active").length;
        const totalJobs = jobs.length;
        console.log('🔍 Active jobs:', activeJobs, 'Total jobs:', totalJobs);
        
        // Debug hired count - only looking for "hired" status now
        const hiredApps = applicationsArray.filter((app) => {
          const status = (app.applicationStatus || app.status || '').toLowerCase();
          return status === "hired";
        });
        const underReviewApps = applicationsArray.filter((app) => {
          const status = (app.applicationStatus || app.status || '').toLowerCase();
          return status === "under_review" || status === "reviewing";
        });
        
        console.log('🔍 Hired applications:', hiredApps.length, 'Under Review applications:', underReviewApps.length);
        console.log('🔍 Hired apps sample:', hiredApps.slice(0, 2));
        console.log('🔍 All applications with status:', applicationsArray.map(app => ({ 
          id: app.id, 
          applicationStatus: app.applicationStatus,
          status: app.status,
          finalStatus: app.applicationStatus || app.status,
          applicant: app.applicantSnapshot?.fullName 
        })));
        return {
          profileCompletion: calculateProfileCompletion(currentUser, "recruiter"),
          activeJobs,
          totalJobs,
          totalApplications: applicationsArray.length,
          shortlisted: applicationsArray.filter(
            (app) => (app.applicationStatus || app.status) === "shortlisted"
          ).length,
          hired: applicationsArray.filter((app) => {
            const status = (app.applicationStatus || app.status || '').toLowerCase();
            return status === "hired";
          }).length,
          underReview: applicationsArray.filter((app) => {
            const status = (app.applicationStatus || app.status || '').toLowerCase();
            return status === "under_review" || status === "reviewing";
          }).length,
          pendingReview: applicationsArray.filter((app) => (app.applicationStatus || app.status) === "pending")
            .length,
          interviewsScheduled: applicationsArray.filter(
            (app) => (app.applicationStatus || app.status) === "interview"
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
        },
        recruiter: {
          activeJobs: 0,
          totalApplications: 0,
          shortlisted: 0,
          hired: 0,
          pendingReview: 0,
          interviewsScheduled: 0
        },
        admin: {
          totalUsers: 0,
          activeJobs: 0,
          totalApplications: 0,
          systemHealth: 0,
          newUsersToday: 0,
          jobsPostedToday: 0,
        }
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

    // getStats Debug info available if needed
    
    // Check if stats are nested by role or direct
    if (typeof dashboardData.stats === "object" && dashboardData.stats[role]) {
      // Returning nested stats for role
      return dashboardData.stats[role];
    }
    
    // Returning direct stats
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
    if (!isAuthenticated || !currentUser?.role) {
      console.log('🔍 Skipping stats refresh - not authenticated or no role');
      return;
    }

    try {
      console.log('🔄 Refreshing stats for role:', currentUser.role);
      
      // Test network connectivity first
      try {
        await fetch(`${API_BASE_URL}/health`, { method: 'HEAD' });
        console.log('✅ Backend connectivity confirmed');
      } catch (connectError) {
        console.warn('⚠️ Backend connectivity issue:', connectError.message);
      }
      
      const response = await analyticsAPI.getRealTimeStats(currentUser.role);
      
      if (response.success && response.data?.stats) {
        setDashboardData(prevData => ({
          ...prevData,
          stats: response.data.stats,
          lastUpdated: response.data.timestamp || new Date().toISOString()
        }));
        console.log('✅ Stats refreshed successfully:', response.data.stats);
      } else {
        console.warn('⚠️ Invalid stats response format:', response);
      }
    } catch (error) {
      console.error('❌ Failed to refresh stats:', error);
      
      // Set fallback stats to prevent UI from breaking
      setDashboardData(prevData => ({
        ...prevData,
        stats: {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          pending: 0,
          shortlisted: 0,
          interviewed: 0,
          hired: 0
        },
        lastUpdated: new Date().toISOString()
      }));
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
