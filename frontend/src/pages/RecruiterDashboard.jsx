import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import ModernDashboardLayout from "../components/layout/ModernDashboardLayout";
import DashboardCard from "../components/cards/DashboardCard";
import {
  DashboardProvider,
  useDashboard,
} from "../contexts/RealDashboardContext";
import { ThemeProvider } from "../contexts/ThemeContext";
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
import EnhancedInterviewsTab from "../components/dashboard/EnhancedInterviewsTab";
import JobMetrics from "../components/dashboard/JobMetrics";
import RecentActivity from "../components/dashboard/RecentActivity";
import JobChart from "../components/dashboard/JobChart";
import CandidatesTab from "../components/dashboard/CandidatesTab";
import InterviewsTab from "../components/dashboard/InterviewsTab";
import LoginStatusBanner from "../components/dashboard/LoginStatusBanner";
import MessagesTab from "../components/dashboard/MessagesTab";

const RecruiterDashboardContent = () => {
  try {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeJobTab, setActiveJobTab] = useState("post");
  const [editingJob, setEditingJob] = useState(null);
  
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
    refreshCurrentUser 
  } = dashboardContext || {};

  // Debug: Log currentUser to see what fields are available (reduced logging)
  if (currentUser && Math.random() < 0.1) { // Only log 10% of the time to reduce spam
    console.log('🔍 RecruiterDashboard currentUser:', currentUser?._id);
    console.log('🔍 RecruiterDashboard editingJob state:', editingJob);
  }
  
  // Add a state to force re-render when profile updates
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0);

  // Handle job editing
  const handleEditJob = (job) => {
    console.log('🔍 RecruiterDashboard handleEditJob called with:', job);
    console.log('🔍 Job fields:', Object.keys(job || {}));
    setEditingJob(job);
    setActiveTab("jobs");
    setActiveJobTab("post");
    console.log('✅ Set editingJob state and switched to post tab');
  };

  // Listen for edit job events
  useEffect(() => {
    const handleEditJobEvent = (event) => {
      handleEditJob(event.detail.job);
    };

    window.addEventListener('editJob', handleEditJobEvent);
    return () => {
      window.removeEventListener('editJob', handleEditJobEvent);
    };
  }, []);

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

  // Watch for currentUser changes and trigger re-render
  useEffect(() => {
    if (currentUser) {
      // Reduced logging to prevent spam
      if (Math.random() < 0.1) {
        console.log('🔍 currentUser changed, triggering re-render');
      }
      setProfileUpdateTrigger(prev => prev + 1);
    }
  }, [currentUser?._id, currentUser?.updatedAt]); // Only watch for ID and updatedAt to prevent infinite loops

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
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "reports", label: "Reports", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Handle tab changes - moved before useEffect to avoid hoisting issues
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const basePath = "/recruiter-dashboard";
    const newPath = tabId === "dashboard" ? basePath : `${basePath}/${tabId}`;
    window.history.pushState({}, "", newPath);
  }, []);

  // Extract tab from URL
  useEffect(() => {
    const pathParts = location.split("/");
    const tab = pathParts[pathParts.length - 1];
    const validTabs = dashboardTabs.map((t) => t.id);
    if (validTabs.includes(tab)) {
      setActiveTab(tab);
    } else if (location === "/recruiter-dashboard") {
      setActiveTab("dashboard");
    }
  }, [location, dashboardTabs]);

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

  const stats = (getStats && getStats("recruiter")) || {
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0
  };

  // Handle profile edit - refresh the dashboard context user data
  const handleEditProfile = async (updatedUserData) => {
    console.log("🔄 Handling profile edit in RecruiterDashboard:", updatedUserData);
    try {
      // Force re-render by updating the trigger
      setProfileUpdateTrigger(prev => prev + 1);
      
      // Refresh current user data first
      if (refreshCurrentUser) {
        console.log("🔄 Refreshing current user data after profile update");
        await refreshCurrentUser();
      }
      
      // Then refresh dashboard data to get updated stats
      if (refreshData) {
        console.log("🔄 Refreshing dashboard data after profile update");
        await refreshData();
      }
      
      console.log("✅ Profile updated, user and dashboard data refreshed");
      
      // Additional trigger after refresh
      setTimeout(() => {
        setProfileUpdateTrigger(prev => prev + 1);
      }, 200);
    } catch (error) {
      console.error("❌ Error handling profile edit:", error);
    }
  };

  // Dashboard overview cards
  const overviewCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs || 0,
      change: "+2 this month",
      changeType: "positive",
      gradient: "blue",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
          />
        </svg>
      ),
    },
    {
      title: "Total Applications",
      value: stats.totalApplications || 0,
      change: "+12 this week",
      changeType: "positive",
      gradient: "green",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: "Shortlisted",
      value: stats.shortlisted || 0,
      change: "+5 this week",
      changeType: "positive",
      gradient: "purple",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Hired",
      value: stats.hired || 0,
      change: "+1 this month",
      changeType: "positive",
      gradient: "orange",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <EnhancedProfileTab
            key={`profile-${currentUser?._id}-${profileUpdateTrigger}-${currentUser?.updatedAt}`}
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
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 
                    ${
                      activeJobTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveJobTab(tab.id)}
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
                  onJobSaved={() => {
                    console.log('🔍 Job saved, clearing editingJob and switching to active tab');
                    setEditingJob(null);
                    setActiveJobTab("active");
                  }} 
                />
              </>
            )}
            {activeJobTab === "active" && (
              <EnhancedJobsTab 
                userRole="recruiter" 
                jobType="active" 
                onEditJob={handleEditJob}
              />
            )}
            {activeJobTab === "draft" && (
              <EnhancedJobsTab 
                userRole="recruiter" 
                jobType="draft" 
                onEditJob={handleEditJob}
              />
            )}
            {activeJobTab === "closed" && (
              <EnhancedJobsTab 
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
      case "messages":
        return <MessagesTab userRole="recruiter" />;
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
      default:
        return (
          <div className="space-y-8">
            {/* Login Status Banner */}
            <LoginStatusBanner />

            {/* Welcome Section */}
            <motion.div
              className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user.name}! 🚀
                  </h2>
                  <p className="text-green-100 text-lg">
                    Ready to find the perfect candidates? Let's build your team!
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="text-6xl">👥</div>
                </div>
              </div>
            </motion.div>

            {/* Job Metrics */}
            <JobMetrics userRole="recruiter" />

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Quick Post Job */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Applications
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
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
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {((app.jobTitle || app.jobId?.title || app.job?.title || 'N/A') || 'N').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {app.jobTitle || app.jobId?.title || app.job?.title || 'Unknown Position'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {app.company || app.jobId?.company || app.job?.company || 'Unknown Company'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : app.status === "shortlisted"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {app.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Analytics
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                    onClick={() => handleTabChange("analytics")}
                  >
                    View details
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Job Views
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      1,234
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Applications
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.totalApplications || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Response Rate
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      68%
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
  } catch (error) {
    console.error('RecruiterDashboard error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
};

const RecruiterDashboardPage = () => {
  return <RecruiterDashboardContent />;
};

export default RecruiterDashboardPage;
