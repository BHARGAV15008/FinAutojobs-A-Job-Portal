import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, Chip,
  TextField, Select, MenuItem, FormControl, InputLabel, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, Badge, Tooltip, Stack, OutlinedInput,
  InputAdornment, Divider, useTheme, motion, Alert, AlertTitle,
  Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem as MenuItemComponent,
  useMediaQuery
} from '@mui/material';
import {
  Search, FilterList, ViewList, ViewModule, LocationOn, AttachMoney,
  Schedule, Business, Work, Star, StarBorder, Bookmark, BookmarkBorder,
  ArrowForward, MoreVert, Refresh, Clear, Sort, ArrowUpward, ArrowDownward,
  Description, Public, Timer, CheckCircle, HourglassEmpty
} from '@mui/icons-material';

const ApplicantJobsTab = ({ user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    salary: '',
    workMode: ''
  });
  const [sortBy, setSortBy] = useState('posted');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [jobsPerPage] = useState(12);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(null);

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120,000 - $180,000',
      jobType: 'Full-time',
      workMode: 'Remote',
      experience: '3-5 years',
      posted: '2 days ago',
      deadline: '2024-02-15',
      applicants: 45,
      skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
      description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
      isBookmarked: false,
      isApplied: false,
      matchScore: 92,
      companyLogo: null,
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Flexible Hours']
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      salary: '$100,000 - $150,000',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      experience: '2-4 years',
      posted: '1 week ago',
      deadline: '2024-02-20',
      applicants: 32,
      skills: ['React', 'Python', 'MongoDB', 'AWS'],
      description: 'Join our fast-growing startup as a Full Stack Developer...',
      isBookmarked: true,
      isApplied: false,
      matchScore: 88,
      companyLogo: null,
      benefits: ['Equity', 'Health Insurance', 'Learning Budget']
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$130,000 - $190,000',
      jobType: 'Full-time',
      workMode: 'On-site',
      experience: '4+ years',
      posted: '3 days ago',
      deadline: '2024-02-10',
      applicants: 128,
      skills: ['React', 'JavaScript', 'TypeScript', 'GraphQL'],
      description: 'Google is seeking a talented React Developer to work on innovative products...',
      isBookmarked: false,
      isApplied: true,
      matchScore: 95,
      companyLogo: null,
      benefits: ['Premium Health', 'Free Meals', 'Gym Access', 'Stock Options']
    }
  ];

  const [jobs, setJobs] = useState(mockJobs);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleBookmark = (jobId) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));
  };

  const handleApply = (jobId) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isApplied: true } : job
    ));
    console.log('Applying to job:', jobId);
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      jobType: '',
      experience: '',
      salary: '',
      workMode: ''
    });
    setSearchTerm('');
  };

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilters = 
      (filters.location === '' || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.jobType === '' || job.jobType === filters.jobType) &&
      (filters.experience === '' || job.experience.includes(filters.experience)) &&
      (filters.workMode === '' || job.workMode === filters.workMode);
    
    return matchesSearch && matchesFilters;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'salary':
        aValue = parseInt(a.salary.replace(/[^0-9]/g, ''));
        bValue = parseInt(b.salary.replace(/[^0-9]/g, ''));
        break;
      case 'posted':
        aValue = new Date(a.posted);
        bValue = new Date(b.posted);
        break;
      case 'match':
        aValue = a.matchScore;
        bValue = b.matchScore;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastJob = page * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = sortedJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);

  const JobCard = ({ job }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {job.title}
              </Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {job.company}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={`${job.matchScore}% match`} 
                color="success" 
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <IconButton
                onClick={() => handleBookmark(job.id)}
                color={job.isBookmarked ? 'primary' : 'default'}
              >
                {job.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              icon={<LocationOn fontSize="small" />}
              label={job.location}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<AttachMoney fontSize="small" />}
              label={job.salary}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Schedule fontSize="small" />}
              label={job.jobType}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Public fontSize="small" />}
              label={job.workMode}
              size="small"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {job.description.substring(0, 120)}...
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {job.skills.slice(0, 4).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {job.skills.length > 4 && (
              <Chip
                label={`+${job.skills.length - 4} more`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary">
              Posted {job.posted} • {job.applicants} applicants
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleViewDetails(job)}
              >
                View Details
              </Button>
              {!job.isApplied ? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleApply(job.id)}
                >
                  Apply
                </Button>
              ) : (
                <Chip
                  icon={<CheckCircle />}
                  label="Applied"
                  color="success"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const JobListItem = ({ job }) => (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40 }}>
            {job.company?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {job.title}
            </Typography>
            <Typography variant="body2" color="primary">
              {job.company}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>{job.location}</TableCell>
      <TableCell>{job.salary}</TableCell>
      <TableCell>
        <Chip
          label={job.workMode}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={`${job.matchScore}% match`}
          color="success"
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {job.posted}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleBookmark(job.id)}
            color={job.isBookmarked ? 'primary' : 'default'}
          >
            {job.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
          {!job.isApplied ? (
            <Button
              size="small"
              variant="contained"
              onClick={() => handleApply(job.id)}
            >
              Apply
            </Button>
          ) : (
            <Chip
              icon={<CheckCircle />}
              label="Applied"
              color="success"
              size="small"
            />
          )}
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Box>
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} size="small">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={(e) => setFilterMenuOpen(e.currentTarget)}
                >
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  onClick={(e) => setSortMenuOpen(e.currentTarget)}
                >
                  Sort
                </Button>
                <Button
                  variant="outlined"
                  startIcon={viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? 'List' : 'Grid'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {filteredJobs.length} jobs found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={clearFilters}
          disabled={!searchTerm && Object.values(filters).every(v => v === '')}
        >
          Clear Filters
        </Button>
      </Box>

      {/* Jobs Grid/List */}
      {filteredJobs.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>No jobs found</AlertTitle>
          Try adjusting your search criteria or filters to find more opportunities.
        </Alert>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {currentJobs.map((job) => (
                <Grid item xs={12} sm={6} md={4} key={job.id}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Work Mode</TableCell>
                    <TableCell>Match</TableCell>
                    <TableCell>Posted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentJobs.map((job) => (
                    <JobListItem key={job.id} job={job} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* Job Details Dialog */}
      <Dialog
        open={jobDetailsOpen}
        onClose={() => setJobDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight="bold">
                {selectedJob.title}
              </Typography>
              <Typography variant="subtitle1" color="primary">
                {selectedJob.company}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Job Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" />
                      <Typography>{selectedJob.location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney fontSize="small" />
                      <Typography>{selectedJob.salary}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" />
                      <Typography>{selectedJob.jobType}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Public fontSize="small" />
                      <Typography>{selectedJob.workMode}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Application Info
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Timer fontSize="small" />
                      <Typography>Deadline: {selectedJob.deadline}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work fontSize="small" />
                      <Typography>Experience: {selectedJob.experience}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description fontSize="small" />
                      <Typography>{selectedJob.applicants} applicants</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star fontSize="small" />
                      <Typography>{selectedJob.matchScore}% match</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedJob.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Required Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedJob.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Benefits
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedJob.benefits.map((benefit, index) => (
                      <Chip
                        key={index}
                        label={benefit}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setJobDetailsOpen(false)}>
                Close
              </Button>
              {!selectedJob.isApplied ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleApply(selectedJob.id);
                    setJobDetailsOpen(false);
                  }}
                >
                  Apply Now
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircle />}
                  disabled
                >
                  Already Applied
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ApplicantJobsTab;
