import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import API_BASE_URL from '../services/apiConfig';
import JobDetailsModal from '../components/modals/JobDetailsModal';
import AuthModal from '../components/modals/AuthModal';
import JobApplicationModal from '../components/modals/JobApplicationModal';
import { useAuth } from '../contexts/AuthContext.jsx';
import { applicationService } from '../services/applicationService';
import SearchInput from '../components/common/SearchInput';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Avatar,
    Chip,
    Paper,
    InputAdornment,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Drawer,
    IconButton,
    Tooltip,
    Rating,
    LinearProgress,
    Tabs,
    Tab,
    Alert,
    useTheme,
    useMediaQuery,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Search as SearchIcon,
    LocationOn,
    Work,
    AttachMoney,
    Schedule,
    Business,
    Favorite,
    FavoriteBorder,
    Share,
    Bookmark,
    BookmarkBorder,
    FilterList,
    Sort,
    TrendingUp,
    Star,
    Verified,
    FlashOn,
    Home,
    Groups,
    Visibility,
    Close,
    CalendarToday,
    ChevronRight,
    CurrencyRupee,
    Language,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { jobsAPI } from '../services/api';

const JobCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    padding: '14px 16px',
    borderRadius: '6px',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    marginBottom: '8px',
    '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderColor: theme.palette.primary.light,
    },
}));

const FilterDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        padding: theme.spacing(2),
    },
}));

const JobsPage = () => {
    const { user, login } = useAuth();
    const [, setLocation] = useLocation();
    
    // Simple local state for favorites and bookmarks
    const [localFavorites, setLocalFavorites] = useState(new Set());
    const [localBookmarks, setLocalBookmarks] = useState(new Set());

    // Load from localStorage on mount
    useEffect(() => {
        if (user && (user.id || user._id)) {
            const userId = user.id || user._id;
            console.log('Loading favorites/bookmarks for user', userId);
            
            try {
                const savedFavorites = localStorage.getItem(`favorites_${userId}`);
                const savedBookmarks = localStorage.getItem(`bookmarks_${userId}`);
                
                if (savedFavorites) {
                    const favoritesArray = JSON.parse(savedFavorites);
                    setLocalFavorites(new Set(favoritesArray));
                    console.log(`Loaded ${favoritesArray.length} favorites from localStorage`);
                }
                if (savedBookmarks) {
                    const bookmarksArray = JSON.parse(savedBookmarks);
                    setLocalBookmarks(new Set(bookmarksArray));
                    console.log(`Loaded ${bookmarksArray.length} bookmarks from localStorage`);
                }
            } catch (error) {
                console.error('Error loading from localStorage', error);
            }
        } else {
            console.log('No user found or user ID missing');
        }
    }, [user]);

    // Debug: Log current state
    useEffect(() => {
        console.log('Current state', {
            user: !!user,
            userId: user?.id || user?._id,
            localFavorites: localFavorites.size,
            localBookmarks: localBookmarks.size,
            favoritesList: [...localFavorites],
            bookmarksList: [...localBookmarks]
        });
    }, [user, localFavorites, localBookmarks]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedExperience, setSelectedExperience] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
    const [selectedWorkMode, setSelectedWorkMode] = useState('');
    const [selectedDatePosted, setSelectedDatePosted] = useState('');
    const [selectedCompanyType, setSelectedCompanyType] = useState('');
    const [selectedEducation, setSelectedEducation] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    
    // Modal state (needed early for useEffect)
    const [applicationModalOpen, setApplicationModalOpen] = useState(false);
    const [selectedJobForApplication, setSelectedJobForApplication] = useState(null);

    // Check for pending job application after login
    useEffect(() => {
        if (user && (user.id || user._id)) {
            const pendingApplication = localStorage.getItem('pendingJobApplication');
            if (pendingApplication) {
                try {
                    const applicationData = JSON.parse(pendingApplication);
                    // Check if the application is recent (within 10 minutes)
                    const isRecent = Date.now() - applicationData.timestamp < 10 * 60 * 1000;
                    
                    if (isRecent && applicationData.jobId) {
                        console.log('Found pending job application, looking for job', applicationData.jobTitle);
                        // Find the job in current jobs list
                        const job = jobs.find(j => (j.id || j._id) === applicationData.jobId);
                        if (job) {
                            console.log('Found job for pending application, opening application modal');
                            setSelectedJobForApplication(job);
                            setApplicationModalOpen(true);
                        } else {
                            console.warn('Job not found in current list, user can manually apply');
                        }
                        // Clear the pending application
                        localStorage.removeItem('pendingJobApplication');
                    }
                } catch (error) {
                    console.error('Error parsing pending application', error);
                    localStorage.removeItem('pendingJobApplication');
                }
            }
        }
    }, [user, jobs]);

    // Read URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        const locationParam = urlParams.get('location');
        const jobTypeParam = urlParams.get('jobType');
        
        if (searchParam) setSearchQuery(searchParam);
        if (locationParam) setSelectedLocation(locationParam);
        if (jobTypeParam) setSelectedJobType(jobTypeParam);
    }, []);
    const [sortBy, setSortBy] = useState('relevance');
    const [selectedTab, setSelectedTab] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    // Removed local state - now using FavoritesContext
    const [page, setPage] = useState(1);
    const [viewFormat, setViewFormat] = useState('list'); // 'table', 'list', 'grid'
    // Modal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewDetailsModal, setViewDetailsModal] = useState({ isOpen: false, job: null });
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [pendingApplication, setPendingApplication] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [applicationLoading, setApplicationLoading] = useState(false);

    // Fetch jobs from API - once on mount, like CompaniesPage
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                console.log('Fetching all jobs from API...');
                
                // Fetch ALL jobs once - no filters in URL
                const response = await fetch(`${API_BASE_URL}/jobs?limit=100`);
                
                const data = await response.json();
                console.log('API Response', data);
                
                // Handle the new API response format
                let jobsData = [];
                if (data.success && Array.isArray(data.data?.jobs)) {
                    jobsData = data.data.jobs;
                    console.log(`Found ${jobsData.length} jobs from comprehensive API`);
                } else {
                    console.log('No jobs found, using empty array');
                    jobsData = [];
                }
                
                // Transform comprehensive API data to match component expectations
                const transformedJobs = jobsData.map(job => ({
                    // Basic job info
                    id: job.id || job._id,
                    title: job.jobTitle || job.title,
                    company: job.companyName || job.company,
                    companyLogo: (job.companyName || job.company)?.substring(0, 2).toUpperCase(),
                    location: job.location,
                    
                    // Job details from comprehensive schema
                    department: job.jobCategory || job.category || job.industry || 'General',
                    type: job.jobType || job.type,
                    workMode: job.workArrangement || 'On-site',
                    workArrangement: job.workArrangement || 'On-site',
                    
                    // Salary information - Fixed to properly format salary display
                    salary: job.formattedSalary || 
                           (job.salaryRange?.min && job.salaryRange?.max ? 
                            `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L ${job.salaryRange.period || 'Yearly'}` :
                            job.salaryRange?.min ? 
                            `₹${(job.salaryRange.min / 100000).toFixed(1)}L+ ${job.salaryRange.period || 'Yearly'}` : 
                            'Negotiable'),
                    formattedSalary: job.formattedSalary || 
                                   (job.salaryRange?.min && job.salaryRange?.max ? 
                                    `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L` :
                                    job.salaryRange?.min ? 
                                    `₹${(job.salaryRange.min / 100000).toFixed(1)}L+` : 
                                    'Negotiable'),
                    salaryRange: job.salaryRange,
                    
                    // Dates and timing
                    posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently',
                    postedDate: job.createdAt,
                    createdAt: job.createdAt,
                    applicationDeadline: job.applicationDeadline,
                    daysSincePosted: job.daysSincePosted,
                    daysUntilDeadline: job.daysUntilDeadline,
                    
                    // Experience and skills
                    experience: job.experience && (job.experience.minimum !== undefined || job.experience.maximum !== undefined) ? 
                        `${job.experience.minimum || 0}-${job.experience.maximum || 0} years` : 
                        job.experience && (job.experience.min !== undefined || job.experience.max !== undefined) ?
                        `${job.experience.min || 0}-${job.experience.max || 0} years` :
                        typeof job.experience === 'string' ? job.experience :
                        'Not specified',
                    experienceMin: job.experience?.minimum || job.experience?.min,
                    experienceMax: job.experience?.maximum || job.experience?.max,
                    
                    // Job content
                    description: job.jobDescription || job.description,
                    jobDescription: job.jobDescription,
                    skills: job.requiredSkills || job.skills || [],
                    requiredSkills: job.requiredSkills,
                    requirements: job.requirements || [],
                    responsibilities: job.keyResponsibilities || job.responsibilities || [],
                    keyResponsibilities: job.keyResponsibilities,
                    
                    // Company and recruiter info
                    industry: job.industry,
                    jobCategory: job.jobCategory,
                    category: job.jobCategory || job.category,
                    recruiterInfo: job.recruiterInfo,
                    postedBy: job.postedBy,
                    
                    // Job status and priority
                    status: job.status,
                    urgency: job.jobUrgency || job.urgency || 'Normal Priority',
                    jobUrgency: job.jobUrgency,
                    
                    // AI and metadata
                    aiKeywords: job.aiKeywords,
                    isAiEnhanced: job.isAiEnhanced,
                    tags: job.tags,
                    slug: job.slug,
                    
                    // Analytics
                    views: job.views || 0,
                    applicationsCount: job.applicationsCount || 0,
                    applicants: job.applicationsCount || 0,
                    
                    // Contact
                    contactEmail: job.contactEmail,
                    
                    // Legacy compatibility
                    currency: job.salaryRange?.currency || 'INR',
                    salaryPeriod: job.salaryRange?.period || 'Yearly',
                    featured: job.status === 'Active' && job.jobUrgency === 'High Priority',
                    urgentHiring: job.jobUrgency === 'Urgent' || job.jobUrgency === 'High Priority',
                    verified: true,
                    rating: 4.5,
                    remote: job.workArrangement === 'Remote',
                    companySize: '1000+'
                }));
                
                console.log('Transformed jobs sample', transformedJobs[0]);
                console.log('Total transformed jobs', transformedJobs.length);
                console.log('Sample job fields', Object.keys(transformedJobs[0] || {}));
                setJobs(transformedJobs);
            } catch (error) {
                console.error('Error fetching jobs from comprehensive API', error);
                // Show empty array - no mock data fallback
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []); // Only fetch once on mount - search will be handled by handleSearch

    // No mock data - using only real API data

    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Gurugram', 'Kolkata', 'Ahmedabad', 'Noida'];
    const experienceLevels = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5-8 years', '8-10 years', '10+ years'];
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Temporary'];
    const workModes = ['On-site', 'Remote', 'Hybrid', 'Work from Home'];
    const salaryRanges = ['₹0-3L', '₹3-6L', '₹6-10L', '₹10-15L', '₹15-25L', '₹25-50L', '₹50L+'];
    const datePostedOptions = ['Last 24 hours', 'Last 7 days', 'Last 15 days', 'Last 30 days', 'Anytime'];
    const companyTypes = ['MNC', 'Startup', 'Corporate', 'Government', 'Non-profit'];
    const educationLevels = ['High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD'];
    const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'IT', 'Customer Support'];


    const toggleFavorite = (jobId) => {
        console.log('🔍 Favorite button clicked for job:', jobId);
        
        // Check if user is authenticated
        if (!user || !(user.id || user._id)) {
            console.log('❌ User not authenticated, redirecting to login page');
            setLocation('/login');
            return;
        }

        try {
            const wasFavorited = localFavorites.has(jobId);
            const newLocalFavorites = new Set(localFavorites);
            
            if (wasFavorited) {
                newLocalFavorites.delete(jobId);
                console.log('✅ Removed from favorites:', jobId);
            } else {
                newLocalFavorites.add(jobId);
                console.log('✅ Added to favorites:', jobId);
            }
            
            setLocalFavorites(newLocalFavorites);

            // Save to localStorage
            const userId = user.id || user._id;
            localStorage.setItem(`favorites_${userId}`, JSON.stringify([...newLocalFavorites]));
            console.log('✅ Saved favorites to localStorage for user:', userId);
        } catch (error) {
            console.error('❌ Error toggling favorite:', error);
        }
    };

    const toggleBookmark = (jobId) => {
        console.log('🔍 Bookmark button clicked for job:', jobId);
        
        // Check if user is authenticated
        if (!user || !(user.id || user._id)) {
            console.log('❌ User not authenticated, redirecting to login page');
            setLocation('/login');
            return;
        }

        try {
            const wasBookmarked = localBookmarks.has(jobId);
            const newLocalBookmarks = new Set(localBookmarks);
            
            if (wasBookmarked) {
                newLocalBookmarks.delete(jobId);
                console.log('✅ Removed from bookmarks:', jobId);
            } else {
                newLocalBookmarks.add(jobId);
                console.log('✅ Added to bookmarks:', jobId);
            }
            
            setLocalBookmarks(newLocalBookmarks);

            // Save to localStorage
            const userId = user.id || user._id;
            localStorage.setItem(`bookmarks_${userId}`, JSON.stringify([...newLocalBookmarks]));
            console.log('✅ Saved bookmarks to localStorage for user:', userId);
        } catch (error) {
            console.error('❌ Error toggling bookmark:', error);
        }
    };

    const formatSalary = (min, max) => {
        const formatAmount = (amount) => {
            if (amount >= 100000) {
                return `₹${(amount / 100000).toFixed(0)}L`;
            } else {
                return `₹${(amount / 1000).toFixed(0)}K`;
            }
        };
        return `${formatAmount(min)} - ${formatAmount(max)}`;
    };

    // Modal handlers
    const handleViewDetails = (job) => {
        setViewDetailsModal({ isOpen: true, job });
    };

    const handleViewDetailsOld = (job) => {
        setSelectedJob(job);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedJob(null);
    };

    // Load applied jobs status on mount
    useEffect(() => {
        const loadAppliedJobs = async () => {
            if (user && (user.id || user._id)) {
                try {
                    const userId = user.id || user._id;
                    const applications = await applicationService.getUserApplications(userId);
                    
                    // Handle different response structures
                    let applicationsData = [];
                    if (applications?.data && Array.isArray(applications.data)) {
                        applicationsData = applications.data;
                    } else if (Array.isArray(applications)) {
                        applicationsData = applications;
                    } else if (applications?.applications && Array.isArray(applications.applications)) {
                        applicationsData = applications.applications;
                    }
                    
                    const appliedJobIds = new Set(applicationsData.map(app => app.jobId || app.job_id || app.id) || []);
                    setAppliedJobs(appliedJobIds);
                    console.log('✅ Loaded applied jobs:', appliedJobIds.size);
                } catch (error) {
                    console.error('❌ Error loading applied jobs:', error);
                    // Don't fail silently - this is expected for new users with no applications
                    console.log('ℹ️ No applications found (this is normal for new users)');
                    setAppliedJobs(new Set()); // Set empty set as fallback
                }
            }
        };
        
        loadAppliedJobs();
    }, [user]);

    const handleApply = (job) => {
        console.log('🔍 Apply button clicked for job:', job.title || job.jobTitle);
        console.log('🔍 Job object:', job);
        console.log('🔍 User object:', user);
        
        // Check if user is authenticated
        if (!user || !(user.id || user._id || user.userId)) {
            console.log('❌ User not authenticated, redirecting to login page');
            // Store the job ID in localStorage so we can redirect back after login
            localStorage.setItem('pendingJobApplication', JSON.stringify({
                jobId: job.id || job._id,
                jobTitle: job.title || job.jobTitle,
                timestamp: Date.now()
            }));
            // Redirect to login page
            setLocation('/login');
            return;
        }

        // Check if user is recruiter (recruiters can't apply to jobs)
        if (user.role === 'recruiter') {
            alert('Recruiters cannot apply to jobs. Please switch to an applicant account.');
            return;
        }

        // Check if already applied (handle different ID formats)
        const jobId = job.id || job._id;
        if (appliedJobs.has(jobId)) {
            alert('You have already applied to this job!');
            return;
        }
        
        console.log('✅ Opening application modal for job:', jobId);
        
        // Open application modal
        setSelectedJobForApplication(job);
        setApplicationModalOpen(true);
    };

    const handleSubmitApplication = async (applicationData) => {
        try {
            setApplicationLoading(true);
            console.log('🔍 Submitting application with data:', applicationData);
            
            // Log FormData contents for debugging
            for (let [key, value] of applicationData.entries()) {
                console.log(`🔍 FormData field: ${key} = ${value}`);
            }
            
            const response = await applicationService.submitApplication(applicationData);
            
            // Update applied jobs state
            const jobId = applicationData.get('jobId');
            setAppliedJobs(prev => new Set([...prev, jobId]));
            
            console.log('✅ Application submitted successfully:', response);
            alert(`Application submitted successfully for ${selectedJobForApplication?.title || selectedJobForApplication?.jobTitle}!`);
            
            // Close modal
            setApplicationModalOpen(false);
            setSelectedJobForApplication(null);
            
        } catch (error) {
            console.error('❌ Error submitting application:', error);
            alert('Error submitting application. Please try again.');
        } finally {
            setApplicationLoading(false);
        }
    };

    const handleAuthSuccess = async (userData) => {
        try {
            // Use AuthContext login function
            const result = await login({
                identifier: userData.email,
                password: userData.password || 'temp',
                role: 'applicant'
            });
            
            if (result.success) {
                setAuthModalOpen(false);
                
                // If there was a pending application, submit it now
                if (pendingApplication) {
                    handleApply(pendingApplication);
                    setPendingApplication(null);
                }
            } else {
                console.error('Login failed:', result.error);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
        // Search logic with safe property access
        const jobTitle = (job.title || '').toLowerCase();
        const jobCompany = (job.company || '').toLowerCase();
        const jobSkills = Array.isArray(job.skills) ? job.skills : [];
        const jobDescription = (job.description || '').toLowerCase();
        const jobDepartment = (job.department || '').toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        
        const matchesSearch = !searchQuery || 
            jobTitle.includes(searchLower) ||
            jobCompany.includes(searchLower) ||
            jobDescription.includes(searchLower) ||
            jobDepartment.includes(searchLower) ||
            jobSkills.some(skill => (skill || '').toLowerCase().includes(searchLower));
            
        const matchesLocation = !selectedLocation || job.location?.includes(selectedLocation);
        const matchesExperience = !selectedExperience || job.experience === selectedExperience;
        const matchesJobType = !selectedJobType || job.type === selectedJobType || (selectedJobType === 'Remote' && job.remote);
        const matchesWorkMode = !selectedWorkMode || job.workMode === selectedWorkMode || (selectedWorkMode === 'Remote' && job.remote);
        const matchesCompanyType = !selectedCompanyType || job.companyType === selectedCompanyType;
        const matchesEducation = !selectedEducation || job.education === selectedEducation;
        const matchesDepartment = !selectedDepartment || job.department === selectedDepartment;
        
        // Date Posted Filter - filter by job creation/posting date
        let matchesDatePosted = true;
        if (selectedDatePosted && selectedDatePosted !== 'Anytime') {
            const jobDate = new Date(job.createdAt || job.postedDate || Date.now());
            const now = new Date();
            const diffTime = Math.abs(now - jobDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (selectedDatePosted === 'Last 24 hours') matchesDatePosted = diffDays <= 1;
            else if (selectedDatePosted === 'Last 7 days') matchesDatePosted = diffDays <= 7;
            else if (selectedDatePosted === 'Last 15 days') matchesDatePosted = diffDays <= 15;
            else if (selectedDatePosted === 'Last 30 days') matchesDatePosted = diffDays <= 30;
        }

        // Salary Range Filter - basic implementation
        let matchesSalaryRange = true;
        if (selectedSalaryRange) {
            const salary = job.salary || job.salaryRange || '';
            matchesSalaryRange = salary.includes(selectedSalaryRange.replace('₹', '').split('-')[0]);
        }

        // Apply all filters
        const matchesAllFilters = matchesSearch && matchesLocation && matchesExperience && 
            matchesJobType && matchesWorkMode && matchesCompanyType && matchesEducation && 
            matchesDepartment && matchesDatePosted && matchesSalaryRange;

        // Apply category tab filter
        if (selectedTab === 0) return matchesAllFilters; // All
        if (selectedTab === 1) return matchesAllFilters && job.department === 'Finance';
        if (selectedTab === 2) return matchesAllFilters && job.department === 'Engineering';
        if (selectedTab === 3) return matchesAllFilters && job.featured;
        if (selectedTab === 4) return matchesAllFilters && job.remote;

        return matchesAllFilters;
    });

    // Helper function for formatting salary
    const formatSalaryDisplay = (min, max, salary) => {
        if (salary) return salary;
        if (min && max) {
            const formatAmount = (amount) => {
                if (amount >= 100000) {
                    return `₹${(amount / 1000).toLocaleString('en-IN')}`;
                }
                return `₹${amount.toLocaleString('en-IN')}`;
            };
            return `${formatAmount(min)} - ${formatAmount(max)}`;
        }
        return '₹Not Disclosed';
    };

    // Helper for work mode display
    const getWorkModeText = (job) => {
        const mode = job.workMode || job.mode || 'On-site';
        if (mode === 'Remote') return 'Work from home';
        if (mode === 'Hybrid') return 'Hybrid';
        return 'Work from Office';
    };

    const JobCardComponent = ({ job }) => (
        <JobCard onClick={() => handleViewDetails(job)}>
            {/* Company Logo */}
            <Avatar
                sx={{
                    bgcolor: job.companyColor || 'primary.main',
                    color: 'white',
                    width: 44,
                    height: 44,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    mr: 2,
                    flexShrink: 0,
                    borderRadius: '6px',
                }}
                variant="rounded"
                src={job.companyLogoUrl}
            >
                {job.companyLogo || job.company?.substring(0, 2).toUpperCase() || 'CO'}
            </Avatar>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {/* Title */}
                <Typography 
                    variant="subtitle1" 
                    fontWeight="600" 
                    sx={{ 
                        color: 'text.primary',
                        mb: 0.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.95rem'
                    }}
                >
                    {job.title}
                </Typography>
                
                {/* Company Name */}
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: 'text.secondary',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.8rem'
                    }}
                >
                    {job.company}
                </Typography>

                {/* Location Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                    <LocationOn sx={{ fontSize: 15, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {job.location || 'Location not specified'}
                    </Typography>
                </Box>

                {/* Salary Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.25 }}>
                    <CurrencyRupee sx={{ fontSize: 15, color: 'text.secondary', mr: 0.25 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {formatSalaryDisplay(job.salaryMin, job.salaryMax, job.salary) || 'Not disclosed'}
                    </Typography>
                </Box>

                {/* Tags Row */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<Business sx={{ fontSize: '13px !important' }} />}
                        label={getWorkModeText(job)}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            '& .MuiChip-icon': { color: 'text.secondary', ml: 0.5 },
                            '& .MuiChip-label': { px: 1 }
                        }}
                    />
                    <Chip
                        icon={<Work sx={{ fontSize: '13px !important' }} />}
                        label={job.type || 'Full Time'}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            '& .MuiChip-icon': { color: 'text.secondary', ml: 0.5 },
                            '& .MuiChip-label': { px: 1 }
                        }}
                    />
                    <Chip
                        icon={<Schedule sx={{ fontSize: '13px !important' }} />}
                        label={job.experience || 'Min. 1 year'}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            '& .MuiChip-icon': { color: 'text.secondary', ml: 0.5 },
                            '& .MuiChip-label': { px: 1 }
                        }}
                    />
                </Box>
            </Box>

            {/* Right Arrow */}
            <ChevronRight 
                sx={{ 
                    color: 'text.secondary',
                    ml: 1,
                    flexShrink: 0,
                    fontSize: 24
                }} 
            />
        </JobCard>
    );

    const FilterPanel = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                Filters
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Location
                </Typography>
                <Autocomplete
                    options={locations}
                    value={selectedLocation}
                    onChange={(event, newValue) => setSelectedLocation(newValue)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Select location" size="small" />
                    )}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Experience Level
                </Typography>
                <Autocomplete
                    options={experienceLevels}
                    value={selectedExperience}
                    onChange={(event, newValue) => setSelectedExperience(newValue)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Select experience" size="small" />
                    )}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Job Type
                </Typography>
                <Autocomplete
                    options={jobTypes}
                    value={selectedJobType}
                    onChange={(event, newValue) => setSelectedJobType(newValue)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Select job type" size="small" />
                    )}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Salary Range
                </Typography>
                <Autocomplete
                    options={salaryRanges}
                    value={selectedSalaryRange}
                    onChange={(event, newValue) => setSelectedSalaryRange(newValue)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Select salary range" size="small" />
                    )}
                />
            </Box>

            <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                    setSelectedLocation('');
                    setSelectedExperience('');
                    setSelectedJobType('');
                    setSelectedSalaryRange('');
                }}
            >
                Clear All Filters
            </Button>
        </Paper>
    );

    if (loading) {
        return (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
            <Box sx={{ 
                width: { xs: 'calc(100% - 32px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                px: { xs: 2, sm: 3, md: 4 } 
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <LinearProgress sx={{ mb: 2 }} />
                        <Typography>Loading recruiter jobs...</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4, bgcolor: '#f5f5f5' }}>
            <Box sx={{ 
                width: { xs: 'calc(100% - 16px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                px: { xs: 1, sm: 2, md: 3 },
                maxWidth: '100vw'
            }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                    Find Your Perfect Job
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Discover opportunities in Finance and Automotive industries
                </Typography>
            </Box>

            {/* Search Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={9}>
                        <SearchInput
                            placeholder="Search jobs, companies, or skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ height: 56 }}
                        >
                            <SearchIcon sx={{ mr: 1 }} /> Search
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Content - Sidebar + Jobs Layout */}
            <Grid container spacing={3}>
                {/* Left Sidebar - Filters (Always Visible on Desktop) */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Filters
                        </Typography>

                        {/* Location Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Location
                            </Typography>
                            <Autocomplete
                                options={locations}
                                value={selectedLocation}
                                onChange={(event, newValue) => setSelectedLocation(newValue || '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Select location"
                                    />
                                )}
                            />
                        </Box>

                        {/* Experience Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Experience
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedExperience}
                                    onChange={(e) => setSelectedExperience(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Experience</MenuItem>
                                    {experienceLevels.map((level) => (
                                        <MenuItem key={level} value={level}>{level}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Job Type Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Job Type
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedJobType}
                                    onChange={(e) => setSelectedJobType(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    {jobTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Salary Range Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Salary Range
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedSalaryRange}
                                    onChange={(e) => setSelectedSalaryRange(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Salaries</MenuItem>
                                    {salaryRanges.map((range) => (
                                        <MenuItem key={range} value={range}>{range}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Work Mode Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Work Mode
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedWorkMode}
                                    onChange={(e) => setSelectedWorkMode(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Work Modes</MenuItem>
                                    {workModes.map((mode) => (
                                        <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Date Posted Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Date Posted
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedDatePosted}
                                    onChange={(e) => setSelectedDatePosted(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">Anytime</MenuItem>
                                    {datePostedOptions.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Company Type Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Company Type
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedCompanyType}
                                    onChange={(e) => setSelectedCompanyType(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Companies</MenuItem>
                                    {companyTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Education Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Education
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedEducation}
                                    onChange={(e) => setSelectedEducation(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Education</MenuItem>
                                    {educationLevels.map((level) => (
                                        <MenuItem key={level} value={level}>{level}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Department Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Department
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Departments</MenuItem>
                                    {departments.map((dept) => (
                                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Category Tabs */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Category
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {['All Jobs', 'Finance', 'Automotive', 'Featured', 'Remote'].map((label, index) => (
                                    <Button
                                        key={label}
                                        variant={selectedTab === index ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedTab(index)}
                                        fullWidth
                                        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        {/* Clear Filters Button */}
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedLocation('');
                                setSelectedExperience('');
                                setSelectedJobType('');
                                setSelectedSalaryRange('');
                                setSelectedWorkMode('');
                                setSelectedDatePosted('');
                                setSelectedCompanyType('');
                                setSelectedEducation('');
                                setSelectedDepartment('');
                                setSelectedTab(0);
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </Paper>
                </Grid>

                {/* Right Content - Job Listings */}
                <Grid item xs={12} md={9}>
                    {/* Results Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="600">
                            {filteredJobs.length} Jobs Found
                        </Typography>
                        {/* View Format Toggle */}
                        <Box sx={{ 
                            display: 'flex', 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1, 
                            overflow: 'hidden'
                        }}>
                            <Button
                                size="small"
                                variant={viewFormat === 'list' ? 'contained' : 'text'}
                                onClick={() => setViewFormat('list')}
                                sx={{ borderRadius: 0, minWidth: 100 }}
                            >
                                📋 List
                            </Button>
                            <Button
                                size="small"
                                variant={viewFormat === 'grid' ? 'contained' : 'text'}
                                onClick={() => setViewFormat('grid')}
                                sx={{ borderRadius: 0, minWidth: 100 }}
                            >
                                📱 Grid
                            </Button>
                        </Box>
                    </Box>

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            )}

            {/* Empty State */}
            {!loading && filteredJobs.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center', mb: 4 }}>
                    <Box sx={{ mb: 3 }}>
                        <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            No Jobs Found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            We couldn't find any jobs matching your criteria. Try adjusting your search filters or check back later for new opportunities.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button 
                                variant="contained" 
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedLocation('');
                                    setSelectedExperience('');
                                    setSelectedJobType('');
                                    setSelectedSalaryRange('');
                                    handleSearch();
                                }}
                            >
                                Clear All Filters
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={async () => {
                                    try {
                                        const sampleJobs = [
                                            {
                                                title: "Software Engineer",
                                                company: "TechCorp",
                                                location: "Mumbai, India",
                                                type: "Full-time",
                                                salary: "₹15-25 LPA",
                                                experience: "3-5 years",
                                                description: "We are looking for a skilled software engineer to join our team.",
                                                skills: ["React", "Node.js", "MongoDB"],
                                                requirements: ["Bachelor's degree in CS", "3+ years experience"],
                                                responsibilities: ["Develop web applications", "Code review"],
                                                category: "Technology"
                                            },
                                            {
                                                title: "Financial Analyst",
                                                company: "FinanceHub",
                                                location: "Delhi, India",
                                                type: "Full-time",
                                                salary: "₹8-12 LPA",
                                                experience: "2-4 years",
                                                description: "Join our finance team as a financial analyst.",
                                                skills: ["Excel", "Financial Modeling", "SQL"],
                                                requirements: ["MBA in Finance", "2+ years experience"],
                                                responsibilities: ["Financial analysis", "Report generation"],
                                                category: "Finance"
                                            }
                                        ];
                                        
                                        for (const job of sampleJobs) {
                                            await jobsAPI.createJob(job);
                                        }
                                        
                                        // Refresh jobs list
                                        handleSearch();
                                        console.log('Sample jobs created successfully');
                                    } catch (error) {
                                        console.error('Error creating sample jobs:', error);
                                    }
                                }}
                            >
                                Add Sample Jobs (Dev)
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            {/* Jobs Display - Multiple View Formats */}
            {filteredJobs.length > 0 && viewFormat === 'table' && (
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Job</TableCell>
                                <TableCell>Company</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Salary</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Experience</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredJobs.map((job) => (
                                <TableRow key={job.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                                {job.company?.charAt(0) || 'C'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">{job.title}</Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                    {job.featured && <Chip label="Featured" size="small" color="primary" />}
                                                    {job.urgentHiring && <Chip label="Urgent" size="small" color="error" />}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{job.company}</TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>{job.salary || 'Negotiable'}</TableCell>
                                    <TableCell>
                                        <Chip label={job.type} size="small" />
                                    </TableCell>
                                    <TableCell>{job.experience}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button size="small" onClick={() => handleViewDetails(job)}>
                                                View Details
                                            </Button>
                                            <Button 
                                                size="small" 
                                                variant={appliedJobs.has(job.id) ? "outlined" : "contained"} 
                                                onClick={() => handleApply(job)}
                                                disabled={appliedJobs.has(job.id)}
                                                sx={{
                                                    color: appliedJobs.has(job.id) ? 'success.main' : undefined,
                                                    borderColor: appliedJobs.has(job.id) ? 'success.main' : undefined,
                                                }}
                                            >
                                                {appliedJobs.has(job.id) ? '✓ Applied' : 'Apply'}
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {filteredJobs.length > 0 && viewFormat === 'list' && (
                <Box sx={{ mb: 4, maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
                    {filteredJobs.map((job) => (
                        <JobCardComponent key={job.id} job={job} />
                    ))}
                </Box>
            )}

            {filteredJobs.length > 0 && viewFormat === 'grid' && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {filteredJobs.map((job) => (
                        <Grid item xs={12} md={6} lg={4} key={job.id}>
                            <JobCardComponent job={job} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {filteredJobs.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No recruiter jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        No jobs have been posted by recruiters yet. Try adjusting your search criteria or check back later.
                    </Typography>
                    <Button variant="outlined" onClick={() => {
                        setSearchQuery('');
                        setSelectedLocation('');
                        setSelectedExperience('');
                        setSelectedJobType('');
                    }}>
                        Clear All Filters
                    </Button>
                </Paper>
            )}

            {/* Pagination - Only show if more than 1 page */}
            {filteredJobs.length > 12 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={Math.ceil(filteredJobs.length / 12)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}
                </Grid>
            </Grid>

            {/* Job Market Insights */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="text.primary">
                    Job Market Insights
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Alert severity="info">
                            <Typography variant="subtitle2" gutterBottom>
                                Finance Sector Growth
                            </Typography>
                            <Typography variant="body2">
                                Finance jobs increased by 15% this quarter with high demand for analysts and risk managers.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Alert severity="success">
                            <Typography variant="subtitle2" gutterBottom>
                                Automotive Innovation
                            </Typography>
                            <Typography variant="body2">
                                Electric vehicle sector is booming with 25% growth in engineering positions.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Alert severity="warning">
                            <Typography variant="subtitle2" gutterBottom>
                                Remote Opportunities
                            </Typography>
                            <Typography variant="body2">
                                40% of new job postings offer remote or hybrid work options.
                            </Typography>
                        </Alert>
                    </Grid>
                </Grid>
            </Box>

            {/* Comprehensive View Details Modal */}
            <Dialog
                open={viewDetailsModal.isOpen}
                onClose={() => setViewDetailsModal({ isOpen: false, job: null })}
                maxWidth={false}
                fullWidth={false}
                PaperProps={{
                    sx: {
                        width: '480px !important',
                        maxWidth: '480px !important',
                        minWidth: '320px',
                        borderRadius: '6px',
                        maxHeight: '85vh',
                        m: 2,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">Job Details</Typography>
                        <IconButton size="small" onClick={() => setViewDetailsModal({ isOpen: false, job: null })}>
                            ✕
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {viewDetailsModal.job && (
                        <Box sx={{ pt: 1 }}>
                            {/* Header Section */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', borderRadius: '6px' }} variant="rounded">
                                    {viewDetailsModal.job.company?.charAt(0) || 'C'}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.25, lineHeight: 1.3 }}>{viewDetailsModal.job.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {viewDetailsModal.job.company} <span style={{ color: '#4caf50' }}>✓</span>
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Rating value={4.5} readOnly size="small" />
                                        <Typography variant="caption" color="text.secondary">
                                            4.5 • {viewDetailsModal.job.applicants || 0}+ applied
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" color="primary" fontWeight="bold">
                                        {viewDetailsModal.job.salary || 'Negotiable'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Key Information - 2x2 Grid */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: '6px' }}>
                                        <LocationOn color="primary" sx={{ fontSize: 20, mb: 0.5 }} />
                                        <Typography variant="caption" color="text.secondary" display="block">Location</Typography>
                                        <Typography variant="body2" fontWeight="bold">{viewDetailsModal.job.location}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: '6px' }}>
                                        <Work color="primary" sx={{ fontSize: 20, mb: 0.5 }} />
                                        <Typography variant="caption" color="text.secondary" display="block">Experience</Typography>
                                        <Typography variant="body2" fontWeight="bold">{viewDetailsModal.job.experience}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: '6px' }}>
                                        <Schedule color="primary" sx={{ fontSize: 20, mb: 0.5 }} />
                                        <Typography variant="caption" color="text.secondary" display="block">Job Type</Typography>
                                        <Typography variant="body2" fontWeight="bold">{viewDetailsModal.job.type}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: '6px' }}>
                                        <Business color="primary" sx={{ fontSize: 20, mb: 0.5 }} />
                                        <Typography variant="caption" color="text.secondary" display="block">Work Mode</Typography>
                                        <Typography variant="body2" fontWeight="bold">{viewDetailsModal.job.workMode || 'Onsite'}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Job Description */}
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Job Description</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {viewDetailsModal.job.description || 'No description available.'}
                                </Typography>
                            </Box>

                            {/* Skills Required */}
                            {viewDetailsModal.job.skills && viewDetailsModal.job.skills.length > 0 && (
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Skills Required</Typography>
                                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                        {viewDetailsModal.job.skills.map((skill, index) => (
                                            <Chip key={index} label={skill} variant="outlined" size="small" sx={{ fontSize: '0.75rem', height: 24 }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Benefits */}
                            {viewDetailsModal.job.benefits && viewDetailsModal.job.benefits.length > 0 && (
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Benefits</Typography>
                                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                        {viewDetailsModal.job.benefits.map((benefit, index) => (
                                            <Chip key={index} label={benefit} color="success" variant="outlined" size="small" sx={{ fontSize: '0.75rem', height: 24 }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Company Information */}
                            <Box sx={{ mb: 2.5, p: 2, bgcolor: 'grey.50', borderRadius: '6px' }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>About the Company</Typography>
                                <Grid container spacing={1.5}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">Company</Typography>
                                        <Typography variant="body2" fontWeight="500">{viewDetailsModal.job.company}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">Industry</Typography>
                                        <Typography variant="body2" fontWeight="500">{viewDetailsModal.job.industry || 'Not specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">Company Size</Typography>
                                        <Typography variant="body2" fontWeight="500">{viewDetailsModal.job.companySize || 'Not specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block">Posted</Typography>
                                        <Typography variant="body2" fontWeight="500">{viewDetailsModal.job.posted || 'Recently'}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Job Stats */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 2.5 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle1" color="primary" fontWeight="bold">{viewDetailsModal.job.views || 150}</Typography>
                                    <Typography variant="caption" color="text.secondary">Views</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle1" color="primary" fontWeight="bold">{viewDetailsModal.job.applicants || 0}</Typography>
                                    <Typography variant="caption" color="text.secondary">Applicants</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle1" color="success.main" fontWeight="bold">Active</Typography>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                </Box>
                            </Box>

                            {/* Tags */}
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                {viewDetailsModal.job.featured && <Chip label="Featured" color="primary" size="small" />}
                                {viewDetailsModal.job.urgentHiring && <Chip label="Urgent Hiring" color="error" size="small" />}
                                {viewDetailsModal.job.remote && <Chip label="Remote" color="success" size="small" />}
                                {viewDetailsModal.job.verified && <Chip label="Verified Company" color="info" size="small" />}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1.5 }}>
                    <Button 
                        variant="outlined" 
                        onClick={() => setViewDetailsModal({ isOpen: false, job: null })}
                        sx={{ borderRadius: '6px' }}
                    >
                        Close
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            handleApply(viewDetailsModal.job);
                            setViewDetailsModal({ isOpen: false, job: null });
                        }}
                        sx={{ minWidth: 100, borderRadius: '6px' }}
                    >
                        Apply Now
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Job Details Modal */}
            <JobDetailsModal
                open={modalOpen}
                onClose={handleCloseModal}
                job={selectedJob}
                onApply={handleApply}
            />

            {/* Authentication Modal */}
            <AuthModal
                open={authModalOpen}
                onClose={() => {
                    setAuthModalOpen(false);
                    setPendingApplication(null);
                }}
                onSuccess={handleAuthSuccess}
                defaultTab={0}
            />

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
            />
            </Box>
        </Box>
    );
};

export default JobsPage;
