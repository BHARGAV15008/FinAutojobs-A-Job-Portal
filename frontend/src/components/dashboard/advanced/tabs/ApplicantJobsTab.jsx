import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Pagination,
  Skeleton,
  Alert,
  Tooltip,
  Badge,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Bookmark,
  BookmarkBorder,
  LocationOn,
  Work,
  Schedule,
  AttachMoney,
  Business,
  ExpandMore,
  Clear,
  Refresh,
  ViewList,
  ViewModule,
  Star,
  TrendingUp,
  AccessTime,
  People,
  Verified,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicantJobsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    workMode: '',
    salaryRange: [0, 200000],
    experience: '',
    company: '',
    skills: [],
    postedDate: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Sample job data
  const sampleJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp India',
      location: 'Bangalore, India',
      workMode: 'Hybrid',
      jobType: 'Full Time',
      salary: { min: 80000, max: 120000, currency: 'INR', type: 'annual' },
      experience: { min: 3, max: 5 },
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
      description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
      postedDate: '2024-01-15',
      applicants: 45,
      isUrgent: false,
      isFeatured: true,
      companyLogo: null,
      matchScore: 95
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Mumbai, India',
      workMode: 'Remote',
      jobType: 'Full Time',
      salary: { min: 60000, max: 90000, currency: 'INR', type: 'annual' },
      experience: { min: 2, max: 4 },
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      description: 'Join our innovative startup as a Full Stack Developer...',
      postedDate: '2024-01-12',
      applicants: 23,
      isUrgent: true,
      isFeatured: false,
      companyLogo: null,
      matchScore: 88
    },
    // Add more sample jobs...
  ];

  // Filter options
  const jobTypeOptions = ['Full Time', 'Part Time', 'Contract', 'Internship'];
  const workModeOptions = ['Remote', 'Hybrid', 'On-site'];
  const experienceOptions = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];
  const postedDateOptions = ['Last 24 hours', 'Last 3 days', 'Last week', 'Last month'];

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobs(sampleJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter(job => job.jobType === filters.jobType);
    }

    // Work mode filter
    if (filters.workMode) {
      filtered = filtered.filter(job => job.workMode === filters.workMode);
    }

    // Salary range filter
    filtered = filtered.filter(job =>
      job.salary.min >= filters.salaryRange[0] && job.salary.max <= filters.salaryRange[1]
    );

    // Experience filter
    if (filters.experience) {
      const [minExp, maxExp] = filters.experience.split('-').map(exp => parseInt(exp.replace(/\D/g, '')) || 0);
      filtered = filtered.filter(job =>
        job.experience.min <= maxExp && job.experience.max >= minExp
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(job =>
        filters.skills.some(skill => job.skills.includes(skill))
      );
    }

    // Posted date filter
    if (filters.postedDate) {
      const now = new Date();
      let dateThreshold;
      
      switch (filters.postedDate) {
        case 'Last 24 hours':
          dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'Last 3 days':
          dateThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case 'Last week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Last month':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = null;
      }
      
      if (dateThreshold) {
        filtered = filtered.filter(job => new Date(job.postedDate) >= dateThreshold);
      }
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      workMode: '',
      salaryRange: [0, 200000],
      experience: '',
      company: '',
      skills: [],
      postedDate: ''
    });
  };

  const toggleBookmark = (jobId) => {
    setBookmarkedJobs(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(jobId)) {
        newBookmarks.delete(jobId);
      } else {
        newBookmarks.add(jobId);
      }
      return newBookmarks;
    });
  };

  const formatSalary = (salary) => {
    const { min, max, currency, type } = salary;
    const formatAmount = (amount) => {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)}L`;
      }
      return `${(amount / 1000).toFixed(0)}K`;
    };
    
    return `₹${formatAmount(min)} - ₹${formatAmount(max)} ${type === 'annual' ? 'per year' : 'per month'}`;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const JobCard = ({ job, isListView = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: job.isFeatured ? '2px solid' : '1px solid',
          borderColor: job.isFeatured ? 'primary.main' : 'divider',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
          position: 'relative',
          overflow: 'visible'
        }}
        onClick={() => setSelectedJob(job)}
      >
        {/* Urgent/Featured badges */}
        {(job.isUrgent || job.isFeatured) && (
          <Box sx={{ position: 'absolute', top: -8, left: 16, zIndex: 1 }}>
            {job.isUrgent && (
              <Chip
                label="Urgent"
                size="small"
                color="error"
                sx={{ mr: 1, fontWeight: 'bold' }}
              />
            )}
            {job.isFeatured && (
              <Chip
                label="Featured"
                size="small"
                color="primary"
                icon={<Star />}
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
        )}

        <CardContent sx={{ p: 3, pt: job.isUrgent || job.isFeatured ? 4 : 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={job.companyLogo}
                sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
              >
                {job.company[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.company}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {job.matchScore && (
                <Chip
                  label={`${job.matchScore}% match`}
                  size="small"
                  color="success"
                  icon={<TrendingUp />}
                />
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(job.id);
                }}
                color={bookmarkedJobs.has(job.id) ? 'primary' : 'default'}
              >
                {bookmarkedJobs.has(job.id) ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              icon={<LocationOn />}
              label={job.location}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Work />}
              label={job.workMode}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              icon={<Schedule />}
              label={job.jobType}
              size="small"
              variant="outlined"
              color="secondary"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            {job.description.substring(0, 120)}...
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {job.skills.slice(0, 4).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{ bgcolor: 'primary.50', color: 'primary.main' }}
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

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {formatSalary(job.salary)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {job.experience.min}-{job.experience.max} years exp
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 14 }} />
                {getTimeAgo(job.postedDate)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <People sx={{ fontSize: 14 }} />
                {job.applicants} applicants
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" width="100%" height={200} />
                  <Skeleton variant="text" sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Search and Filters Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search jobs, companies, or skills..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: filters.search && (
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <Clear />
                  </IconButton>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ borderRadius: 3 }}
              >
                Filters
              </Button>
              
              <IconButton
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
              >
                {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
              </IconButton>
              
              <IconButton
                onClick={loadJobs}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    label="Job Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {jobTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    value={filters.workMode}
                    onChange={(e) => handleFilterChange('workMode', e.target.value)}
                    label="Work Mode"
                  >
                    <MenuItem value="">All Modes</MenuItem>
                    {workModeOptions.map((mode) => (
                      <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Experience</InputLabel>
                  <Select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    label="Experience"
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    {experienceOptions.map((exp) => (
                      <MenuItem key={exp} value={exp}>{exp}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Posted</InputLabel>
                  <Select
                    value={filters.postedDate}
                    onChange={(e) => handleFilterChange('postedDate', e.target.value)}
                    label="Posted"
                  >
                    <MenuItem value="">Any time</MenuItem>
                    {postedDateOptions.map((date) => (
                      <MenuItem key={date} value={date}>{date}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Salary Range: ₹{(filters.salaryRange[0] / 1000).toFixed(0)}K - ₹{(filters.salaryRange[1] / 100000).toFixed(1)}L per year
                </Typography>
                <Slider
                  value={filters.salaryRange}
                  onChange={(e, newValue) => handleFilterChange('salaryRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={500000}
                  step={10000}
                  valueLabelFormat={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {filteredJobs.length} jobs found
                  </Typography>
                  <Button
                    onClick={clearFilters}
                    size="small"
                    startIcon={<Clear />}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {filteredJobs.length} Jobs Found
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {totalPages}
          </Typography>
        </Box>
      </Box>

      {/* Jobs Grid/List */}
      {filteredJobs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search criteria or filters
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentJobs.map((job) => (
              <Grid
                item
                xs={12}
                md={viewMode === 'grid' ? 6 : 12}
                lg={viewMode === 'grid' ? 4 : 12}
                key={job.id}
              >
                <JobCard job={job} isListView={viewMode === 'list'} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Job Detail Dialog */}
      <Dialog
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {selectedJob.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedJob.company}
                  </Typography>
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(selectedJob.id);
                  }}
                  color={bookmarkedJobs.has(selectedJob.id) ? 'primary' : 'default'}
                >
                  {bookmarkedJobs.has(selectedJob.id) ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn color="action" />
                      <Typography variant="body2">{selectedJob.location}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Work color="action" />
                      <Typography variant="body2">{selectedJob.workMode} • {selectedJob.jobType}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachMoney color="action" />
                      <Typography variant="body2">{formatSalary(selectedJob.salary)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <People color="action" />
                      <Typography variant="body2">{selectedJob.applicants} applicants</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedJob.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Required Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {selectedJob.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Experience Required
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedJob.experience.min}-{selectedJob.experience.max} years of relevant experience
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button
                variant="contained"
                size="large"
                sx={{ minWidth: 120 }}
              >
                Apply Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ApplicantJobsTab;
