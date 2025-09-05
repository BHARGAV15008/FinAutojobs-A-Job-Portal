import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const JobCard = styled(Card)(({ theme, featured }) => ({
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
        width: 320,
        padding: theme.spacing(2),
    },
}));

const JobsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedExperience, setSelectedExperience] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const [selectedTab, setSelectedTab] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [bookmarks, setBookmarks] = useState(new Set());
    const [page, setPage] = useState(1);

    // Mock jobs data with enhanced features
    const mockJobs = [
        {
            id: 1,
            title: "Senior Financial Analyst",
            company: "Goldman Sachs",
            companyLogo: "GS",
            location: "Mumbai, Maharashtra",
            department: "Finance",
            type: "Full-time",
            workMode: "Hybrid",
            salary: "₹15,00,000 - ₹25,00,000",
            salaryMin: 1500000,
            salaryMax: 2500000,
            posted: "2 days ago",
            experience: "3-5 years",
            description: "We are seeking a Senior Financial Analyst to join our dynamic team in Mumbai. You will be responsible for financial modeling, analysis, and reporting.",
            skills: ["Excel", "Python", "SQL", "Financial Modeling", "Risk Analysis"],
            featured: true,
            urgentHiring: false,
            verified: true,
            applicants: 24,
            rating: 4.5,
            views: 1250,
            remote: false,
            benefits: ["Health Insurance", "Stock Options", "Flexible Hours"],
            companySize: "10,000+",
            industry: "Investment Banking",
        },
        {
            id: 2,
            title: "Automotive Design Engineer",
            company: "Tata Motors",
            companyLogo: "TM",
            location: "Pune, Maharashtra",
            department: "Engineering",
            type: "Full-time",
            workMode: "On-site",
            salary: "₹8,00,000 - ₹12,00,000",
            salaryMin: 800000,
            salaryMax: 1200000,
            posted: "1 day ago",
            experience: "2-4 years",
            description: "Join our innovative team working on next-generation electric vehicles and sustainable mobility solutions.",
            skills: ["CAD", "CATIA", "Automotive Systems", "Testing", "Design"],
            featured: false,
            urgentHiring: true,
            verified: true,
            applicants: 15,
            rating: 4.2,
            views: 890,
            remote: false,
            benefits: ["Medical Coverage", "Transport", "Canteen"],
            companySize: "50,000+",
            industry: "Automotive",
        },
        {
            id: 3,
            title: "Investment Banking Associate",
            company: "ICICI Bank",
            companyLogo: "IB",
            location: "Mumbai, Maharashtra",
            department: "Finance",
            type: "Full-time",
            workMode: "Hybrid",
            salary: "₹18,00,000 - ₹30,00,000",
            salaryMin: 1800000,
            salaryMax: 3000000,
            posted: "3 days ago",
            experience: "4-6 years",
            description: "Looking for experienced Investment Banking Associate for our Mumbai office to work on M&A transactions and capital markets.",
            skills: ["Financial Analysis", "Valuation", "Excel", "PowerPoint", "Due Diligence"],
            featured: true,
            urgentHiring: false,
            verified: true,
            applicants: 50,
            rating: 4.7,
            views: 2100,
            remote: false,
            benefits: ["Performance Bonus", "Health Coverage", "Learning Budget"],
            companySize: "100,000+",
            industry: "Banking",
        },
        {
            id: 4,
            title: "Electric Vehicle Engineer",
            company: "Ola Electric",
            companyLogo: "OE",
            location: "Bangalore, Karnataka",
            department: "Engineering",
            type: "Full-time",
            workMode: "Remote",
            salary: "₹12,00,000 - ₹18,00,000",
            salaryMin: 1200000,
            salaryMax: 1800000,
            posted: "1 day ago",
            experience: "3-6 years",
            description: "Work on cutting-edge electric vehicle technology and battery management systems in our remote-first environment.",
            skills: ["Battery Technology", "Electric Motors", "Power Electronics", "Python", "MATLAB"],
            featured: false,
            urgentHiring: true,
            verified: true,
            applicants: 32,
            rating: 4.4,
            views: 1560,
            remote: true,
            benefits: ["Stock Options", "Remote Work", "Learning Stipend"],
            companySize: "5,000+",
            industry: "Electric Vehicles",
        },
        {
            id: 5,
            title: "Risk Management Specialist",
            company: "HDFC Bank",
            companyLogo: "HD",
            location: "Mumbai, Maharashtra",
            department: "Finance",
            type: "Full-time",
            workMode: "Hybrid",
            salary: "₹10,00,000 - ₹16,00,000",
            salaryMin: 1000000,
            salaryMax: 1600000,
            posted: "4 days ago",
            experience: "3-5 years",
            description: "Join our risk management team to assess and mitigate financial risks across various business segments.",
            skills: ["Risk Assessment", "Compliance", "Analytics", "Regulations", "Python"],
            featured: false,
            urgentHiring: false,
            verified: true,
            applicants: 18,
            rating: 4.3,
            views: 750,
            remote: false,
            benefits: ["Health Insurance", "Provident Fund", "Flexible Hours"],
            companySize: "120,000+",
            industry: "Banking",
        },
        {
            id: 6,
            title: "Automotive Manufacturing Engineer",
            company: "Maruti Suzuki",
            companyLogo: "MS",
            location: "Gurugram, Haryana",
            department: "Manufacturing",
            type: "Full-time",
            workMode: "On-site",
            salary: "₹7,00,000 - ₹11,00,000",
            salaryMin: 700000,
            salaryMax: 1100000,
            posted: "5 days ago",
            experience: "2-4 years",
            description: "Lead manufacturing process optimization and quality improvement initiatives in our state-of-the-art facility.",
            skills: ["Lean Manufacturing", "Quality Control", "Six Sigma", "Process Optimization"],
            featured: false,
            urgentHiring: false,
            verified: true,
            applicants: 12,
            rating: 4.0,
            views: 620,
            remote: false,
            benefits: ["Medical Benefits", "Transport", "Canteen"],
            companySize: "15,000+",
            industry: "Automotive",
        },
    ];

    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Gurugram'];
    const experienceLevels = ['0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years'];
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
    const salaryRanges = [
        '₹0-5L', '₹5-10L', '₹10-15L', '₹15-20L', '₹20-30L', '₹30L+'
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setJobs(mockJobs);
            setLoading(false);
        }, 1000);
    }, []);

    const handleSearch = () => {
        setLoading(true);
        // Simulate search
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const toggleFavorite = (jobId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(jobId)) {
                newFavorites.delete(jobId);
            } else {
                newFavorites.add(jobId);
            }
            return newFavorites;
        });
    };

    const toggleBookmark = (jobId) => {
        setBookmarks(prev => {
            const newBookmarks = new Set(prev);
            if (newBookmarks.has(jobId)) {
                newBookmarks.delete(jobId);
            } else {
                newBookmarks.add(jobId);
            }
            return newBookmarks;
        });
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

    const filteredJobs = jobs.filter(job => {
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
        <JobCard featured={job.featured}>
            <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                        <Avatar
                            sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                width: 56,
                                height: 56,
                                fontSize: '1.2rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {job.companyLogo}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {job.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                                    {job.company}
                                </Typography>
                                {job.verified && (
                                    <Verified sx={{ fontSize: 16, color: 'success.main' }} />
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Rating value={job.rating} precision={0.1} size="small" readOnly />
                                <Typography variant="body2" color="text.secondary">
                                    {job.rating} • {job.applicants}+ applied
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Tooltip title={favorites.has(job.id) ? 'Remove from favorites' : 'Add to favorites'}>
                            <IconButton onClick={() => toggleFavorite(job.id)} size="small">
                                {favorites.has(job.id) ? 
                                    <Favorite color="error" /> : 
                                    <FavoriteBorder />
                                }
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={bookmarks.has(job.id) ? 'Remove bookmark' : 'Bookmark job'}>
                            <IconButton onClick={() => toggleBookmark(job.id)} size="small">
                                {bookmarks.has(job.id) ? 
                                    <Bookmark color="primary" /> : 
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

                {/* Job Details */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {job.location.split(',')[0]}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {job.experience}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {job.type}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Groups sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {job.companySize}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Salary */}
                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                    {formatSalary(job.salaryMin, job.salaryMax)}
                </Typography>

                {/* Tags and Badges */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                        label={job.workMode}
                        size="small"
                        color={job.workMode === 'Remote' ? 'success' : job.workMode === 'Hybrid' ? 'warning' : 'default'}
                        icon={job.workMode === 'Remote' ? <RemoteWork /> : undefined}
                    />
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
                        label={job.posted}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                {/* Skills */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Required Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {job.skills.slice(0, 4).map((skill, index) => (
                            <Chip
                                key={index}
                                label={skill}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        ))}
                        {job.skills.length > 4 && (
                            <Chip
                                label={`+${job.skills.length - 4} more`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {job.description.substring(0, 120)}...
                </Typography>

                {/* Job Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {job.views} views
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {job.industry}
                    </Typography>
                </Box>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    component={Link}
                    href={`/job/${job.id}`}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                >
                    View Details
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    fullWidth
                >
                    Apply Now
                </Button>
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
                        <Typography>Loading jobs...</Typography>
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

            {/* Jobs Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {filteredJobs.map((job) => (
                    <Grid item xs={12} md={6} lg={4} key={job.id}>
                        <JobCardComponent job={job} />
                    </Grid>
                ))}
            </Grid>

            {filteredJobs.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Try adjusting your search criteria or filters
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

            {/* Pagination */}
            {filteredJobs.length > 0 && (
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
        </Container>
    );
};

export default JobsPage;
