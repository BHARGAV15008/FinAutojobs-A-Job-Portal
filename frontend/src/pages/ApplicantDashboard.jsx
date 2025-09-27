import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import ModernDashboardLayout from "../components/layout/ModernDashboardLayout";
import DashboardCard from "../components/cards/DashboardCard";
import { DashboardProvider, useDashboard } from "../contexts/RealDashboardContext";
import { IntegratedThemeProvider } from "../contexts/IntegratedThemeContext";
import {
  EnhancedProfileTab,
  EnhancedSettingsTab,
  EnhancedJobsTab,
  EnhancedApplicationsTab,
  EnhancedAnalyticsTab,
} from "../components/dashboard/EnhancedDashboardTabs";
import JobMetrics from "../components/dashboard/JobMetrics";
import RecentActivity from "../components/dashboard/RecentActivity";
import JobChart from "../components/dashboard/JobChart";
import LoginStatusBanner from "../components/dashboard/LoginStatusBanner";
import EmptyState from "../components/dashboard/EmptyState";

const ApplicantDashboardContent = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { 
    currentUser, 
    isAuthenticated, 
    getStats, 
    dashboardData, 
    loading,
    demoAccounts 
  } = useDashboard();

  // Use real user data if authenticated, otherwise use demo data
  const user = currentUser || {
    id: 1,
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com",
    phone: "+91 9876543210",
    location: "Mumbai, India",
    bio: "Experienced software developer with 5+ years in full-stack development",
    skills: ["JavaScript", "React", "Node.js", "Python", "MongoDB"],
    qualification: "B.Tech Computer Science",
    experience: 5,
    role: "applicant",
    profileCompletion: { percentage: 85 }
  };

  // Get role-specific stats with null safety
  const stats = getStats('applicant') || {
    profileCompletion: 0,
    appliedJobs: 0,
    shortlisted: 0,
    interviews: 0
  };

  // Define comprehensive dashboard tabs
  const dashboardTabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "jobs", label: "Browse Jobs", icon: "💼" },
    { id: "recommended", label: "Recommended", icon: "⭐" },
    { id: "favorites", label: "Favorites", icon: "❤️" },
    {
      id: "applications",
      label: "Applications",
      icon: "📄",
      badge: dashboardData?.applications?.length || 0,
    },
    { id: "resume", label: "Resume Builder", icon: "📝" },
    { id: "job-alerts", label: "Job Alerts", icon: "🔔" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Extract tab from URL
  useEffect(() => {
    const pathParts = location.split("/");
    const tab = pathParts[pathParts.length - 1];
    const validTabs = dashboardTabs.map((t) => t.id);
    if (validTabs.includes(tab)) {
      setActiveTab(tab);
    } else if (location === "/applicant-dashboard") {
      setActiveTab("dashboard");
    }
  }, [location, dashboardTabs]);

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const basePath = "/applicant-dashboard";
    const newPath = tabId === "dashboard" ? basePath : `${basePath}/${tabId}`;
    setLocation(newPath);
  };

  // Mock functions for enhanced components
  const handleApplyJob = (jobId) => {
    console.log("Applying to job:", jobId);
    // TODO: Implement job application logic
  };

  const handleSaveJob = (jobId) => {
    console.log("Saving job:", jobId);
    // TODO: Implement job saving logic
  };

  const handleEditProfile = () => {
    console.log("Editing profile");
    // TODO: Implement profile editing
  };

  // Dashboard overview cards
  const overviewCards = [
    {
      title: "Profile Completion",
      value: `${stats.profileCompletion || 0}%`,
      change: "+5% from last week",
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: "Applied Jobs",
      value: stats.appliedJobs || 0,
      change: "+3 this week",
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
      change: "+1 this week",
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
      title: "Interviews",
      value: stats.interviews || 0,
      change: "Next: Tomorrow 2 PM",
      changeType: "neutral",
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
            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-1 1v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4l-1-1m2 0h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V8a2 2 0 012-2z"
          />
        </svg>
      ),
    },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <EnhancedProfileTab user={user} onEdit={handleEditProfile} userRole="applicant" />;
      case "settings":
        return <EnhancedSettingsTab />;
      case "jobs":
        return (
          <EnhancedJobsTab
            jobType="all"
            userRole="applicant"
            onApply={handleApplyJob}
            onSave={handleSaveJob}
          />
        );
      case "recommended":
        return (
          <EnhancedJobsTab
            jobType="recommended"
            userRole="applicant"
            onApply={handleApplyJob}
            onSave={handleSaveJob}
          />
        );
      case "favorites":
        return (
          <EnhancedJobsTab
            jobType="favorites"
            userRole="applicant"
            onApply={handleApplyJob}
            onSave={handleSaveJob}
          />
        );
      case "applications":
        return <EnhancedApplicationsTab userRole="applicant" />;
      case "resume":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Resume Builder
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Resume Builder Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build professional resumes with our AI-powered builder.
              </p>
            </div>
          </div>
        );
      case "job-alerts":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Job Alerts
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Job Alerts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get notified about new job opportunities that match your skills.
              </p>
            </div>
          </div>
        );
      case "analytics":
        return <EnhancedAnalyticsTab userRole="applicant" />;
      default:
        return (
          <div className="space-y-8">
            {/* Login Status Banner */}
            <LoginStatusBanner />
            
            {/* Welcome Section */}
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user.firstName} {user.lastName}! 👋
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Ready to find your next opportunity? Let's get started!
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="text-6xl">🚀</div>
                </div>
              </div>
            </motion.div>

            {/* Job Metrics */}
            <JobMetrics userRole="applicant" />

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Job Chart */}
              <div className="xl:col-span-2">
                <JobChart userRole="applicant" />
              </div>

              {/* Recent Activity */}
              <div className="xl:col-span-1">
                <RecentActivity userRole="applicant" />
              </div>
            </div>

            {/* Quick Actions */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Recent Applications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Applications
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                    onClick={() => handleTabChange("applications")}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {dashboardData?.applications && dashboardData.applications.length > 0 ? (
                    dashboardData.applications.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {app.jobTitle}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {app.company}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : app.status === "shortlisted"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {isAuthenticated ? "Start applying to jobs to see them here" : "Login to see your applications"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Jobs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recommended Jobs
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                    onClick={() => handleTabChange("recommended")}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {dashboardData?.recentJobs && dashboardData.recentJobs.length > 0 ? (
                    dashboardData.recentJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {job.company} • {job.location}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                              {job.salary}
                            </p>
                          </div>
                          <button
                            className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={() => handleApplyJob(job.id)}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">💼</div>
                      <p className="text-gray-500 dark:text-gray-400">No recommended jobs yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {isAuthenticated ? "Check back later for job recommendations" : "Login to see personalized job recommendations"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <ModernDashboardLayout
      title="Applicant Dashboard"
      userRole="applicant"
      user={user}
      breadcrumbs={
        activeTab !== "overview"
          ? [
              { name: "Dashboard", path: "/applicant-dashboard" },
              {
                name:
                  activeTab.charAt(0).toUpperCase() +
                  activeTab.slice(1).replace("-", " "),
                path: `/${activeTab}`,
              },
            ]
          : []
      }
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

const ApplicantDashboardPage = () => {
  return (
    <IntegratedThemeProvider>
      <DashboardProvider>
        <ApplicantDashboardContent />
      </DashboardProvider>
    </IntegratedThemeProvider>
  );
};

export default ApplicantDashboardPage;
