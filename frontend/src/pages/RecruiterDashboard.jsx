import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import ModernDashboardLayout from "../components/layout/ModernDashboardLayout";
import DashboardCard from "../components/cards/DashboardCard";
import { DashboardProvider, useDashboard } from "../contexts/DashboardContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import {
  EnhancedProfileTab,
  EnhancedSettingsTab,
} from "../components/dashboard/EnhancedDashboardTabs";
import JobMetrics from "../components/dashboard/JobMetrics";
import RecentActivity from "../components/dashboard/RecentActivity";
import JobChart from "../components/dashboard/JobChart";
import CandidatesTab from "../components/dashboard/CandidatesTab";
import InterviewsTab from "../components/dashboard/InterviewsTab";
import MessagesTab from "../components/dashboard/MessagesTab";

const RecruiterDashboardContent = () => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { dashboardStats, jobs, applications } = useDashboard();

  // Mock user data - authentication removed
  const user = {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+91 9876543211",
    location: "Bangalore, India",
    company: "TechCorp India",
    role: "recruiter",
    linkedin_url: "https://linkedin.com/in/sarahjohnson",
    profileComplete: 95,
  };

  // Define comprehensive dashboard tabs for recruiters
  const dashboardTabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "jobs", label: "Job Management", icon: "💼" },
    {
      id: "applicants",
      label: "Applicants",
      icon: "👥",
      badge: applications.length,
    },
    { id: "candidates", label: "Candidates", icon: "🎯" },
    { id: "interviews", label: "Interviews", icon: "🗣️" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "reports", label: "Reports", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

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

  const stats = dashboardStats.recruiter;

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const basePath = "/recruiter-dashboard";
    const newPath = tabId === "dashboard" ? basePath : `${basePath}/${tabId}`;
    window.history.pushState({}, "", newPath);
  };

  // Mock functions for enhanced components
  const handleEditProfile = () => {
    console.log("Editing recruiter profile");
  };

  // Dashboard overview cards
  const overviewCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
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
      value: stats.totalApplications,
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
      value: stats.shortlistedCandidates,
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
      value: stats.hiredCandidates,
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
        return <EnhancedProfileTab user={user} onEdit={handleEditProfile} userRole="recruiter" />;
      case "settings":
        return <EnhancedSettingsTab />;
      case "jobs":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Job Management
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Job Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create, edit, and manage your job postings.
              </p>
            </div>
          </div>
        );
      case "applicants":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Applicants
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {applications.map((app) => (
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
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Applied: {app.appliedDate}
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
                ))}
              </div>
            </div>
          </div>
        );
      case "candidates":
        return <CandidatesTab />;
      case "interviews":
        return <InterviewsTab />;
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
                  {applications.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {app.jobTitle.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {app.jobTitle}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {app.company}
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
                        {app.status}
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
                      {stats.totalApplications}
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
      showBreadcrumbs={activeTab !== "dashboard"}
      breadcrumbs={
        activeTab !== "dashboard"
          ? [
              { name: "Dashboard", path: "/recruiter-dashboard" },
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

const RecruiterDashboardPage = () => {
  return <RecruiterDashboardContent />;
};

export default RecruiterDashboardPage;
