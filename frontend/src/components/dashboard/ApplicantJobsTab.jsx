import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction,
  Pagination, Skeleton, Alert, Tabs, Tab, Divider, Avatar,
  Stack, Rating, Tooltip, Badge
} from '@mui/material';
import {
  Search, FilterList, BookmarkBorder, Bookmark, LocationOn,
  Work, AttachMoney, Schedule, Business, Share, Apply,
  Visibility, Star, StarBorder, TrendingUp, NewReleases,
  AccessTime, Group, School, Language
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicantJobsTab = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    salary: '',
    company: '',
    postedDate: ''
  });
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailOpen, setJobDetailOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [jobsPerPage] = useState(6);

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "3-5 years",
      salary: "$90,000 - $120,000",
      postedDate: "2024-01-15",
      description: "We are looking for a skilled Frontend Developer to join our dynamic team...",
      requirements: ["React.js", "TypeScript", "Node.js", "GraphQL"],
      benefits: ["Health Insurance", "401k", "Remote Work", "Flexible Hours"],
      companyLogo: "/api/placeholder/40/40",
      featured: true,
      urgent: false,
      matchScore: 95,
      applicants: 45,
      views: 234
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      type: "Full-time",
      experience: "2-4 years",
      salary: "$80,000 - $110,000",
      postedDate: "2024-01-14",
      description: "Join our innovative startup as a Full Stack Engineer...",
      requirements: ["JavaScript", "Python", "AWS", "Docker"],
      benefits: ["Equity", "Health Insurance", "Learning Budget"],
      companyLogo: "/api/placeholder/40/40",
      featured: false,
      urgent: true,
      matchScore: 87,
      applicants: 23,
      views: 156
    },
    {
      id: 3,
      title: "React Developer",
      company: "Digital Agency Pro",
      location: "Remote",
      type: "Contract",
      experience: "1-3 years",
      salary: "$60 - $80/hour",
      postedDate: "2024-01-13",
      description: "Remote React Developer position for exciting client projects...",
      requirements: ["React.js", "Redux", "CSS3", "Git"],
      benefits: ["Flexible Schedule", "Remote Work", "Project Bonuses"],
      companyLogo: "/api/placeholder/40/40",
      featured: false,
      urgent: false,
      matchScore: 78,
      applicants: 67,
      views: 289
    },
    {
      id: 4,
      title: "UI/UX Developer",
      company: "Design Studios Inc",
      location: "Los Angeles, CA",
      type: "Full-time",
      experience: "2-5 years",
      salary: "$70,000 - $95,000",
      postedDate: "2024-01-12",
      description: "Creative UI/UX Developer to bring designs to life...",
      requirements: ["Figma", "HTML/CSS", "JavaScript", "Adobe Creative Suite"],
      benefits: ["Creative Environment", "Health Insurance", "Gym Membership"],
      companyLogo: "/api/placeholder/40/40",
      featured: true,
      urgent: false,
      matchScore: 82,
      applicants: 34,
      views: 178
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, filters, jobs, currentTab]);

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by tab
    if (currentTab === 1) {
      filtered = filtered.filter(job => bookmarkedJobs.has(job.id));
    } else if (currentTab === 2) {
      filtered = filtered.filter(job => job.featured);
    } else if (currentTab === 3) {
      filtered = filtered.filter(job => job.urgent);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Other filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filtered = filtered.filter(job => {
          switch (key) {
            case 'location':
              return job.location.toLowerCase().includes(filters[key].toLowerCase());
            case 'jobType':
              return job.type.toLowerCase() === filters[key].toLowerCase();
            case 'company':
              return job.company.toLowerCase().includes(filters[key].toLowerCase());
            default:
              return true;
          }
        });
      }
    });

    setFilteredJobs(filtered);
    setPage(1);
  };

  const handleBookmark = (jobId) => {
    const newBookmarked = new Set(bookmarkedJobs);
    if (newBookmarked.has(jobId)) {
      newBookmarked.delete(jobId);
    } else {
      newBookmarked.add(jobId);
    }
    setBookmarkedJobs(newBookmarked);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setJobDetailOpen(true);
  };

  const handleApply = (jobId) => {
    // Handle job application
    console.log('Applying to job:', jobId);
  };

  const paginatedJobs = filteredJobs.slice(
    (page - 1) * jobsPerPage,
    page * jobsPerPage
  );

  const JobCard = ({ job }) => (
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
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: 4
          },
          transition: 'all 0.3s ease',
          border: job.featured ? '2px solid #1976d2' : 'none'
        }}
        onClick={() => handleJobClick(job)}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={job.companyLogo} sx={{ width: 48, height: 48 }}>
                {job.company[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.company}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              {job.featured && (
                <Chip 
                  label="Featured" 
                  size="small" 
                  color="primary"
                  icon={<Star />}
                />
              )}
              {job.urgent && (
                <Chip 
                  label="Urgent" 
                  size="small" 
                  color="error"
                  icon={<NewReleases />}
                />
              )}
            </Box>
          </Box>

          <Stack spacing={1} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2">{job.location}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Work fontSize="small" color="action" />
              <Typography variant="body2">{job.type}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney fontSize="small" color="action" />
              <Typography variant="body2">{job.salary}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                Posted {new Date(job.postedDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>

          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Match Score">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {job.matchScore}% match
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Applicants">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Group fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {job.applicants}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            <Rating value={job.matchScore / 20} precision={0.1} size="small" readOnly />
          </Box>

          <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
            {job.requirements.slice(0, 3).map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small" 
                variant="outlined"
              />
            ))}
            {job.requirements.length > 3 && (
              <Chip 
                label={`+${job.requirements.length - 3} more`} 
                size="small" 
                variant="outlined"
                color="primary"
              />
            )}
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              variant="contained"
              startIcon={<Apply />}
              onClick={(e) => {
                e.stopPropagation();
                handleApply(job.id);
              }}
              size="small"
            >
              Apply Now
            </Button>
            <Box display="flex" gap={1}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark(job.id);
                }}
                color={bookmarkedJobs.has(job.id) ? "primary" : "default"}
              >
                {bookmarkedJobs.has(job.id) ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
              <IconButton size="small">
                <Share />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Browse Jobs
          </Typography>
          <Button variant="outlined" startIcon={<FilterList />}>
            Advanced Filters
          </Button>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    label="Location"
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    <MenuItem value="remote">Remote</MenuItem>
                    <MenuItem value="san francisco">San Francisco</MenuItem>
                    <MenuItem value="new york">New York</MenuItem>
                    <MenuItem value="los angeles">Los Angeles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={filters.jobType}
                    onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                    label="Job Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="full-time">Full-time</MenuItem>
                    <MenuItem value="part-time">Part-time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="internship">Internship</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Experience</InputLabel>
                  <Select
                    value={filters.experience}
                    onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    label="Experience"
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="entry">Entry Level</MenuItem>
                    <MenuItem value="mid">Mid Level</MenuItem>
                    <MenuItem value="senior">Senior Level</MenuItem>
                    <MenuItem value="executive">Executive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setFilters({
                    location: '',
                    jobType: '',
                    experience: '',
                    salary: '',
                    company: '',
                    postedDate: ''
                  })}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Job Categories Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge badgeContent={jobs.length} color="primary">
                  All Jobs
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={bookmarkedJobs.size} color="primary">
                  Bookmarked
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={jobs.filter(j => j.featured).length} color="primary">
                  Featured
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={jobs.filter(j => j.urgent).length} color="error">
                  Urgent Hiring
                </Badge>
              } 
            />
          </Tabs>
        </Card>

        {/* Results Summary */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="body1" color="text.secondary">
            Showing {paginatedJobs.length} of {filteredJobs.length} jobs
          </Typography>
          <FormControl size="small">
            <InputLabel>Sort by</InputLabel>
            <Select defaultValue="relevance" label="Sort by">
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="date">Date Posted</MenuItem>
              <MenuItem value="salary">Salary</MenuItem>
              <MenuItem value="company">Company</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Jobs Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" height={200} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredJobs.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No jobs found
            </Typography>
            <Typography>
              Try adjusting your search criteria or filters
            </Typography>
          </Alert>
        ) : (
          <AnimatePresence>
            <Grid container spacing={3}>
              {paginatedJobs.map((job) => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {filteredJobs.length > jobsPerPage && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={Math.ceil(filteredJobs.length / jobsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </motion.div>

      {/* Job Detail Dialog */}
      <Dialog
        open={jobDetailOpen}
        onClose={() => setJobDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedJob.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedJob.company}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => handleBookmark(selectedJob.id)}
                  color={bookmarkedJobs.has(selectedJob.id) ? "primary" : "default"}
                >
                  {bookmarkedJobs.has(selectedJob.id) ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Job Description
                  </Typography>
                  <Typography paragraph>
                    {selectedJob.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                    {selectedJob.requirements.map((req, index) => (
                      <Chip key={index} label={req} variant="outlined" />
                    ))}
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Benefits
                  </Typography>
                  <List dense>
                    {selectedJob.benefits.map((benefit, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={benefit} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body1">
                            {selectedJob.location}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Job Type
                          </Typography>
                          <Typography variant="body1">
                            {selectedJob.type}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Experience
                          </Typography>
                          <Typography variant="body1">
                            {selectedJob.experience}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Salary
                          </Typography>
                          <Typography variant="body1">
                            {selectedJob.salary}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Posted Date
                          </Typography>
                          <Typography variant="body1">
                            {new Date(selectedJob.postedDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setJobDetailOpen(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<Apply />}
                onClick={() => handleApply(selectedJob.id)}
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
