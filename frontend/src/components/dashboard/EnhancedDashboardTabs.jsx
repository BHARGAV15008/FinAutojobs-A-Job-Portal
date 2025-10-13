import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../services/apiConfig';
import EditJobModal from '../modals/EditJobModal';
import JobDetailsModal from '../modals/JobDetailsModal';
import CandidateProfileModal from '../modals/CandidateProfileModal';
import ContactModal from '../modals/ContactModal';
import { communicationsAPI } from '../../api/communications';
import { toast } from '../ui/use-toast';
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
  Sparkles
} from 'lucide-react';
import ProfileEditModal from '../profile/ProfileEditModal';
import JobRecommendations from '../recommendations/JobRecommendations';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { useTheme } from "../../contexts/IntegratedThemeContext";
import { useDashboard } from "../../contexts/RealDashboardContext";
import {
  JobsFilter,
  ApplicationsFilter,
  AnalyticsFilter,
} from "./DashboardFilters";

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
  const { updateProfile, updateProfileWithFile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(false);
  
  // Calculate dynamic profile completion
  const actualUser = currentUser?.data ? currentUser.data : currentUser;
  const profileCompletion = calculateProfileCompletion(actualUser, userRole);

  // Sync local state with prop changes (optimized to prevent form resets)
  useEffect(() => {
    if (user && user._id !== currentUser?._id) {
      console.log('🔍 EnhancedProfileTab user prop changed:', user);
      setCurrentUser(user);
    }
  }, [user?._id]); // Only update when user ID changes, not on every user object change

  // Helper function to safely convert values to strings
  const safeStringValue = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      // Handle location object
      if (value.city && value.state && value.country) {
        return `${value.city}, ${value.state}, ${value.country}`;
      }
      if (value.city && value.country) {
        return `${value.city}, ${value.country}`;
      }
      if (value.city) {
        return value.city;
      }
      if (value.country) {
        return value.country;
      }
      // Handle other objects by converting to JSON
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Create role-specific profile sections
  const getProfileSections = () => {
    // Reduced debug logging for better performance
    const personalInfo = {
      title: "Personal Information",
      icon: "👤",
      fields: [
        { 
          label: "Full Name", 
          value: safeStringValue(
            user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
          ), 
          icon: "👤" 
        },
        { label: "Email", value: safeStringValue(user?.email), icon: "📧" },
        { label: "Phone", value: safeStringValue(user?.phone), icon: "📱" },
        {
          label: "Location",
          value: (() => {
            if (userRole === 'recruiter') {
              return safeStringValue(
                user?.officeLocation?.city || 
                user?.officeLocation || 
                user?.location || 
                "Not specified"
              );
            } else {
              return safeStringValue(
                user?.currentLocation?.city || 
                user?.currentLocation || 
                user?.location || 
                "Not specified"
              );
            }
          })(),
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
          value: (() => {
            const linkedinValue = userRole === 'recruiter' 
              ? user?.professionalLinks?.linkedin || user?.linkedin_url
              : user?.linkedin_url;
            // LinkedIn URL processing
            return safeStringValue(linkedinValue);
          })(),
          icon: "💼",
        },
        {
          label: "GitHub",
          value: (() => {
            const githubValue = userRole === 'recruiter' 
              ? user?.professionalLinks?.github || user?.github_url
              : user?.github_url;
            // GitHub URL processing
            return safeStringValue(githubValue);
          })(),
          icon: "💻",
        },
        {
          label: "Portfolio",
          value: safeStringValue(
            userRole === 'recruiter' 
              ? user?.professionalLinks?.personalWebsite || user?.portfolio_url || user?.documents?.portfolioUrl
              : user?.portfolio_url || user?.documents?.portfolioUrl
          ),
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
            value: (() => {
              // Skills processing
              
              // Try multiple sources for skills display
              if (Array.isArray(user?.skills_array) && user.skills_array.length > 0) {
                return user.skills_array.join(", ");
              } else if (Array.isArray(user?.primary_skills) && user.primary_skills.length > 0) {
                return user.primary_skills.join(", ");
              } else if (Array.isArray(user?.skills)) {
                return user.skills.join(", ");
              } else if (user?.skills?.primary && Array.isArray(user.skills.primary) && user.skills.primary.length > 0) {
                return user.skills.primary.join(", ");
              } else if (user?.skills?.technical && Array.isArray(user.skills.technical) && user.skills.technical.length > 0) {
                return user.skills.technical.join(", ");
              } else if (user?.skills?.soft && Array.isArray(user.skills.soft) && user.skills.soft.length > 0) {
                return user.skills.soft.join(", ");
              } else if (typeof user?.skills === 'string' && user.skills.trim()) {
                return user.skills;
              }
              return "Not provided";
            })(),
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
          {
            label: "Resume",
            value: (() => {
              // Check multiple sources for resume URL
              const resumeUrl = user?.resume_url || user?.documents?.resumeUrl || '';
              // Resume URL processing
              return resumeUrl ? (
                <a 
                  href={resumeUrl.startsWith('http') ? resumeUrl : `${API_BASE_URL}${resumeUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  📄 View Resume
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : "Not uploaded";
            })(),
            icon: "📄",
          },
        ],
      };
    } else if (userRole === "recruiter") {
      // Recruiter profile processing
      
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
            value: safeStringValue(user?.companyInfo?.companyName || user?.companyName || user?.company || "Not specified"),
            icon: "🏢",
          },
          {
            label: "Department",
            value: (() => {
              // Department processing
              return safeStringValue(user?.companyInfo?.department || user?.department || "Not provided");
            })(),
            icon: "🏛️",
          },
          {
            label: "Job Title",
            value: safeStringValue(user?.companyInfo?.designation || user?.position || user?.job_title || "Not specified"),
            icon: "💼",
          },
          {
            label: "Experience",
            value: `${user?.yearsOfExperience || user?.experience_years || user?.experience || 0} years`,
            icon: "⏱️",
          },
          {
            label: "Resume",
            value: (() => {
              // Check multiple sources for resume URL
              const resumeUrl = user?.resume_url || user?.documents?.resumeUrl || '';
              // Resume processing for recruiter
              
              return resumeUrl ? (
                <a 
                  href={resumeUrl.startsWith('http') ? resumeUrl : `${API_BASE_URL}${resumeUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  📄 View Resume
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : "Not uploaded";
            })(),
            icon: "📄",
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
            value: `${user?.experience_years || user?.yearsOfExperience || 0} years`,
            icon: "⏱️",
          },
        ],
      };
    }

    return [personalInfo, professionalDetails, linksSection];
  };

  const profileSections = getProfileSections();

  // Handle profile save
  const handleProfileSave = async (formData, isFileUpload = false) => {
    setLoading(true);
    try {
      // Profile save initiated
      
      // Handle file upload differently
      if (isFileUpload) {
        // For file uploads, send FormData directly to backend
        const response = await updateProfileWithFile(formData);
        console.log('✅ Profile with file update response:', response);
        
        if (response.success) {
          // Update local state immediately for UI responsiveness
          setCurrentUser(response.data);
          console.log('🔄 Profile update completed, contexts should be synced');
        } else {
          throw new Error(response.error || 'Failed to update profile');
        }
        return;
      }
      
      // Transform form data to match backend expectations (for regular updates)
      const transformedData = { ...formData };
      
      // Processing form data
      
      // Handle name field - split into firstName and lastName
      if (formData.name) {
        const nameParts = formData.name.split(' ');
        transformedData.firstName = nameParts[0] || '';
        transformedData.lastName = nameParts.slice(1).join(' ') || '';
        delete transformedData.name; // Remove the name field
      }
      
      // Handle recruiter-specific fields
      if (userRole === 'recruiter') {
        // Processing recruiter fields
        
        // Map company info to nested structure - ALWAYS create companyInfo if any field exists
        if (formData.company !== undefined || formData.department !== undefined || formData.job_title !== undefined) {
          transformedData.companyInfo = {
            companyName: formData.company || '',
            department: formData.department || '',
            designation: formData.job_title || ''
          };
          console.log('🔍 Created companyInfo:', transformedData.companyInfo);
          
          // Remove flat fields after transformation
          delete transformedData.company;
          delete transformedData.department;
          delete transformedData.job_title;
        }
        
        // Handle years of experience
        if (formData.experience_years !== undefined) {
          transformedData.yearsOfExperience = parseInt(formData.experience_years) || 0;
          delete transformedData.experience_years;
        }
        
        // Handle location field
        if (formData.location !== undefined) {
          // Parse location string if it contains comma-separated values
          const locationParts = formData.location.split(',').map(part => part.trim());
          
          transformedData.officeLocation = {
            city: locationParts[0] || formData.location || '',
            state: locationParts[1] || '', // Don't default to Maharashtra
            country: locationParts[2] || 'India' // Default to India only
          };
          console.log('🔍 Created officeLocation:', transformedData.officeLocation);
          delete transformedData.location; // Remove the location field
        }
        // Handle professional links for recruiters - store in both places
        console.log('🔍 Processing professional links - linkedin:', formData.linkedin_url, 'github:', formData.github_url, 'portfolio:', formData.portfolio_url);
        
        const professionalLinks = {};
        if (formData.linkedin_url !== undefined) {
          professionalLinks.linkedin = formData.linkedin_url || '';
          // Keep linkedin_url in BaseUser for backward compatibility - don't delete
        }
        if (formData.github_url !== undefined) {
          professionalLinks.github = formData.github_url || '';
          // Keep github_url in BaseUser for backward compatibility - don't delete
        }
        if (formData.portfolio_url !== undefined) {
          professionalLinks.personalWebsite = formData.portfolio_url || '';
          // Keep portfolio_url in BaseUser for backward compatibility - don't delete
        }
        
        // Always set professionalLinks if any field was provided (even if empty)
        if (Object.keys(professionalLinks).length > 0) {
          transformedData.professionalLinks = professionalLinks;
          console.log('🔍 Created professionalLinks:', transformedData.professionalLinks);
        }
        
        // Ensure bio is preserved (it's a BaseUser field)
        // Bio should already be in transformedData, no special handling needed
      }
      
      // Handle applicant-specific fields
      if (userRole === 'applicant') {
        // Handle skills array for applicants
        if (formData.skills) {
          if (Array.isArray(formData.skills)) {
            transformedData.skills = {
              primary: formData.skills,
              technical: formData.technical_skills || [],
              soft: formData.soft_skills || []
            };
          } else if (typeof formData.skills === 'string') {
            transformedData.skills = {
              primary: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
              technical: [],
              soft: []
            };
          }
        }
        
        // Handle location for applicants
        if (formData.location) {
          // Parse location string if it contains comma-separated values
          const locationParts = formData.location.split(',').map(part => part.trim());
          
          transformedData.currentLocation = {
            city: locationParts[0] || formData.location || '',
            state: locationParts[1] || '', // Don't default to Maharashtra
            country: locationParts[2] || 'India' // Default to India only
          };
          delete transformedData.location;
        }
        
        // Handle career information for applicants
        if (formData.current_job_title || formData.current_company || formData.expected_salary || formData.experience_level) {
          transformedData.careerInfo = {
            ...(formData.current_job_title && { currentJobTitle: formData.current_job_title }),
            ...(formData.current_company && { currentCompany: formData.current_company }),
            ...(formData.expected_salary && { expectedSalary: parseInt(formData.expected_salary) || 0 }),
            ...(formData.experience_level && { experienceLevel: formData.experience_level })
          };
          // Clean up flat fields
          delete transformedData.current_job_title;
          delete transformedData.current_company;
          delete transformedData.expected_salary;
          delete transformedData.experience_level;
        }
        
        // Handle education for applicants
        if (formData.education) {
          transformedData.education = Array.isArray(formData.education) ? formData.education : [];
          console.log('🔍 Using existing education array:', transformedData.education);
        } else if (formData.qualification) {
          // Convert simple qualification string to education array
          console.log('🔍 Converting qualification to education:', formData.qualification);
          transformedData.education = [{
            institution: 'Not specified',
            degree: formData.qualification,
            fieldOfStudy: 'Not specified',
            startDate: null,
            endDate: null,
            grade: '',
            isCurrentlyStudying: false
          }];
          console.log('🔍 Created education array:', transformedData.education);
          delete transformedData.qualification;
        }
        
        // Handle work experience for applicants
        if (formData.workExperience) {
          transformedData.workExperience = Array.isArray(formData.workExperience) ? formData.workExperience : [];
        } else if (formData.experience_years) {
          // Convert experience years to basic work experience structure
          transformedData.workExperience = [{
            companyName: formData.current_company || 'Not specified',
            jobTitle: formData.current_job_title || 'Not specified',
            startDate: null,
            endDate: null,
            isCurrentJob: true,
            description: `${formData.experience_years} years of experience`,
            achievements: []
          }];
        }
        
        // Handle documents for applicants
        if (formData.resume_url !== undefined || formData.cover_letter_url !== undefined || formData.portfolio_url !== undefined) {
          transformedData.documents = {
            resumeUrl: formData.resume_url || '',
            coverLetterUrl: formData.cover_letter_url || '',
            portfolioUrl: formData.portfolio_url || '',
            certificates: []
          };
          console.log('🔍 Created documents object:', transformedData.documents);
          
          // Also preserve flat fields for backward compatibility
          if (formData.resume_url !== undefined) transformedData.resume_url = formData.resume_url;
          if (formData.cover_letter_url !== undefined) transformedData.cover_letter_url = formData.cover_letter_url;
          if (formData.portfolio_url !== undefined) transformedData.portfolio_url = formData.portfolio_url;
        }
        
        // Handle job preferences for applicants
        if (formData.willing_to_relocate !== undefined || formData.remote_work_preference !== undefined || formData.preferred_job_types || formData.preferred_locations) {
          transformedData.jobPreferences = {
            ...(formData.willing_to_relocate !== undefined && { willingToRelocate: formData.willing_to_relocate }),
            ...(formData.remote_work_preference !== undefined && { remoteWorkPreference: formData.remote_work_preference }),
            ...(formData.preferred_job_types && { preferredJobTypes: Array.isArray(formData.preferred_job_types) ? formData.preferred_job_types : [formData.preferred_job_types] }),
            ...(formData.preferred_locations && { preferredLocations: Array.isArray(formData.preferred_locations) ? formData.preferred_locations : [formData.preferred_locations] })
          };
          // Clean up flat fields
          delete transformedData.willing_to_relocate;
          delete transformedData.remote_work_preference;
          delete transformedData.preferred_job_types;
          delete transformedData.preferred_locations;
        }
        
        // Handle years of experience for applicants
        if (formData.experience_years !== undefined) {
          console.log('🔍 Converting experience_years to yearsOfExperience:', formData.experience_years);
          transformedData.yearsOfExperience = parseInt(formData.experience_years) || 0;
          console.log('🔍 Set yearsOfExperience to:', transformedData.yearsOfExperience);
          delete transformedData.experience_years;
        }
      }
      
      // Handle common social links for all user types (if not handled above)
      if (userRole !== 'recruiter') {
        // For applicants and admins, keep social links as direct fields
        // These are already in the correct format, no transformation needed
        // Just ensure they're included: linkedin_url, github_url, portfolio_url
      }
      
      // Validate and sanitize data before sending
      if (transformedData.bio && (
        transformedData.bio.includes('chunk-') || 
        transformedData.bio.includes('console.log') || 
        transformedData.bio.includes('Download the React DevTools')
      )) {
        console.log('🚫 Detected corrupted bio data, clearing it');
        transformedData.bio = '';
      }
      
      const sanitizedData = { ...transformedData };

      const isCorruptedUrl = (url) => {
        if (!url || url.trim() === '') return false;
        // Check if URL contains localhost with current page path (indicates corruption)
        return url.includes('localhost:3000') && (
          url.includes('/dashboard/profile') || 
          url.includes('/recruiter-dashboard/profile') ||
          url.includes('/applicant-dashboard/profile') ||
          url === window.location.href
        );
      };

      // Clean corrupted URLs (temporarily disabled for debugging)
      // ['linkedin_url', 'github_url', 'portfolio_url'].forEach(field => {
      //   if (sanitizedData[field] && isCorruptedUrl(sanitizedData[field])) {
      //     console.log(`🚫 Detected corrupted ${field}, clearing it`);
      //     sanitizedData[field] = '';
      //   }
      // });
      
      // Validate bio for repeated content
      if (sanitizedData.bio && sanitizedData.bio.length > 100) {
        const words = sanitizedData.bio.split(' ');
        const uniqueWords = [...new Set(words)];
        // If more than 80% of words are repeated, likely corrupted
        if (uniqueWords.length / words.length < 0.2) {
          console.log('🚫 Detected corrupted bio with repeated content, clearing it');
          transformedData.bio = '';
        }
      }
      
      console.log('🔍 Sanitized data for backend:', transformedData);
      console.log('🔍 Sanitized data keys:', Object.keys(transformedData));
      console.log('🔍 Sanitized data companyInfo:', transformedData.companyInfo);
      console.log('🔍 Sanitized data officeLocation:', transformedData.officeLocation);
      console.log('🔍 Sanitized data professionalLinks:', transformedData.professionalLinks);
      
      console.log('🔍 About to call updateProfile with transformed data');
      console.log('🔍 Final transformed data being sent:', JSON.stringify(transformedData, null, 2));
      
      const response = await updateProfile(transformedData);
      console.log('✅ Profile update response:', response);
      console.log('✅ Profile update response.success:', response.success);
      console.log('✅ Profile update response.data:', response.data);
      console.log('✅ Profile update response.error:', response.error);
      console.log('✅ Profile update response.message:', response.message);
      
      if (response.success) {
        console.log('✅ Profile update was successful');
        // Update local state immediately for UI responsiveness
        setCurrentUser(response.data);
        
        // Call parent onEdit to trigger dashboard refresh
        if (onEdit) {
          onEdit(response.data);
        }
        
        // Force a small delay to ensure all contexts sync
        setTimeout(() => {
          console.log('🔄 Profile update completed, contexts should be synced');
        }, 100);
        
        return response;
      } else {
        console.error('❌ Profile update failed:', response.error);
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      console.error("❌ Failed to update profile:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
      
      // Re-throw with more descriptive error message
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      throw new Error(errorMessage);
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

        <div className="flex flex-wrap gap-3">
          <motion.button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditModalOpen(true)}
            disabled={loading}
          >
            <Edit3 className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Edit Profile"}</span>
          </motion.button>
          
        </div>
      </motion.div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full items-start">
        {profileSections.map((section, index) => (
          <motion.div
            key={section.title}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 overflow-hidden min-w-0 h-fit max-h-96 flex flex-col"
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

            <div className="space-y-4 flex-1 overflow-y-auto">
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="border-l-4 border-blue-200 dark:border-blue-700 pl-4 overflow-hidden min-w-0"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span>{field.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </span>
                  </div>
                  <div
                    className={`text-sm ${
                      field.value
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500 italic"
                    } ${field.multiline ? "whitespace-pre-wrap" : "break-words overflow-wrap-anywhere"} leading-relaxed max-w-full`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
                    {typeof field.value === 'string' ? (field.value || "Not provided") : (field.value || "Not provided")}
                  </div>
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
    // Show feedback
    if (window.showToast) {
      window.showToast(`Theme changed to ${mode}`, 'success');
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    // Show feedback
    if (window.showToast) {
      window.showToast(`Font size changed to ${size}`, 'success');
    }
  };

  const handleFontFamilyChange = (family) => {
    setFontFamily(family);
    // Show feedback
    if (window.showToast) {
      window.showToast(`Font family changed to ${family}`, 'success');
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Show feedback
    if (window.showToast) {
      window.showToast(`Language changed to ${languageOptions[lang]}`, 'success');
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Show feedback
    if (window.showToast) {
      window.showToast(`${key} notifications ${notifications[key] ? 'disabled' : 'enabled'}`, 'success');
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
                      className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={fontSize}
                      onChange={(e) => handleFontSizeChange(e.target.value)}
                    >
                      {Object.entries(fontSizeOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)} ({Math.round(value * 16)}px)
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === "fontFamily" && (
                    <select
                      className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={fontFamily}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                    >
                      {Object.keys(fontFamilyOptions).map((font) => (
                        <option key={font} value={font} style={{ fontFamily: fontFamilyOptions[font] }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === "language" && (
                    <select
                      className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
  onEditJob = null,
  onApply = null,
  onSave = null,
}) => {
  const { dashboardData, loading, error, currentUser } = useDashboard();
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);

  // Get jobs from dashboard data with fallback
  let jobs = dashboardData?.recentJobs || [];
  
  console.log('🔍 Dashboard jobs available:', {
    dashboardData: !!dashboardData,
    recentJobs: dashboardData?.recentJobs?.length || 0,
    jobType: jobType,
    userRole: userRole
  });

  // Debug experience field in regular jobs
  if (dashboardData?.recentJobs?.length > 0) {
    console.log('🔍 First regular job experience field:', {
      job: dashboardData.recentJobs[0]?.jobTitle,
      experience: dashboardData.recentJobs[0]?.experience,
      experienceType: typeof dashboardData.recentJobs[0]?.experience
    });
  }

  // For applicants, fetch recommended jobs when jobType is "recommended" or "all"
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      if (userRole === "applicant" && (jobType === "recommended" || jobType === "all") && currentUser?._id) {
        try {
          setJobsLoading(true);
          console.log('🔍 Fetching recommended jobs for applicant:', currentUser._id);
          
          // Import recommendations API
          const { getRecommendedJobs } = await import("../../api/recommendations");
          const response = await getRecommendedJobs({ 
            limit: 20, 
            minMatchPercentage: 20 // Minimum 20% overall match (but skill match is mandatory)
          });
          
          console.log('🔍 Recommendation API response:', response);
          
          if (response.success) {
            // Transform the data to match the component's expected format
            const transformedJobs = response.data.jobs.map(job => {
              // Format salary properly
              const formatSalary = (salaryObj) => {
                if (!salaryObj) return 'Negotiable';
                if (typeof salaryObj === 'string') return salaryObj;
                
                const { minimum, maximum, type, period, currency } = salaryObj;
                const currencySymbol = currency === 'INR' ? '₹' : '$';
                
                if (minimum && maximum) {
                  if (minimum >= 100000) {
                    return `${currencySymbol}${(minimum / 100000).toFixed(1)}L - ${currencySymbol}${(maximum / 100000).toFixed(1)}L ${period || 'Yearly'}`;
                  } else {
                    return `${currencySymbol}${minimum.toLocaleString()} - ${currencySymbol}${maximum.toLocaleString()} ${period || 'Yearly'}`;
                  }
                } else if (minimum) {
                  if (minimum >= 100000) {
                    return `${currencySymbol}${(minimum / 100000).toFixed(1)}L+ ${period || 'Yearly'}`;
                  } else {
                    return `${currencySymbol}${minimum.toLocaleString()}+ ${period || 'Yearly'}`;
                  }
                }
                
                return 'Negotiable';
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
                type: job.workArrangement || 'Full-time',
                experience: job.experience ? 
                  (typeof job.experience === 'object' ? 
                    `${job.experience.min || 0}-${job.experience.max || job.experience.min || 0} years` : 
                    job.experience) : 
                  'Not specified', // Map experience field
                industry: job.industry || 'Not specified', // Map industry field
                jobCategory: job.jobCategory || 'Not specified', // Map job category
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
                status: 'Active'
              };
            });
            
            console.log('✅ Transformed recommended jobs:', transformedJobs.length);
            setRecommendedJobs(transformedJobs);
          } else {
            console.log('❌ Failed to fetch recommendations:', response.message);
            setRecommendedJobs([]);
          }
        } catch (error) {
          console.error('❌ Error fetching recommended jobs:', error);
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
          const companyName = currentUser.companyInfo?.companyName || 
                             currentUser.companyName || 
                             currentUser.company;
          
          console.log('🔍 Fetching jobs for recruiter and company:', {
            recruiterId: currentUser._id,
            companyName: companyName
          });
          
          // Import jobsAPI dynamically to avoid circular imports
          const { jobsAPI } = await import("../../services/api");
          
          // Use combined filtering: recruiter's own jobs + company jobs
          const queryParams = companyName ? 
            { 
              recruiterAndCompany: `${currentUser._id}|${companyName}`,
              limit: 100 
            } : 
            { 
              recruiterId: currentUser._id, 
              limit: 100 
            };
          
          console.log('🔍 Query parameters:', queryParams);
          
          const response = await jobsAPI.getJobs(queryParams);
          
          const fetchedJobs = response.data.data?.jobs || response.data.jobs || [];
          console.log(`✅ Fetched company jobs: ${fetchedJobs.length} for jobType: ${jobType}`);
          console.log('🔍 Sample job data:', fetchedJobs[0]);
          if (fetchedJobs[0]) {
            console.log('🔍 Job fields:', Object.keys(fetchedJobs[0]));
            console.log('🔍 Experience field value:', fetchedJobs[0].experience);
            console.log('🔍 Job title field:', fetchedJobs[0].jobTitle || fetchedJobs[0].title);
            console.log('🔍 Company field:', fetchedJobs[0].companyName || fetchedJobs[0].company);
            console.log('🔍 Skills field:', fetchedJobs[0].requiredSkills || fetchedJobs[0].skills);
            console.log('🔍 Salary field:', fetchedJobs[0].salaryRange);
          }
          setRecruiterJobs(fetchedJobs);
        } catch (error) {
          console.error('Error fetching company jobs:', error);
          setRecruiterJobs([]);
        } finally {
          setJobsLoading(false);
        }
      }
    };

    fetchRecruiterJobs();
  }, [userRole, currentUser?._id, currentUser?.companyInfo?.companyName, currentUser?.companyName, currentUser?.company]);

  // Handle view job details
  const handleViewJobDetails = (job) => {
    console.log('Opening job details for:', job.jobTitle);
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
    console.log('🔍 Using recommended jobs:', jobs.length);
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
  const [editModal, setEditModal] = useState({ isOpen: false, job: null });
  const [applicationsModal, setApplicationsModal] = useState({ isOpen: false, job: null, applications: [] });
  const [candidateModal, setCandidateModal] = useState({ isOpen: false, candidate: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, candidate: null });
  const [scheduleInterviewModal, setScheduleInterviewModal] = useState({ isOpen: false, candidate: null, job: null, application: null });

  // Filter jobs based on job type and current filters
  const getJobsByType = () => {
    // Ensure jobs is always an array
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    let filteredJobs = safeJobs;

    switch (jobType) {
      case "active":
        // Filter active jobs - Fixed case sensitivity
        filteredJobs = safeJobs.filter((job) => 
          job.status?.toLowerCase() === "active" || job.status === "Active"
        );
        break;
      case "draft":
        // Filter draft jobs - Fixed case sensitivity
        filteredJobs = safeJobs.filter((job) => 
          job.status?.toLowerCase() === "draft" || job.status === "Draft"
        );
        break;
      case "closed":
        // Filter closed jobs - Fixed case sensitivity
        filteredJobs = safeJobs.filter((job) => 
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
        safeJobs.forEach(job => {
          const jobId = job.id || job._id;
          if (jobId) {
            jobsById[jobId] = job;
          }
        });
        
        // Add recommended jobs if available
        if (userRole === "applicant" && recommendedJobs.length > 0) {
          recommendedJobs.forEach(job => {
            const jobId = job.id || job._id;
            if (jobId) {
              const existingJob = jobsById[jobId];
              if (existingJob) {
                // Merge properties - mark as recommended
                jobsById[jobId] = {
                  ...existingJob,
                  recommended: true,
                  matchScore: job.matchScore,
                  matchReasons: job.matchReasons
                };
              } else {
                // Add new recommended job
                jobsById[jobId] = job;
              }
            }
          });
        }
        
        filteredJobs = Object.values(jobsById);
        console.log('🔍 All jobs combined:', {
          regular: safeJobs.length,
          recommended: recommendedJobs.length,
          total: filteredJobs.length,
          jobType: jobType,
          userRole: userRole
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
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }
    
    setDeleting((prev) => ({ ...prev, [jobId]: true }));
    try {
      // Import jobsAPI dynamically to avoid circular imports
      const { jobsAPI } = await import("../../services/api");
      const response = await jobsAPI.deleteJob(jobId);
      
      if (response.data.success) {
        alert(`Job has been deleted successfully!`);
        // Refresh the jobs list
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to delete job');
      }
      
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setDeleting((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle job update (toggle status)
  const handleUpdate = async (jobId) => {
    setUpdating((prev) => ({ ...prev, [jobId]: true }));
    try {
      // Get current job to toggle its status
      const currentJob = jobs.find(job => job.id === jobId || job._id === jobId);
      if (!currentJob) {
        throw new Error('Job not found');
      }
      
      // Toggle between active and draft status
      const newStatus = currentJob.status === 'active' ? 'draft' : 'active';
      
      // Import jobsAPI dynamically to avoid circular imports
      const { jobsAPI } = await import("../../services/api");
      const response = await jobsAPI.updateJob(jobId, { status: newStatus });
      
      if (response.data.success) {
        alert(`Job status updated to ${newStatus} successfully!`);
        // Refresh the jobs list
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to update job');
      }
      
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setUpdating((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle edit job (open modal instead of redirecting)
  const handleEdit = (jobId) => {
    console.log('🔍 Edit job clicked, jobId:', jobId);
    const currentJob = jobs.find(job => job.id === jobId || job._id === jobId);
    console.log('🔍 Found job for editing:', currentJob);
    
    if (currentJob && onEditJob) {
      onEditJob(currentJob);
    } else {
      console.log('🔍 No onEditJob callback provided or job not found');
    }
  };

  // Handle apply to job
  const handleApply = (jobId) => {
    const currentJob = jobs.find(job => job.id === jobId || job._id === jobId);
    
    if (currentJob && onApply) {
      onApply(currentJob);
    } else {
      console.log('❌ No onApply callback provided or job not found');
    }
  };

  // Handle save/favorite job
  const handleSaveJob = (jobId, isSaved) => {
    console.log('🔍 Save job clicked, jobId:', jobId, 'isSaved:', isSaved);
    const currentJob = jobs.find(job => job.id === jobId || job._id === jobId);
    console.log('🔍 Found job for saving:', currentJob);
    
    if (currentJob && onSave) {
      onSave(currentJob);
    } else {
      console.log('🔍 No onSave callback provided or job not found');
    }
  };

  const handleUpdateJob = async (jobId, updateData) => {
    console.log('🔍 Updating job:', jobId, updateData);
    
    try {
      setUpdating(prev => ({ ...prev, [jobId]: true }));
      
      // Call API to update job
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
      
      // Update local jobs list
      setRecruiterJobs(prevJobs => 
        prevJobs.map(job => 
          (job.id === jobId || job._id === jobId) 
            ? { ...job, ...updateData, id: job.id || job._id }
            : job
        )
      );
      
      // Close modal
      setEditModal({ isOpen: false, job: null });
      
      return result;
    } catch (error) {
      console.error('❌ Error updating job:', error);
      throw error;
    } finally {
      setUpdating(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // Handle view applications
  const handleViewApplications = async (jobId) => {
    console.log('🔍 View applications for job:', jobId);
    try {
      // Import applicationsAPI dynamically to avoid circular imports
      const { applicationsAPI } = await import("../../services/api");
      console.log('🔍 Calling API with jobId:', jobId);
      
      const response = await applicationsAPI.getApplicationsByJob(jobId);
      console.log('🔍 API Response:', response);
      
      const applications = response.data.data?.applications || response.data.applications || [];
      console.log('🔍 Extracted applications:', applications);
      
      const currentJob = jobs.find(job => job.id === jobId || job._id === jobId);
      console.log('🔍 Found job:', currentJob);
      
      // Open the applications modal with job and applications data
      setApplicationsModal({
        isOpen: true,
        job: currentJob,
        applications: applications
      });
      
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Failed to fetch applications. Please try again.');
    }
  };

  // Transform application data to candidate format for CandidateProfileModal
  const transformApplicationToCandidate = (app) => {
    console.log('Transforming application:', app);
    
    const applicant = app.applicant || app.applicantId || {};
    const appInfo = app.applicationInfo || app.applicationData || {};
    
    console.log('Applicant data:', applicant);
    console.log('Application info:', appInfo);
    console.log('Applicant skills:', applicant.skills);
    console.log('Applicant socialLinks:', applicant.socialLinks);
    console.log('Applicant portfolioLinks:', applicant.portfolioLinks);
    
    // Extract structured data from applicationInfo
    const basicInfo = appInfo.basicInfo || {};
    const experience = appInfo.experience || {};
    const expectedSalary = appInfo.expectedSalary || {};
    const skills = appInfo.skills || {};
    const socialLinks = appInfo.socialLinks || {};
    const education = appInfo.education || [];
    
    console.log('🔍 Extracted appInfo:', appInfo);
    console.log('🔍 Extracted basicInfo:', basicInfo);
    console.log('🔍 Extracted experience:', experience);
    console.log('🔍 Extracted expectedSalary:', expectedSalary);
    console.log('🔍 Applicant yearsOfExperience:', applicant.yearsOfExperience);
    console.log('🔍 Applicant experience_years:', applicant.experience_years);
    console.log('🔍 Applicant expectedSalary:', applicant.expectedSalary);
    console.log('🔍 Applicant careerInfo:', applicant.careerInfo);
    console.log('🔍 Extracted skills from appInfo:', skills);
    console.log('🔍 Extracted socialLinks from appInfo:', socialLinks);
    
    return {
      id: app.applicantId || app._id,
      
      // Basic Information
      name: basicInfo.firstName && basicInfo.lastName 
        ? `${basicInfo.firstName} ${basicInfo.lastName}`
        : applicant.fullName || applicant.name || `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown Applicant',
      email: basicInfo.email || applicant.email || 'No email provided',
      phone: basicInfo.phone || applicant.phone || 'No phone provided',
      location: applicant.location || appInfo.personalInfo?.location || 'Location not specified',
      
      // Professional Information
      currentRole: experience.currentJob?.jobTitle || applicant.currentJobTitle || 'Not specified',
      
      // Experience data - enhanced extraction
      experience: experience.totalYears 
        ? `${experience.totalYears} years`
        : basicInfo.experienceYears 
        ? `${basicInfo.experienceYears} years`
        : applicant.yearsOfExperience 
        ? `${applicant.yearsOfExperience} years`
        : applicant.experience_years 
        ? `${applicant.experience_years} years`
        : app.applicationData?.experience || 'Not specified',
      
      // Expected Salary - prioritize applicationInfo data
      expectedSalary: expectedSalary.displayText 
        ? expectedSalary.displayText
        : expectedSalary.rawSalaryText 
        ? expectedSalary.rawSalaryText
        : expectedSalary.salaryRange?.min && expectedSalary.salaryRange?.max
        ? `₹${expectedSalary.salaryRange.min}K - ₹${expectedSalary.salaryRange.max}K ${expectedSalary.salaryRange.period || 'yearly'}`
        : expectedSalary.salaryRange?.min
        ? `₹${expectedSalary.salaryRange.min}K+ ${expectedSalary.salaryRange.period || 'yearly'}`
        : basicInfo.expectedSalary || applicant.expectedSalary || applicant.careerInfo?.expectedSalary || app.applicationData?.expectedSalary || 'Not specified',
      
      // Skills data - combine all skill types from multiple sources
      skills: [
        // From ApplicationInformation (application-time snapshot)
        ...(skills.primary?.map(s => s.skill || s) || []),
        ...(skills.technical?.map(s => s.skill || s) || []),
        ...(skills.soft?.map(s => s.skill || s) || []),
        
        // From user profile (current profile data)
        ...(applicant.skills?.primary?.map(s => s.skill || s) || []),
        ...(applicant.skills?.technical?.map(s => s.skill || s) || []),
        ...(applicant.skills?.soft?.map(s => s.skill || s) || []),
        ...(applicant.skills || []), // If skills is a simple array
        
        // From applicant snapshot (fallback)
        ...(app.applicantSnapshot?.skills || []),
        
        // From basicInfo skills
        ...(basicInfo.skills || []),
        
        // From application data skills
        ...(app.applicationData?.skills || []),
        
        // From primary_skills field
        ...(applicant.primary_skills || []),
        ...(applicant.skills_array || [])
      ].filter(Boolean),
      
      // Education data
      education: education.length > 0 ? education : applicant.education || [],
      
      // Work experience data
      workExperience: appInfo.workExperience || applicant.workExperience || [],
      
      // Portfolio links - combine from multiple sources
      portfolioLinks: [
        // From ApplicationInformation (application-time snapshot)
        socialLinks.portfolio?.url && { type: 'Portfolio', url: socialLinks.portfolio.url, label: 'Personal Portfolio' },
        socialLinks.linkedin?.url && { type: 'LinkedIn', url: socialLinks.linkedin.url, label: 'LinkedIn Profile' },
        socialLinks.github?.url && { type: 'GitHub', url: socialLinks.github.url, label: 'GitHub Profile' },
        socialLinks.personalWebsite && { type: 'Website', url: socialLinks.personalWebsite, label: 'Personal Website' },
        
        // From user profile (current profile data)
        applicant.socialLinks?.portfolio && { type: 'Portfolio', url: applicant.socialLinks.portfolio, label: 'Personal Portfolio' },
        applicant.socialLinks?.linkedin && { type: 'LinkedIn', url: applicant.socialLinks.linkedin, label: 'LinkedIn Profile' },
        applicant.socialLinks?.github && { type: 'GitHub', url: applicant.socialLinks.github, label: 'GitHub Profile' },
        applicant.socialLinks?.website && { type: 'Website', url: applicant.socialLinks.website, label: 'Personal Website' },
        
        // From portfolioLinks field (if exists)
        ...(applicant.portfolioLinks?.map(link => ({
          type: link.type || 'Link',
          url: link.url,
          label: link.label || link.title || 'Portfolio Link'
        })) || []),
        
        // From application data (fallback)
        app.applicationData?.portfolioUrl && { type: 'Portfolio', url: app.applicationData.portfolioUrl, label: 'Personal Portfolio' },
        app.applicationData?.linkedinUrl && { type: 'LinkedIn', url: app.applicationData.linkedinUrl, label: 'LinkedIn Profile' },
        app.applicationData?.githubUrl && { type: 'GitHub', url: app.applicationData.githubUrl, label: 'GitHub Profile' },
        
        // From basicInfo social links
        basicInfo.linkedin && { type: 'LinkedIn', url: basicInfo.linkedin, label: 'LinkedIn Profile' },
        basicInfo.github && { type: 'GitHub', url: basicInfo.github, label: 'GitHub Profile' },
        basicInfo.portfolio && { type: 'Portfolio', url: basicInfo.portfolio, label: 'Personal Portfolio' }
      ].filter(Boolean),
      
      // Application specific data
      appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 
                   app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Unknown',
      status: app.applicationStatus || app.status || 'pending',
      summary: basicInfo.bio || app.coverLetter || applicant.bio || 'No summary provided',
      rating: 4, // Default rating
      notes: app.notes || '',
      isShortlisted: (app.applicationStatus || app.status) === 'shortlisted'
    };
  };

  // Handle schedule interview
  const handleScheduleInterview = (application, job) => {
    console.log('📅 Scheduling interview for:', application, job);
    
    // Transform application to candidate format
    const candidate = transformApplicationToCandidate(application);
    
    setScheduleInterviewModal({
      isOpen: true,
      candidate: candidate,
      job: job,
      application: application
    });
  };

  // Handle view candidate profile
  const handleViewCandidate = (app) => {
    console.log('🔍 Viewing candidate profile for:', app);
    const candidateData = transformApplicationToCandidate(app);
    console.log('🔍 Transformed candidate data:', candidateData);
    setCandidateModal({ isOpen: true, candidate: candidateData });
  };

  // Handle contact candidate
  const handleContactCandidate = (candidate) => {
    console.log('📞 Opening contact modal for:', candidate);
    setContactModal({ isOpen: true, candidate });
  };

  // Handle send email
  const handleSendEmail = async (emailData) => {
    try {
      console.log('📧 Sending email:', emailData);
      const response = await communicationsAPI.sendEmail(emailData);
      console.log('✅ Email sent successfully:', response);
      
      // Show success message
      toast({
        title: "Email Sent Successfully!",
        description: `Email sent to ${emailData.to}`,
        variant: "default",
      });
      
      return response;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Show error message
      toast({
        title: "Failed to Send Email",
        description: error.message || 'Please try again later',
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Handle send message/SMS
  const handleSendMessage = async (candidate) => {
    try {
      console.log('📱 Sending message to:', candidate);
      
      if (!candidate.phone) {
        throw new Error('No phone number available for this candidate');
      }

      // For now, we'll open the default SMS app
      const message = `Hi ${candidate.name}, I'm interested in discussing a job opportunity with you. Please let me know if you're available for a conversation.`;
      const smsUrl = `sms:${candidate.phone}?body=${encodeURIComponent(message)}`;
      
      // Try to open SMS app
      window.open(smsUrl, '_self');
      
      // Also send via our API if available
      try {
        const response = await communicationsAPI.sendSMS({
          to: candidate.phone,
          message: message
        });
        console.log('✅ SMS sent via API:', response);
      } catch (apiError) {
        console.log('ℹ️ SMS API not available, opened default SMS app');
      }
      
      toast({
        title: "SMS App Opened",
        description: `Message prepared for ${candidate.name}`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      
      toast({
        title: "Failed to Send Message",
        description: error.message || 'Please try again later',
        variant: "destructive",
      });
    }
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Work Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Urgency
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
                              {job.jobTitle || job.title}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(job.requiredSkills || job.skills || [])
                                ?.slice(0, 2)
                                .map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {(job.requiredSkills || job.skills || [])?.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{(job.requiredSkills || job.skills || []).length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {job.companyName || job.company || job.companyInfo?.companyName || 'Not specified'}
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
                            {job.salary || job.formattedSalary || 
                             (job.salaryRange?.min && job.salaryRange?.max ? 
                              `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L ${job.salaryRange.period || 'Yearly'}` :
                              job.salaryRange?.min ? 
                              `₹${(job.salaryRange.min / 100000).toFixed(1)}L+ ${job.salaryRange.period || 'Yearly'}` : 
                              (job.salaryMin && job.salaryMax ? `₹${job.salaryMin}-${job.salaryMax} ${job.salaryPeriod || 'yearly'}` : 
                               job.salaryMin ? `₹${job.salaryMin}+ ${job.salaryPeriod || 'yearly'}` : 'Negotiable'))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {job.jobType || job.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {(() => {
                              if (!job.experience) return 'Not specified';
                              if (typeof job.experience === 'object') {
                                if (job.experience.min !== undefined && job.experience.max !== undefined) {
                                  return `${job.experience.min}-${job.experience.max} years`;
                                } else if (job.experience.min !== undefined) {
                                  return `${job.experience.min}+ years`;
                                }
                                return 'Not specified';
                              }
                              return job.experience;
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {job.industry || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            job.workArrangement === 'remote' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : job.workArrangement === 'hybrid'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {job.workArrangement === 'remote' ? '🏠 Remote' : 
                             job.workArrangement === 'hybrid' ? '🏢 Hybrid' : 
                             job.workArrangement === 'onsite' ? '🏢 Onsite' : 
                             job.workArrangement || 'Onsite'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            job.urgency === 'high-priority' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : job.urgency === 'urgent'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {job.urgency === 'high-priority' ? '🔴 High Priority' : 
                             job.urgency === 'urgent' ? '🟡 Urgent' : 
                             '🟢 Normal'}
                          </span>
                        </td>
                        {userRole === "applicant" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {job.recommended ? (
                                <div className="flex flex-col items-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    ⭐ Yes
                                  </span>
                                  {job.matchScore && (
                                    <span className="text-xs text-gray-500 mt-1">
                                      {job.matchScore}% match
                                    </span>
                                  )}
                                </div>
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
                                onClick={() => handleSaveJob(job.id, job.saved)}
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
                                onClick={() => handleViewApplications(job._id || job.id)}
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
                  {/* Header with Title and Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {job.jobTitle || job.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {job.companyName || job.company || job.companyInfo?.companyName || 'Company not specified'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : job.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {job.status || 'Active'}
                        </span>
                        {job.urgency && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.urgency === 'high-priority' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : job.urgency === 'urgent'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {job.urgency === 'high-priority' ? '🔴 High Priority' : 
                             job.urgency === 'urgent' ? '🟡 Urgent' : 
                             '🟢 Normal'}
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
                        {job.salary || job.formattedSalary || 
                         (job.salaryRange?.min && job.salaryRange?.max ? 
                          `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L` :
                          job.salaryRange?.min ? 
                          `₹${(job.salaryRange.min / 100000).toFixed(1)}L+` : 
                          (job.salaryMin && job.salaryMax ? `₹${job.salaryMin}-${job.salaryMax} ${job.salaryPeriod || 'yearly'}` : 
                           job.salaryMin ? `₹${job.salaryMin}+ ${job.salaryPeriod || 'yearly'}` : 'Negotiable'))}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">⏱️</span>
                      <span className="truncate">
                        {(() => {
                          if (!job.experience) return 'Not specified';
                          if (typeof job.experience === 'object') {
                            if (job.experience.min !== undefined && job.experience.max !== undefined) {
                              return `${job.experience.min}-${job.experience.max} years`;
                            } else if (job.experience.min !== undefined) {
                              return `${job.experience.min}+ years`;
                            }
                            return 'Not specified';
                          }
                          return job.experience;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">💼</span>
                      <span className="truncate">{job.jobType || job.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">🏭</span>
                      <span className="truncate">{job.industry || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">🏠</span>
                      <span className="truncate">
                        {job.workArrangement === 'remote' ? 'Remote' : 
                         job.workArrangement === 'hybrid' ? 'Hybrid' : 
                         job.workArrangement === 'onsite' ? 'Onsite' : 
                         job.workArrangement || 'Onsite'}
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
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requirements:</h4>
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
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Responsibilities:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {job.responsibilities.slice(0, 3).map((resp, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-green-500">•</span>
                            <span className="line-clamp-1">{resp}</span>
                          </li>
                        ))}
                        {job.responsibilities.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{job.responsibilities.length - 3} more responsibilities
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

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {userRole === "recruiter" ? (
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="View Applications"
                          onClick={() => handleViewApplications(job._id || job.id)}
                        >
                          👥 Applications
                        </motion.button>
                        <motion.button
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Edit Job"
                          onClick={() => handleEdit(job.id)}
                        >
                          ✏️ Edit
                        </motion.button>
                        <motion.button
                          className={`px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-xs font-medium ${
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

      {/* Job Edit Modal */}
      <EditJobModal
        open={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, job: null })}
        job={editModal.job}
        onUpdate={handleUpdateJob}
      />

      {/* Applications Modal */}
      <ApplicationsModal
        isOpen={applicationsModal.isOpen}
        job={applicationsModal.job}
        applications={applicationsModal.applications}
        onClose={() => setApplicationsModal({ isOpen: false, job: null, applications: [] })}
        onViewCandidate={handleViewCandidate}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        open={isJobDetailsModalOpen}
        onClose={handleCloseJobDetails}
        job={selectedJob}
        onApply={(jobId) => {
          console.log('Apply to job from modal:', jobId);
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
          console.log('Schedule interview with candidate:', candidate);
          // Add schedule logic here
        }}
        onShortlist={(candidate) => {
          console.log('Shortlist candidate:', candidate);
          // Add shortlist logic here
        }}
        onDownloadResume={(candidateId) => {
          console.log('Download resume for candidate:', candidateId);
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
    console.log('🔍 JobEditModal useEffect triggered, job:', job);
    if (job) {
      console.log('🔍 JobEditModal received job data:', job);
      console.log('🔍 Job fields available:', Object.keys(job));
      
      const populatedData = {
        // Basic Information
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        industry: job.industry || "",
        category: job.category || "",
        type: job.type || "full-time",
        workArrangement: job.workArrangement || "onsite",
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
        
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
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        qualifications: Array.isArray(job.qualifications) ? job.qualifications : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        
        // Contact Information
        contactEmail: job.contactEmail || "",
        urgency: job.urgency || "normal",
        
        // AI Enhancement
        keywordsForAI: job.keywordsForAI || "",
        
        // Legacy fields for compatibility
        experience: job.experience || "",
        sector: job.sector || job.industry || "automobile",
        jobFunction: job.jobFunction || "",
        shift: job.shift || "",
        preferredQualification: job.preferredQualification || "",
        certificationsRequired: Array.isArray(job.certificationsRequired) ? job.certificationsRequired : [],
        toolsAndTechnologies: Array.isArray(job.toolsAndTechnologies) ? job.toolsAndTechnologies : [],
      };
      
      console.log('🔍 Setting formData with populated data:', populatedData);
      setFormData(populatedData);
      console.log('✅ JobEditModal formData set successfully');
    } else {
      console.log('🔍 No job data provided to JobEditModal');
    }
  }, [job]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInput = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 JobEditModal handleSubmit called');
    console.log('🔍 Current formData being saved:', formData);
    setLoading(true);
    try {
      console.log('🔍 Calling onSave with formData...');
      await onSave(formData);
      console.log('✅ JobEditModal onSave completed successfully');
    } catch (error) {
      console.error('❌ JobEditModal onSave failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Job
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Edit "{job?.title || 'Job'}" details
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
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

// Enhanced Recommendations Tab Component
export const EnhancedRecommendationsTab = ({ userRole = "applicant" }) => {
  if (userRole !== 'applicant') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
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
              <span className="font-medium text-gray-900 dark:text-white">Add Skills</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete your skills profile to get better job matches
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">Update Education</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add your educational background for relevant opportunities
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">Work Experience</span>
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
          console.log('✅ Analytics data loaded:', response.data.data.analytics);
        } else {
          throw new Error(response.data.message || 'Failed to fetch analytics');
        }
      } catch (error) {
        console.error('❌ Error fetching analytics:', error);
        setError(error.message);
        // Set fallback data
        setAnalyticsData({
          overview: {
            totalApplications: 0,
            shortlisted: 0,
            interviews: 0,
            hired: 0
          },
          performance: {
            shortlistRate: 0,
            interviewRate: 0,
            hireRate: 0
          }
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
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === 'recruiter' ? 'Total Applications' : 'Applications Sent'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData?.overview?.totalApplications || 0}
                  </p>
                </div>
                <div className="text-3xl">📝</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === 'recruiter' ? 'Active Jobs' : 'Shortlisted'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userRole === 'recruiter' 
                      ? (analyticsData?.overview?.activeJobs || 0)
                      : (analyticsData?.overview?.shortlisted || 0)
                    }
                  </p>
                </div>
                <div className="text-3xl">{userRole === 'recruiter' ? '💼' : '⭐'}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === 'recruiter' ? 'Shortlisted' : 'Interviews'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userRole === 'recruiter' 
                      ? (analyticsData?.overview?.shortlisted || 0)
                      : (analyticsData?.overview?.interviews || 0)
                    }
                  </p>
                </div>
                <div className="text-3xl">{userRole === 'recruiter' ? '⭐' : '🗣️'}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === 'recruiter' ? 'Hire Rate' : 'Success Rate'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userRole === 'recruiter' 
                      ? `${analyticsData?.performance?.hireRate || 0}%`
                      : `${analyticsData?.performance?.shortlistRate || 0}%`
                    }
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
export const EnhancedJobPostingTab = ({ editingJob = null, onJobSaved = null }) => {
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
    console.log('🔍 EnhancedJobPostingTab useEffect triggered, editingJob:', editingJob);
    
    if (editingJob) {
      console.log('🔍 EnhancedJobPostingTab received editingJob:', editingJob);
      console.log('🔍 Job fields available:', Object.keys(editingJob));
      
      // Handle different possible data structures
      const jobData = {
        title: editingJob.title || editingJob.jobTitle || "",
        description: editingJob.description || editingJob.jobDescription || "",
        company: editingJob.company || editingJob.companyName || "",
        location: editingJob.location || editingJob.jobLocation || "",
        type: editingJob.type || editingJob.jobType || "full-time",
        experience: editingJob.experience || editingJob.experienceRequired || "",
        salary: editingJob.salary || editingJob.salaryRange || "",
        skills: Array.isArray(editingJob.skills) ? editingJob.skills : 
                (typeof editingJob.skills === 'string' ? editingJob.skills.split(',').map(s => s.trim()) : []),
        requirements: Array.isArray(editingJob.requirements) ? editingJob.requirements : 
                     (typeof editingJob.requirements === 'string' ? editingJob.requirements.split('\n').filter(r => r.trim()) : []),
        responsibilities: Array.isArray(editingJob.responsibilities) ? editingJob.responsibilities : 
                         (typeof editingJob.responsibilities === 'string' ? editingJob.responsibilities.split('\n').filter(r => r.trim()) : []),
        sector: editingJob.sector || editingJob.industry || "automobile",
        jobFunction: editingJob.jobFunction || editingJob.function || "",
        shift: editingJob.shift || editingJob.workShift || "",
        preferredQualification: editingJob.preferredQualification || editingJob.qualifications || "",
        certificationsRequired: Array.isArray(editingJob.certificationsRequired) ? editingJob.certificationsRequired : [],
        benefits: Array.isArray(editingJob.benefits) ? editingJob.benefits : [],
        toolsAndTechnologies: Array.isArray(editingJob.toolsAndTechnologies) ? editingJob.toolsAndTechnologies : [],
      };
      
      console.log('🔍 Processed job data for form:', jobData);
      console.log('🔍 Setting form data...');
      setFormData(jobData);
      console.log('✅ Form data set successfully');
    } else {
      console.log('🔍 No editingJob provided, resetting to empty form');
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
    console.log('🔍 EnhancedJobPostingTab handleSubmit called');
    console.log('🔍 Current formData being submitted:', formData);
    console.log('🔍 Experience field value:', formData.experience);
    
    try {
      if (editingJob) {
        // Update existing job
        console.log('🔍 Updating existing job with formData:', formData);
        const { jobsAPI } = await import("../../services/api");
        const response = await jobsAPI.updateJob(editingJob.id || editingJob._id, formData);
        
        if (response.data.success) {
          alert('Job updated successfully!');
          if (onJobSaved) {
            onJobSaved();
          }
        } else {
          throw new Error(response.data.message || 'Failed to update job');
        }
      } else {
        // Create new job
        console.log('🔍 Creating new job with formData:', formData);
        console.log('🔍 Calling postJob function...');
        await postJob(formData);
        console.log('✅ postJob completed successfully');
        alert('Job posted successfully!');
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
      alert('Failed to save job. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('🔍 EnhancedJobPostingTab handleInputChange:', { name, value });
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };
      console.log('🔍 Updated formData:', newFormData);
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
  console.log('🔍 EnhancedJobPostingTab current formData:', formData);
  console.log('🔍 EnhancedJobPostingTab experience value:', formData.experience);

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
            {editingJob ? 'Edit Job' : 'Post New Job'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {editingJob ? `Edit "${editingJob.title || 'Job'}"` : 'Create a new job posting'}
          </p>
          {editingJob && (
            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📝 Editing Mode: Form should be pre-filled with job data
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Current form title: "{formData.title || 'Not loaded'}"
              </p>
            </div>
          )}
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
              {loading ? "⏳ Saving..." : editingJob ? "💾 Update Job" : "📝 Post Job"}
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

// Applications Modal Component
const ApplicationsModal = ({ isOpen, job, applications, onClose, onViewCandidate }) => {
  if (!isOpen) return null;
  
  // Debug: Log the job object to understand its structure
  console.log('🔍 ApplicationsModal job object:', job);
  console.log('🔍 ApplicationsModal applications:', applications);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job Applications
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {job?.jobTitle || job?.title || 'Job'} - {applications?.length || 0} applications
              </p>
            </div>
            <button onClick={onClose} className="text-2xl">×</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">💼 Job Details</h3>
              {job && (
                <div className="space-y-3 text-sm">
                  <div><strong>Title:</strong> {job.jobTitle || job.title || 'Not specified'}</div>
                  <div><strong>Company:</strong> {job.companyName || job.company || job.companyInfo?.companyName || 'Not specified'}</div>
                  <div><strong>Location:</strong> {job.location || 'Not specified'}</div>
                  <div><strong>Industry:</strong> {job.industry || 'Not specified'}</div>
                  <div><strong>Type:</strong> {job.jobType || job.type || 'Not specified'}</div>
                  <div><strong>Work Mode:</strong> {job.workArrangement || 'Not specified'}</div>
                  <div><strong>Salary:</strong> {job.salary || job.formattedSalary || (job.salaryRange?.min && job.salaryRange?.max ? `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L ${job.salaryRange.period || 'Yearly'}` : 'Negotiable')}</div>
                  <div><strong>Experience:</strong> {
                    job.experience?.minimum !== undefined && job.experience?.maximum !== undefined 
                      ? `${job.experience.minimum}-${job.experience.maximum} years`
                      : job.experienceMin !== undefined && job.experienceMax !== undefined 
                      ? `${job.experienceMin}-${job.experienceMax} years`
                      : 'Not specified'
                  }</div>
                  {job.applicationDeadline && (
                    <div><strong>Application Deadline:</strong> {new Date(job.applicationDeadline).toLocaleDateString()}</div>
                  )}
                  {job.jobUrgency && (
                    <div><strong>Priority:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${
                        job.jobUrgency === 'High Priority' ? 'bg-red-100 text-red-800' :
                        job.jobUrgency === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {job.jobUrgency}
                      </span>
                    </div>
                  )}
                  {job.contactEmail && (
                    <div><strong>Contact:</strong> {job.contactEmail}</div>
                  )}
                  {(job.jobDescription || job.description) && (
                    <div><strong>Description:</strong> 
                      <p className="text-sm mt-1 max-h-20 overflow-y-auto bg-white dark:bg-gray-600 p-2 rounded">{job.jobDescription || job.description}</p>
                    </div>
                  )}
                  {(job.requiredSkills || job.skills) && (job.requiredSkills || job.skills).length > 0 && (
                    <div><strong>Skills:</strong> 
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(job.requiredSkills || job.skills).slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {(job.requiredSkills || job.skills).length > 5 && <span className="text-xs text-gray-500">+{(job.requiredSkills || job.skills).length - 5} more</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Applications List */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">👥 Applications ({applications?.length || 0})</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {applications && applications.length > 0 ? (
                  applications.map((app, index) => (
                    <div key={index} className="bg-white dark:bg-gray-600 p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {app.applicant?.name || app.applicantSnapshot?.fullName || app.applicantName || app.name || 'Unknown Applicant'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {app.applicant?.email || app.applicantSnapshot?.email || app.email || 'No email provided'}
                          </p>
                          {(app.applicant?.phone || app.applicantSnapshot?.phone) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              📞 {app.applicant?.phone || app.applicantSnapshot?.phone}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          app.applicationStatus === 'selected' ? 'bg-green-100 text-green-800' :
                          app.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          app.applicationStatus === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          app.applicationStatus === 'interviewed' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.applicationStatus || app.status || 'pending'}
                        </span>
                      </div>
                      {(app.appliedAt || app.appliedDate) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Applied: {new Date(app.appliedAt || app.appliedDate).toLocaleDateString()}
                        </p>
                      )}
                      {(app.applicationData?.coverLetter || app.additionalInfo?.coverLetter || app.coverLetter) && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cover Letter:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs max-h-16 overflow-y-auto">
                            {app.applicationData?.coverLetter || app.additionalInfo?.coverLetter || app.coverLetter}
                          </p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="mt-3 flex justify-end space-x-2">
                        <button
                          onClick={() => onViewCandidate(app)}
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
                    <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Applications will appear here once candidates apply</p>
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
