import React, { useState, useEffect, useCallback } from "react";
import API_BASE_URL from "../services/apiConfig";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import ModernDashboardLayout from "../components/layout/ModernDashboardLayout";
import DashboardCard from "../components/cards/DashboardCard";
import {
  DashboardProvider,
  useDashboard,
} from "../contexts/RealDashboardContext";
import { useTheme } from "../contexts/IntegratedThemeContext";
import { useAutoRefresh, useVisibilityRefresh } from "../hooks/useAutoRefresh";
import { useRealTimeNotifications } from "../hooks/useRealTimeNotifications";
import {
  EnhancedProfileTab,
  EnhancedSettingsTab,
  EnhancedJobsTab,
} from "../components/dashboard/EnhancedDashboardTabs";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import EnhancedJobPostingTab from "../components/dashboard/EnhancedJobPostingTab";
import EnhancedApplicantsTab from "../components/dashboard/EnhancedApplicantsTab";
import RealApplicationsTab from "../components/dashboard/RealApplicationsTab";
import EnhancedCandidatesTab from "../components/dashboard/EnhancedCandidatesTab";
import NotificationsTab from "../components/dashboard/NotificationsTab";
import EnhancedInterviewsTab from "../components/dashboard/EnhancedInterviewsTab";
import JobMetrics from "../components/dashboard/JobMetrics";
import RecentActivity from "../components/dashboard/RecentActivity";
import JobChart from "../components/dashboard/JobChart";
import CandidatesTab from "../components/dashboard/CandidatesTab";
import InterviewsTab from "../components/dashboard/InterviewsTab";
import LoginStatusBanner from "../components/dashboard/LoginStatusBanner";
import { 
  Work as WorkIcon, 
  Description as DescriptionIcon, 
  Star as StarIcon, 
  Person as PersonIcon 
} from '@mui/icons-material';
import { getDisplayName, capitalizeWords } from '../utils/textHelpers';

const RecruiterDashboardContent = () => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeJobTab, setActiveJobTab] = useState("post");
  const [editingJob, setEditingJob] = useState(null);
  const { darkMode } = useTheme();
  
  // Safe dashboard context with comprehensive error handling
  let dashboardContext;
  try {
    dashboardContext = useDashboard();
    // Ensure all required properties exist
    if (!dashboardContext) {
      throw new Error('Dashboard context is null');
    }
  } catch (error) {
    console.warn('Dashboard context not available, using fallback data:', error);
    dashboardContext = {
      currentUser: null,
      isAuthenticated: false,
      refreshData: () => Promise.resolve(),
      getStats: () => ({
        activeJobs: 0,
        totalApplications: 0,
        shortlisted: 0,
        hired: 0
      }),
      dashboardData: {
        applications: [],
        stats: {
          activeJobs: 0,
          totalApplications: 0,
          shortlisted: 0,
          hired: 0
        }
      },
      loading: false
    };
  }
  
  const { 
    currentUser, 
    isAuthenticated, 
    getStats, 
    dashboardData, 
    loading,
    refreshData,
    refreshCurrentUser,
    refreshStats
  } = dashboardContext || {};

  // Auto-refresh dashboard data every 30 seconds
  const { manualRefresh } = useAutoRefresh(30000, isAuthenticated);
  
  // Refresh when user returns to the page
  useVisibilityRefresh();

  // Real-time notifications
  const { 
    isConnected: isNotificationConnected, 
    unreadCount: realTimeUnreadCount 
  } = useRealTimeNotifications();

  // State declarations first
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);
  const [jobsRefreshTrigger, setJobsRefreshTrigger] = useState(0);

  // Get stats from dashboard context
  const stats = getStats ? getStats("recruiter") : {};
  // Stats and dashboard data available for debugging if needed
  
  // Manual check for accepted applications
  if (dashboardData?.applications) {
    const acceptedApps = dashboardData.applications.filter(app => 
      (app.applicationStatus === "accepted") || 
      (app.status === "accepted") ||
      (app.applicationStatus === "Accepted") || 
      (app.status === "Accepted")
    );
    // Manual check for accepted applications completed
  }

  // Handle job editing - redirect to post tab with data
  const handleEditJob = (job) => {
    console.log('🔍 Edit job initiated:', job);
    // Set the job data for editing
    setEditingJob(job);
    // Redirect to jobs tab and post sub-tab
    setActiveTab("jobs");
    setActiveJobTab("post");
    // Update URL to prevent URL parsing from overriding the tab change
    window.history.pushState({}, '', '/recruiter-dashboard/jobs/post');
  };

  // Handle job update
  const handleUpdateJob = async (jobId, updateData) => {
    console.log('🔍 Updating job:', jobId, updateData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Job updated successfully:', result);
      
      // Refresh dashboard data to show updated job
      if (refreshDashboard) {
        refreshDashboard();
      }
      
      // Close modal
      setEditingJob(null);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to update job:', error);
      throw error;
    }
  };

  // Listen for edit job events and dashboard management
  useEffect(() => {
    const handleEditJobEvent = (event) => {
      console.log('🔍 RecruiterDashboard received editJob event:', event);
      console.log('🔍 Event detail:', event.detail);
      console.log('🔍 Job data:', event.detail.job);
      handleEditJob(event.detail.job);
    };

    const handleRefreshDashboard = () => {
      console.log('🔄 RecruiterDashboard received refreshDashboard event');
      if (refreshData) {
        refreshData();
      }
    };

    const handleClearEditingJob = () => {
      console.log('🧹 RecruiterDashboard received clearEditingJob event');
      setEditingJob(null);
    };

    window.addEventListener('editJob', handleEditJobEvent);
    window.addEventListener('refreshDashboard', handleRefreshDashboard);
    window.addEventListener('clearEditingJob', handleClearEditingJob);
    console.log('✅ Dashboard event listeners added to RecruiterDashboard');
    
    return () => {
      window.removeEventListener('editJob', handleEditJobEvent);
      window.removeEventListener('refreshDashboard', handleRefreshDashboard);
      window.removeEventListener('clearEditingJob', handleClearEditingJob);
      console.log('🧹 Dashboard event listeners removed from RecruiterDashboard');
    };
  }, [refreshData]);

  // Periodic check for jobs past deadline (every 30 minutes)
  useEffect(() => {
    const checkJobDeadlines = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/check-deadlines`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.updatedCount > 0) {
            console.log(`✅ ${result.updatedCount} jobs moved to closed status due to deadline`);
            // Refresh dashboard to show updated job statuses
            if (refreshData) {
              refreshData();
            }
          }
        }
      } catch (error) {
        console.error('Error checking job deadlines:', error);
      }
    };

    // Check immediately on mount
    checkJobDeadlines();
    
    // Then check every 30 minutes instead of 5 minutes
    const interval = setInterval(checkJobDeadlines, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshData]);

  // Use real authenticated user data with proper registration data mapping
  const user = currentUser ? {
    id: currentUser._id,
    name: currentUser.name || currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}`.trim(),
    email: currentUser.email,
    phone: currentUser.phone,
    location: currentUser.location || currentUser.officeLocation?.city || currentUser.currentLocation?.city || "Not specified",
    // Enhanced company info mapping - prioritize registration data
    company: currentUser.companyInfo?.companyName || currentUser.companyName || currentUser.company || "Not specified",
    department: currentUser.companyInfo?.department || currentUser.department || "Not provided",
    // Map jobTitle from registration (position field) to job_title
    job_title: currentUser.companyInfo?.jobTitle || currentUser.companyInfo?.designation || currentUser.position || currentUser.job_title || "Not specified",
    experience_years: currentUser.yearsOfExperience || currentUser.experience_years || 0,
    role: currentUser.role,
    linkedin_url: currentUser.linkedin_url || currentUser.professionalLinks?.linkedin || "",
    github_url: currentUser.github_url || currentUser.professionalLinks?.github || "",
    portfolio_url: currentUser.portfolio_url || currentUser.professionalLinks?.personalWebsite || "",
    bio: currentUser.bio || "",
    // Dynamic profile completion calculation
    profileComplete: calculateProfileCompletion(currentUser, "recruiter"),
    // Include nested objects for proper field mapping
    companyInfo: currentUser.companyInfo,
    officeLocation: currentUser.officeLocation,
    professionalLinks: currentUser.professionalLinks,
    yearsOfExperience: currentUser.yearsOfExperience,
    // Include original fields for ProfileEditModal
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
  } : {
    // Fallback data when not authenticated
    id: null,
    name: "Loading...",
    email: "",
    phone: "",
    location: "",
    company: "",
    role: "recruiter",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    bio: "",
    profileComplete: 0,
  };

  // Debug: Log constructed user object (reduced logging)
  if (user && Math.random() < 0.05) { // Only log 5% of the time
    console.log('🔍 RecruiterDashboard constructed user:', user?.id);
  }

  // Watch for currentUser changes (optimized to prevent form resets)
  useEffect(() => {
    if (currentUser?._id) {
      console.log('🔍 currentUser changed, triggering re-render');
      console.log('🔍 Current user profile data:', {
        name: currentUser.firstName + ' ' + currentUser.lastName,
        company: currentUser.companyInfo?.companyName || currentUser.company,
        department: currentUser.companyInfo?.department,
        jobTitle: currentUser.companyInfo?.designation || currentUser.job_title,
        bio: currentUser.bio,
        linkedin: currentUser.linkedin_url
      });
      // Only update trigger when user ID changes (new user login), not on profile updates
      // This prevents form resets during profile editing
    }
  }, [
    currentUser?._id // Only watch for user ID changes, not profile field changes
  ]); // Reduced dependencies to prevent form resets

  // Define comprehensive dashboard tabs for recruiters
  const dashboardTabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "jobs", label: "Job Management", icon: "💼" },
    {
      id: "applicants",
      label: "Applicants",
      icon: "👥",
      badge: dashboardData?.applications?.length || 0,
    },
    { id: "candidates", label: "Candidates", icon: "🎯" },
    { id: "interviews", label: "Interviews", icon: "🗣️" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: "🔔",
      badge: realTimeUnreadCount || 0,
      status: isNotificationConnected ? "connected" : "disconnected"
    },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "reports", label: "Reports", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Handle tab changes - moved before useEffect to avoid hoisting issues
  const handleTabChange = useCallback((tabId, subTabId = null) => {
    setActiveTab(tabId);
    if (subTabId) {
      setActiveJobTab(subTabId);
    }
    const basePath = "/recruiter-dashboard";
    let newPath;
    if (tabId === "dashboard") {
      newPath = basePath;
    } else if (tabId === "jobs" && subTabId) {
      newPath = `${basePath}/${tabId}/${subTabId}`;
    } else {
      newPath = `${basePath}/${tabId}`;
    }
    window.history.pushState({}, "", newPath);
  }, []);

  // Extract tab from URL with support for nested job tabs
  useEffect(() => {
    const pathParts = location.split("/");
    const validTabs = dashboardTabs.map((t) => t.id);
    
    console.log('🔍 RecruiterDashboard URL parsing:', { location, pathParts });
    
    if (location === "/recruiter-dashboard" || location === "/dashboard") {
      setActiveTab("dashboard");
      console.log('✅ RecruiterDashboard: Set to dashboard tab');
    } else if (pathParts.length >= 4) {
      // Handle nested paths: /recruiter-dashboard/jobs/active
      const mainTab = pathParts[2];
      const subTab = pathParts[3];
      
      if (mainTab === "jobs" && subTab) {
        const validJobTabs = ["post", "active", "draft", "closed"];
        if (validJobTabs.includes(subTab)) {
          setActiveTab("jobs");
          setActiveJobTab(subTab);
          console.log('✅ RecruiterDashboard: Set job tab:', mainTab, subTab);
        }
      } else if (validTabs.includes(mainTab) || mainTab === "applications") {
        setActiveTab(mainTab === "applications" ? "applicants" : mainTab);
        console.log('✅ RecruiterDashboard: Set main tab:', mainTab);
      }
    } else if (pathParts.length >= 3) {
      // Handle single-level tabs: /recruiter-dashboard/profile
      const tab = pathParts[2];
      if (validTabs.includes(tab) || tab === "applications") {
        setActiveTab(tab === "applications" ? "applicants" : tab);
        console.log('✅ RecruiterDashboard: Set single tab:', tab);
      }
    }
  }, [location, dashboardTabs]);
  
  // Enhanced navigation event listener
  useEffect(() => {
    const handleNavigationEvent = (event) => {
      const { tabId, jobTabId } = event.detail;
      console.log('🔍 RecruiterDashboard: Navigation event received:', { tabId, jobTabId });
      
      if (tabId && dashboardTabs.some(t => t.id === tabId)) {
        setActiveTab(tabId);
        if (jobTabId) {
          setActiveJobTab(jobTabId);
        }
        console.log('✅ RecruiterDashboard: Tab changed via event:', { tabId, jobTabId });
      }
    };
    
    window.addEventListener('dashboardTabChange', handleNavigationEvent);
    return () => window.removeEventListener('dashboardTabChange', handleNavigationEvent);
  }, [dashboardTabs]);

  // Listen for sidebar tab change events
  useEffect(() => {
    const handleSidebarTabChange = (event) => {
      const { tabId, jobTabId } = event.detail;
      setActiveTab(tabId);
      if (jobTabId) {
        setActiveJobTab(jobTabId);
      }
      handleTabChange(tabId);
    };

    window.addEventListener('dashboardTabChange', handleSidebarTabChange);
    return () => window.removeEventListener('dashboardTabChange', handleSidebarTabChange);
  }, [handleTabChange]);

  // Show loading state if dashboard context is not ready
  if (!dashboardContext || loading === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle profile edit - refresh the dashboard context user data
  const handleEditProfile = async (updatedUserData) => {
    console.log("🔄 Handling profile edit in RecruiterDashboard:", updatedUserData);
    try {
      // Force immediate re-render
      setProfileUpdateTrigger(prev => prev + 1);
      
      // Refresh current user data first
      if (refreshCurrentUser) {
        console.log("🔄 Refreshing current user data after profile update");
        await refreshCurrentUser();
        console.log("✅ Current user data refreshed");
      }
      
      // Wait a bit for the user data to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then refresh dashboard data to get updated stats
      if (refreshData) {
        console.log("🔄 Refreshing dashboard data after profile update");
        await refreshData();
        console.log("✅ Dashboard data refreshed");
      }
      
      // Force multiple re-renders to ensure UI updates
      setProfileUpdateTrigger(prev => prev + 1);
      
      // Additional triggers with delays to ensure all components update
      setTimeout(() => {
        console.log("🔄 Additional re-render trigger 1");
        setProfileUpdateTrigger(prev => prev + 1);
      }, 200);
      
      setTimeout(() => {
        console.log("🔄 Additional re-render trigger 2");
        setProfileUpdateTrigger(prev => prev + 1);
      }, 500);
      
      console.log("✅ Profile update complete - all refresh triggers set");
      
    } catch (error) {
      console.error("❌ Error handling profile edit:", error);
    }
  };

  // Dashboard overview cards
  const overviewCards = [
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      change: "+2 this month",
      changeType: "positive",
      gradient: "blue",
      icon: <WorkIcon sx={{ color: '#2563eb' }} />,
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      change: "+12 this week",
      changeType: "positive",
      gradient: "green",
      icon: <DescriptionIcon sx={{ color: '#10b981' }} />,
    },
    {
      title: "Shortlisted",
      value: stats?.shortlisted || 0,
      change: "+5 this week",
      changeType: "positive",
      gradient: "purple",
      icon: <StarIcon sx={{ color: '#8b5cf6' }} />,
    },
    {
      title: "Hired",
      value: stats?.hired || 0,
      change: "+1 this month",
      changeType: "positive",
      gradient: "orange",
      icon: <PersonIcon sx={{ color: '#f97316' }} />,
    },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <EnhancedProfileTab
            key={`profile-${currentUser?._id}`} // Stable key to prevent form resets
            user={user}
            onEdit={handleEditProfile}
            userRole="recruiter"
          />
        );
      case "settings":
        return <EnhancedSettingsTab />;
      case "jobs":
        const jobTabs = [
          { id: "post", label: "Post New Job", icon: "➕" },
          { id: "active", label: "Active Jobs", icon: "🟢" },
          { id: "draft", label: "Draft Jobs", icon: "📝" },
          { id: "closed", label: "Closed Jobs", icon: "🔒" },
        ];

        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 mb-6">
              {jobTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`tab-button px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 
                    ${
                      activeJobTab === tab.id
                        ? "active bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveJobTab(tab.id);
                    handleTabChange("jobs", tab.id);
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {activeJobTab === "post" && (
              <>
                {console.log('🔍 Rendering EnhancedJobPostingTab with editingJob:', editingJob)}
                <EnhancedJobPostingTab 
                  key={editingJob ? `edit-${editingJob.id || editingJob._id}` : 'new-job'}
                  editingJob={editingJob} 
                  onJobSaved={(result) => {
                    console.log('🔍 Job saved, result:', result);
                    console.log('🔍 Enhanced result isDraft:', result?.isDraft);
                    console.log('🔍 Enhanced result jobStatus:', result?.jobStatus);
                    setEditingJob(null);
                    
                    // Switch to appropriate tab based on job status
                    if (result?.isDraft || result?.jobStatus === 'draft' || result?.data?.status === 'draft') {
                      console.log('🔍 Switching to draft tab for draft job');
                      setActiveJobTab("draft");
                    } else {
                      console.log('🔍 Switching to active tab for active job');
                      setActiveJobTab("active");
                    }
                    
                    // Trigger a refresh of the jobs data
                    console.log('🔍 Triggering jobs refresh...');
                    setJobsRefreshTrigger(prev => prev + 1);
                  }} 
                />
              </>
            )}
            {activeJobTab === "active" && (
              <EnhancedJobsTab 
                key={`active-${jobsRefreshTrigger}`}
                userRole="recruiter" 
                jobType="active" 
                onEditJob={handleEditJob}
              />
            )}
            {activeJobTab === "draft" && (
              <EnhancedJobsTab 
                key={`draft-${jobsRefreshTrigger}`}
                userRole="recruiter" 
                jobType="draft" 
                onEditJob={handleEditJob}
              />
            )}
            {activeJobTab === "closed" && (
              <EnhancedJobsTab 
                key={`closed-${jobsRefreshTrigger}`}
                userRole="recruiter" 
                jobType="closed" 
                onEditJob={handleEditJob}
              />
            )}
          </div>
        );
      case "applicants":
        return <RealApplicationsTab />;
      case "candidates":
        return <EnhancedCandidatesTab />;
      case "interviews":
        return <EnhancedInterviewsTab />;
      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <DashboardCard {...card} />
                </motion.div>
              ))}
            </div>
          </div>
        );
      case "notifications":
        return <NotificationsTab />;
      default:
        return (
          <div className="space-y-8">
            {/* Login Status Banner */}
            <LoginStatusBanner />

            {/* Welcome Section */}
            <motion.div
              className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg md:rounded-md p-4 sm:p-6 md:p-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 break-words text-white">
                    Welcome Back, {getDisplayName(user)}! 🚀
                  </h2>
                  <p className="text-white text-sm sm:text-base md:text-lg opacity-90">
                    Ready to find the perfect candidates? Let's build your team!
                  </p>
                </div>
                <div className="hidden sm:block ml-4 flex-shrink-0">
                  <div className="text-4xl sm:text-5xl md:text-6xl">👥</div>
                </div>
              </div>
            </motion.div>

            {/* Job Metrics */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Dashboard Metrics</h2>
            </div>
            <JobMetrics userRole="recruiter" />

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Job Chart */}
              <div className="xl:col-span-2">
                <JobChart userRole="recruiter" />
              </div>

              {/* Recent Activity */}
              <div className="xl:col-span-1">
                <RecentActivity userRole="recruiter" />
              </div>
            </div>

            {/* Quick Actions */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Quick Post Job */}
              <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Post New Job
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Create a new job posting to attract top talent
                  </p>
                  <button
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => handleTabChange("jobs")}
                  >
                    Create Job Post
                  </button>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Recent Applications
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-semibold"
                    onClick={() => handleTabChange("applicants")}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {(dashboardData?.applications || []).slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {(app.applicantSnapshot?.fullName || app.applicantId?.firstName || app.applicantSnapshot?.firstName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {capitalizeWords(app.jobSnapshot?.title || app.jobId?.title || app.jobTitle || 'Unknown Position')}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {capitalizeWords(app.applicantSnapshot?.fullName ||
                             (app.applicantSnapshot?.firstName && app.applicantSnapshot?.lastName 
                              ? `${app.applicantSnapshot.firstName} ${app.applicantSnapshot.lastName}`
                              : app.applicantId?.firstName && app.applicantId?.lastName
                              ? `${app.applicantId.firstName} ${app.applicantId.lastName}`
                              : 'Unknown Applicant'))}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (app.applicationStatus || app.status) === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : (app.applicationStatus || app.status) === "under_review"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : (app.applicationStatus || app.status) === "shortlisted"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : (app.applicationStatus || app.status) === "interviewed"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : (app.applicationStatus || app.status) === "hired"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : (app.applicationStatus || app.status) === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {(() => {
                            const status = app.applicationStatus || app.status || 'pending';
                            switch (status) {
                              case 'pending': return 'Pending';
                              case 'under_review': return 'Under Review';
                              case 'shortlisted': return 'Shortlisted';
                              case 'interviewed': return 'Interviewed';
                              case 'hired': return 'Hired';
                              case 'rejected': return 'Rejected';
                              case 'withdrawn': return 'Withdrawn';
                              default: return status.charAt(0).toUpperCase() + status.slice(1);
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Analytics
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-semibold"
                    onClick={() => handleTabChange("analytics")}
                  >
                    View details
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Jobs
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {stats.activeJobs || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Applications
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {stats.totalApplications || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Hired
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {stats.hired || 0}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <ModernDashboardLayout
      title="Recruiter Dashboard"
      userRole="recruiter"
      user={user}
      activeTab={activeTab}
      activeJobTab={activeJobTab}
      showBreadcrumbs={false}
    >
      <div className="space-y-6">
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </ModernDashboardLayout>
  );
};

const RecruiterDashboardPage = () => {
  return <RecruiterDashboardContent />;
};

export default RecruiterDashboardPage;
