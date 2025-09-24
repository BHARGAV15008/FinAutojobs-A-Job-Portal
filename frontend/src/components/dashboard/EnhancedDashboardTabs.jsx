import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/IntegratedThemeContext";
import { useDashboard } from "../../contexts/RealDashboardContext";
import {
  JobsFilter,
  ApplicationsFilter,
  AnalyticsFilter,
} from "./DashboardFilters";
import ProfileEditModal from "../profile/ProfileEditModal";
import { profileApi } from "../../services/profileApi";

// Enhanced Tab Navigation Component
export const DashboardTabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  userRole,
}) => {
  const { darkMode } = useTheme();

  const tabVariants = {
    inactive: {
      scale: 1,
      backgroundColor: darkMode
        ? "rgba(55, 65, 81, 0.5)"
        : "rgba(243, 244, 246, 0.8)",
    },
    active: {
      scale: 1.02,
      backgroundColor: darkMode
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
    },
    hover: {
      scale: 1.05,
      backgroundColor: darkMode
        ? "rgba(75, 85, 99, 0.8)"
        : "rgba(229, 231, 235, 0.9)",
    },
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          className={`
            relative px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
            ${
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }
          `}
          variants={tabVariants}
          initial="inactive"
          animate={activeTab === tab.id ? "active" : "inactive"}
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange(tab.id)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && (
              <motion.span
                className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {tab.badge}
              </motion.span>
            )}
          </div>

          {activeTab === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

// Enhanced Profile Tab Component
export const EnhancedProfileTab = ({
  user,
  onEdit,
  userRole = "applicant",
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const profileCompletion = currentUser?.profileComplete || 85;

  // Helper function to safely convert values to strings
  const safeStringValue = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      // Handle location object
      if (value.country) return value.country;
      if (value.city && value.country) return `${value.city}, ${value.country}`;
      // Handle other objects by converting to JSON
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Create role-specific profile sections
  const getProfileSections = () => {
    const personalInfo = {
      title: "Personal Information",
      icon: "👤",
      fields: [
        { label: "Full Name", value: safeStringValue(user?.name), icon: "📝" },
        { label: "Email", value: safeStringValue(user?.email), icon: "📧" },
        { label: "Phone", value: safeStringValue(user?.phone), icon: "📱" },
        {
          label: "Location",
          value: safeStringValue(user?.location),
          icon: "📍",
        },
      ],
    };

    const linksSection = {
      title: "Links & Social",
      icon: "🔗",
      fields: [
        {
          label: "LinkedIn",
          value: safeStringValue(user?.linkedin_url),
          icon: "💼",
        },
        {
          label: "GitHub",
          value: safeStringValue(user?.github_url),
          icon: "💻",
        },
        {
          label: "Portfolio",
          value: safeStringValue(user?.portfolio_url),
          icon: "🌐",
        },
      ],
    };

    // Role-specific professional details
    let professionalDetails = {};

    if (userRole === "applicant") {
      professionalDetails = {
        title: "Professional Details",
        icon: "💼",
        fields: [
          {
            label: "Bio",
            value: safeStringValue(user?.bio),
            multiline: true,
            icon: "📄",
          },
          {
            label: "Skills",
            value: Array.isArray(user?.skills)
              ? user.skills.join(", ")
              : safeStringValue(user?.skills),
            icon: "🛠️",
          },
          {
            label: "Experience",
            value: `${user?.experience_years || user?.experience || 0} years`,
            icon: "⏱️",
          },
          {
            label: "Qualification",
            value: safeStringValue(user?.qualification),
            icon: "🎓",
          },
        ],
      };
    } else if (userRole === "recruiter") {
      professionalDetails = {
        title: "Professional Details",
        icon: "💼",
        fields: [
          {
            label: "Bio",
            value: safeStringValue(user?.bio),
            multiline: true,
            icon: "📄",
          },
          {
            label: "Company",
            value: safeStringValue(user?.company),
            icon: "🏢",
          },
          {
            label: "Department",
            value: safeStringValue(user?.department),
            icon: "🏛️",
          },
          {
            label: "Experience",
            value: `${user?.experience_years || user?.experience || 0} years`,
            icon: "⏱️",
          },
        ],
      };
    } else if (userRole === "admin") {
      professionalDetails = {
        title: "Administrative Details",
        icon: "⚙️",
        fields: [
          {
            label: "Bio",
            value: safeStringValue(user?.bio),
            multiline: true,
            icon: "📄",
          },
          {
            label: "Department",
            value: safeStringValue(user?.department) || "System Administration",
            icon: "🏛️",
          },
          {
            label: "Access Level",
            value: safeStringValue(user?.access_level) || "Full Access",
            icon: "🔐",
          },
          {
            label: "Experience",
            value: `${user?.experience_years || user?.experience || 0} years`,
            icon: "⏱️",
          },
        ],
      };
    }

    return [personalInfo, professionalDetails, linksSection];
  };

  const profileSections = getProfileSections();

  // Handle profile save
  const handleProfileSave = async (formData) => {
    setLoading(true);
    try {
      const response = await profileApi.updateProfile(formData);
      if (response.success) {
        setCurrentUser(response.data);
        // Call parent onEdit if provided
        if (onEdit) {
          onEdit(response.data);
        }
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Profile Completion Card */}
      <motion.div
        className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Profile Completion
          </h3>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {profileCompletion}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${profileCompletion}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete your profile to get better job recommendations and increase
          visibility.
        </p>

        <motion.button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditModalOpen(true)}
          disabled={loading}
        >
          ✏️ {loading ? "Saving..." : "Edit Profile"}
        </motion.button>
      </motion.div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profileSections.map((section, index) => (
          <motion.div
            key={section.title}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">{section.icon}</span>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h4>
            </div>

            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="border-l-4 border-blue-200 dark:border-blue-700 pl-4"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span>{field.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      field.value
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500 italic"
                    } ${field.multiline ? "whitespace-pre-wrap" : "truncate"}`}
                  >
                    {field.value || "Not provided"}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
        userRole={userRole}
        onSave={handleProfileSave}
      />
    </motion.div>
  );
};

// Enhanced Settings Tab Component
export const EnhancedSettingsTab = () => {
  const {
    darkMode,
    systemTheme,
    fontSize,
    fontFamily,
    language,
    setThemeMode,
    setFontSize,
    setFontFamily,
    setLanguage,
    fontSizeOptions,
    fontFamilyOptions,
    languageOptions,
  } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    jobAlerts: true,
    messages: false,
  });

  const settingSections = [
    {
      title: "Appearance",
      icon: "🎨",
      settings: [
        {
          type: "theme",
          label: "Theme Mode",
          icon: "🌓",
          options: [
            { value: "light", label: "Light", icon: "☀️" },
            { value: "dark", label: "Dark", icon: "🌙" },
            { value: "system", label: "System", icon: "💻" },
          ],
        },
        {
          type: "fontSize",
          label: "Font Size",
          icon: "🔤",
          current: fontSize,
        },
        {
          type: "fontFamily",
          label: "Font Family",
          icon: "✍️",
          current: fontFamily,
        },
      ],
    },
    {
      title: "Language & Region",
      icon: "🌍",
      settings: [
        {
          type: "language",
          label: "Language",
          icon: "🗣️",
          current: language,
        },
      ],
    },
    {
      title: "Notifications",
      icon: "🔔",
      settings: [
        {
          type: "toggle",
          key: "email",
          label: "Email Notifications",
          icon: "📧",
          description: "Receive job alerts and updates via email",
        },
        {
          type: "toggle",
          key: "push",
          label: "Push Notifications",
          icon: "📱",
          description: "Get instant notifications on your device",
        },
        {
          type: "toggle",
          key: "jobAlerts",
          label: "Job Alerts",
          icon: "💼",
          description: "Notifications for new job matches",
        },
        {
          type: "toggle",
          key: "messages",
          label: "Messages",
          icon: "💬",
          description: "Notifications for new messages",
        },
      ],
    },
  ];

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">⚙️</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h2>
      </div>

      {settingSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl">{section.icon}</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {section.title}
            </h3>
          </div>

          <div className="space-y-6">
            {section.settings.map((setting, settingIndex) => (
              <div
                key={settingIndex}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{setting.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {setting.label}
                    </h4>
                    {setting.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {setting.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {setting.type === "theme" && (
                    <div className="flex space-x-2">
                      {setting.options.map((option) => (
                        <motion.button
                          key={option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            (systemTheme && option.value === "system") ||
                            (!systemTheme &&
                              darkMode &&
                              option.value === "dark") ||
                            (!systemTheme &&
                              !darkMode &&
                              option.value === "light")
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleThemeChange(option.value)}
                        >
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {setting.type === "fontSize" && (
                    <select
                      className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                    >
                      {Object.entries(fontSizeOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === "fontFamily" && (
                    <select
                      className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                    >
                      {Object.keys(fontFamilyOptions).map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === "language" && (
                    <select
                      className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {Object.entries(languageOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === "toggle" && (
                    <motion.button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        notifications[setting.key]
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      onClick={() => handleNotificationToggle(setting.key)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          notifications[setting.key]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                        layout
                      />
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Enhanced Jobs Tab Component
export const EnhancedJobsTab = ({
  userRole = "applicant",
  jobType = "all",
}) => {
  const { dashboardData, loading, error } = useDashboard();

  // Get jobs from dashboard data with fallback
  const jobs = dashboardData?.recentJobs || [];

  // Placeholder functions for job actions (will be implemented later)
  const applyToJob = async (jobId) => {
    console.log("Apply to job:", jobId);
    return { success: true };
  };

  const saveJob = async (jobId) => {
    console.log("Save job:", jobId);
    return { success: true };
  };

  const unsaveJob = async (jobId) => {
    console.log("Unsave job:", jobId);
    return { success: true };
  };
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    salary: "",
    experience: "",
    search: "",
  });
  const [applying, setApplying] = useState({});
  const [saving, setSaving] = useState({});
  const [deleting, setDeleting] = useState({});
  const [updating, setUpdating] = useState({});

  // Filter jobs based on job type and current filters
  const getJobsByType = () => {
    // Ensure jobs is always an array
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    let filteredJobs = safeJobs;

    switch (jobType) {
      case "recommended":
        // Filter recommended jobs (jobs that match user skills or preferences)
        filteredJobs = safeJobs.filter(
          (job) =>
            job.recommended === true ||
            job.skills?.some((skill) =>
              ["JavaScript", "React", "Node.js", "Python"].includes(skill)
            )
        );
        break;
      case "favorites":
        // Filter saved/favorite jobs
        filteredJobs = safeJobs.filter((job) => job.saved === true);
        break;
      case "all":
      default:
        filteredJobs = safeJobs;
        break;
    }

    // Ensure we always return an array
    return Array.isArray(filteredJobs) ? filteredJobs : [];
  };

  const displayedJobs = getJobsByType().filter((job) => {
    return (
      (!filters.location ||
        job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.jobType || job.type === filters.jobType) &&
      (!filters.salary || job.salary.includes(filters.salary)) &&
      (!filters.experience || job.experience === filters.experience) &&
      (!filters.search ||
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      location: "",
      jobType: "",
      salary: "",
      experience: "",
      search: "",
    });
  };

  // Handle job application
  const handleApply = async (jobId) => {
    setApplying((prev) => ({ ...prev, [jobId]: true }));
    try {
      const result = await applyToJob(jobId);
      if (result.success) {
        // Show success message
      }
    } catch (error) {
      console.error("Failed to apply:", error);
    } finally {
      setApplying((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle save/unsave job
  const handleSave = async (jobId, isSaved) => {
    setSaving((prev) => ({ ...prev, [jobId]: true }));
    try {
      if (isSaved) {
        await unsaveJob(jobId);
      } else {
        await saveJob(jobId);
      }
    } catch (error) {
      console.error("Failed to save/unsave job:", error);
    } finally {
      setSaving((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle job deletion
  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }
    
    setDeleting((prev) => ({ ...prev, [jobId]: true }));
    try {
      // API call to delete job would go here
      console.log('Deleting job:', jobId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or update UI
      alert('Job posting deleted successfully!');
      
      // Optionally refresh the jobs list or remove from local state
      // This would typically trigger a re-fetch of jobs
      
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert('Failed to delete job posting. Please try again.');
    } finally {
      setDeleting((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle job update
  const handleUpdate = async (jobId) => {
    setUpdating((prev) => ({ ...prev, [jobId]: true }));
    try {
      // API call to update job would go here
      console.log('Updating job:', jobId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Job posting updated successfully!');
      
      // Optionally refresh the jobs list
      
    } catch (error) {
      console.error("Failed to update job:", error);
      alert('Failed to update job posting. Please try again.');
    } finally {
      setUpdating((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle edit job (navigate to edit form)
  const handleEdit = (jobId) => {
    console.log('Edit job:', jobId);
    // This would typically navigate to an edit form or open a modal
    alert(`Edit functionality for job ${jobId} - This would open the job editing form.`);
  };

  // Handle view applications
  const handleViewApplications = (jobId) => {
    console.log('View applications for job:', jobId);
    // This would typically navigate to applications view or open a modal
    alert(`View applications for job ${jobId} - This would show all applications for this job.`);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobType === "recommended"
              ? "⭐ Recommended Jobs"
              : jobType === "favorites"
              ? "❤️ Favorite Jobs"
              : "🔍 Browse Jobs"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {displayedJobs.length}{" "}
            {jobType === "favorites"
              ? "saved"
              : jobType === "recommended"
              ? "recommended"
              : ""}{" "}
            jobs found
          </p>
        </div>

        <div className="flex space-x-2">
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              showFilters
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("grid")}
          >
            📊 Grid
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("list")}
          >
            📋 List
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("table")}
          >
            📋 Table
          </motion.button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="w-80 flex-shrink-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <JobsFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs Content */}
        <div className="flex-1 space-y-6">
          {/* Jobs Display */}
          {viewMode === "table" ? (
            /* Table View */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Job
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Experience
                      </th>
                      {userRole === "applicant" && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Recommended
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Favorite
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {displayedJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {job.title}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.skills
                                ?.slice(0, 2)
                                .map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {job.skills?.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{job.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {job.company}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <span className="mr-1">📍</span>
                            {job.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <span className="mr-1">💰</span>
                            {job.salary}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {job.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {job.experience}
                          </div>
                        </td>
                        {userRole === "applicant" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {job.recommended ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  ⭐ Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                  ➖ No
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <motion.button
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                                  job.saved
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-200"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSave(job.id, job.saved)}
                                disabled={saving[job.id]}
                              >
                                {saving[job.id]
                                  ? "⏳ ..."
                                  : job.saved
                                  ? "❤️ Saved"
                                  : "🤍 Save"}
                              </motion.button>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {userRole === "recruiter" ? (
                            <div className="flex flex-wrap gap-1">
                              <motion.button
                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-xs"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="View Applications"
                                onClick={() => handleViewApplications(job.id)}
                              >
                                👥 Applications
                              </motion.button>
                              <motion.button
                                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-xs"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Edit Job"
                                onClick={() => handleEdit(job.id)}
                              >
                                ✏️ Edit
                              </motion.button>
                              <motion.button
                                className={`px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors duration-200 text-xs ${
                                  updating[job.id] ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                whileHover={{ scale: updating[job.id] ? 1 : 1.05 }}
                                whileTap={{ scale: updating[job.id] ? 1 : 0.95 }}
                                title="Update Job"
                                onClick={() => handleUpdate(job.id)}
                                disabled={updating[job.id]}
                              >
                                {updating[job.id] ? '⏳ Updating...' : '🔄 Update'}
                              </motion.button>
                              <motion.button
                                className={`px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 text-xs ${
                                  deleting[job.id] ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                whileHover={{ scale: deleting[job.id] ? 1 : 1.05 }}
                                whileTap={{ scale: deleting[job.id] ? 1 : 0.95 }}
                                title="Delete Job"
                                onClick={() => handleDelete(job.id)}
                                disabled={deleting[job.id]}
                              >
                                {deleting[job.id] ? '⏳ Deleting...' : '🗑️ Delete'}
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-xs"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApply(job.id)}
                              disabled={applying[job.id]}
                            >
                              {applying[job.id] ? "⏳ Applying..." : "📝 Apply"}
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid/List View */
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {displayedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {job.company}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          job.saved
                            ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSave(job.id, job.saved)}
                        disabled={saving[job.id]}
                      >
                        {saving[job.id] ? "⏳" : job.saved ? "⭐" : "☆"}
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">📍</span>
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">💰</span>
                      {job.salary}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">⏱️</span>
                      {job.experience}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">💼</span>
                      {job.type}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills?.slice(0, 3).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs rounded-full">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApply(job.id)}
                      disabled={applying[job.id]}
                    >
                      {applying[job.id] ? "⏳ Applying..." : "📝 Apply Now"}
                    </motion.button>
                    <motion.button
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      👁️ View Details
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Applications Tab Component
export const EnhancedApplicationsTab = ({ userRole = "applicant" }) => {
  const { dashboardData, loading, error } = useDashboard();

  // Get applications from dashboard data with fallback and ensure it's an array
  const applications = Array.isArray(dashboardData?.applications) 
    ? dashboardData.applications 
    : [];
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "",
    company: "",
  });

  // Filter applications based on current filters
  const displayedApplications = applications.filter((app) => {
    return (
      (!filters.status || app.status === filters.status) &&
      (!filters.company ||
        app.company.toLowerCase().includes(filters.company.toLowerCase())) &&
      (!filters.dateRange || true)
    ); // Add date filtering logic here
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "",
      dateRange: "",
      company: "",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Under Review":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Shortlisted:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Interview:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Hired:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Applications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {displayedApplications.length} applications found
          </p>
        </div>

        <div className="flex space-x-2">
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              showFilters
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters
          </motion.button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="w-80 flex-shrink-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ApplicationsFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Applications Content */}
        <div className="flex-1 space-y-4">
          {displayedApplications.map((application, index) => (
            <motion.div
              key={application.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {application.jobTitle}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {application.company}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Applied:</span>
                  <p>{application.appliedDate}</p>
                </div>
                <div>
                  <span className="font-medium">Location:</span>
                  <p>{application.location}</p>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <p>{application.jobType}</p>
                </div>
                <div>
                  <span className="font-medium">Salary:</span>
                  <p>{application.salary}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {displayedApplications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or apply to some jobs.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Analytics Tab Component
export const EnhancedAnalyticsTab = ({ userRole = "applicant" }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: "30d",
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      timeRange: "30d",
    });
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your job search progress
          </p>
        </div>

        <div className="flex space-x-2">
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              showFilters
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters
          </motion.button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="w-80 flex-shrink-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Content */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Analytics Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Applications
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    24
                  </p>
                </div>
                <div className="text-3xl">📝</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Profile Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    156
                  </p>
                </div>
                <div className="text-3xl">👀</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interviews
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    3
                  </p>
                </div>
                <div className="text-3xl">🗣️</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Response Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    12%
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Application Trends
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              📈 Chart will be displayed here based on selected time range:{" "}
              {filters.timeRange}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Job Posting Tab Component
export const EnhancedJobPostingTab = () => {
  const { dashboardData, loading, postJob } = useDashboard();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    type: "full-time",
    experience: "",
    salary: "",
    skills: [],
    requirements: [],
    responsibilities: [],
    sector: "automobile",
    jobFunction: "",
    shift: "",
    preferredQualification: "",
    certificationsRequired: [],
    benefits: [],
    toolsAndTechnologies: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postJob(formData);
      // Show success message and reset form
      setFormData({
        title: "",
        description: "",
        company: "",
        location: "",
        type: "full-time",
        experience: "",
        salary: "",
        skills: [],
        requirements: [],
        responsibilities: [],
      });
    } catch (error) {
      console.error("Failed to post job:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInput = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post New Job
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new job posting
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sector *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="automobile">Automobile</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="shift-based">Shift Based</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Function *
              </label>
              <select
                name="jobFunction"
                value={formData.jobFunction}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {formData.sector === "automobile" ? (
                  <>
                    <option value="">Select Job Function</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="technician">Technician</option>
                    <option value="engineer">Engineer</option>
                    <option value="designer">Designer</option>
                    <option value="sales">Sales</option>
                    <option value="service">Service</option>
                  </>
                ) : (
                  <>
                    <option value="">Select Job Function</option>
                    <option value="analyst">Financial Analyst</option>
                    <option value="accountant">Accountant</option>
                    <option value="consultant">Financial Consultant</option>
                    <option value="banker">Banker</option>
                    <option value="insurance">Insurance Professional</option>
                    <option value="trader">Trader</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Required *
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 2-4 years"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary Range *
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g., $60,000 - $80,000"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description *
            </label>
            <div className="space-y-4">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder={
                  formData.sector === "automobile"
                    ? "Describe the role, required expertise in automotive systems, and specific responsibilities..."
                    : "Describe the role, financial expertise required, and key responsibilities..."
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // AI enhancement functionality would go here
                    console.log("Enhance description with AI");
                  }}
                >
                  🤖 Enhance with AI
                </motion.button>
                <span className="text-sm text-gray-500">
                  Let AI help improve your job description
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Skills * (comma-separated)
            </label>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.skills.join(", ")}
                onChange={(e) => handleArrayInput("skills", e.target.value)}
                placeholder={
                  formData.sector === "automobile"
                    ? "e.g., Automotive Repair, Engine Diagnostics, Vehicle Maintenance"
                    : "e.g., Financial Analysis, Risk Management, Investment Planning"
                }
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex flex-wrap gap-2">
                {formData.sector === "automobile"
                  ? [
                      "Engine Repair",
                      "Diagnostics",
                      "Electrical Systems",
                      "Brake Systems",
                      "Transmission",
                    ].map((skill) => (
                      <motion.button
                        key={skill}
                        type="button"
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "skills",
                            formData.skills.concat(skill).join(", ")
                          )
                        }
                      >
                        + {skill}
                      </motion.button>
                    ))
                  : [
                      "Financial Planning",
                      "Risk Analysis",
                      "Banking",
                      "Investment",
                      "Accounting",
                    ].map((skill) => (
                      <motion.button
                        key={skill}
                        type="button"
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "skills",
                            formData.skills.concat(skill).join(", ")
                          )
                        }
                      >
                        + {skill}
                      </motion.button>
                    ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirements * (comma-separated)
            </label>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.requirements.join(", ")}
                onChange={(e) =>
                  handleArrayInput("requirements", e.target.value)
                }
                placeholder={
                  formData.sector === "automobile"
                    ? "e.g., Automotive certification, Valid driver's license, Technical diploma"
                    : "e.g., Bachelor's in Finance, CFA certification, Banking experience"
                }
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex flex-wrap gap-2">
                {formData.sector === "automobile"
                  ? [
                      "ASE Certification",
                      "Valid Driver's License",
                      "Technical Diploma",
                      "Physical Fitness",
                    ].map((req) => (
                      <motion.button
                        key={req}
                        type="button"
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "requirements",
                            formData.requirements.concat(req).join(", ")
                          )
                        }
                      >
                        + {req}
                      </motion.button>
                    ))
                  : [
                      "Bachelor's in Finance",
                      "CFA",
                      "Financial License",
                      "Excel Proficiency",
                    ].map((req) => (
                      <motion.button
                        key={req}
                        type="button"
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "requirements",
                            formData.requirements.concat(req).join(", ")
                          )
                        }
                      >
                        + {req}
                      </motion.button>
                    ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Responsibilities * (comma-separated)
            </label>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.responsibilities.join(", ")}
                onChange={(e) =>
                  handleArrayInput("responsibilities", e.target.value)
                }
                placeholder={
                  formData.sector === "automobile"
                    ? "e.g., Diagnose vehicle issues, Perform repairs, Maintain service records"
                    : "e.g., Analyze financial data, Prepare reports, Manage client portfolios"
                }
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex flex-wrap gap-2">
                {formData.sector === "automobile"
                  ? [
                      "Diagnose vehicle problems",
                      "Perform maintenance",
                      "Test vehicle systems",
                      "Document repairs",
                      "Customer communication",
                    ].map((resp) => (
                      <motion.button
                        key={resp}
                        type="button"
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "responsibilities",
                            formData.responsibilities.concat(resp).join(", ")
                          )
                        }
                      >
                        + {resp}
                      </motion.button>
                    ))
                  : [
                      "Financial analysis",
                      "Risk assessment",
                      "Portfolio management",
                      "Client consultation",
                      "Market research",
                    ].map((resp) => (
                      <motion.button
                        key={resp}
                        type="button"
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "responsibilities",
                            formData.responsibilities.concat(resp).join(", ")
                          )
                        }
                      >
                        + {resp}
                      </motion.button>
                    ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tools & Technologies (comma-separated)
            </label>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.toolsAndTechnologies.join(", ")}
                onChange={(e) =>
                  handleArrayInput("toolsAndTechnologies", e.target.value)
                }
                placeholder={
                  formData.sector === "automobile"
                    ? "e.g., Diagnostic tools, OBD scanners, Lift equipment"
                    : "e.g., Bloomberg Terminal, Excel, Financial modeling software"
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex flex-wrap gap-2">
                {formData.sector === "automobile"
                  ? [
                      "OBD Scanners",
                      "Lift Equipment",
                      "Hand Tools",
                      "Diagnostic Software",
                      "Welding Equipment",
                    ].map((tool) => (
                      <motion.button
                        key={tool}
                        type="button"
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "toolsAndTechnologies",
                            formData.toolsAndTechnologies
                              .concat(tool)
                              .join(", ")
                          )
                        }
                      >
                        + {tool}
                      </motion.button>
                    ))
                  : [
                      "Bloomberg Terminal",
                      "MS Excel",
                      "Financial Software",
                      "Trading Platforms",
                      "Accounting Software",
                    ].map((tool) => (
                      <motion.button
                        key={tool}
                        type="button"
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleArrayInput(
                            "toolsAndTechnologies",
                            formData.toolsAndTechnologies
                              .concat(tool)
                              .join(", ")
                          )
                        }
                      >
                        + {tool}
                      </motion.button>
                    ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <motion.button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? "⏳ Posting..." : "📝 Post Job"}
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

// Enhanced Active Jobs Tab Component
export const EnhancedActiveJobsTab = () => {
  const { dashboardData, loading, updateJob, deleteJob } = useDashboard();
  const activeJobs = dashboardData?.activeJobs || [];
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJob(jobId, { status: newStatus });
      // Job will be updated in the dashboard data automatically
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await deleteJob(jobId);
        // Job will be removed from the dashboard data automatically
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Active Jobs
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your active job postings
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {activeJobs.map((job) => (
          <motion.div
            key={job.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {job.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {job.company}
                </p>
              </div>
              <div className="flex space-x-2">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job.id, e.target.value)}
                  className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
                <motion.button
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedJob(job);
                    setIsEditModalOpen(true);
                  }}
                >
                  ✏️
                </motion.button>
                <motion.button
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteJob(job.id)}
                >
                  🗑️
                </motion.button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Location
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {job.location}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Type
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {job.type}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Applications
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {job.applications || 0}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Posted
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {activeJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No active jobs
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start by posting a new job.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
