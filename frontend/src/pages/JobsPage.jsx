import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import API_BASE_URL from '../services/apiConfig';
import JobDetailsModal from '../components/modals/JobDetailsModal';
import AuthModal from '../components/modals/AuthModal';
import JobApplicationModal from '../components/modals/JobApplicationModal';
import { useAuth } from '../contexts/AuthContext.jsx';
import { applicationService } from '../services/applicationService';
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { jobsAPI } from '../services/api';

const JobCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'featured'
})(({ theme, featured }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    ...(featured && {
        border: `2px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.primary.light + '10',
    }),
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[12],
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
            log.info('Loading favorites/bookmarks for user', userId);
            
            try {
                const savedFavorites = localStorage.getItem(`favorites_${userId}`);
                const savedBookmarks = localStorage.getItem(`bookmarks_${userId}`);
                
                if (savedFavorites) {
                    const favoritesArray = JSON.parse(savedFavorites);
                    setLocalFavorites(new Set(favoritesArray));
                    log.success(`Loaded ${favoritesArray.length} favorites from localStorage`);
                }
                if (savedBookmarks) {
                    const bookmarksArray = JSON.parse(savedBookmarks);
                    setLocalBookmarks(new Set(bookmarksArray));
                    log.success(`Loaded ${bookmarksArray.length} bookmarks from localStorage`);
                }
            } catch (error) {
                log.error('Error loading from localStorage', error);
            }
        } else {
            log.info('No user found or user ID missing');
        }
    }, [user]);

    // Debug: Log current state
    useEffect(() => {
        log.data('Current state', {
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
                        log.info('Found pending job application, looking for job', applicationData.jobTitle);
                        // Find the job in current jobs list
                        const job = jobs.find(j => (j.id || j._id) === applicationData.jobId);
                        if (job) {
                            log.success('Found job for pending application, opening application modal');
                            setSelectedJobForApplication(job);
                            setApplicationModalOpen(true);
                        } else {
                            log.warn('Job not found in current list, user can manually apply');
                        }
                        // Clear the pending application
                        localStorage.removeItem('pendingJobApplication');
                    }
                } catch (error) {
                    log.error('Error parsing pending application', error);
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

    // Fetch jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                log.fetch('Fetching jobs from comprehensive API...');
                
                // Use fetch directly to call our comprehensive job API (without search query for initial load)
                const response = await fetch(`${API_BASE_URL}/jobs?${new URLSearchParams({
                    location: selectedLocation || '',
                    jobType: selectedJobType || '',
                    page: page.toString(),
                    limit: '20'
                })}`);
                
                const data = await response.json();
                log.api('Comprehensive API Response', data);
                
                // Handle the new API response format
                let jobsData = [];
                if (data.success && Array.isArray(data.data?.jobs)) {
                    jobsData = data.data.jobs;
                    log.success(`Found ${jobsData.length} jobs from comprehensive API`);
                } else {
                    log.info('No jobs found, using empty array');
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
                
                log.data('Transformed jobs sample', transformedJobs[0]);
                log.data('Total transformed jobs', transformedJobs.length);
                log.data('Sample job fields', Object.keys(transformedJobs[0] || {}));
                setJobs(transformedJobs);
            } catch (error) {
                log.error('Error fetching jobs from comprehensive API', error);
                // Show empty array - no mock data fallback
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [selectedLocation, selectedJobType, page]);

    // No mock data - using only real API data

    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Gurugram'];
    const experienceLevels = ['0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years'];
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
    const salaryRanges = [
        '₹0-5L', '₹5-10L', '₹10-15L', '₹15-20L', '₹20-30L', '₹30L+'
    ];


    const handleSearch = async () => {
        try {
            setLoading(true);
            console.log('🔍 Performing search with query:', searchQuery);
            
            const searchParams = {
                search: searchQuery,
                location: selectedLocation,
                jobType: selectedJobType,
                experience: selectedExperience,
                salaryRange: selectedSalaryRange,
                page: 1,
                limit: 12
            };
            
            // Filter out empty parameters
            const filteredParams = Object.fromEntries(
                Object.entries(searchParams).filter(([_, value]) => value && value !== '')
            );
            
            const response = await fetch(`${API_BASE_URL}/jobs?${new URLSearchParams(filteredParams)}`);
            const data = await response.json();
            
            if (data.success) {
                setJobs(data.jobs || []);
                setTotalJobs(data.total || 0);
                setPage(1); // Reset to first page
                console.log('✅ Search completed, found', data.jobs?.length || 0, 'jobs');
            } else {
                console.error('❌ Search failed:', data.message);
                setJobs([]);
            }
        } catch (error) {
            console.error('❌ Search error:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

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
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesLocation = !selectedLocation || job.location.includes(selectedLocation);
        const matchesExperience = !selectedExperience || job.experience === selectedExperience;
        const matchesJobType = !selectedJobType || job.type === selectedJobType || (selectedJobType === 'Remote' && job.remote);

        if (selectedTab === 0) return matchesSearch && matchesLocation && matchesExperience && matchesJobType; // All
        if (selectedTab === 1) return matchesSearch && matchesLocation && matchesExperience && matchesJobType && job.department === 'Finance';
        if (selectedTab === 2) return matchesSearch && matchesLocation && matchesExperience && matchesJobType && job.department === 'Engineering';
        if (selectedTab === 3) return matchesSearch && matchesLocation && matchesExperience && matchesJobType && job.featured;
        if (selectedTab === 4) return matchesSearch && matchesLocation && matchesExperience && matchesJobType && job.remote;

        return matchesSearch && matchesLocation && matchesExperience && matchesJobType;
    });

    const JobCardComponent = ({ job }) => (
        <JobCard 
            featured={job.featured}
            sx={{ 
                width: '100%',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Header - Horizontal Layout */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3, minWidth: 0, flexGrow: 1 }}>
                        <Avatar
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                width: 64,
                                height: 64,
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {job.companyLogo}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                {job.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {job.company}
                                </Typography>
                                {job.verified && (
                                    <Verified sx={{ fontSize: 20, color: 'success.main' }} />
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                                <Rating value={job.rating} precision={0.1} size="small" readOnly />
                                <Typography variant="body2" color="text.secondary">
                                    {job.rating} • {job.applicants}+ applied
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Salary - Right side */}
                        <Box sx={{ textAlign: 'right', minWidth: '200px' }}>
                            <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                                {job.salary || formatSalary(job.salaryMin, job.salaryMax)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mb: 1 }}>
                                <Chip
                                    label={job.status || "active"}
                                    size="small"
                                    color="success"
                                    variant="filled"
                                />
                                <Chip
                                    label={job.urgency || "Normal"}
                                    size="small"
                                    color={job.urgency === 'urgent' || job.urgency === 'high-priority' ? 'warning' : 'default'}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Tooltip title={localFavorites.has(job.id) ? 'Remove from favorites' : 'Add to favorites'}>
                            <IconButton 
                                onClick={() => toggleFavorite(job.id)} 
                                size="small"
                                sx={{
                                    color: localFavorites.has(job.id) ? 'error.main' : 'action.active',
                                    backgroundColor: localFavorites.has(job.id) ? 'error.light' : 'transparent',
                                    border: '2px solid',
                                    borderColor: localFavorites.has(job.id) ? 'error.main' : 'action.active',
                                    '&:hover': {
                                        backgroundColor: localFavorites.has(job.id) ? 'error.light' : 'action.hover'
                                    }
                                }}
                            >
                                {localFavorites.has(job.id) ?
                                    <Favorite /> :
                                    <FavoriteBorder />
                                }
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={localBookmarks.has(job.id) ? 'Remove bookmark' : 'Bookmark job'}>
                            <IconButton 
                                onClick={() => toggleBookmark(job.id)} 
                                size="small"
                                sx={{
                                    color: localBookmarks.has(job.id) ? 'primary.main' : 'action.active',
                                    backgroundColor: localBookmarks.has(job.id) ? 'primary.light' : 'transparent',
                                    border: '2px solid',
                                    borderColor: localBookmarks.has(job.id) ? 'primary.main' : 'action.active',
                                    '&:hover': {
                                        backgroundColor: localBookmarks.has(job.id) ? 'primary.light' : 'action.hover'
                                    }
                                }}
                            >
                                {localBookmarks.has(job.id) ?
                                    <Bookmark /> :
                                    <BookmarkBorder />
                                }
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Share job">
                            <IconButton size="small">
                                <Share />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Job Details - Horizontal Layout */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {job.location}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {job.experience}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {job.type}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {job.posted}
                        </Typography>
                    </Box>
                </Box>

                {/* Job Description */}
                {job.description && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" color="text.secondary" sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5
                        }}>
                            {job.description}
                        </Typography>
                    </Box>
                )}

                {/* Skills Section */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(job.skills || []).slice(0, 6).map((skill, index) => (
                                <Chip
                                    key={index}
                                    label={skill}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                />
                            ))}
                            {job.skills && job.skills.length > 6 && (
                                <Chip
                                    label={`+${job.skills.length - 6} more`}
                                    size="small"
                                    variant="outlined"
                                    color="default"
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Tags and Status */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {job.featured && (
                        <Chip
                            label="Featured"
                            size="small"
                            color="primary"
                            icon={<Star />}
                        />
                    )}
                    {job.urgentHiring && (
                        <Chip
                            label="Urgent Hiring"
                            size="small"
                            color="error"
                            icon={<FlashOn />}
                        />
                    )}
                    <Chip
                        label={job.workMode || job.type}
                        size="small"
                        color={job.workMode === 'Remote' ? 'success' : job.workMode === 'Hybrid' ? 'warning' : 'default'}
                        icon={job.workMode === 'Remote' ? <Home /> : undefined}
                    />
                </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        onClick={() => handleViewDetails(job)}
                        variant="outlined"
                        size="large"
                        sx={{ minWidth: '140px' }}
                    >
                        View Details
                    </Button>
                    <Button
                        onClick={() => handleApply(job)}
                        variant={appliedJobs.has(job.id) ? "outlined" : "contained"}
                        size="large"
                        sx={{
                            minWidth: '120px',
                            backgroundColor: appliedJobs.has(job.id) ? 'transparent' : undefined,
                            color: appliedJobs.has(job.id) ? 'success.main' : undefined,
                            borderColor: appliedJobs.has(job.id) ? 'success.main' : undefined,
                            '&:hover': {
                                backgroundColor: appliedJobs.has(job.id) ? 'success.light' : undefined,
                            }
                        }}
                        disabled={appliedJobs.has(job.id)}
                    >
                        {appliedJobs.has(job.id) ? '✓ Applied' : 'Apply'}
                    </Button>
                </Box>
                
                {/* Right side - Job Stats */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Visibility sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                            {job.views} views
                        </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="500">
                        Posted {job.posted}
                    </Typography>
                </Box>
            </CardActions>

            {/* Featured Badge */}
            {job.featured && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                    }}
                >
                    FEATURED
                </Box>
            )}
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
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <LinearProgress sx={{ mb: 2 }} />
                        <Typography>Loading recruiter jobs...</Typography>
                    </Box>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Find Your Perfect Job
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Discover opportunities in Finance and Automotive industries
                </Typography>
            </Box>

            {/* Search Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search jobs, companies, or skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={locations}
                            value={selectedLocation}
                            onChange={(event, newValue) => setSelectedLocation(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Location"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSearch}
                            sx={{ height: 56 }}
                        >
                            Search
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setShowFilters(true)}
                            sx={{ height: 56 }}
                        >
                            <FilterList />
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Category Tabs */}
            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons="auto"
                    centered={!isMobile}
                >
                    <Tab label="All Jobs" />
                    <Tab label="Finance" />
                    <Tab label="Automotive" />
                    <Tab label="Featured" />
                    <Tab label="Remote" />
                </Tabs>
            </Box>

            {/* Results Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    {filteredJobs.length} jobs found
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* View Format Toggle */}
                    <Box sx={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                        <Button
                            size="small"
                            variant={viewFormat === 'table' ? 'contained' : 'text'}
                            onClick={() => setViewFormat('table')}
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            📊 Table
                        </Button>
                        <Button
                            size="small"
                            variant={viewFormat === 'list' ? 'contained' : 'text'}
                            onClick={() => setViewFormat('list')}
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            📋 List
                        </Button>
                        <Button
                            size="small"
                            variant={viewFormat === 'grid' ? 'contained' : 'text'}
                            onClick={() => setViewFormat('grid')}
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            🔲 Grid
                        </Button>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort by</InputLabel>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            label="Sort by"
                        >
                            <MenuItem value="relevance">Relevance</MenuItem>
                            <MenuItem value="date">Date Posted</MenuItem>
                            <MenuItem value="salary">Salary</MenuItem>
                            <MenuItem value="company">Company</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
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
                                        // Create sample jobs for testing
                                        const sampleJobs = [
                                            {
                                                title: "Senior Software Engineer",
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
                        <Card key={job.id} sx={{ mb: 3, p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 3, flex: 1 }}>
                                    <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                                        {job.company?.charAt(0) || 'C'}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" gutterBottom>{job.title}</Typography>
                                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                            {job.company} ✓
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Rating value={4.5} size="small" readOnly />
                                            <Typography variant="body2" color="text.secondary">
                                                4.5 • {job.applicants || 0}+ applied
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                            <Chip icon={<LocationOn />} label={job.location} size="small" />
                                            <Chip icon={<Work />} label={job.experience} size="small" />
                                            <Chip icon={<Schedule />} label={job.type} size="small" />
                                            <Chip label={`Posted ${job.posted || 'recently'}`} size="small" />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {job.description?.substring(0, 150)}...
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                            <Typography variant="body2" sx={{ mr: 1 }}>Skills:</Typography>
                                            {job.skills?.slice(0, 4).map((skill, index) => (
                                                <Chip key={index} label={skill} size="small" variant="outlined" />
                                            ))}
                                            {job.skills?.length > 4 && (
                                                <Typography variant="body2" color="text.secondary">
                                                    +{job.skills.length - 4} more
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            {job.featured && <Chip label="Featured" size="small" color="primary" />}
                                            {job.urgentHiring && <Chip label="Urgent" size="small" color="error" />}
                                            {job.remote && <Chip label="Remote" size="small" color="success" />}
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        {job.salary || 'Negotiable'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <IconButton size="small">❤️</IconButton>
                                        <IconButton size="small">📑</IconButton>
                                        <IconButton size="small">📤</IconButton>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" onClick={() => handleViewDetails(job)}>
                                        View Details
                                    </Button>
                                    <Button 
                                        variant={appliedJobs.has(job.id) ? "outlined" : "contained"} 
                                        onClick={() => handleApply(job)}
                                        disabled={appliedJobs.has(job.id)}
                                        sx={{
                                            color: appliedJobs.has(job.id) ? 'success.main' : undefined,
                                            borderColor: appliedJobs.has(job.id) ? 'success.main' : undefined,
                                        }}
                                    >
                                        {appliedJobs.has(job.id) ? '✓ Applied' : 'Apply Now'}
                                    </Button>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    👁️ {job.views || 150} views • Posted {job.posted || '2d'}
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}

            {filteredJobs.length > 0 && viewFormat === 'grid' && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {filteredJobs.map((job) => (
                        <Grid item xs={12} md={6} lg={4} key={job.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main' }}>
                                            {job.company?.charAt(0) || 'C'}
                                        </Avatar>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton size="small">❤️</IconButton>
                                            <IconButton size="small">📑</IconButton>
                                            <IconButton size="small">📤</IconButton>
                                        </Box>
                                    </Box>
                                    <Typography variant="h6" gutterBottom>{job.title}</Typography>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {job.company} ✓
                                    </Typography>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        {job.salary || 'Negotiable'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                        <Chip label={job.location} size="small" />
                                        <Chip label={job.experience} size="small" />
                                        <Chip label={job.type} size="small" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {job.description?.substring(0, 100)}...
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {job.skills?.slice(0, 3).map((skill, index) => (
                                            <Chip key={index} label={skill} size="small" variant="outlined" />
                                        ))}
                                        {job.skills?.length > 3 && (
                                            <Typography variant="body2" color="text.secondary">
                                                +{job.skills.length - 3}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        {job.featured && <Chip label="Featured" size="small" color="primary" />}
                                        {job.urgentHiring && <Chip label="Urgent" size="small" color="error" />}
                                        {job.remote && <Chip label="Remote" size="small" color="success" />}
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
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
                                        {appliedJobs.has(job.id) ? '✓ Applied' : 'Apply Now'}
                                    </Button>
                                </CardActions>
                            </Card>
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

            {/* Filter Drawer for Mobile */}
            <FilterDrawer
                anchor="right"
                open={showFilters}
                onClose={() => setShowFilters(false)}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Filters</Typography>
                    <IconButton onClick={() => setShowFilters(false)}>
                        <Close />
                    </IconButton>
                </Box>
                <FilterPanel />
            </FilterDrawer>

            {/* Job Market Insights */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
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
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        maxWidth: { xs: '95vw', sm: '600px', md: '700px', lg: '800px' },
                        maxHeight: '85vh',
                        m: 2
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5">Job Details</Typography>
                        <IconButton onClick={() => setViewDetailsModal({ isOpen: false, job: null })}>
                            ✕
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {viewDetailsModal.job && (
                        <Box sx={{ py: 2 }}>
                            {/* Header Section */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                                    {viewDetailsModal.job.company?.charAt(0) || 'C'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4" gutterBottom>{viewDetailsModal.job.title}</Typography>
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        {viewDetailsModal.job.company} ✓
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Rating value={4.5} readOnly />
                                        <Typography variant="body2" color="text.secondary">
                                            4.5 • {viewDetailsModal.job.applicants || 0}+ applied
                                        </Typography>
                                    </Box>
                                    <Typography variant="h5" color="primary">
                                        {viewDetailsModal.job.salary || 'Negotiable'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Key Information */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                        <LocationOn color="primary" sx={{ mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">Location</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.location}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                        <Work color="primary" sx={{ mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">Experience</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.experience}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                        <Schedule color="primary" sx={{ mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">Job Type</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.type}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                        <Business color="primary" sx={{ mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">Work Mode</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.workMode || 'Onsite'}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Job Description */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom>Job Description</Typography>
                                <Typography variant="body1" paragraph>
                                    {viewDetailsModal.job.description || 'No description available.'}
                                </Typography>
                            </Box>

                            {/* Skills Required */}
                            {viewDetailsModal.job.skills && viewDetailsModal.job.skills.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>Skills Required</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {viewDetailsModal.job.skills.map((skill, index) => (
                                            <Chip key={index} label={skill} variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Benefits */}
                            {viewDetailsModal.job.benefits && viewDetailsModal.job.benefits.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>Benefits</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {viewDetailsModal.job.benefits.map((benefit, index) => (
                                            <Chip key={index} label={benefit} color="success" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Company Information */}
                            <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>About the Company</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Company</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.company}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Industry</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.industry || 'Not specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Company Size</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.companySize || 'Not specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Posted</Typography>
                                        <Typography variant="body1" fontWeight="bold">{viewDetailsModal.job.posted || 'Recently'}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Job Stats */}
                            <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="primary">{viewDetailsModal.job.views || 150}</Typography>
                                    <Typography variant="body2" color="text.secondary">Views</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="primary">{viewDetailsModal.job.applicants || 0}</Typography>
                                    <Typography variant="body2" color="text.secondary">Applicants</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="success.main">Active</Typography>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                </Box>
                            </Box>

                            {/* Tags */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {viewDetailsModal.job.featured && <Chip label="Featured" color="primary" />}
                                {viewDetailsModal.job.urgentHiring && <Chip label="Urgent Hiring" color="error" />}
                                {viewDetailsModal.job.remote && <Chip label="Remote" color="success" />}
                                {viewDetailsModal.job.verified && <Chip label="Verified Company" color="info" />}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        onClick={() => setViewDetailsModal({ isOpen: false, job: null })}
                        size="large"
                    >
                        Close
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            handleApply(viewDetailsModal.job);
                            setViewDetailsModal({ isOpen: false, job: null });
                        }}
                        size="large"
                        sx={{ minWidth: 120 }}
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
        </Container>
    );
};

export default JobsPage;
