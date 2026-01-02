import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE_URL from "../../services/apiConfig";
import JobDetailsModal from "../modals/JobDetailsModal";
import CandidateProfileModal from "../modals/CandidateProfileModal";
import ContactModal from "../modals/ContactModal";
import ScheduleModal from "../modals/ScheduleModal";
import { communicationsAPI } from "../../api/communications";
import { toast } from "../ui/use-toast";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  Briefcase,
  Calendar,
  Award,
  Target,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Bell,
  Palette,
  Globe,
  Download,
  Upload,
  Camera,
  Link as LinkIcon,
  Github,
  Linkedin,
  ExternalLink,
  Building,
  GraduationCap,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Heart,
  Share,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Flag,
  Zap,
  Layers,
  Grid,
  List,
  BarChart3,
  PieChart,
  Activity,
  Cpu,
  Database,
  Server,
  Cloud,
  Wifi,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square as Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Maximize2 as Maximize,
  Minimize2 as Minimize,
  Copy,
  Clipboard,
  Scissors,
  Paperclip,
  Image,
  Video,
  Music,
  File,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Box,
  Truck,
  Plane,
  Car,
  Bike,
  Truck as Bus,
  Truck as Train,
  Anchor as Ship,
  Anchor,
  Compass,
  Map,
  Navigation2,
  MapPin as Route,
  Home,
  Building2,
  Store,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  DollarSign,
  Coins,
  Wallet,
  Receipt,
  Calculator,
  Wallet as PiggyBank,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import ProfileEditModal from "../profile/ProfileEditModal";
import JobRecommendations from "../recommendations/JobRecommendations";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { calculateProfileCompletion } from "../../utils/profileCompletion";
import { useTheme } from "../../contexts/IntegratedThemeContext";
import { useDashboard } from "../../contexts/RealDashboardContext";
import {
  JobsFilter,
  ApplicationsFilter,
  AnalyticsFilter,
} from "./DashboardFilters";
import {
  getDisplayName,
  capitalizeWords,
  capitalize,
} from "../../utils/textHelpers";

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
    <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconColor = darkMode
          ? isActive
            ? "#60a5fa"
            : "#9ca3af" // blue-400 and gray-400
          : isActive
          ? "#2563eb"
          : "#4f46e5"; // blue-600 and indigo-600

        return (
          <motion.button
            key={tab.id}
            className={`
              relative px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${
                isActive
                  ? "text-blue-500 dark:text-blue-300 bg-white dark:bg-gray-700 shadow-md"
                  : "text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-100"
              }
            `}
            variants={tabVariants}
            initial="inactive"
            animate={isActive ? "active" : "inactive"}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg" style={{ color: iconColor }}>
                {tab.icon}
              </span>
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

            {isActive && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// Enhanced Profile Tab Component
export const EnhancedProfileTab = ({
  user,
  onEdit,
  userRole = "applicant",
}) => {
  const { updateProfile, updateProfileWithFile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const actualUser = currentUser?.data ? currentUser.data : currentUser;
    const completion = calculateProfileCompletion(actualUser, userRole);
    setProfileCompletion(completion);
  }, [currentUser, userRole]);

  useEffect(() => {
    if (user && user._id !== currentUser?._id) {
      setCurrentUser(user);
    }
  }, [user?._id]);

  const getProfileSections = () => {
    // Debug logging to see what data we have
    console.log("🔍 Profile Data Available:", {
      resume_url: user,
      "documents.resumeUrl": user?.documents,
      resumeUrl: user?.resumeUrl,
      profileImage: user?.profileImage,
      education: user?.education?.length || 0,
      workExperience: user?.workExperience?.length || 0,
    });

    const personalInfo = {
      title: "Personal Information",
      color: "blue",
      icon: <User size={20} />,
      fields: [
        {
          label: "Full Name",
          value:
            user?.name ||
            `${capitalize(user?.firstName)} ${capitalize(
              user?.lastName
            )}`.trim(),
          icon: <User size={14} />,
        },
        {
          label: "Email Address",
          value: user?.email,
          icon: <Mail size={14} />,
        },
        {
          label: "Phone Number",
          value: user?.phone,
          icon: <Phone size={14} />,
        },
        {
          label: "Current Location",
          value:
            userRole === "recruiter"
              ? user?.officeLocation?.city || user?.location
              : user?.currentLocation?.city || user?.location,
          icon: <MapPin size={14} />,
        },
      ],
    };

    const linksSection = {
      title: "Links & Social",
      color: "rose",
      icon: <Globe size={20} />,
      fields: [
        {
          label: "LinkedIn URL",
          value:
            userRole === "recruiter"
              ? user?.professionalLinks?.linkedin
              : user?.linkedin_url || user?.linkedinUrl,
          icon: <Linkedin size={14} />,
          isUrl: true,
        },
        {
          label: "GitHub URL",
          value:
            userRole === "recruiter"
              ? user?.professionalLinks?.github
              : user?.github_url || user?.githubUrl,
          icon: <Github size={14} />,
          isUrl: true,
        },
        {
          label: "Portfolio URL",
          value:
            userRole === "recruiter"
              ? user?.professionalLinks?.personalWebsite
              : user?.portfolio_url || user?.portfolioUrl,
          icon: <LinkIcon size={14} />,
          isUrl: true,
        },
      ],
    };

    const documentsSection =
      userRole === "applicant"
        ? {
            title: "Documents & Files",
            color: "green",
            icon: <FileText size={20} />,
            fields: [
              {
                label: "Resume",
                value:
                  user?.resume_url ||
                  user?.documents?.resumeUrl ||
                  user?.resumeUrl,
                icon: <Download size={14} />,
                isUrl: true,
                isDocument: true,
              },
              {
                label: "Cover Letter",
                value:
                  user?.cover_letter_url ||
                  user?.documents?.coverLetterUrl ||
                  user?.coverLetterUrl,
                icon: <Download size={14} />,
                isUrl: true,
                isDocument: true,
              },
              {
                label: "Profile Image",
                value: user?.profileImage,
                icon: <Camera size={14} />,
                isUrl: true,
                isImage: true,
              },
            ].filter((field) => field.value), // Only show fields that have values
          }
        : null;

    let professionalDetails = {
      title: "Professional Details",
      color: "purple",
      icon: <Briefcase size={20} />,
      fields: [],
    };

    if (userRole === "applicant") {
      professionalDetails.fields = [
        {
          label: "Professional Bio",
          value: user?.bio,
          multiline: true,
          icon: <FileText size={14} />,
        },
        {
          label: "Core Skills",
          value: Array.isArray(user?.skills)
            ? user.skills.join(", ")
            : Array.isArray(user?.skills_array)
            ? user.skills_array.join(", ")
            : typeof user?.skills === "object" && user?.skills !== null
            ? [
                ...(user.skills.primary?.map((s) => s.skill || s) || []),
                ...(user.skills.technical?.map((s) => s.skill || s) || []),
                ...(user.skills.soft?.map((s) => s.skill || s) || []),
                ...(user.skills.languages?.map((s) => s.skill || s) || []),
              ]
                .filter(Boolean)
                .join(", ") || "Not specified"
            : "Not specified",
          icon: <Zap size={14} />,
        },
        {
          label: "Years of Experience",
          value: `${user?.yearsOfExperience || 0} Years`,
          icon: <Clock size={14} />,
        },
        {
          label: "Highest Education",
          value: user?.qualification,
          icon: <GraduationCap size={14} />,
        },
      ];
    } else {
      professionalDetails.fields = [
        {
          label: "Company Name",
          value: user?.companyInfo?.companyName || user?.company,
          icon: <Building size={14} />,
        },
        {
          label: "Business Department",
          value: user?.companyInfo?.department,
          icon: <Building2 size={14} />,
        },
        {
          label: "Current Designation",
          value: user?.companyInfo?.designation || user?.position,
          icon: <Briefcase size={14} />,
        },
      ];
    }

    // Filter out documentsSection if it has no fields with values
    const sections = [personalInfo, professionalDetails, linksSection];
    if (
      documentsSection &&
      documentsSection.fields &&
      documentsSection.fields.length > 0
    ) {
      sections.push(documentsSection);
    }

    return sections;
  };

  const profileSections = getProfileSections();

  const handleProfileSave = async (formData, isFileUpload = false) => {
    setLoading(true);
    try {
      let response;
      if (isFileUpload) {
        response = await updateProfileWithFile(formData);
      } else {
        const transformed = { ...formData };
        if (formData.name) {
          const [first, ...last] = formData.name.split(" ");
          transformed.firstName = first;
          transformed.lastName = last.join(" ");
        }
        response = await updateProfile(transformed);
      }
      if (response.success) {
        // Always re-fetch the latest profile after update
        try {
          const { profileApi } = await import("../../services/profileApi.js");
          const latestProfile = await profileApi.getProfile();
          setCurrentUser(latestProfile.data || latestProfile);
          if (onEdit) onEdit(latestProfile.data || latestProfile);
        } catch (fetchErr) {
          // fallback to response data if fetch fails
          setCurrentUser(response.data);
          if (onEdit) onEdit(response.data);
        }
        return response;
      }
    } catch (error) {
      console.error("Profile update failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Profile Header Widget */}
      <motion.div
        className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-[2.5rem] p-1 shadow-2xl shadow-blue-500/5 overflow-hidden border border-gray-100 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[2.3rem] p-8 text-white relative">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-md bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-md bg-green-500 border-4 border-indigo-600 flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-white">
                  {getDisplayName(user)}
                </h2>
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  {/* <span className="bg-white text-blue-600 px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest shadow-md">
                    {userRole}
                  </span> */}
                  {/* <span className="opacity-40">|</span> */}
                  <span className="text-blue-50">{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-md min-w-[300px] shadow-2xl">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-black text-white">
                  Profile Strength
                </span>
                <span className="text-2xl font-black text-white">
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-5 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-3.5 bg-white dark:bg-gray-800 rounded-md text-gray-800 dark:text-white shadow-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-all active:scale-95 flex items-center justify-center gap-2 border border-transparent"
              >
                <Edit3 size={16} className="text-gray-800 dark:text-white" />
                Edit Profile Details
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profileSections.map((section, idx) => (
          <motion.div
            key={section.title}
            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 transition-all duration-500 p-8 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-4 mb-10">
              <div
                className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-700 ${
                  section.color === "blue"
                    ? "bg-blue-500 text-white shadow-blue-200"
                    : section.color === "purple"
                    ? "bg-purple-500 text-white shadow-purple-200"
                    : section.color === "rose"
                    ? "bg-rose-500 text-white shadow-rose-200"
                    : section.color === "green"
                    ? "bg-green-500 text-white shadow-green-200"
                    : "bg-gray-500 text-white shadow-gray-200"
                }`}
              >
                {React.cloneElement(section.icon, { size: 24 })}
              </div>
              <h3 className="text-md font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-wider">
                {section.title}
              </h3>
            </div>

            <div className="space-y-8 flex-1">
              {section.fields.map((field, fIdx) => (
                <div key={fIdx} className="group">
                  <div className="flex items-center gap-3 mb-2.5 transition-all">
                    <div
                      className={`w-8 h-8 rounded-md bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100/50 dark:border-blue-800/50 shadow-sm group-hover:scale-110 transition-transform 
                        ${section.color === "blue" ? "text-blue-600" : ""}
                        ${section.color === "purple" ? "text-purple-600" : ""}
                        ${section.color === "rose" ? "text-rose-600" : ""}
                        ${section.color === "green" ? "text-green-600" : ""}
                        dark:text-blue-400
                    `}
                    >
                      {field.icon}
                    </div>{" "}
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                      {field.label}
                    </span>
                  </div>
                  <div
                    className={`text-sm font-bold pl-11 transition-all ${
                      field.value && field.value !== "Not provided yet"
                        ? "text-slate-800 dark:text-slate-100"
                        : "text-slate-400 dark:text-slate-500 italic font-medium"
                    }`}
                  >
                    {field.isUrl &&
                    field.value &&
                    field.value !== "Not provided yet" ? (
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                      >
                        {field.isImage
                          ? "View Image"
                          : field.isDocument
                          ? "Download File"
                          : "Open Link"}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      field.value || "Not provided yet"
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Education Section - Only for applicants */}
      {userRole === "applicant" &&
        user?.education &&
        Array.isArray(user.education) &&
        user.education.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-[1.2rem] bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-700 shadow-amber-200">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-md font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-wider">
                Education
              </h3>
            </div>

            <div className="space-y-4">
              {user.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-amber-500 pl-4 py-2"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white">
                    {edu.degree}{" "}
                    {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {edu.institution}
                  </p>
                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {edu.startDate && (
                      <span>{new Date(edu.startDate).getFullYear()}</span>
                    )}
                    {edu.endDate && (
                      <span>
                        -{" "}
                        {edu.isCurrentlyStudying
                          ? "Present"
                          : new Date(edu.endDate).getFullYear()}
                      </span>
                    )}
                    {edu.grade && <span>• Grade: {edu.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      {/* Work Experience Section - Only for applicants */}
      {userRole === "applicant" &&
        user?.workExperience &&
        Array.isArray(user.workExperience) &&
        user.workExperience.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-700 shadow-emerald-200">
                <Briefcase size={24} />
              </div>
              <h3 className="text-md font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-wider">
                Work Experience
              </h3>
            </div>

            <div className="space-y-4">
              {user.workExperience.map((work, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-emerald-500 pl-4 py-2"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white">
                    {work.position || work.jobTitle}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {work.company || work.companyName}
                  </p>
                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {work.startDate && (
                      <span>{new Date(work.startDate).getFullYear()}</span>
                    )}
                    {work.endDate && (
                      <span>
                        -{" "}
                        {work.isCurrentlyWorking
                          ? "Present"
                          : new Date(work.endDate).getFullYear()}
                      </span>
                    )}
                    {work.location && <span>• {work.location}</span>}
                  </div>
                  {work.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {work.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
        userRole={userRole}
        onSave={handleProfileSave}
      />
    </div>
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
    // Show feedback
    if (window.showToast) {
      window.showToast(`Theme changed to ${mode}`, "success");
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    // Show feedback
    if (window.showToast) {
      window.showToast(`Font size changed to ${size}`, "success");
    }
  };

  const handleFontFamilyChange = (family) => {
    setFontFamily(family);
    // Show feedback
    if (window.showToast) {
      window.showToast(`Font family changed to ${family}`, "success");
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Show feedback
    if (window.showToast) {
      window.showToast(
        `Language changed to ${languageOptions[lang]}`,
        "success"
      );
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Show feedback
    if (window.showToast) {
      window.showToast(
        `${key} notifications ${notifications[key] ? "disabled" : "enabled"}`,
        "success"
      );
    }
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
          className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl">{section.icon}</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {section.title}
            </h3>
          </div>

          <div className="space-y-6">
            {section.settings.map((setting, settingIndex) => (
              <div
                key={settingIndex}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{setting.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {setting.label}
                    </h4>
                    {setting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            (systemTheme && option.value === "system") ||
                            (!systemTheme &&
                              darkMode &&
                              option.value === "dark") ||
                            (!systemTheme &&
                              !darkMode &&
                              option.value === "light")
                              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
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
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500"
                      value={fontSize}
                      onChange={(e) => handleFontSizeChange(e.target.value)}
                    >
                      {Object.entries(fontSizeOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)} (
                          {Math.round(value * 16)}px)
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === "fontFamily" && (
                    <select
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500"
                      value={fontFamily}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                    >
                      {Object.keys(fontFamilyOptions).map((font) => (
                        <option
                          key={font}
                          value={font}
                          style={{ fontFamily: fontFamilyOptions[font] }}
                        >
                          {font}
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === "language" && (
                    <select
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500"
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
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
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        notifications[setting.key]
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                      }`}
                      onClick={() => handleNotificationToggle(setting.key)}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
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
  onEditJob = null,
  onApply = null,
  onSave = null,
}) => {
  const { dashboardData, loading, error, currentUser } = useDashboard();
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);

  // Get jobs from dashboard data with fallback and mark saved jobs
  let jobs = (dashboardData?.recentJobs || []).map((job) => ({
    ...job,
    saved: savedJobIds.has(job._id?.toString() || job.id?.toString()),
  }));

  console.log("🔍 Dashboard jobs available:", {
    dashboardData: !!dashboardData,
    recentJobs: dashboardData?.recentJobs?.length || 0,
    jobType: jobType,
    userRole: userRole,
  });

  // Debug experience field in regular jobs
  if (dashboardData?.recentJobs?.length > 0) {
    console.log("🔍 First regular job experience field:", {
      job: dashboardData.recentJobs[0]?.jobTitle,
      experience: dashboardData.recentJobs[0]?.experience,
      experienceType: typeof dashboardData.recentJobs[0]?.experience,
    });
  }

  // Fetch saved jobs for applicants
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (userRole === "applicant") {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const savedIds = new Set(
              data.saved.map(
                (saved) =>
                  saved.jobId?._id?.toString() || saved.jobId?.toString()
              )
            );
            setSavedJobIds(savedIds);
            console.log("✅ Loaded saved jobs:", savedIds.size);
          }
        } catch (error) {
          console.error("❌ Error fetching saved jobs:", error);
        }
      }
    };

    fetchSavedJobs();
  }, [userRole]);

  // For applicants, fetch recommended jobs when jobType is "recommended" or "all"
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      if (
        userRole === "applicant" &&
        (jobType === "recommended" || jobType === "all") &&
        currentUser?._id
      ) {
        try {
          setJobsLoading(true);
          console.log(
            "🔍 Fetching recommended jobs for applicant:",
            currentUser._id
          );

          // Import recommendations API
          const { getRecommendedJobs } = await import(
            "../../api/recommendations"
          );
          const response = await getRecommendedJobs({
            limit: 20,
            minMatchPercentage: 20, // Minimum 20% overall match (but skill match is mandatory)
          });

          console.log("🔍 Recommendation API response:", response);

          if (response.success) {
            // Transform the data to match the component's expected format
            const transformedJobs = response.data.jobs.map((job) => {
              // Format salary properly
              const formatSalary = (salaryObj) => {
                if (!salaryObj) return "Negotiable";
                if (typeof salaryObj === "string") return salaryObj;

                const { minimum, maximum, type, period, currency } = salaryObj;
                const currencySymbol = currency === "INR" ? "₹" : "$";

                if (minimum && maximum) {
                  if (minimum >= 100000) {
                    return `${currencySymbol}${(minimum / 100000).toFixed(
                      1
                    )}L - ${currencySymbol}${(maximum / 100000).toFixed(1)}L ${
                      period || "Yearly"
                    }`;
                  } else {
                    return `${currencySymbol}${minimum.toLocaleString()} - ${currencySymbol}${maximum.toLocaleString()} ${
                      period || "Yearly"
                    }`;
                  }
                } else if (minimum) {
                  if (minimum >= 100000) {
                    return `${currencySymbol}${(minimum / 100000).toFixed(
                      1
                    )}L+ ${period || "Yearly"}`;
                  } else {
                    return `${currencySymbol}${minimum.toLocaleString()}+ ${
                      period || "Yearly"
                    }`;
                  }
                }

                return "Negotiable";
              };

              return {
                id: job.id,
                _id: job.id,
                jobTitle: job.jobTitle,
                title: job.jobTitle,
                companyName: job.companyName,
                company: job.companyName,
                location: job.location,
                salary: formatSalary(job.salary), // Format salary as string
                salaryRange: job.salary, // Keep original object for other uses
                formattedSalary: formatSalary(job.salary), // Explicit formatted version
                workArrangement: job.workArrangement,
                type: job.workArrangement || "Full-time",
                experience: job.experience
                  ? typeof job.experience === "object"
                    ? `${job.experience.min || 0}-${
                        job.experience.max || job.experience.min || 0
                      } years`
                    : job.experience
                  : "Not specified", // Map experience field
                industry: job.industry || "Not specified", // Map industry field
                jobCategory: job.jobCategory || "Not specified", // Map job category
                requiredSkills: job.requiredSkills,
                skills: job.requiredSkills,
                description: job.description,
                jobDescription: job.description,
                postedDate: job.postedDate,
                createdAt: job.postedDate,
                applicationDeadline: job.applicationDeadline,
                matchScore: job.matchScore?.overall || 0,
                matchReasons: job.recommendationReasons || [],
                recommended: true,
                saved: false, // Default to not saved
                status: "Active",
              };
            });

            console.log(
              "✅ Transformed recommended jobs:",
              transformedJobs.length
            );
            setRecommendedJobs(transformedJobs);
          } else {
            console.log(
              "❌ Failed to fetch recommendations:",
              response.message
            );
            setRecommendedJobs([]);
          }
        } catch (error) {
          console.error("❌ Error fetching recommended jobs:", error);
          setRecommendedJobs([]);
        } finally {
          setJobsLoading(false);
        }
      }
    };

    fetchRecommendedJobs();
  }, [userRole, jobType, currentUser?._id]);

  // For recruiters, fetch their company's jobs
  useEffect(() => {
    const fetchRecruiterJobs = async () => {
      if (userRole === "recruiter" && currentUser?._id) {
        try {
          setJobsLoading(true);

          // Get company name from current user
          const companyName =
            currentUser.companyInfo?.companyName ||
            currentUser.companyName ||
            currentUser.company;

          console.log("🔍 Fetching jobs for recruiter and company:", {
            recruiterId: currentUser._id,
            companyName: companyName,
          });

          // Import jobsAPI dynamically to avoid circular imports
          const { jobsAPI } = await import("../../services/api");

          // Use combined filtering: recruiter's own jobs + company jobs
          const queryParams = companyName
            ? {
                recruiterAndCompany: `${currentUser._id}|${companyName}`,
                limit: 100,
              }
            : {
                postedBy: currentUser._id,
                limit: 100,
              };

          console.log("🔍 Query parameters:", queryParams);

          const response = await jobsAPI.getJobs(queryParams);

          const fetchedJobs =
            response.data.data?.jobs || response.data.jobs || [];
          console.log(
            `✅ Fetched company jobs: ${fetchedJobs.length} for jobType: ${jobType}`
          );
          console.log("🔍 Sample job data:", fetchedJobs[0]);
          if (fetchedJobs[0]) {
            console.log("🔍 Job fields:", Object.keys(fetchedJobs[0]));
            console.log(
              "🔍 Experience field value:",
              fetchedJobs[0].experience
            );
            console.log(
              "🔍 Job title field:",
              fetchedJobs[0].jobTitle || fetchedJobs[0].title
            );
            console.log(
              "🔍 Company field:",
              fetchedJobs[0].companyName || fetchedJobs[0].company
            );
            console.log(
              "🔍 Skills field:",
              fetchedJobs[0].requiredSkills || fetchedJobs[0].skills
            );
            console.log("🔍 Salary field:", fetchedJobs[0].salaryRange);
          }
          // Map backend jobs to UI-expected structure
          const mapJob = (job) => {
            const mappedJob = {
              ...job,
              id: job.id || job._id,
              // Use separate fields for display to avoid overwriting original data needed for forms
              displayTitle: job.jobTitle || job.title || "",
              displayCompany: job.companyName || job.company || "",
              status: (job.status || job.jobStatus || "active").toLowerCase(),
              // Ensure we keep original values if they exist
              jobTitle: job.jobTitle || job.title || "",
              companyName: job.companyName || job.company || "",
              description: job.jobDescription || job.description || "",
              postedDate: job.postedDate || job.createdAt || "",
              applicationDeadline: job.applicationDeadline || "",
              jobType: job.jobType || job.type || "Full Time",
              workArrangement: job.workArrangement || "On-site",
            };
            return mappedJob;
          };
          const mappedJobs = fetchedJobs.map(mapJob);
          setRecruiterJobs(mappedJobs);
        } catch (error) {
          console.error("Error fetching company jobs:", error);
          setRecruiterJobs([]);
        } finally {
          setJobsLoading(false);
        }
      }
    };

    fetchRecruiterJobs();
  }, [
    userRole,
    currentUser?._id,
    currentUser?.companyInfo?.companyName,
    currentUser?.companyName,
    currentUser?.company,
    dashboardData, // Add dashboardData to trigger refresh
  ]);

  // Handle view job details
  const handleViewJobDetails = (job) => {
    console.log("Opening job details for:", job.jobTitle);
    setSelectedJob(job);
    setIsJobDetailsModalOpen(true);
  };

  // Handle close job details modal
  const handleCloseJobDetails = () => {
    setIsJobDetailsModalOpen(false);
    setSelectedJob(null);
  };

  // Use role and type-specific jobs
  if (userRole === "recruiter" && recruiterJobs.length > 0) {
    jobs = recruiterJobs;
  } else if (userRole === "applicant" && jobType === "recommended") {
    jobs = recommendedJobs;
    console.log("🔍 Using recommended jobs:", jobs.length);
  }

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
  const [applicationsModal, setApplicationsModal] = useState({
    isOpen: false,
    job: null,
    applications: [],
  });
  const [candidateModal, setCandidateModal] = useState({
    isOpen: false,
    candidate: null,
  });
  const [contactModal, setContactModal] = useState({
    isOpen: false,
    candidate: null,
  });
  const [scheduleInterviewModal, setScheduleInterviewModal] = useState({
    isOpen: false,
    candidate: null,
    job: null,
    application: null,
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".relative")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Filter jobs based on job type and current filters
  const getJobsByType = () => {
    // Ensure jobs is always an array
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    let filteredJobs = safeJobs;

    switch (jobType) {
      case "active":
        // Filter active jobs - Fixed case sensitivity
        filteredJobs = safeJobs.filter(
          (job) =>
            job.status?.toLowerCase() === "active" || job.status === "Active"
        );
        break;
      case "draft":
        // Filter draft jobs - Fixed case sensitivity
        filteredJobs = safeJobs.filter(
          (job) =>
            job.status?.toLowerCase() === "draft" || job.status === "Draft"
        );
        break;
      case "closed":
        // Filter closed jobs - Fixed case sensitivity
        filteredJobs = safeJobs.filter(
          (job) =>
            job.status?.toLowerCase() === "closed" || job.status === "Closed"
        );
        break;
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
        // Combine regular jobs, recommended jobs, and favorites using object instead of Map
        const jobsById = {};

        // Add regular jobs
        safeJobs.forEach((job) => {
          const jobId = job.id || job._id;
          if (jobId) {
            jobsById[jobId] = job;
          }
        });

        // Add recommended jobs if available
        if (userRole === "applicant" && recommendedJobs.length > 0) {
          recommendedJobs.forEach((job) => {
            const jobId = job.id || job._id;
            if (jobId) {
              const existingJob = jobsById[jobId];
              if (existingJob) {
                // Merge properties - mark as recommended
                jobsById[jobId] = {
                  ...existingJob,
                  recommended: true,
                  matchScore: job.matchScore,
                  matchReasons: job.matchReasons,
                };
              } else {
                // Add new recommended job
                jobsById[jobId] = job;
              }
            }
          });
        }

        filteredJobs = Object.values(jobsById);
        console.log("🔍 All jobs combined:", {
          regular: safeJobs.length,
          recommended: recommendedJobs.length,
          total: filteredJobs.length,
          jobType: jobType,
          userRole: userRole,
        });
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
    });
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
    if (
      !window.confirm(
        "Are you sure you want to delete this job posting? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting((prev) => ({ ...prev, [jobId]: true }));
    try {
      // Import jobsAPI dynamically to avoid circular imports
      const { jobsAPI } = await import("../../services/api");
      const response = await jobsAPI.deleteJob(jobId);

      if (response.data.success) {
        console.log("✅ Job deleted successfully:", jobId);

        // Update local jobs list by removing the deleted job
        setRecruiterJobs((prevJobs) =>
          prevJobs.filter((job) => job.id !== jobId && job._id !== jobId)
        );

        // Show success message
        alert(`Job has been deleted successfully!`);
      } else {
        throw new Error(response.data.message || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Please try again.");
    } finally {
      setDeleting((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle job update (toggle status)
  const handleUpdate = async (jobId) => {
    setUpdating((prev) => ({ ...prev, [jobId]: true }));
    try {
      // Get current job to toggle its status
      const currentJob = jobs.find(
        (job) => job.id === jobId || job._id === jobId
      );
      if (!currentJob) {
        throw new Error("Job not found");
      }

      // Toggle between active and draft status
      const newStatus = currentJob.status === "active" ? "draft" : "active";

      // Import jobsAPI dynamically to avoid circular imports
      const { jobsAPI } = await import("../../services/api");
      const response = await jobsAPI.updateJob(jobId, { status: newStatus });

      if (response.data.success) {
        alert(`Job status updated to ${newStatus} successfully!`);
        // Refresh the jobs list
        window.location.reload();
      } else {
        throw new Error(response.data.message || "Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
    } finally {
      setUpdating((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle edit job (redirect to post tab with data)
  const handleEdit = (jobId) => {
    console.log("🔍 Edit job clicked, jobId:", jobId);
    console.log("🔍 Available jobs:", jobs);
    console.log("🔍 Jobs length:", jobs?.length);

    const currentJob = jobs.find(
      (job) => job.id === jobId || job._id === jobId
    );
    console.log("🔍 Found job for editing:", currentJob);

    if (currentJob) {
      // Dispatch custom event to trigger edit in parent dashboard
      const editEvent = new CustomEvent("editJob", {
        detail: { job: currentJob },
      });
      window.dispatchEvent(editEvent);
      console.log(
        "✅ Edit event dispatched for job:",
        currentJob.jobTitle || currentJob.title
      );
      console.log("✅ Event dispatched successfully");
    } else {
      console.log("❌ Job not found for editing");
      console.log("❌ Searched for jobId:", jobId);
      console.log(
        "❌ Available job IDs:",
        jobs?.map((j) => ({ id: j.id, _id: j._id }))
      );
      alert("Job not found. Please refresh the page and try again.");
    }
  };

  // Handle apply to job
  const handleApply = (jobId) => {
    const currentJob = jobs.find(
      (job) => job.id === jobId || job._id === jobId
    );

    if (currentJob && onApply) {
      onApply(currentJob);
    } else {
      console.log("❌ No onApply callback provided or job not found");
    }
  };

  // Handle save/favorite job
  const handleSaveJob = async (jobId, isSaved) => {
    console.log("🔍 Save job clicked, jobId:", jobId, "isSaved:", isSaved);

    try {
      setSaving((prev) => ({ ...prev, [jobId]: true }));

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to save jobs");
        return;
      }

      if (isSaved) {
        // Remove from favorites - need to find the saved job record ID first
        // For now, we'll use the job ID directly and let backend handle it
        const response = await fetch(
          `${API_BASE_URL}/saved-jobs/by-job/${jobId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          console.log("✅ Job removed from favorites");
          // Update local state
          setSavedJobIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(jobId.toString());
            return newSet;
          });
        } else {
          const error = await response
            .json()
            .catch(() => ({ message: "Failed to remove from favorites" }));
          console.error("❌ Failed to remove from favorites:", error);
          alert(error.message || "Failed to remove from favorites");
        }
      } else {
        // Add to favorites - send the MongoDB ObjectId as string
        const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_id: typeof jobId === "object" ? jobId.toString() : jobId,
          }),
        });

        if (response.ok) {
          console.log("✅ Job added to favorites");
          // Update local state
          setSavedJobIds((prev) => new Set([...prev, jobId.toString()]));
        } else {
          const error = await response.json();
          console.error("❌ Failed to add to favorites:", error);
          if (response.status === 409) {
            // Already saved - just show message
            alert("This job is already in your favorites");
          } else {
            alert(error.message || "Failed to add to favorites");
          }
        }
      }
    } catch (error) {
      console.error("❌ Error saving job:", error);
      alert("An error occurred while saving the job");
    } finally {
      setSaving((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleUpdateJob = async (jobId, updateData) => {
    console.log("🔍 Updating job:", jobId, updateData);

    try {
      setUpdating((prev) => ({ ...prev, [jobId]: true }));

      // Call API to update job
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Job updated successfully:", result);

      // Update local jobs list
      setRecruiterJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId || job._id === jobId
            ? { ...job, ...updateData, id: job.id || job._id }
            : job
        )
      );

      // Close modal
      setEditModal({ isOpen: false, job: null });

      return result;
    } catch (error) {
      console.error("❌ Error updating job:", error);
      throw error;
    } finally {
      setUpdating((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle view applications
  const handleViewApplications = async (jobId) => {
    console.log("🔍 View applications for job:", jobId);
    try {
      // Import applicationsAPI dynamically to avoid circular imports
      const { applicationsAPI } = await import("../../services/api");
      console.log("🔍 Calling API with jobId:", jobId);

      const response = await applicationsAPI.getApplicationsByJob(jobId);
      console.log("🔍 API Response:", response);
      console.log("🔍 API Response structure:", {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasApplications: !!response.data?.data?.applications,
        firstApp: response.data?.data?.applications?.[0],
        firstAppSnapshot:
          response.data?.data?.applications?.[0]?.applicantSnapshot,
      });

      const applications =
        response.data.data?.applications || response.data.applications || [];
      console.log("🔍 Extracted applications:", applications);
      console.log(
        "🔍 First application has snapshot?",
        !!applications[0]?.applicantSnapshot
      );
      console.log(
        "🔍 First application fields:",
        applications[0] ? Object.keys(applications[0]) : "No applications"
      );
      console.log(
        "🔍 First application appliedAt:",
        applications[0]?.appliedAt
      );
      console.log(
        "🔍 First application createdAt:",
        applications[0]?.createdAt
      );
      console.log("🔍 First application timeline:", applications[0]?.timeline);

      const currentJob = jobs.find(
        (job) => job.id === jobId || job._id === jobId
      );
      console.log("🔍 Found job:", currentJob);

      // Open the applications modal with job and applications data
      setApplicationsModal({
        isOpen: true,
        job: currentJob,
        applications: applications,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Failed to fetch applications. Please try again.");
    }
  };

  // Transform application data to candidate format for CandidateProfileModal
  const transformApplicationToCandidate = (app) => {
    console.log("Transforming application:", app);
    console.log("🔍 app.applicantSnapshot exists?", !!app.applicantSnapshot);
    console.log(
      "🔍 app.applicantSnapshot keys:",
      app.applicantSnapshot ? Object.keys(app.applicantSnapshot) : "N/A"
    );
    console.log(
      "🔍 app.applicantSnapshot.education:",
      app.applicantSnapshot?.education?.length || 0
    );
    console.log(
      "🔍 app.applicantSnapshot.workExperience:",
      app.applicantSnapshot?.workExperience?.length || 0
    );
    console.log(
      "🔍 app.applicantSnapshot.bio:",
      app.applicantSnapshot?.bio ? "Present" : "Missing"
    );

    // PRIORITY: Use applicantSnapshot if available (has complete data at application time)
    const snapshot = app.applicantSnapshot || {};
    const applicant = app.applicant || app.applicantId || {};
    const appInfo = app.applicationInfo || app.applicationData || {};
    const firstJob = appInfo.firstJob || appInfo.job || {};

    console.log("🔍 Job title field:", firstJob.jobTitle);
    console.log("🔍 Company field:", firstJob.companyName);
    console.log("🔍 Skills field:", firstJob.requiredSkills);
    console.log("🔍 Salary field:", firstJob.salaryRange);
    console.log("🔍 Job urgency field:", firstJob.jobUrgency);
    console.log("🔍 Job urgency type:", typeof firstJob.jobUrgency);

    console.log("Applicant data:", applicant);
    console.log("Application info:", appInfo);
    console.log("Applicant skills:", applicant.skills);
    console.log("Applicant socialLinks:", applicant.socialLinks);
    console.log("Applicant portfolioLinks:", applicant.portfolioLinks);

    // Extract structured data from applicationInfo
    const basicInfo = appInfo.basicInfo || {};
    const experience = appInfo.experience || {};
    const expectedSalary = appInfo.expectedSalary || {};
    const skills = appInfo.skills || {};
    const socialLinks = appInfo.socialLinks || {};
    const education = appInfo.education || [];

    console.log("🔍 Extracted appInfo:", appInfo);
    console.log("🔍 Extracted basicInfo:", basicInfo);
    console.log("🔍 Extracted experience:", experience);
    console.log("🔍 Extracted expectedSalary:", expectedSalary);
    console.log("🔍 Applicant yearsOfExperience:", applicant.yearsOfExperience);
    console.log("🔍 Applicant experience_years:", applicant.experience_years);
    console.log("🔍 Applicant expectedSalary:", applicant.expectedSalary);
    console.log("🔍 Applicant careerInfo:", applicant.careerInfo);
    console.log("🔍 Extracted skills from appInfo:", skills);
    console.log("🔍 Extracted socialLinks from appInfo:", socialLinks);

    // PRIORITY 1: Use applicantSnapshot (complete data at application time)
    // PRIORITY 2: Use applicant/applicantId (current profile)
    // PRIORITY 3: Use appInfo (application form data)

    return {
      // ID - Try multiple sources
      id:
        app.applicantId?._id ||
        app.applicantId?.id ||
        app.applicant?._id ||
        app.applicant?.id ||
        app._id,

      // Basic Information - Prioritize snapshot
      name:
        snapshot.firstName && snapshot.lastName
          ? `${snapshot.firstName} ${snapshot.lastName}`
          : basicInfo.firstName && basicInfo.lastName
          ? `${basicInfo.firstName} ${basicInfo.lastName}`
          : applicant.fullName ||
            applicant.name ||
            `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() ||
            "Unknown Applicant",
      email:
        snapshot.email ||
        basicInfo.email ||
        applicant.email ||
        "No email provided",
      phone:
        snapshot.phone ||
        basicInfo.phone ||
        applicant.phone ||
        "No phone provided",
      location:
        snapshot.location ||
        applicant.location ||
        appInfo.personalInfo?.location ||
        "Location not specified",

      // Professional Information - Prioritize snapshot
      currentRole:
        snapshot.currentJobTitle ||
        experience.currentJob?.jobTitle ||
        applicant.currentJobTitle ||
        "Not specified",

      // Bio/Summary - Prioritize snapshot
      bio:
        snapshot.bio ||
        snapshot.professionalSummary ||
        applicant.bio ||
        applicant.professionalSummary ||
        "",

      // Experience data - Prioritize snapshot
      experience: snapshot.experience
        ? typeof snapshot.experience === "number"
          ? `${snapshot.experience} years`
          : snapshot.experience
        : snapshot.yearsOfExperience
        ? `${snapshot.yearsOfExperience} years`
        : experience.totalYears
        ? `${experience.totalYears} years`
        : basicInfo.experienceYears
        ? `${basicInfo.experienceYears} years`
        : applicant.yearsOfExperience
        ? `${applicant.yearsOfExperience} years`
        : applicant.experience_years
        ? `${applicant.experience_years} years`
        : app.applicationData?.experience || "Not specified",

      // Expected Salary - Prioritize snapshot
      expectedSalary: snapshot.expectedSalary
        ? snapshot.expectedSalary
        : expectedSalary.displayText
        ? expectedSalary.displayText
        : expectedSalary.rawSalaryText
        ? expectedSalary.rawSalaryText
        : expectedSalary.salaryRange?.min && expectedSalary.salaryRange?.max
        ? `₹${expectedSalary.salaryRange.min}K - ₹${
            expectedSalary.salaryRange.max
          }K ${expectedSalary.salaryRange.period || "yearly"}`
        : expectedSalary.salaryRange?.min
        ? `₹${expectedSalary.salaryRange.min}K+ ${
            expectedSalary.salaryRange.period || "yearly"
          }`
        : basicInfo.expectedSalary ||
          applicant.expectedSalary ||
          applicant.careerInfo?.expectedSalary ||
          app.applicationData?.expectedSalary ||
          "Not specified",

      // Skills data - PRIORITIZE snapshot
      skills: [
        // PRIORITY 1: From applicantSnapshot (complete data at application time)
        ...(snapshot.skills?.primary?.map((s) => s.skill || s) || []),
        ...(snapshot.skills?.technical?.map((s) => s.skill || s) || []),
        ...(snapshot.skills?.soft?.map((s) => s.skill || s) || []),
        ...(Array.isArray(snapshot.skills) ? snapshot.skills : []),

        // PRIORITY 2: From ApplicationInformation
        ...(skills.primary?.map((s) => s.skill || s) || []),
        ...(skills.technical?.map((s) => s.skill || s) || []),
        ...(skills.soft?.map((s) => s.skill || s) || []),

        // PRIORITY 3: From user profile (current profile data)
        ...(applicant.skills?.primary?.map((s) => s.skill || s) || []),
        ...(applicant.skills?.technical?.map((s) => s.skill || s) || []),
        ...(applicant.skills?.soft?.map((s) => s.skill || s) || []),
        ...(Array.isArray(applicant.skills) ? applicant.skills : []),

        // Fallbacks
        ...(basicInfo.skills || []),
        ...(app.applicationData?.skills || []),
        ...(applicant.primary_skills || []),
        ...(applicant.skills_array || []),
      ].filter(Boolean),

      // Education data - PRIORITIZE snapshot
      education:
        snapshot.education && snapshot.education.length > 0
          ? snapshot.education
          : education.length > 0
          ? education
          : applicant.education || [],

      // Work experience data - PRIORITIZE snapshot
      workExperience:
        snapshot.workExperience && snapshot.workExperience.length > 0
          ? snapshot.workExperience
          : appInfo.workExperience || applicant.workExperience || [],

      // Portfolio links - combine from multiple sources
      portfolioLinks: [
        // From ApplicationInformation (application-time snapshot)
        socialLinks.portfolio?.url && {
          type: "Portfolio",
          url: socialLinks.portfolio.url,
          label: "Personal Portfolio",
        },
        socialLinks.linkedin?.url && {
          type: "LinkedIn",
          url: socialLinks.linkedin.url,
          label: "LinkedIn Profile",
        },
        socialLinks.github?.url && {
          type: "GitHub",
          url: socialLinks.github.url,
          label: "GitHub Profile",
        },
        socialLinks.personalWebsite && {
          type: "Website",
          url: socialLinks.personalWebsite,
          label: "Personal Website",
        },

        // From user profile (current profile data)
        applicant.socialLinks?.portfolio && {
          type: "Portfolio",
          url: applicant.socialLinks.portfolio,
          label: "Personal Portfolio",
        },
        applicant.socialLinks?.linkedin && {
          type: "LinkedIn",
          url: applicant.socialLinks.linkedin,
          label: "LinkedIn Profile",
        },
        applicant.socialLinks?.github && {
          type: "GitHub",
          url: applicant.socialLinks.github,
          label: "GitHub Profile",
        },
        applicant.socialLinks?.website && {
          type: "Website",
          url: applicant.socialLinks.website,
          label: "Personal Website",
        },

        // From portfolioLinks field (if exists)
        ...(applicant.portfolioLinks?.map((link) => ({
          type: link.type || "Link",
          url: link.url,
          label: link.label || link.title || "Portfolio Link",
        })) || []),

        // From application data (fallback)
        app.applicationData?.portfolioUrl && {
          type: "Portfolio",
          url: app.applicationData.portfolioUrl,
          label: "Personal Portfolio",
        },
        app.applicationData?.linkedinUrl && {
          type: "LinkedIn",
          url: app.applicationData.linkedinUrl,
          label: "LinkedIn Profile",
        },
        app.applicationData?.githubUrl && {
          type: "GitHub",
          url: app.applicationData.githubUrl,
          label: "GitHub Profile",
        },

        // From basicInfo social links
        basicInfo.linkedin && {
          type: "LinkedIn",
          url: basicInfo.linkedin,
          label: "LinkedIn Profile",
        },
        basicInfo.github && {
          type: "GitHub",
          url: basicInfo.github,
          label: "GitHub Profile",
        },
        basicInfo.portfolio && {
          type: "Portfolio",
          url: basicInfo.portfolio,
          label: "Personal Portfolio",
        },
      ].filter(Boolean),

      // Application specific data
      // Extract applied date from timeline if appliedAt/createdAt not available
      appliedAt:
        app.appliedAt ||
        app.createdAt ||
        app.timeline?.find((t) => t.status === "applied")?.timestamp ||
        app.timeline?.[0]?.timestamp,
      appliedDate: app.appliedAt
        ? new Date(app.appliedAt).toLocaleDateString()
        : app.createdAt
        ? new Date(app.createdAt).toLocaleDateString()
        : app.timeline?.find((t) => t.status === "applied")?.timestamp
        ? new Date(
            app.timeline.find((t) => t.status === "applied").timestamp
          ).toLocaleDateString()
        : app.timeline?.[0]?.timestamp
        ? new Date(app.timeline[0].timestamp).toLocaleDateString()
        : "Unknown",
      status: app.applicationStatus || app.status || "pending",
      summary:
        basicInfo.bio ||
        app.coverLetter ||
        applicant.bio ||
        "No summary provided",
      rating: 4, // Default rating
      notes: app.notes || "",
      isShortlisted: (app.applicationStatus || app.status) === "shortlisted",
    };
  };

  // Handle schedule interview
  const handleScheduleInterview = (application, job) => {
    console.log("📅 Scheduling interview for:", application, job);

    // Transform application to candidate format
    const candidate = transformApplicationToCandidate(application);

    setScheduleInterviewModal({
      isOpen: true,
      candidate: candidate,
      job: job,
      application: application,
    });
  };

  // Handle view candidate profile
  const handleViewCandidate = (app) => {
    console.log("🔍 Viewing candidate profile for:", app);
    console.log("🔍 app.appliedAt:", app.appliedAt);
    console.log("🔍 app.createdAt:", app.createdAt);
    const candidateData = transformApplicationToCandidate(app);
    console.log("🔍 Transformed candidate data:", candidateData);
    console.log("🔍 candidateData.appliedAt:", candidateData.appliedAt);
    console.log("🔍 candidateData.appliedDate:", candidateData.appliedDate);
    setCandidateModal({ isOpen: true, candidate: candidateData });
  };

  // Handle contact candidate
  const handleContactCandidate = (candidate) => {
    console.log("📞 Opening contact modal for:", candidate);
    setContactModal({ isOpen: true, candidate });
  };

  // Handle send email
  const handleSendEmail = async (emailData) => {
    try {
      console.log("📧 Sending email:", emailData);
      const response = await communicationsAPI.sendEmail(emailData);
      console.log("✅ Email sent successfully:", response);

      // Show success message
      toast({
        title: "Email Sent Successfully!",
        description: `Email sent to ${emailData.to}`,
        variant: "default",
      });

      return response;
    } catch (error) {
      console.error("❌ Failed to send email:", error);

      // Show error message
      toast({
        title: "Failed to Send Email",
        description: error.message || "Please try again later",
        variant: "destructive",
      });

      throw error;
    }
  };

  // Handle send message/SMS
  const handleSendMessage = async (candidate) => {
    try {
      console.log("📱 Sending message to:", candidate);

      if (!candidate.phone) {
        throw new Error("No phone number available for this candidate");
      }

      // For now, we'll open the default SMS app
      const message = `Hi ${candidate.name}, I'm interested in discussing a job opportunity with you. Please let me know if you're available for a conversation.`;
      const smsUrl = `sms:${candidate.phone}?body=${encodeURIComponent(
        message
      )}`;

      // Try to open SMS app
      window.open(smsUrl, "_self");

      // Also send via our API if available
      try {
        const response = await communicationsAPI.sendSMS({
          to: candidate.phone,
          message: message,
        });
        console.log("✅ SMS sent via API:", response);
      } catch (apiError) {
        console.log("ℹ️ SMS API not available, opened default SMS app");
      }

      toast({
        title: "SMS App Opened",
        description: `Message prepared for ${candidate.name}`,
        variant: "default",
      });
    } catch (error) {
      console.error("❌ Failed to send message:", error);

      toast({
        title: "Failed to Send Message",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {jobType === "recommended"
              ? "⭐ Recommended Jobs"
              : jobType === "favorites"
              ? "❤️ Favorite Jobs"
              : "🔍 Browse Jobs"}
          </h2>
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
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="overflow-x-auto max-w-full"
                style={{
                  scrollbarWidth: "thin",
                  scrollBehavior: "smooth",
                  maxWidth: "100%",
                  overflowY: "visible",
                }}
              >
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-64">
                        Job Details
                      </th>
                      {userRole === "applicant" && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-48">
                          Company & Location
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                        Salary
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                        Type & Mode
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                        Experience
                      </th>
                      {userRole === "recruiter" && (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                            Applicants
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                            Deadline
                          </th>
                        </>
                      )}
                      {userRole === "applicant" && (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                            Posted
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                            Deadline
                          </th>
                        </>
                      )}
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-48">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    style={{ position: "relative" }}
                  >
                    {displayedJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-5">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              {job.jobTitle || job.title}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {(job.requiredSkills || job.skills || [])
                                ?.slice(0, 2)
                                .map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {(job.requiredSkills || job.skills || [])
                                ?.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +
                                  {(job.requiredSkills || job.skills || [])
                                    .length - 2}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {job.industry || "Not specified"}
                            </div>
                          </div>
                        </td>
                        {userRole === "applicant" && (
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              {job.companyName ||
                                job.company ||
                                job.companyInfo?.companyName ||
                                "Not specified"}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                              <span className="mr-1">📍</span>
                              {job.location}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span className="mr-1">💰</span>
                            <span className="truncate">
                              {job.salary ||
                                job.formattedSalary ||
                                (job.salaryRange?.min && job.salaryRange?.max
                                  ? `₹${(job.salaryRange.min / 100000).toFixed(
                                      1
                                    )}L - ₹${(
                                      job.salaryRange.max / 100000
                                    ).toFixed(1)}L`
                                  : job.salaryRange?.min
                                  ? `₹${(job.salaryRange.min / 100000).toFixed(
                                      1
                                    )}L+`
                                  : job.salaryMin && job.salaryMax
                                  ? `₹${job.salaryMin}-${job.salaryMax}`
                                  : job.salaryMin
                                  ? `₹${job.salaryMin}+`
                                  : "Negotiable")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2.5">
                            {/* Job Type */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium w-10">
                                Type:
                              </span>
                              <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {job.jobType || job.type || "N/A"}
                              </span>
                            </div>
                            {/* Work Mode */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium w-10">
                                Mode:
                              </span>
                              <span
                                className={`px-2.5 py-0.5 inline-flex items-center gap-1 text-xs font-semibold rounded-md ${
                                  job.workArrangement?.toLowerCase() ===
                                  "remote"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : job.workArrangement?.toLowerCase() ===
                                      "hybrid"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }`}
                              >
                                {job.workArrangement?.toLowerCase() ===
                                "remote" ? (
                                  <>🏠 Remote</>
                                ) : job.workArrangement?.toLowerCase() ===
                                  "hybrid" ? (
                                  <>🔄 Hybrid</>
                                ) : job.workArrangement
                                    ?.toLowerCase()
                                    .includes("site") ? (
                                  <>🏢 Onsite</>
                                ) : (
                                  <>{job.workArrangement || "Onsite"}</>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {(() => {
                              if (!job.experience) return "Not specified";
                              if (typeof job.experience === "object") {
                                if (
                                  job.experience.min !== undefined &&
                                  job.experience.max !== undefined
                                ) {
                                  return `${job.experience.min}-${job.experience.max} yrs`;
                                } else if (job.experience.min !== undefined) {
                                  return `${job.experience.min}+ yrs`;
                                }
                                return "Not specified";
                              }
                              return job.experience;
                            })()}
                          </div>
                        </td>
                        {userRole === "recruiter" && (
                          <>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900">
                                  <span className="text-base font-bold text-blue-600 dark:text-blue-300">
                                    {job.applicantsCount ||
                                      job.applications?.length ||
                                      0}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  {job.applicantsCount === 1
                                    ? "Applicant"
                                    : "Applicants"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {job.applicationDeadline ? (
                                  <div className="flex flex-col gap-1.5">
                                    <span className="font-medium text-sm">
                                      {new Date(
                                        job.applicationDeadline
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="text-xs font-medium">
                                      {(() => {
                                        const deadline = new Date(
                                          job.applicationDeadline
                                        );
                                        const today = new Date();
                                        const diffTime = deadline - today;
                                        const diffDays = Math.ceil(
                                          diffTime / (1000 * 60 * 60 * 24)
                                        );
                                        if (diffDays < 0)
                                          return (
                                            <span className="text-red-600 dark:text-red-400">
                                              ⚠️ Expired
                                            </span>
                                          );
                                        if (diffDays === 0)
                                          return (
                                            <span className="text-red-600 dark:text-red-400">
                                              🔴 Today
                                            </span>
                                          );
                                        if (diffDays === 1)
                                          return (
                                            <span className="text-yellow-600 dark:text-yellow-400">
                                              🟡 Tomorrow
                                            </span>
                                          );
                                        if (diffDays <= 7)
                                          return (
                                            <span className="text-yellow-600 dark:text-yellow-400">
                                              🟡 {diffDays} days left
                                            </span>
                                          );
                                        return (
                                          <span className="text-green-600 dark:text-green-400">
                                            🟢 {diffDays} days left
                                          </span>
                                        );
                                      })()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    No deadline
                                  </span>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        {userRole === "applicant" && (
                          <>
                            {/* Posted Date Column */}
                            <td className="px-6 py-5">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {job.createdAt || job.postedDate ? (
                                  <div className="flex flex-col gap-1.5">
                                    <span className="font-medium text-sm">
                                      {new Date(
                                        job.createdAt || job.postedDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                      {(() => {
                                        const posted = new Date(
                                          job.createdAt || job.postedDate
                                        );
                                        const today = new Date();

                                        // Normalize dates to midnight for accurate day comparison
                                        posted.setHours(0, 0, 0, 0);
                                        today.setHours(0, 0, 0, 0);

                                        const diffTime = today - posted;
                                        const diffDays = Math.floor(
                                          diffTime / (1000 * 60 * 60 * 24)
                                        );

                                        if (diffDays === 0) return "Today";
                                        if (diffDays === 1) return "Yesterday";
                                        if (diffDays < 7)
                                          return `${diffDays} days ago`;
                                        if (diffDays < 30)
                                          return `${Math.floor(
                                            diffDays / 7
                                          )} weeks ago`;
                                        return `${Math.floor(
                                          diffDays / 30
                                        )} months ago`;
                                      })()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Recently
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Deadline Column */}
                            <td className="px-6 py-5">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {job.applicationDeadline ? (
                                  <div className="flex flex-col gap-1.5">
                                    <span className="font-medium text-sm">
                                      {new Date(
                                        job.applicationDeadline
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="text-xs font-medium">
                                      {(() => {
                                        const deadline = new Date(
                                          job.applicationDeadline
                                        );
                                        const today = new Date();
                                        const diffTime = deadline - today;
                                        const diffDays = Math.ceil(
                                          diffTime / (1000 * 60 * 60 * 24)
                                        );
                                        if (diffDays < 0)
                                          return (
                                            <span className="text-red-600 dark:text-red-400">
                                              ⚠️ Expired
                                            </span>
                                          );
                                        if (diffDays === 0)
                                          return (
                                            <span className="text-red-600 dark:text-red-400">
                                              🔴 Today
                                            </span>
                                          );
                                        if (diffDays === 1)
                                          return (
                                            <span className="text-yellow-600 dark:text-yellow-400">
                                              🟡 Tomorrow
                                            </span>
                                          );
                                        if (diffDays <= 7)
                                          return (
                                            <span className="text-yellow-600 dark:text-yellow-400">
                                              🟡 {diffDays} days left
                                            </span>
                                          );
                                        return (
                                          <span className="text-green-600 dark:text-green-400">
                                            🟢 {diffDays} days left
                                          </span>
                                        );
                                      })()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    No deadline
                                  </span>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-5 text-sm font-medium">
                          {userRole === "recruiter" ? (
                            <div className="flex items-center justify-center gap-3">
                              <motion.button
                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 group"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleViewApplications(job._id || job.id)
                                }
                                title="View Applications"
                              >
                                <svg
                                  className="w-5 h-5 text-green-600 dark:text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                              </motion.button>
                              <motion.button
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 group"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEdit(job._id || job.id)}
                                title="Edit Job"
                              >
                                <svg
                                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </motion.button>
                              <motion.button
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(job.id)}
                                disabled={deleting[job.id]}
                                title={
                                  deleting[job.id]
                                    ? "Deleting..."
                                    : "Delete Job"
                                }
                              >
                                <svg
                                  className="w-5 h-5 text-red-600 dark:text-red-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </motion.button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              {/* Favorite Button */}
                              <motion.button
                                className={`p-2 rounded-lg transition-colors duration-200 group ${
                                  job.saved
                                    ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleSaveJob(job._id || job.id, job.saved)
                                }
                                disabled={saving[job._id || job.id]}
                                title={
                                  job.saved
                                    ? "Remove from Favorites"
                                    : "Add to Favorites"
                                }
                              >
                                {saving[job._id || job.id] ? (
                                  <svg
                                    className="w-5 h-5 text-gray-400 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : job.saved ? (
                                  <svg
                                    className="w-6 h-6 text-red-500 dark:text-red-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                  </svg>
                                )}
                              </motion.button>
                              {/* View Details Button */}
                              <motion.button
                                className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200 group"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedJob(job);
                                  setIsJobDetailsModalOpen(true);
                                }}
                                title="View Details"
                              >
                                <svg
                                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </motion.button>
                              {/* Apply Button */}
                              <motion.button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApply(job.id)}
                                disabled={applying[job.id]}
                              >
                                <svg
                                  className="w-4 h-4"
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
                                {applying[job.id] ? "Applying..." : "Apply"}
                              </motion.button>
                            </div>
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
                  className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {/* Header with Title and Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {job.jobTitle || job.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {job.companyName ||
                          job.company ||
                          job.companyInfo?.companyName ||
                          "Company not specified"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : job.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {job.status || "Active"}
                        </span>
                        {job.jobUrgency &&
                          job.jobUrgency !== "Normal Priority" && (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                job.jobUrgency === "High Priority"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : job.jobUrgency === "Urgent"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                            >
                              {job.jobUrgency === "High Priority"
                                ? "🔴 High Priority"
                                : job.jobUrgency === "Urgent"
                                ? "🟡 Urgent"
                                : "🟢 Normal Priority"}
                            </span>
                          )}
                      </div>
                    </div>
                    {userRole === "applicant" && (
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
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">📍</span>
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">💰</span>
                      <span className="truncate">
                        {job.salary ||
                          job.formattedSalary ||
                          (job.salaryRange?.min && job.salaryRange?.max
                            ? `₹${(job.salaryRange.min / 100000).toFixed(
                                1
                              )}L - ₹${(job.salaryRange.max / 100000).toFixed(
                                1
                              )}L`
                            : job.salaryRange?.min
                            ? `₹${(job.salaryRange.min / 100000).toFixed(1)}L+`
                            : job.salaryMin && job.salaryMax
                            ? `₹${job.salaryMin}-${job.salaryMax} ${
                                job.salaryPeriod || "yearly"
                              }`
                            : job.salaryMin
                            ? `₹${job.salaryMin}+ ${
                                job.salaryPeriod || "yearly"
                              }`
                            : "Negotiable")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">⏱️</span>
                      <span className="truncate">
                        {(() => {
                          if (!job.experience) return "Not specified";
                          if (typeof job.experience === "object") {
                            if (
                              job.experience.min !== undefined &&
                              job.experience.max !== undefined
                            ) {
                              return `${job.experience.min}-${job.experience.max} years`;
                            } else if (job.experience.min !== undefined) {
                              return `${job.experience.min}+ years`;
                            }
                            return "Not specified";
                          }
                          return job.experience;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">💼</span>
                      <span className="truncate">
                        {job.jobType || job.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">🏭</span>
                      <span className="truncate">
                        {job.industry || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">🏠</span>
                      <span className="truncate">
                        {job.workArrangement?.toLowerCase() === "remote"
                          ? "Remote"
                          : job.workArrangement?.toLowerCase() === "hybrid"
                          ? "Hybrid"
                          : job.workArrangement?.toLowerCase().includes("site")
                          ? "Onsite"
                          : job.workArrangement || "Onsite"}
                      </span>
                    </div>
                  </div>

                  {/* Job Description */}
                  {job.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  )}

                  {/* Requirements */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Requirements:
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-blue-500">•</span>
                            <span className="line-clamp-1">{req}</span>
                          </li>
                        ))}
                        {job.requirements.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{job.requirements.length - 3} more requirements
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Responsibilities:
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {job.responsibilities.slice(0, 3).map((resp, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-green-500">•</span>
                            <span className="line-clamp-1">{resp}</span>
                          </li>
                        ))}
                        {job.responsibilities.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{job.responsibilities.length - 3} more
                            responsibilities
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills?.slice(0, 4).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills?.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs rounded-full">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Action Menu */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {userRole === "recruiter" ? (
                      <div className="relative flex justify-end">
                        <motion.button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === job.id ? null : job.id
                            )
                          }
                          title="Actions"
                        >
                          <svg
                            className="w-6 h-6 text-gray-600 dark:text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </motion.button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {openDropdown === job.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                              onMouseLeave={() => setOpenDropdown(null)}
                            >
                              <div className="py-1">
                                <button
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 flex items-center gap-3"
                                  onClick={() => {
                                    handleViewApplications(job._id || job.id);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  <span className="text-lg">👥</span>
                                  <span>View Applications</span>
                                </button>
                                <button
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-3"
                                  onClick={() => {
                                    handleEdit(job._id || job.id);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  <span className="text-lg">✏️</span>
                                  <span>Edit Job</span>
                                </button>
                                <button
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={() => {
                                    handleDelete(job.id);
                                    setOpenDropdown(null);
                                  }}
                                  disabled={deleting[job.id]}
                                >
                                  <span className="text-lg">
                                    {deleting[job.id] ? "⏳" : "🗑️"}
                                  </span>
                                  <span>
                                    {deleting[job.id]
                                      ? "Deleting..."
                                      : "Delete Job"}
                                  </span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
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
                          onClick={() => handleViewJobDetails(job)}
                        >
                          👁️ View Details
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applications Modal */}
      <ApplicationsModal
        isOpen={applicationsModal.isOpen}
        job={applicationsModal.job}
        applications={applicationsModal.applications}
        onClose={() =>
          setApplicationsModal({ isOpen: false, job: null, applications: [] })
        }
        onViewCandidate={handleViewCandidate}
        onScheduleInterview={handleScheduleInterview}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        open={isJobDetailsModalOpen}
        onClose={handleCloseJobDetails}
        job={selectedJob}
        onApply={(jobId) => {
          console.log("Apply to job from modal:", jobId);
          handleCloseJobDetails();
          // Add apply logic here if needed
        }}
      />

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        candidate={candidateModal.candidate}
        isOpen={candidateModal.isOpen}
        onClose={() => setCandidateModal({ isOpen: false, candidate: null })}
        onContact={handleContactCandidate}
        onSchedule={(candidate) => {
          console.log("Schedule interview with candidate:", candidate);
          // Add schedule logic here
        }}
        onShortlist={(candidate) => {
          console.log("Shortlist candidate:", candidate);
          // Add shortlist logic here
        }}
        onDownloadResume={(candidateId) => {
          console.log("Download resume for candidate:", candidateId);
          // Add resume download logic here
        }}
      />

      {/* Contact Modal */}
      <ContactModal
        candidate={contactModal.candidate}
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, candidate: null })}
        onSendEmail={handleSendEmail}
        onOpenMessaging={handleSendMessage}
      />

      {/* Schedule Interview Modal */}
      <ScheduleModal
        candidate={scheduleInterviewModal.candidate}
        isOpen={scheduleInterviewModal.isOpen}
        onClose={() =>
          setScheduleInterviewModal({
            isOpen: false,
            candidate: null,
            job: null,
            application: null,
          })
        }
        onScheduleInterview={async (interviewData) => {
          try {
            console.log("📅 Scheduling interview:", interviewData);

            // Import interviewsAPI dynamically to avoid circular imports
            const { interviewsAPI } = await import("../../services/api");

            // Add job and application data to interview data
            const completeInterviewData = {
              ...interviewData,
              jobId:
                scheduleInterviewModal.job?.id ||
                scheduleInterviewModal.job?._id,
              applicationId:
                scheduleInterviewModal.application?.id ||
                scheduleInterviewModal.application?._id,
              candidateId:
                scheduleInterviewModal.candidate?.id ||
                scheduleInterviewModal.candidate?._id,
              candidateName:
                scheduleInterviewModal.candidate?.name ||
                scheduleInterviewModal.candidate?.fullName,
              candidateEmail: scheduleInterviewModal.candidate?.email,
            };

            const response = await interviewsAPI.scheduleInterview(
              completeInterviewData
            );
            console.log("✅ Interview scheduled successfully:", response);
            alert("Interview scheduled successfully!");
            setScheduleInterviewModal({
              isOpen: false,
              candidate: null,
              job: null,
              application: null,
            });
          } catch (error) {
            console.error("❌ Failed to schedule interview:", error);
            alert("Failed to schedule interview. Please try again.");
          }
        }}
      />

      {/* Compact Job Details Modal */}
      <AnimatePresence>
        {isJobDetailsModalOpen && selectedJob && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsJobDetailsModalOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-md shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Job Details
                </h3>
                <button
                  onClick={() => setIsJobDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Job Details Card */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2.5">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">📍</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                        Location
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedJob.location || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">💰</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                        Salary
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedJob.salary ||
                          selectedJob.formattedSalary ||
                          (selectedJob.salaryRange?.min &&
                          selectedJob.salaryRange?.max
                            ? `₹${(
                                selectedJob.salaryRange.min / 100000
                              ).toFixed(1)}L - ₹${(
                                selectedJob.salaryRange.max / 100000
                              ).toFixed(1)}L Yearly`
                            : selectedJob.salaryRange?.min
                            ? `₹${(
                                selectedJob.salaryRange.min / 100000
                              ).toFixed(1)}L+ Yearly`
                            : "Negotiable")}
                      </p>
                      {selectedJob.salaryRange?.min && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          INR {selectedJob.salaryRange.min.toLocaleString()} -{" "}
                          {selectedJob.salaryRange.max?.toLocaleString() ||
                            selectedJob.salaryRange.min.toLocaleString()}{" "}
                          Yearly
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Experience Required */}
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">⏱️</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                        Experience Required
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {(() => {
                          if (!selectedJob.experience) return "Not specified";
                          if (typeof selectedJob.experience === "object") {
                            if (
                              selectedJob.experience.min !== undefined &&
                              selectedJob.experience.max !== undefined
                            ) {
                              return `${selectedJob.experience.min} - ${selectedJob.experience.max} years`;
                            } else if (
                              selectedJob.experience.min !== undefined
                            ) {
                              return `${selectedJob.experience.min}+ years`;
                            }
                            return "Not specified";
                          }
                          return selectedJob.experience;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Job Type */}
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">💼</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                        Job Type
                      </p>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded-full">
                        {selectedJob.jobType || selectedJob.type || "Full Time"}
                      </span>
                    </div>
                  </div>

                  {/* Work Arrangement */}
                  {selectedJob.workArrangement && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">🏢</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                          Work Arrangement
                        </p>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            selectedJob.workArrangement === "remote"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : selectedJob.workArrangement === "hybrid"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {selectedJob.workArrangement.charAt(0).toUpperCase() +
                            selectedJob.workArrangement.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Application Deadline */}
                  {selectedJob.applicationDeadline && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">📆</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                          Application Deadline
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {new Date(
                            selectedJob.applicationDeadline
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Job Priority */}
                  {selectedJob.jobUrgency && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">⭐</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                          Job Priority
                        </p>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            selectedJob.jobUrgency === "High Priority"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : selectedJob.jobUrgency === "Urgent"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {selectedJob.jobUrgency}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                {selectedJob.description && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                      Job Description
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {selectedJob.description}
                    </p>
                  </div>
                )}

                {/* Required Skills */}
                {(selectedJob.requiredSkills || selectedJob.skills) &&
                  (selectedJob.requiredSkills || selectedJob.skills).length >
                    0 && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedJob.requiredSkills || selectedJob.skills).map(
                          (skill, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                      Requirements
                    </h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 list-disc list-inside">
                      {Array.isArray(selectedJob.requirements) ? (
                        selectedJob.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))
                      ) : (
                        <li>{selectedJob.requirements}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2.5 flex gap-2">
                <motion.button
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsJobDetailsModalOpen(false);
                    handleApply(selectedJob.id);
                  }}
                >
                  Apply Now
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsJobDetailsModalOpen(false)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Comprehensive Job Edit Modal Component
const JobEditModal = ({ isOpen, job, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    company: "",
    location: "",
    industry: "",
    category: "",
    type: "full-time",
    workArrangement: "onsite",
    applicationDeadline: "",

    // Experience & Skills
    experienceMin: 0,
    experienceMax: 10,
    skills: [],

    // Salary & Compensation
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "yearly",
    currency: "INR",
    salary: "",

    // Job Description & Details
    description: "",
    responsibilities: [],
    requirements: [],
    qualifications: [],
    benefits: [],

    // Contact Information
    contactEmail: "",
    urgency: "normal",

    // AI Enhancement
    keywordsForAI: "",

    // Legacy fields for compatibility
    experience: "",
    sector: "automobile",
    jobFunction: "",
    shift: "",
    preferredQualification: "",
    certificationsRequired: [],
    toolsAndTechnologies: [],
  });
  const [loading, setLoading] = useState(false);

  // Populate form when job data is provided
  useEffect(() => {
    console.log("🔍 JobEditModal useEffect triggered, job:", job);
    if (job) {
      console.log("🔍 JobEditModal received job data:", job);
      console.log("🔍 Job fields available:", Object.keys(job));

      const populatedData = {
        // Basic Information
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        industry: job.industry || "",
        category: job.category || "",
        type: job.type || "full-time",
        workArrangement: job.workArrangement || "onsite",
        applicationDeadline: job.applicationDeadline
          ? new Date(job.applicationDeadline).toISOString().split("T")[0]
          : "",

        // Experience & Skills
        experienceMin: job.experienceMin || 0,
        experienceMax: job.experienceMax || 10,
        skills: Array.isArray(job.skills) ? job.skills : [],

        // Salary & Compensation
        salaryMin: job.salaryMin || "",
        salaryMax: job.salaryMax || "",
        salaryPeriod: job.salaryPeriod || "yearly",
        currency: job.currency || "INR",
        salary: job.salary || "",

        // Job Description & Details
        description: job.description || "",
        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities
          : [],
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        qualifications: Array.isArray(job.qualifications)
          ? job.qualifications
          : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],

        // Contact Information
        contactEmail: job.contactEmail || "",
        urgency:
          job.jobUrgency === "High Priority"
            ? "high-priority"
            : job.jobUrgency === "Urgent"
            ? "urgent"
            : "normal",

        // AI Enhancement
        keywordsForAI: job.keywordsForAI || "",

        // Legacy fields for compatibility
        experience: job.experience || "",
        sector: job.sector || job.industry || "automobile",
        jobFunction: job.jobFunction || "",
        shift: job.shift || "",
        preferredQualification: job.preferredQualification || "",
        certificationsRequired: Array.isArray(job.certificationsRequired)
          ? job.certificationsRequired
          : [],
        toolsAndTechnologies: Array.isArray(job.toolsAndTechnologies)
          ? job.toolsAndTechnologies
          : [],
      };

      console.log("🔍 Setting formData with populated data:", populatedData);
      setFormData(populatedData);
      console.log("✅ JobEditModal formData set successfully");
    } else {
      console.log("🔍 No job data provided to JobEditModal");
    }
  }, [job]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInput = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔍 JobEditModal handleSubmit called");
    console.log("🔍 Current formData being saved:", formData);
    setLoading(true);
    try {
      console.log("🔍 Calling onSave with formData...");
      await onSave(formData);
      console.log("✅ JobEditModal onSave completed successfully");
    } catch (error) {
      console.error("❌ JobEditModal onSave failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-[95vw] sm:max-w-[460px] md:max-w-[490px] lg:max-w-[510px] w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Job
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Edit "{job?.title || "Job"}" details
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-4 flex items-center">
                <span className="mr-2">📋</span> Basic Information
              </h3>
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
                    Industry *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Industry</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="automobile">Automobile</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
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
                        <option value="insurance">
                          Insurance Professional
                        </option>
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
                          "Bachelor's Degree",
                          "CFA Certification",
                          "Banking Experience",
                          "Financial Analysis",
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

              <div className="mt-6 flex justify-end">
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {loading ? "⏳ Saving..." : "💾 Update Job"}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Enhanced Applications Tab Component
export const EnhancedApplicationsTab = ({ userRole = "applicant" }) => {
  const { dashboardData, loading, error } = useDashboard();
  const [filters, setFilters] = useState({
    status: "",
    company: "",
    dateRange: "",
  });

  // Get applications from dashboard data with fallback and ensure it's an array
  const applications = Array.isArray(dashboardData?.applications)
    ? dashboardData.applications
    : [];
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

  // Dropdown handlers
  const toggleDropdown = (jobId) => {
    setOpenDropdown(openDropdown === jobId ? null : jobId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown, dropdownRef]);

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
              className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
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

// Enhanced Recommendations Tab Component
export const EnhancedRecommendationsTab = ({ userRole = "applicant" }) => {
  if (userRole !== "applicant") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg">
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Recommendations Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Job recommendations are only available for applicant accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <JobRecommendations limit={25} showTitle={false} />

      {/* Additional recommendation insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Improve Your Match Score
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Add Skills
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete your skills profile to get better job matches
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Update Education
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add your educational background for relevant opportunities
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Work Experience
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update your experience level to find suitable positions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Analytics Tab Component
export const EnhancedAnalyticsTab = ({ userRole = "applicant" }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: "30d",
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import analyticsAPI dynamically
        const { analyticsAPI } = await import("../../services/api");
        const response = await analyticsAPI.getDashboardAnalytics(userRole);

        if (response.data.success) {
          setAnalyticsData(response.data.data.analytics);
          console.log(
            "✅ Analytics data loaded:",
            response.data.data.analytics
          );
        } else {
          throw new Error(response.data.message || "Failed to fetch analytics");
        }
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
        setError(error.message);
        // Set fallback data
        setAnalyticsData({
          overview: {
            totalApplications: 0,
            shortlisted: 0,
            interviews: 0,
            hired: 0,
          },
          performance: {
            shortlistRate: 0,
            interviewRate: 0,
            hireRate: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userRole]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

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
            {/* Analytics Cards with Real Data */}
            <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === "recruiter"
                      ? "Total Applications"
                      : "Applications Sent"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData?.overview?.totalApplications || 0}
                  </p>
                </div>
                <div className="text-3xl">📝</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === "recruiter" ? "Active Jobs" : "Shortlisted"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userRole === "recruiter"
                      ? analyticsData?.overview?.activeJobs || 0
                      : analyticsData?.overview?.shortlisted || 0}
                  </p>
                </div>
                <div className="text-3xl">
                  {userRole === "recruiter" ? "💼" : "⭐"}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === "recruiter" ? "Shortlisted" : "Interviews"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userRole === "recruiter"
                      ? analyticsData?.overview?.shortlisted || 0
                      : analyticsData?.overview?.interviews || 0}
                  </p>
                </div>
                <div className="text-3xl">
                  {userRole === "recruiter" ? "⭐" : "🗣️"}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === "recruiter" ? "Hire Rate" : "Success Rate"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userRole === "recruiter"
                      ? `${analyticsData?.performance?.hireRate || 0}%`
                      : `${analyticsData?.performance?.shortlistRate || 0}%`}
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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
export const EnhancedJobPostingTab = ({
  editingJob = null,
  onJobSaved = null,
}) => {
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

  // Populate form when editing a job
  useEffect(() => {
    console.log(
      "🔍 EnhancedJobPostingTab useEffect triggered, editingJob:",
      editingJob
    );

    if (editingJob) {
      console.log("🔍 EnhancedJobPostingTab received editingJob:", editingJob);
      console.log("🔍 Job fields available:", Object.keys(editingJob));

      // Handle different possible data structures
      const jobData = {
        title: editingJob.title || editingJob.jobTitle || "",
        description: editingJob.description || editingJob.jobDescription || "",
        company: editingJob.company || editingJob.companyName || "",
        location: editingJob.location || editingJob.jobLocation || "",
        type: editingJob.type || editingJob.jobType || "full-time",
        experience:
          editingJob.experience || editingJob.experienceRequired || "",
        salary: editingJob.salary || editingJob.salaryRange || "",
        skills: Array.isArray(editingJob.skills)
          ? editingJob.skills
          : typeof editingJob.skills === "string"
          ? editingJob.skills.split(",").map((s) => s.trim())
          : [],
        requirements: Array.isArray(editingJob.requirements)
          ? editingJob.requirements
          : typeof editingJob.requirements === "string"
          ? editingJob.requirements.split("\n").filter((r) => r.trim())
          : [],
        responsibilities: Array.isArray(editingJob.responsibilities)
          ? editingJob.responsibilities
          : typeof editingJob.responsibilities === "string"
          ? editingJob.responsibilities.split("\n").filter((r) => r.trim())
          : [],
        sector: editingJob.sector || editingJob.industry || "automobile",
        jobFunction: editingJob.jobFunction || editingJob.function || "",
        shift: editingJob.shift || editingJob.workShift || "",
        preferredQualification:
          editingJob.preferredQualification || editingJob.qualifications || "",
        certificationsRequired: Array.isArray(editingJob.certificationsRequired)
          ? editingJob.certificationsRequired
          : [],
        benefits: Array.isArray(editingJob.benefits) ? editingJob.benefits : [],
        toolsAndTechnologies: Array.isArray(editingJob.toolsAndTechnologies)
          ? editingJob.toolsAndTechnologies
          : [],
      };

      console.log("🔍 Processed job data for form:", jobData);
      console.log("🔍 Setting form data...");
      setFormData(jobData);
      console.log("✅ Form data set successfully");
    } else {
      console.log("🔍 No editingJob provided, resetting to empty form");
      // Reset to empty form when no job is being edited
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
        sector: "automobile",
        jobFunction: "",
        shift: "",
        preferredQualification: "",
        certificationsRequired: [],
        benefits: [],
        toolsAndTechnologies: [],
      });
    }
  }, [editingJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔍 EnhancedJobPostingTab handleSubmit called");
    console.log("🔍 Current formData being submitted:", formData);
    console.log("🔍 Experience field value:", formData.experience);

    try {
      if (editingJob) {
        // Update existing job
        console.log("🔍 Updating existing job with formData:", formData);
        const { jobsAPI } = await import("../../services/api");
        const response = await jobsAPI.updateJob(
          editingJob.id || editingJob._id,
          formData
        );

        if (response.data.success) {
          alert("Job updated successfully!");
          if (onJobSaved) {
            onJobSaved();
          }
        } else {
          throw new Error(response.data.message || "Failed to update job");
        }
      } else {
        // Create new job
        console.log("🔍 Creating new job with formData:", formData);
        console.log("🔍 Calling postJob function...");
        await postJob(formData);
        console.log("✅ postJob completed successfully");
        alert("Job posted successfully!");
      }

      // Reset form
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
        sector: "automobile",
        jobFunction: "",
        shift: "",
        preferredQualification: "",
        certificationsRequired: [],
        benefits: [],
        toolsAndTechnologies: [],
      });
    } catch (error) {
      console.error("Failed to save job:", error);
      alert("Failed to save job. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("🔍 EnhancedJobPostingTab handleInputChange:", { name, value });
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };
      console.log("🔍 Updated formData:", newFormData);
      return newFormData;
    });
  };

  const handleArrayInput = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  // Debug: Log current formData
  console.log("🔍 EnhancedJobPostingTab current formData:", formData);
  console.log(
    "🔍 EnhancedJobPostingTab experience value:",
    formData.experience
  );

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
            {editingJob ? "Edit Job" : "Post New Job"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {editingJob
              ? `Edit "${editingJob.title || "Job"}"`
              : "Create a new job posting"}
          </p>
          {editingJob && (
            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📝 Editing Mode: Form should be pre-filled with job data
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Current form title: "{formData.title || "Not loaded"}"
              </p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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
              {loading
                ? "⏳ Saving..."
                : editingJob
                ? "💾 Update Job"
                : "📝 Post Job"}
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

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJob(jobId, { status: newStatus });
      // Job will be updated in the dashboard data automatically
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this job posting? This action cannot be undone."
      )
    ) {
      try {
        console.log("🗑️ Deleting job:", jobId);
        await deleteJob(jobId);
        console.log("✅ Job deleted successfully:", jobId);
        alert("Job has been deleted successfully!");
        // Job will be removed from the dashboard data automatically
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert("Failed to delete job. Please try again.");
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
            className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700"
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

// Applications Modal Component
const ApplicationsModal = ({
  isOpen,
  job,
  applications,
  onClose,
  onViewCandidate,
  onScheduleInterview,
}) => {
  if (!isOpen) return null;

  // Handle schedule interview
  const handleScheduleInterview = (app, jobData) => {
    console.log(
      "📅 Schedule interview clicked for:",
      app.applicantSnapshot?.fullName || app.name
    );
    if (typeof onScheduleInterview === "function") {
      onScheduleInterview(app, jobData);
    } else {
      console.error("❌ onScheduleInterview function not provided");
      alert("Schedule interview function not available");
    }
  };

  // Debug: Log the job object to understand its structure
  console.log("🔍 ApplicationsModal job object:", job);
  console.log("🔍 ApplicationsModal applications:", applications);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-[95vw] sm:max-w-[460px] md:max-w-[490px] lg:max-w-[510px] w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job Applications
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {job?.jobTitle || job?.title || "Job"} -{" "}
                {applications?.length || 0} applications
              </p>
            </div>
            <button onClick={onClose} className="text-2xl">
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                💼 Job Details
              </h3>
              {job && (
                <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
                  <div>
                    <strong>Title:</strong>{" "}
                    {job.jobTitle || job.title || "Not specified"}
                  </div>
                  <div>
                    <strong>Company:</strong>{" "}
                    {job.companyName ||
                      job.company ||
                      job.companyInfo?.companyName ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Location:</strong> {job.location || "Not specified"}
                  </div>
                  <div>
                    <strong>Industry:</strong> {job.industry || "Not specified"}
                  </div>
                  <div>
                    <strong>Type:</strong>{" "}
                    {job.jobType || job.type || "Not specified"}
                  </div>
                  <div>
                    <strong>Work Mode:</strong>{" "}
                    {job.workArrangement || "Not specified"}
                  </div>
                  <div>
                    <strong>Salary:</strong>{" "}
                    {job.salary ||
                      job.formattedSalary ||
                      (job.salaryRange?.min && job.salaryRange?.max
                        ? `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(
                            job.salaryRange.max / 100000
                          ).toFixed(1)}L ${job.salaryRange.period || "Yearly"}`
                        : "Negotiable")}
                  </div>
                  <div>
                    <strong>Experience:</strong>{" "}
                    {(() => {
                      // Check experience object with min/max
                      if (
                        job.experience?.min !== undefined &&
                        job.experience?.max !== undefined
                      ) {
                        return `${job.experience.min}-${job.experience.max} years`;
                      }
                      // Check experience object with minimum/maximum
                      if (
                        job.experience?.minimum !== undefined &&
                        job.experience?.maximum !== undefined
                      ) {
                        return `${job.experience.minimum}-${job.experience.maximum} years`;
                      }
                      // Check flat experienceMin/experienceMax fields
                      if (
                        job.experienceMin !== undefined &&
                        job.experienceMax !== undefined
                      ) {
                        return `${job.experienceMin}-${job.experienceMax} years`;
                      }
                      // Check if experience is a string
                      if (
                        typeof job.experience === "string" &&
                        job.experience.trim()
                      ) {
                        return job.experience;
                      }
                      return "Not specified";
                    })()}
                  </div>
                  {job.applicationDeadline && (
                    <div>
                      <strong>Application Deadline:</strong>{" "}
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  )}
                  {job.jobUrgency && (
                    <div>
                      <strong>Priority:</strong>
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded ${
                          job.jobUrgency === "High Priority"
                            ? "bg-red-100 text-red-800"
                            : job.jobUrgency === "Urgent"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {job.jobUrgency}
                      </span>
                    </div>
                  )}
                  {job.contactEmail && (
                    <div>
                      <strong>Contact:</strong> {job.contactEmail}
                    </div>
                  )}
                  {(job.jobDescription || job.description) && (
                    <div>
                      <strong>Description:</strong>
                      <p className="text-sm mt-1 max-h-20 overflow-y-auto bg-white dark:bg-gray-600 p-2 rounded text-gray-800 dark:text-gray-200">
                        {job.jobDescription || job.description}
                      </p>
                    </div>
                  )}
                  {(job.requiredSkills || job.skills) &&
                    (job.requiredSkills || job.skills).length > 0 && (
                      <div>
                        <strong>Skills:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(job.requiredSkills || job.skills)
                            .slice(0, 5)
                            .map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          {(job.requiredSkills || job.skills).length > 5 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              +{(job.requiredSkills || job.skills).length - 5}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Applications List */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                👥 Applications ({applications?.length || 0})
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {applications && applications.length > 0 ? (
                  applications.map((app, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-600 p-3 rounded border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {app.applicant?.name ||
                              app.applicantSnapshot?.fullName ||
                              app.applicantName ||
                              app.name ||
                              "Unknown Applicant"}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {app.applicant?.email ||
                              app.applicantSnapshot?.email ||
                              app.email ||
                              "No email provided"}
                          </p>
                          {(app.applicant?.phone ||
                            app.applicantSnapshot?.phone) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              📞{" "}
                              {app.applicant?.phone ||
                                app.applicantSnapshot?.phone}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            app.applicationStatus === "selected"
                              ? "bg-green-100 text-green-800"
                              : app.applicationStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : app.applicationStatus === "shortlisted"
                              ? "bg-blue-100 text-blue-800"
                              : app.applicationStatus === "interviewed"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {app.applicationStatus || app.status || "pending"}
                        </span>
                      </div>
                      {(app.appliedAt || app.appliedDate) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Applied:{" "}
                          {new Date(
                            app.appliedAt || app.appliedDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {(app.applicationData?.coverLetter ||
                        app.additionalInfo?.coverLetter ||
                        app.coverLetter) && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Cover Letter:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs max-h-16 overflow-y-auto">
                            {app.applicationData?.coverLetter ||
                              app.additionalInfo?.coverLetter ||
                              app.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-3 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            console.log(
                              "👤 View Profile clicked for:",
                              app.applicantSnapshot?.fullName || app.name
                            );
                            if (typeof onViewCandidate === "function") {
                              onViewCandidate(app);
                            } else {
                              console.error(
                                "❌ onViewCandidate function not provided"
                              );
                              alert("View profile function not available");
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200"
                        >
                          👤 View Profile
                        </button>
                        <button
                          onClick={() => handleScheduleInterview(app, job)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors duration-200"
                        >
                          📅 Schedule Interview
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No applications yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Applications will appear here once candidates apply
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Applications: {applications?.length || 0}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
