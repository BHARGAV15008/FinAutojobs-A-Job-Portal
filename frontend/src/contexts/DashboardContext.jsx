import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  dashboardAPI, 
  jobsAPI, 
  applicationsAPI, 
  usersAPI, 
  notificationsAPI,
  authAPI 
} from '../services/api';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Real data fetchers - no mock data
const fetchRealJobs = async () => {
  try {
    const response = await jobsAPI.getJobs({ limit: 20 });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

const fetchRealApplications = async () => {
  try {
    const response = await applicationsAPI.getApplications();
    return response.data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

const fetchRealUsers = async () => {
  try {
    const response = await usersAPI.getUsers();
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const DashboardProvider = ({ children }) => {
  // Use auth context if available, otherwise use mock data for demo
  const authContext = useAuth();
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for jobs, applications, and other data
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  
  // Load real data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch real data from APIs
        const [jobsData, applicationsData, usersData] = await Promise.all([
          fetchRealJobs(),
          fetchRealApplications(),
          fetchRealUsers()
        ]);
        
        setJobs(jobsData);
        setApplications(applicationsData);
        setUsers(usersData);
        
        // Fetch dashboard stats if user is authenticated
        if (isAuthenticated && user) {
          const statsResponse = await dashboardAPI.getStats(user.role);
          if (statsResponse.success) {
            setDashboardStats(prev => ({
              ...prev,
              [user.role]: statsResponse.data
            }));
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, user]);
  
  // Real dashboard stats from API - initialized empty, populated by API calls
  const [dashboardStats, setDashboardStats] = useState({
    applicant: {},
    recruiter: {},
    admin: {}
  });

  // Job management functions - using real API calls
  const addJob = async (jobData) => {
    try {
      const response = await jobsAPI.createJob(jobData);
      if (response.success) {
        setJobs(prev => [response.data, ...prev]);
        return response.data;
      }
      throw new Error(response.message || 'Failed to create job');
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job');
      throw error;
    }
  };

  const updateJob = async (jobId, updates) => {
    try {
      const response = await jobsAPI.updateJob(jobId, updates);
      if (response.success) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, ...response.data } : job
        ));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update job');
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job');
      throw error;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const response = await jobsAPI.deleteJob(jobId);
      if (response.success) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
        return true;
      }
      throw new Error(response.message || 'Failed to delete job');
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job');
      throw error;
    }
  };

  // Application management - using real API calls
  const applyToJob = async (jobId, applicationData = {}) => {
    try {
      const response = await applicationsAPI.createApplication({
        jobId,
        ...applicationData
      });
      if (response.success) {
        setApplications(prev => [response.data, ...prev]);
        return response.data;
      }
      throw new Error(response.message || 'Failed to apply to job');
    } catch (error) {
      console.error('Error applying to job:', error);
      setError('Failed to apply to job');
      throw error;
    }
  };

  const withdrawApplication = async (applicationId) => {
    try {
      const response = await applicationsAPI.withdrawApplication(applicationId);
      if (response.success) {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        return true;
      }
      throw new Error(response.message || 'Failed to withdraw application');
    } catch (error) {
      console.error('Error withdrawing application:', error);
      setError('Failed to withdraw application');
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId, status, stage) => {
    try {
      const response = await applicationsAPI.updateApplicationStatus(applicationId, { status, stage });
      if (response.success) {
        setApplications(prev => prev.map(app =>
          app.id === applicationId ? { ...app, status, stage } : app
        ));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update application status');
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status');
      throw error;
    }
  };

  // Bookmark management
  const toggleBookmark = (jobId) => {
    setBookmarkedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  // Notification management
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const clearReadNotifications = () => {
    setNotifications(prev => prev.filter(notif => !notif.read));
  };

  // User management (Admin)
  const updateUserStatus = (userId, status) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status } : user
    ));
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Search and filter functions
  const searchJobs = (filters) => {
    return jobs.filter(job => {
      const matchesQuery = !filters.query || 
        job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.query.toLowerCase());

      const matchesLocation = !filters.location || 
        job.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesIndustry = !filters.industry || 
        job.industry === filters.industry;

      const matchesType = !filters.type || 
        job.type === filters.type;

      return matchesQuery && matchesLocation && matchesIndustry && matchesType;
    });
  };

  // Notification functions
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  // Bookmark functions
  const saveJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (job && !bookmarkedJobs.find(b => b.id === jobId)) {
      setBookmarkedJobs(prev => [...prev, job]);
    }
  };

  const unsaveJob = (jobId) => {
    setBookmarkedJobs(prev => prev.filter(job => job.id !== jobId));
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch fresh data from APIs
      // For now, we'll just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // Data
    jobs,
    applications,
    users,
    notifications,
    bookmarkedJobs,
    dashboardStats,
    loading,
    error,
    
    // Job functions
    addJob,
    updateJob,
    deleteJob,
    searchJobs,
    saveJob,
    unsaveJob,
    
    // Application functions
    applyToJob,
    withdrawApplication,
    updateApplicationStatus,
    
    // User functions
    updateUserStatus,
    deleteUser,
    
    // Notification functions
    markNotificationAsRead,
    addNotification,
    clearReadNotifications,
    
    // Utility functions
    refreshDashboard,
    
    // Fallback to mock data for demo
    mockJobs,
    mockApplications,
    mockUsers
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
