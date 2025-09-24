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

// Mock data generators
const generateMockJobs = () => [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp India',
    location: 'Mumbai, India',
    salary: '₹15-25 LPA',
    type: 'Full-time',
    industry: 'Technology',
    experience: '3-5 years',
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
    description: 'We are looking for a senior frontend developer to join our team...',
    postedDate: '2025-01-15',
    deadline: '2025-02-15',
    status: 'active',
    recommended: true,
    saved: true
  },
  {
    id: 2,
    title: 'Financial Analyst',
    company: 'FinanceHub',
    location: 'Delhi, India',
    salary: '₹8-12 LPA',
    type: 'Full-time',
    industry: 'Finance',
    experience: '2-4 years',
    skills: ['Excel', 'Financial Modeling', 'SQL', 'Python'],
    description: 'Join our finance team as a financial analyst...',
    postedDate: '2025-01-14',
    deadline: '2025-02-10',
    status: 'active',
    recommended: false,
    saved: false
  },
  {
    id: 3,
    title: 'Automotive Engineer',
    company: 'AutoTech Solutions',
    location: 'Bangalore, India',
    salary: '₹12-18 LPA',
    type: 'Full-time',
    industry: 'Automotive',
    experience: '4-6 years',
    skills: ['CAD', 'MATLAB', 'Automotive Systems', 'Testing'],
    description: 'Exciting opportunity in automotive engineering...',
    postedDate: '2025-01-13',
    deadline: '2025-02-05',
    status: 'active',
    recommended: false,
    saved: true
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'StartupTech',
    location: 'Pune, India',
    salary: '₹10-18 LPA',
    type: 'Full-time',
    industry: 'Technology',
    experience: '2-4 years',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    description: 'Join our dynamic startup as a full stack developer...',
    postedDate: '2025-01-12',
    deadline: '2025-02-01',
    status: 'active',
    recommended: true,
    saved: false
  },
  {
    id: 5,
    title: 'Python Developer',
    company: 'DataScience Corp',
    location: 'Hyderabad, India',
    salary: '₹12-20 LPA',
    type: 'Full-time',
    industry: 'Technology',
    experience: '3-5 years',
    skills: ['Python', 'Django', 'Machine Learning', 'SQL'],
    description: 'Work with cutting-edge data science technologies...',
    postedDate: '2025-01-11',
    deadline: '2025-01-30',
    status: 'active',
    recommended: true,
    saved: true
  }
];

const generateMockApplications = () => [
  {
    id: 1,
    jobId: 1,
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp India',
    appliedDate: '2025-01-16',
    status: 'pending',
    stage: 'Application Review'
  },
  {
    id: 2,
    jobId: 2,
    jobTitle: 'Financial Analyst',
    company: 'FinanceHub',
    appliedDate: '2025-01-15',
    status: 'shortlisted',
    stage: 'Technical Interview'
  }
];

const generateMockUsers = () => [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'jobseeker',
    status: 'active',
    joinDate: '2025-01-01'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    role: 'recruiter',
    status: 'active',
    joinDate: '2024-12-15'
  }
];

export const DashboardProvider = ({ children }) => {
  // Use auth context if available, otherwise use mock data for demo
  const authContext = useAuth();
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for jobs, applications, and other data
  const [jobs, setJobs] = useState(generateMockJobs());
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState(generateMockUsers());
  const [analytics, setAnalytics] = useState({});
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  
  // Mock data for fallback
  const mockJobs = generateMockJobs();
  const mockApplications = [];
  const mockUsers = generateMockUsers();
  
  // Real dashboard stats from API
  const [dashboardStats, setDashboardStats] = useState({
    applicant: {
      profileCompletion: 85,
      appliedJobs: 12,
      shortlistedApplications: 3,
      interviewsScheduled: 2,
      bookmarkedJobs: 8
    },
    recruiter: {
      activeJobs: 5,
      totalApplications: 45,
      shortlistedCandidates: 12,
      interviewsScheduled: 8,
      hiredCandidates: 3
    },
    admin: {
      totalUsers: 1250,
      activeJobs: 89,
      totalApplications: 567,
      systemHealth: 98
    }
  });

  // Job management functions
  const addJob = (jobData) => {
    const newJob = {
      ...jobData,
      id: Date.now(),
      postedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = (jobId, updates) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const deleteJob = (jobId) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  // Application management
  const applyToJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return false;

    const newApplication = {
      id: Date.now(),
      jobId,
      jobTitle: job.title,
      company: job.company,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      stage: 'Application Review'
    };

    setApplications(prev => [newApplication, ...prev]);
    return true;
  };

  const withdrawApplication = (applicationId) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
  };

  const updateApplicationStatus = (applicationId, status, stage) => {
    setApplications(prev => prev.map(app =>
      app.id === applicationId ? { ...app, status, stage } : app
    ));
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
