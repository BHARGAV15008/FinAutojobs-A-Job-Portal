import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/IntegratedThemeContext";

const ProfileEditModal = ({ isOpen, onClose, user, userRole, onSave }) => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && user) {
      console.log("🔍 ProfileEditModal initializing with user:", user);

      // Handle case where user might be API response object
      const actualUser = user.data ? user.data : user;
      console.log("🔍 ProfileEditModal actual user:", actualUser);

      // Extract location based on role and schema
      const getLocation = () => {
        if (userRole === "applicant") {
          return (
            actualUser.currentLocation?.city ||
            actualUser.address?.city ||
            actualUser.location ||
            actualUser.currentLocation?.country ||
            actualUser.address?.country ||
            ""
          );
        } else {
          // Recruiter location
          return (
            actualUser.officeLocation?.city ||
            actualUser.companyInfo?.workLocation?.city ||
            actualUser.location ||
            actualUser.officeLocation?.country ||
            actualUser.companyInfo?.workLocation?.country ||
            ""
          );
        }
      };

      // Extract social links based on schema structure
      const getSocialLinks = () => {
        return {
          linkedin:
            actualUser.linkedin_url ||
            actualUser.socialLinks?.linkedinUrl ||
            actualUser.professionalLinks?.linkedin ||
            actualUser.professionalLinks?.linkedinUrl ||
            "",
          github:
            actualUser.github_url ||
            actualUser.socialLinks?.githubUrl ||
            actualUser.professionalLinks?.github ||
            actualUser.professionalLinks?.githubUrl ||
            "",
          portfolio:
            actualUser.portfolio_url ||
            actualUser.socialLinks?.portfolioUrl ||
            actualUser.professionalLinks?.personalWebsite ||
            actualUser.professionalLinks?.portfolioUrl ||
            "",
        };
      };

      const socialLinks = getSocialLinks();

      setFormData({
        // Basic Info (common for both roles)
        name:
          `${actualUser.firstName || ""} ${actualUser.lastName || ""}`.trim() ||
          actualUser.fullName ||
          "",
        email: actualUser.email || "",
        phone: actualUser.phone || "",
        username: actualUser.username || "",
        location: getLocation(),
        bio: actualUser.bio || "",

        // Social Links
        linkedin_url: socialLinks.linkedin,
        github_url: socialLinks.github,
        portfolio_url: socialLinks.portfolio,

        // Address fields
        country:
          actualUser.address?.country ||
          actualUser.country ||
          actualUser.currentLocation?.country ||
          "",
        city:
          actualUser.address?.city || actualUser.currentLocation?.city || "",
        state:
          actualUser.address?.state || actualUser.currentLocation?.state || "",

        // Applicant-specific fields
        ...(userRole === "applicant" && {
          // Skills - comprehensive extraction
          skills: (() => {
            const skillsObj = actualUser.skills || {};

            // Combine all skill types
            const allSkills = [
              ...(Array.isArray(skillsObj.technical)
                ? skillsObj.technical
                : []),
              ...(Array.isArray(skillsObj.soft) ? skillsObj.soft : []),
              ...(Array.isArray(skillsObj.primary) ? skillsObj.primary : []),
              ...(Array.isArray(actualUser.skills_array)
                ? actualUser.skills_array
                : []),
              ...(Array.isArray(actualUser.primary_skills)
                ? actualUser.primary_skills
                : []),
            ];

            // Remove duplicates
            return [...new Set(allSkills.filter((s) => s))];
          })(),

          // Languages
          languages: Array.isArray(actualUser.skills?.languages)
            ? actualUser.skills.languages
            : Array.isArray(actualUser.languages)
            ? actualUser.languages
            : [],

          // Experience
          experience_years:
            actualUser.yearsOfExperience || actualUser.experience_years || 0,

          // Qualification/Education
          qualification:
            actualUser.qualification || actualUser.education?.[0]?.degree || "",
          education: actualUser.education || [],
          workExperience: actualUser.workExperience || [],

          // Add logging
          ...(() => {
            console.log("📚 Education data:", actualUser.education);
            console.log("💼 Work Experience data:", actualUser.workExperience);
            console.log("🎓 Qualification:", actualUser.qualification);
            console.log(
              "🔗 URLs - LinkedIn:",
              actualUser.linkedin_url || actualUser.socialLinks?.linkedinUrl
            );
            console.log(
              "🔗 URLs - GitHub:",
              actualUser.github_url || actualUser.socialLinks?.githubUrl
            );
            console.log(
              "🔗 URLs - Portfolio:",
              actualUser.portfolio_url || actualUser.socialLinks?.portfolioUrl
            );
            return {};
          })(),

          // Documents
          resume_url:
            actualUser.documents?.resumeUrl || actualUser.resume_url || "",
          cover_letter_url:
            actualUser.documents?.coverLetterUrl ||
            actualUser.cover_letter_url ||
            "",
          certificates: actualUser.documents?.certificates || [],

          // Job Preferences
          jobPreferences: {
            preferredJobTypes:
              actualUser.jobPreferences?.preferredJobTypes || [],
            preferredLocations:
              actualUser.jobPreferences?.preferredLocations || [],
            remoteWorkPreference:
              actualUser.jobPreferences?.remoteWorkPreference || false,
            willingToRelocate:
              actualUser.jobPreferences?.willingToRelocate || false,
            preferredIndustries:
              actualUser.jobPreferences?.preferredIndustries || [],
          },

          // Career Info
          currentLocation: actualUser.currentLocation || {},
          careerInfo: actualUser.careerInfo || {},

          // Profile completion
          profileCompletion: actualUser.profileCompletion || {},

          // Arrays for tracking
          appliedJobs: actualUser.appliedJobs || [],
          savedJobs: actualUser.savedJobs || [],
          scheduledInterviews: actualUser.scheduledInterviews || [],
        }),

        // Recruiter-specific fields
        ...(userRole === "recruiter" && {
          // Company Information
          company:
            actualUser.companyInfo?.companyName ||
            actualUser.companyName ||
            actualUser.company ||
            "",
          department:
            actualUser.companyInfo?.department || actualUser.department || "",
          job_title:
            actualUser.companyInfo?.designation ||
            actualUser.companyInfo?.jobTitle ||
            actualUser.designation ||
            actualUser.position ||
            actualUser.job_title ||
            "",

          // Office Location
          officeLocation: {
            country:
              actualUser.officeLocation?.country ||
              actualUser.companyInfo?.workLocation?.country ||
              "",
            city:
              actualUser.officeLocation?.city ||
              actualUser.companyInfo?.workLocation?.city ||
              "",
          },

          // Experience
          experience_years:
            actualUser.yearsOfExperience || actualUser.experience_years || 0,

          // Specializations
          specializations: actualUser.specializations || [],
          industryExpertise: actualUser.industryExpertise || [],

          // Professional Links (additional for recruiters)
          professionalLinks: actualUser.professionalLinks || {},

          // Recruiting Stats
          recruitingStats: actualUser.recruitingStats || {
            totalJobsPosted: 0,
            activeJobs: 0,
            totalHires: 0,
            averageTimeToHire: 0,
            successRate: 0,
          },

          // Subscription
          subscription: actualUser.subscription || {
            planType: "basic",
            jobPostingCredits: 5,
            candidateViewCredits: 100,
          },

          // Preferences
          preferences: actualUser.preferences || {
            notificationSettings: {
              newApplications: true,
              candidateMessages: true,
              interviewReminders: true,
              jobExpiryAlerts: true,
            },
            autoResponseEnabled: false,
          },

          // Arrays for tracking
          postedJobs: actualUser.postedJobs || [],
          managedApplications: actualUser.managedApplications || [],
          scheduledInterviews: actualUser.scheduledInterviews || [],
        }),
      });
    }
  }, [isOpen, user, userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Create the payload with the structure expected by the backend
      const [firstName, ...lastName] = (formData.name || "").split(" ");
      const payload = {
        firstName: firstName || "",
        lastName: lastName.join(" ") || "",
        phone: formData.phone,
        bio: formData.bio,
      };

      if (userRole === "applicant") {
        // Applicant-specific payload matching database schema
        Object.assign(payload, {
          // Address
          address: {
            country: formData.country || "",
            city: formData.city || "",
            state: formData.state || "",
          },

          // Current Location
          currentLocation: {
            country: formData.country || "",
            city: formData.city || "",
            state: formData.state || "",
          },

          // Skills - store in nested structure
          skills: {
            technical: Array.isArray(formData.skills)
              ? formData.skills
              : (formData.skills || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s),
            soft: formData.softSkills || [],
            primary: Array.isArray(formData.skills)
              ? formData.skills
              : (formData.skills || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s),
            languages: formData.languages || [],
          },

          // Experience
          yearsOfExperience: formData.experience_years || 0,

          // Education
          qualification: formData.qualification || "",
          education: Array.isArray(formData.education)
            ? formData.education
            : [],

          // Work Experience
          workExperience: Array.isArray(formData.workExperience)
            ? formData.workExperience
            : [],

          // Social Links
          socialLinks: {
            linkedinUrl: formData.linkedin_url || "",
            githubUrl: formData.github_url || "",
            portfolioUrl: formData.portfolio_url || "",
            otherUrls: [],
          },

          // Also set flat social link fields for compatibility
          linkedin_url: formData.linkedin_url || "",
          github_url: formData.github_url || "",
          portfolio_url: formData.portfolio_url || "",

          // Location field for backward compatibility
          location: formData.location || "",

          // Documents
          documents: {
            resumeUrl: formData.resume_url || "",
            coverLetterUrl: formData.cover_letter_url || "",
            certificates: formData.certificates || [],
          },

          // Job Preferences
          jobPreferences: formData.jobPreferences || {
            preferredJobTypes: [],
            preferredLocations: [],
            remoteWorkPreference: false,
            willingToRelocate: false,
            preferredIndustries: [],
          },

          // Career Info
          careerInfo: formData.careerInfo || {
            workLocation: {
              country: formData.country || "",
            },
          },
        });
      } else if (userRole === "recruiter") {
        // Recruiter-specific payload matching database schema
        Object.assign(payload, {
          // Company Information
          companyInfo: {
            companyName: formData.company || "",
            department: formData.department || "",
            designation: formData.job_title || "",
            workLocation: {
              country:
                formData.officeLocation?.country || formData.country || "",
              city: formData.officeLocation?.city || formData.city || "",
            },
          },

          // Office Location
          officeLocation: {
            country: formData.officeLocation?.country || formData.country || "",
            city: formData.officeLocation?.city || formData.city || "",
          },

          // Address
          address: {
            country: formData.country || "",
            city: formData.city || "",
          },

          // Experience
          yearsOfExperience: formData.experience_years || 0,

          // Social/Professional Links
          socialLinks: {
            linkedinUrl: formData.linkedin_url || "",
            githubUrl: formData.github_url || "",
            portfolioUrl: formData.portfolio_url || "",
            otherUrls: [],
          },

          professionalLinks: {
            linkedin: formData.linkedin_url || "",
            github: formData.github_url || "",
            personalWebsite: formData.portfolio_url || "",
            linkedinUrl: formData.linkedin_url || "",
            githubUrl: formData.github_url || "",
            portfolioUrl: formData.portfolio_url || "",
            otherUrls: [],
          },

          // Flat fields for compatibility
          linkedin_url: formData.linkedin_url || "",
          github_url: formData.github_url || "",
          portfolio_url: formData.portfolio_url || "",
          location: formData.location || "",

          // Specializations
          specializations: formData.specializations || [],
          industryExpertise: formData.industryExpertise || [],

          // Recruiting Stats (preserve existing if not in form)
          recruitingStats: formData.recruitingStats || {
            totalJobsPosted: 0,
            activeJobs: 0,
            totalHires: 0,
            averageTimeToHire: 0,
            successRate: 0,
          },

          // Subscription (preserve existing if not in form)
          subscription: formData.subscription || {
            planType: "basic",
            jobPostingCredits: 5,
            candidateViewCredits: 100,
          },

          // Preferences (preserve existing if not in form)
          preferences: formData.preferences || {
            notificationSettings: {
              newApplications: true,
              candidateMessages: true,
              interviewReminders: true,
              jobExpiryAlerts: true,
            },
            autoResponseEnabled: false,
          },
        });
      }

      if (formData.resumeFile) {
        const formDataWithFile = new FormData();

        // Remove documents from payload, backend will handle it
        delete payload.documents;

        // Append transformed payload fields to FormData
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            if (typeof payload[key] === "object" && payload[key] !== null) {
              formDataWithFile.append(key, JSON.stringify(payload[key]));
            } else {
              formDataWithFile.append(key, payload[key]);
            }
          }
        });

        // Add the resume file
        formDataWithFile.append("resume", formData.resumeFile);

        await onSave(formDataWithFile, true); // true indicates file upload
      } else {
        await onSave(payload);
      }

      if (window.showToast) {
        window.showToast("Profile updated successfully!", "success");
      }

      onClose();
    } catch (error) {
      console.error("❌ ProfileEditModal handleSubmit error:", error);
      setErrors({
        general: error.message || "Failed to save profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className={`px-8 py-6 border-b ${darkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Edit Profile
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Update your personal information and settings
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-sm"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              </div>

              {/* Bio Section */}
              <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <label
                  className={`block text-lg font-semibold mb-3 flex items-center ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  About Me
                </label>
                <textarea
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    darkMode
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                />
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Write a brief description about yourself and your professional background
                </p>
              </div>

              {/* Role-specific fields */}
              {userRole === "applicant" && (
                <div className="space-y-8">
                  {/* Location Section for Applicants */}
                  <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                    <h3
                      className={`text-lg font-semibold mb-4 flex items-center ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Location Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="e.g. India"
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="e.g. Mumbai"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={
                        Array.isArray(formData.skills)
                          ? formData.skills.join(", ")
                          : formData.skills || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow typing commas and other characters
                        setFormData({
                          ...formData,
                          skills: value, // Store as string while typing, will be converted to array on save
                        });
                      }}
                      onBlur={(e) => {
                        // Convert to array when field loses focus
                        const value = e.target.value;
                        const skillsArray = value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s);
                        setFormData({ ...formData, skills: skillsArray });
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="e.g. JavaScript, React, Node.js"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={formData.qualification || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualification: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="e.g. Bachelor's in Computer Science"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience_years: parseInt(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Resume
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, resumeFile: file });
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {formData.resume_url && (
                        <div className="text-sm text-gray-600">
                          Current:{" "}
                          <a
                            href={formData.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3
                        className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        🎓 Education
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newEducation = [
                            ...(formData.education || []),
                            {
                              institution: "",
                              degree: "",
                              fieldOfStudy: "",
                              startDate: "",
                              endDate: "",
                              grade: "",
                              isCurrentlyStudying: false,
                            },
                          ];
                          setFormData({ ...formData, education: newEducation });
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Add Education
                      </button>
                    </div>
                    {formData.education && formData.education.length > 0 ? (
                      formData.education.map((edu, index) => (
                        <div
                          key={index}
                          className={`mb-4 p-4 border rounded-lg ${
                            darkMode
                              ? "border-gray-600 bg-gray-700"
                              : "border-gray-300 bg-gray-50"
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Institution"
                              value={edu.institution || ""}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].institution =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  education: newEducation,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree || ""}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].degree = e.target.value;
                                setFormData({
                                  ...formData,
                                  education: newEducation,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="Field of Study"
                              value={edu.fieldOfStudy || ""}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].fieldOfStudy =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  education: newEducation,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="Grade/GPA"
                              value={edu.grade || ""}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].grade = e.target.value;
                                setFormData({
                                  ...formData,
                                  education: newEducation,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="date"
                              placeholder="Start Date"
                              value={edu.startDate ? new Date(edu.startDate).toISOString().slice(0, 10) : ""}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].startDate = e.target.value;
                                setFormData({
                                  ...formData,
                                  education: newEducation,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="date"
                              placeholder="End Date"
                              value={edu.endDate ? new Date(edu.endDate).toISOString().slice(0, 10) : ""}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].endDate = e.target.value;
                                setFormData({
                                  ...formData,
                                  education: newEducation,
                                });
                              }}
                              disabled={edu.isCurrentlyStudying}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={edu.isCurrentlyStudying || false}
                                onChange={(e) => {
                                  const newEducation = [...formData.education];
                                  newEducation[index].isCurrentlyStudying =
                                    e.target.checked;
                                  setFormData({
                                    ...formData,
                                    education: newEducation,
                                  });
                                }}
                                className="mr-2"
                              />
                              <span
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Currently studying here
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newEducation = formData.education.filter(
                                  (_, i) => i !== index
                                );
                                setFormData({
                                  ...formData,
                                  education: newEducation,
                                });
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        No education added yet. Click "Add Education" to get
                        started.
                      </p>
                    )}
                  </div>

                  {/* Work Experience Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3
                        className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        💼 Work Experience
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newWorkExperience = [
                            ...(formData.workExperience || []),
                            {
                              company: "",
                              position: "",
                              location: "",
                              startDate: "",
                              endDate: "",
                              isCurrentlyWorking: false,
                              description: "",
                            },
                          ];
                          setFormData({
                            ...formData,
                            workExperience: newWorkExperience,
                          });
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Add Experience
                      </button>
                    </div>
                    {formData.workExperience &&
                    formData.workExperience.length > 0 ? (
                      formData.workExperience.map((exp, index) => (
                        <div
                          key={index}
                          className={`mb-4 p-4 border rounded-lg ${
                            darkMode
                              ? "border-gray-600 bg-gray-700"
                              : "border-gray-300 bg-gray-50"
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Company"
                              value={exp.company || ""}
                              onChange={(e) => {
                                const newWorkExperience = [
                                  ...formData.workExperience,
                                ];
                                newWorkExperience[index].company =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  workExperience: newWorkExperience,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="Position/Role"
                              value={exp.position || ""}
                              onChange={(e) => {
                                const newWorkExperience = [
                                  ...formData.workExperience,
                                ];
                                newWorkExperience[index].position =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  workExperience: newWorkExperience,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="Location"
                              value={exp.location || ""}
                              onChange={(e) => {
                                const newWorkExperience = [
                                  ...formData.workExperience,
                                ];
                                newWorkExperience[index].location =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  workExperience: newWorkExperience,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <div></div>
                            <input
                              type="date"
                              placeholder="Start Date"
                              value={exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 10) : ""}
                              onChange={(e) => {
                                const newWorkExperience = [
                                  ...formData.workExperience,
                                ];
                                newWorkExperience[index].startDate =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  workExperience: newWorkExperience,
                                });
                              }}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <input
                              type="date"
                              placeholder="End Date"
                              value={exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 10) : ""}
                              onChange={(e) => {
                                const newWorkExperience = [
                                  ...formData.workExperience,
                                ];
                                newWorkExperience[index].endDate =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  workExperience: newWorkExperience,
                                });
                              }}
                              disabled={exp.isCurrentlyWorking}
                              className={`px-3 py-2 border rounded-lg ${
                                darkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                          </div>
                          <textarea
                            placeholder="Job Description"
                            value={exp.description || ""}
                            onChange={(e) => {
                              const newWorkExperience = [
                                ...formData.workExperience,
                              ];
                              newWorkExperience[index].description =
                                e.target.value;
                              setFormData({
                                ...formData,
                                workExperience: newWorkExperience,
                              });
                            }}
                            rows={3}
                            className={`w-full mt-3 px-3 py-2 border rounded-lg ${
                              darkMode
                                ? "bg-gray-600 border-gray-500 text-white"
                                : "bg-white border-gray-300"
                            }`}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={exp.isCurrentlyWorking || false}
                                onChange={(e) => {
                                  const newWorkExperience = [
                                    ...formData.workExperience,
                                  ];
                                  newWorkExperience[index].isCurrentlyWorking =
                                    e.target.checked;
                                  setFormData({
                                    ...formData,
                                    workExperience: newWorkExperience,
                                  });
                                }}
                                className="mr-2"
                              />
                              <span
                                className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Currently working here
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newWorkExperience =
                                  formData.workExperience.filter(
                                    (_, i) => i !== index
                                  );
                                setFormData({
                                  ...formData,
                                  workExperience: newWorkExperience,
                                });
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        No work experience added yet. Click "Add Experience" to
                        get started.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {userRole === "recruiter" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Company *
                      </label>
                      <input
                        type="text"
                        value={formData.company || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Job Title/Designation
                      </label>
                      <input
                        type="text"
                        value={formData.job_title || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            job_title: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.experience_years || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience_years: parseInt(e.target.value) || 0,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Office Location Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3
                      className={`text-lg font-semibold mb-3 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      🏢 Office Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="e.g. India"
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="e.g. Hyderabad"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="space-y-4">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          linkedin_url: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={formData.github_url || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, github_url: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Portfolio
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio_url || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        portfolio_url: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              {errors.general && (
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start">
                    <svg className={`w-5 h-5 mr-3 mt-0.5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm font-medium ${darkMode ? "text-red-400" : "text-red-800"}`}>
                      {errors.general}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer with Actions */}
          <div className={`px-8 py-6 border-t ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  darkMode
                    ? "text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-600"
                    : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileEditModal;
