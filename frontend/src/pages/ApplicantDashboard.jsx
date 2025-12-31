import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import ModernDashboardLayout from "../components/layout/ModernDashboardLayout";
import DashboardCard from "../components/cards/DashboardCard";
import {
  DashboardProvider,
  useDashboard,
} from "../contexts/RealDashboardContext";
import { IntegratedThemeProvider } from "../contexts/IntegratedThemeContext";
import {
  EnhancedProfileTab,
  EnhancedSettingsTab,
  EnhancedJobsTab,
  EnhancedApplicationsTab,
  EnhancedAnalyticsTab,
} from "../components/dashboard/EnhancedDashboardTabs";
import MyApplicationsTab from "../components/dashboard/applicant/MyApplicationsTab";
import JobAlertsTab from "../components/dashboard/JobAlertsTab";
import RecentActivity from "../components/dashboard/RecentActivity";
import JobChart from "../components/dashboard/JobChart";
import JobMetrics from "../components/dashboard/JobMetrics";
import LoginStatusBanner from "../components/dashboard/LoginStatusBanner";
import EmptyState from "../components/dashboard/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { toast } from "react-hot-toast";
import { getRecommendedJobs } from "../api/recommendations";
import JobApplicationModal from "../components/modals/JobApplicationModal";
import AuthModal from "../components/modals/AuthModal";
import { applicationService } from "../services/applicationService";
import { 
  CheckCircle as CheckCircleIcon, 
  Description as DescriptionIcon, 
  Star as StarIcon, 
  EmojiEvents as EmojiEventsIcon 
} from '@mui/icons-material';
import { getDisplayName, capitalizeWords } from '../utils/textHelpers';

const ApplicantDashboardContent = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const {
    currentUser,
    isAuthenticated,
    getStats,
    dashboardData,
    loading,
    demoAccounts,
  } = useDashboard();

  // Auth and application state
  const { user: authUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  // Modal states
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] =
    useState(null);

  // Recommended jobs state
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [pendingApplication, setPendingApplication] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);

  // Applied jobs tracking
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Use real user data if authenticated, otherwise use demo data
  const user = (authUser || currentUser) ? {
    id: (authUser || currentUser)?._id || (authUser || currentUser)?.id,
    name: (authUser || currentUser)?.name || 
          (authUser || currentUser)?.fullName || 
          `${(authUser || currentUser)?.firstName || ''} ${(authUser || currentUser)?.lastName || ''}`.trim() ||
          'User',
    firstName: (authUser || currentUser)?.firstName,
    lastName: (authUser || currentUser)?.lastName,
    email: (authUser || currentUser)?.email,
    phone: (authUser || currentUser)?.phone,
    location: (authUser || currentUser)?.location || (authUser || currentUser)?.currentLocation?.city || "Not specified",
    bio: (authUser || currentUser)?.bio || "",
    skills: (authUser || currentUser)?.skills || [],
    qualification: (authUser || currentUser)?.qualification || 
                  (Array.isArray((authUser || currentUser)?.education) && (authUser || currentUser)?.education.length > 0
                    ? (authUser || currentUser)?.education[0]?.degree 
                    : (authUser || currentUser)?.education) || "",
    experience: (authUser || currentUser)?.experience || (authUser || currentUser)?.yearsOfExperience || 0,
    role: (authUser || currentUser)?.role || "applicant",
    profileCompletion: (authUser || currentUser)?.profileCompletion || { percentage: 0 },
    profile_picture: (authUser || currentUser)?.profile_picture || (authUser || currentUser)?.profilePicture,
  } : {
    id: 1,
    name: "Demo User",
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
    profileCompletion: { percentage: 85 },
  };

  // Get role-specific stats with null safety
  const stats = getStats("applicant") || {
    profileCompletion: 0,
    appliedJobs: 0,
    shortlisted: 0,
    interviews: 0,
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
    { id: "job-alerts", label: "Job Alerts", icon: "🔔" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Extract tab from URL with improved parsing
  useEffect(() => {
    const pathParts = location.split("/");
    const validTabs = dashboardTabs.map((t) => t.id);

    // URL parsing for tab detection

    if (location === "/applicant-dashboard" || location === "/dashboard") {
      setActiveTab("dashboard");
    } else if (pathParts.length >= 3) {
      const tab = pathParts[2]; // /applicant-dashboard/[tab]
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
        console.log("✅ ApplicantDashboard: Set active tab to:", tab);
      }
    } else {
      // Fallback: check last part of URL
      const tab = pathParts[pathParts.length - 1];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [location, dashboardTabs]);

  // Listen for navigation events from sidebar
  useEffect(() => {
    const handleNavigationEvent = (event) => {
      const { tabId } = event.detail;
      if (tabId && dashboardTabs.some((t) => t.id === tabId)) {
        setActiveTab(tabId);
        console.log("✅ ApplicantDashboard: Tab changed via event to:", tabId);
      }
    };

    window.addEventListener("dashboardTabChange", handleNavigationEvent);
    return () =>
      window.removeEventListener("dashboardTabChange", handleNavigationEvent);
  }, [dashboardTabs]);

  // Fetch recommended jobs for applicants
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      if (!isAuthenticated || !authUser || authUser.role !== "applicant") {
        return;
      }

      setLoadingRecommendations(true);
      try {
        const response = await getRecommendedJobs({
          limit: 3,
          minMatchPercentage: 10,
        });
        if (response.success && response.data?.jobs) {
          setRecommendedJobs(response.data.jobs);
        }
      } catch (error) {
        console.error("Error fetching recommended jobs:", error);
        // Fallback to empty array on error
        setRecommendedJobs([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendedJobs();
  }, [isAuthenticated, authUser]);

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const basePath = "/applicant-dashboard";
    const newPath = tabId === "dashboard" ? basePath : `${basePath}/${tabId}`;
    setLocation(newPath);
  };

  // Job application functions
  const handleApplyJob = (job) => {
    console.log("🔍 Apply button clicked for job:", job.title || job.jobTitle);

    // Check if user is authenticated
    if (!user || !(user.id || user._id || user.userId)) {
      console.log("❌ User not authenticated, showing login modal");
      setPendingApplication(job);
      setAuthModalOpen(true);
      return;
    }

    // Check if user is recruiter (recruiters can't apply to jobs)
    if (user.role === "recruiter") {
      alert(
        "Recruiters cannot apply to jobs. Please switch to an applicant account."
      );
      return;
    }

    // Check if already applied (handle different ID formats)
    const jobId = job.id || job._id;
    if (appliedJobs.has(jobId)) {
      alert("You have already applied to this job!");
      return;
    }

    console.log("✅ Opening application modal for job:", jobId);

    // Open application modal
    setSelectedJobForApplication(job);
    setApplicationModalOpen(true);
  };

  const handleSaveJob = (job) => {
    console.log("🔍 Save/Favorite button clicked for job:", job);
    const jobId = job.id || job._id;

    if (isFavorite(jobId)) {
      removeFromFavorites(jobId);
      console.log("✅ Job removed from favorites:", jobId);
    } else {
      addToFavorites(job);
      console.log("✅ Job added to favorites:", jobId);
    }
  };

  // Handle application submission
  const handleSubmitApplication = async (applicationData) => {
    try {
      setApplicationLoading(true);
      console.log("🔍 Submitting application with data:", applicationData);

      // Log FormData contents for debugging
      for (let [key, value] of applicationData.entries()) {
        console.log(`🔍 FormData field: ${key} = ${value}`);
      }

      const response = await applicationService.submitApplication(
        applicationData
      );

      // Update applied jobs state
      const jobId = applicationData.get("jobId");
      setAppliedJobs((prev) => new Set([...prev, jobId]));

      console.log("✅ Application submitted successfully:", response);
      alert(
        `Application submitted successfully for ${
          selectedJobForApplication?.title ||
          selectedJobForApplication?.jobTitle
        }!`
      );

      // Close modal
      setApplicationModalOpen(false);
      setSelectedJobForApplication(null);
    } catch (error) {
      console.error("❌ Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    } finally {
      setApplicationLoading(false);
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (pendingApplication) {
      // Retry the application after successful auth
      handleApplyJob(pendingApplication);
      setPendingApplication(null);
    }
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
      change:
        stats.profileCompletion >= 80
          ? "Great progress!"
          : "Complete your profile",
      changeType: stats.profileCompletion >= 80 ? "positive" : "neutral",
      gradient: "blue",
      icon: <CheckCircleIcon sx={{ color: '#2563eb' }} />,
    },
    {
      title: "Applied Jobs",
      value: stats.appliedJobs || 0,
      change: `${stats.totalApplications || 0} total applications`,
      changeType: "positive",
      gradient: "green",
      icon: <DescriptionIcon sx={{ color: '#10b981' }} />,
    },
    {
      title: "Shortlisted",
      value: stats.shortlisted || 0,
      change: `${(
        ((stats.shortlisted || 0) / Math.max(1, stats.totalApplications || 1)) *
        100
      ).toFixed(1)}% success rate`,
      changeType: "positive",
      gradient: "purple",
      icon: <StarIcon sx={{ color: '#8b5cf6' }} />,
    },
    {
      title: "Interviews",
      value: stats.interviews || 0,
      change: "Next: Tomorrow 2 PM",
      changeType: "neutral",
      gradient: "orange",
      icon: <EmojiEventsIcon sx={{ color: '#f97316' }} />,
    },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <EnhancedProfileTab
            user={user}
            onEdit={handleEditProfile}
            userRole="applicant"
          />
        );
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
        return <MyApplicationsTab />;
      case "job-alerts":
        return <JobAlertsTab />;
      case "analytics":
        return <EnhancedAnalyticsTab userRole="applicant" />;
      default:
        return (
          <div className="space-y-8">
            {/* Login Status Banner */}
            <LoginStatusBanner />

            {/* Welcome Section */}
            <motion.div
              className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-md p-8 sm:p-10 text-white shadow-xl relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 text-white tracking-tight">
                    Welcome Back, {getDisplayName(user)}! 👋
                  </h2>
                  <p className="text-white text-sm sm:text-base md:text-lg font-medium max-w-xl leading-relaxed opacity-90">
                    You have{" "}
                    <span className="text-white font-bold">3 new matches</span>{" "}
                    and{" "}
                    <span className="text-white font-bold">
                      2 interview requests
                    </span>{" "}
                    today. Let's find your dream job!
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleTabChange("jobs")}
                      className="px-5 py-2.5 bg-white text-indigo-600 rounded-md font-semibold text-sm shadow-lg hover:bg-blue-50 transition-all active:scale-95"
                    >
                      Browse Jobs
                    </button>
                    <button
                      onClick={() => handleTabChange("profile")}
                      className="px-5 py-2.5 bg-white/20 text-white border border-white/30 rounded-md font-semibold text-sm backdrop-blur-sm hover:bg-white/30 transition-all active:scale-95"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block ml-8 transform hover:scale-110 transition-transform duration-500">
                  <div className="bg-white/10 p-6 rounded-md backdrop-blur-md border border-white/10 shadow-2xl">
                    <div className="text-6xl filter drop-shadow-lg">🚀</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Job Metrics */}
            <JobMetrics userRole="applicant" />

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Recent Applications */}
              <div
                className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-inter">
                    Recent Applications
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold transition-colors duration-200"
                    onClick={() => handleTabChange("applications")}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Debug applications data structure */}
                  {dashboardData?.applications &&
                    console.log(
                      "🔍 Applications data:",
                      dashboardData.applications
                    )}
                  {dashboardData?.applications &&
                    dashboardData.applications[0] &&
                    console.log(
                      "🔍 First application structure:",
                      dashboardData.applications[0]
                    )}
                  {dashboardData?.applications &&
                    dashboardData.applications[0] &&
                    console.log(
                      "🔍 First app jobId:",
                      dashboardData.applications[0].jobId
                    )}
                  {dashboardData?.applications &&
                  dashboardData.applications.length > 0 ? (
                    dashboardData.applications.slice(0, 3).map((app) => (
                      <div
                        key={app.id || app._id || app.applicationId}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white font-inter">
                              {capitalizeWords(app.jobSnapshot?.title ||
                                app.jobTitle ||
                                app.jobId?.title ||
                                app.jobId?.jobTitle ||
                                app.job?.title ||
                                app.job?.jobTitle ||
                                app.jobSnapshot?.jobTitle ||
                                app.title ||
                                app.position ||
                                "Job Title Not Available")}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                            {app.jobSnapshot?.company ||
                              app.company ||
                              app.companyName ||
                              app.jobId?.companyName ||
                              app.jobId?.company ||
                              app.job?.companyName ||
                              app.job?.company ||
                              app.jobSnapshot?.companyName ||
                              app.employer ||
                              "Company Not Available"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (app.status || app.applicationStatus) === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : (app.status || app.applicationStatus) ===
                                "shortlisted"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : (app.status || app.applicationStatus) ===
                                "interviewed"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {app.status || app.applicationStatus || "pending"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-gray-600 dark:text-gray-300 font-inter dashboard-text">
                        No applications yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-inter dashboard-secondary">
                        {isAuthenticated
                          ? "Start applying to jobs to see them here"
                          : "Login to see your applications"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Jobs */}
              <div
                className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-inter">
                    Recommended Jobs
                  </h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold transition-colors duration-200"
                    onClick={() => handleTabChange("recommended")}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Debug recommended jobs data structure */}
                  {recommendedJobs &&
                    console.log("🔍 Recommended jobs data:", recommendedJobs)}
                  {loadingRecommendations ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-300 dashboard-text">
                        Loading recommendations...
                      </span>
                    </div>
                  ) : recommendedJobs && recommendedJobs.length > 0 ? (
                    recommendedJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id || job._id || job.jobId}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white font-inter">
                              {capitalizeWords(job.jobTitle ||
                                job.title ||
                                "Job Title Not Available")}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                              {job.companyName ||
                                job.company ||
                                "Company Not Available"}{" "}
                              • {job.location || "Location Not Available"}
                            </p>
                            {/* Match score indicator */}
                            {job.matchScore && (
                              <div className="flex items-center mt-1">
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-1 rounded-full">
                                  {job.matchScore.overall}% Match
                                </span>
                                {job.recommendationReasons &&
                                  job.recommendationReasons.length > 0 && (
                                    <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                                      {job.recommendationReasons[0]}
                                    </span>
                                  )}
                              </div>
                            )}
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                              {typeof job.salary === "string"
                                ? job.salary
                                : job.salaryRange
                                ? `₹${job.salaryRange.min / 100000}L - ₹${
                                    job.salaryRange.max / 100000
                                  }L ${job.salaryRange.period || "Yearly"}`
                                : "Salary Not Disclosed"}
                            </p>
                            {/* Additional job details */}
                            <div className="mt-2 space-y-1">
                              {job.jobType && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 dashboard-muted">
                                  📋 {job.jobType}
                                </p>
                              )}
                              {job.experience && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 dashboard-muted">
                                  🎯{" "}
                                  {typeof job.experience === "string"
                                    ? job.experience
                                        .toLowerCase()
                                        .includes("experience")
                                      ? job.experience
                                      : `${job.experience} experience required`
                                    : typeof job.experience === "number"
                                    ? `${job.experience} years experience required`
                                    : typeof job.experience === "object"
                                    ? job.experience.minimum &&
                                      job.experience.maximum
                                      ? `${job.experience.minimum}-${job.experience.maximum} years experience required`
                                      : job.experience.minimum
                                      ? `${job.experience.minimum}+ years experience required`
                                      : "Experience required"
                                    : "Experience required"}
                                </p>
                              )}
                               {job.requiredSkills &&
                                 Array.isArray(job.requiredSkills) &&
                                 job.requiredSkills.length > 0 && (
                                   <p className="text-xs text-gray-600 dark:text-gray-300 dashboard-muted">
                                     💡 Skills:{" "}
                                     {job.requiredSkills.slice(0, 3).join(", ")}
                                     {job.requiredSkills.length > 3 ? "..." : ""}
                                   </p>
                                 )}
                            </div>
                          </div>
                          <button
                            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm rounded-lg font-medium font-inter transition-colors duration-200"
                            onClick={() =>
                              handleApplyJob(job.id || job._id || job.jobId)
                            }
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">⭐</div>
                      <p className="text-gray-600 dark:text-gray-300 font-inter dashboard-text">
                        No personalized recommendations yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-inter dashboard-secondary">
                        {isAuthenticated
                          ? "Complete your profile with skills and preferences to get better job recommendations"
                          : "Login to see personalized job recommendations based on your skills"}
                      </p>
                      {isAuthenticated && (
                        <button
                          onClick={() => handleTabChange("profile")}
                          className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium font-inter transition-colors duration-200"
                        >
                          Complete Profile →
                        </button>
                      )}
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

      {/* Job Application Modal */}
      <JobApplicationModal
        open={applicationModalOpen}
        onClose={() => {
          setApplicationModalOpen(false);
          setSelectedJobForApplication(null);
        }}
        job={selectedJobForApplication}
        user={user}
        onSubmit={handleSubmitApplication}
        loading={applicationLoading}
      />

      {/* Authentication Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingApplication(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </ModernDashboardLayout>
  );
};

const ApplicantDashboardPage = () => {
  return (
    <DashboardProvider>
      <ApplicantDashboardContent />
    </DashboardProvider>
  );
};

export default ApplicantDashboardPage;
