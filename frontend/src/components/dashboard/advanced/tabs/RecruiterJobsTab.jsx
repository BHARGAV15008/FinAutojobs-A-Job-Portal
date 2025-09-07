import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Pagination,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Work,
  LocationOn,
  AttachMoney,
  Schedule,
  People,
  Search,
  FilterList,
  Share,
  ContentCopy,
  Pause,
  PlayArrow,
  Archive,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const RecruiterJobsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(6);

  const sampleJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Mumbai, India',
      type: 'Full-time',
      workMode: 'Hybrid',
      salary: '₹15-25 LPA',
      status: 'active',
      applications: 45,
      views: 234,
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      description: 'We are looking for an experienced Frontend Developer to join our team...',
      requirements: ['React', 'JavaScript', 'TypeScript', 'CSS'],
      benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work'],
      experience: '3-5 years'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      department: 'Engineering',
      location: 'Bangalore, India',
      type: 'Full-time',
      workMode: 'Remote',
      salary: '₹18-30 LPA',
      status: 'active',
      applications: 38,
      views: 189,
      postedDate: '2024-01-20',
      deadline: '2024-02-20',
      description: 'Join our dynamic team as a Full Stack Engineer...',
      requirements: ['Node.js', 'React', 'MongoDB', 'AWS'],
      benefits: ['Health Insurance', 'Stock Options', 'Learning Budget'],
      experience: '4-6 years'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Delhi, India',
      type: 'Full-time',
      workMode: 'On-site',
      salary: '₹12-20 LPA',
      status: 'draft',
      applications: 0,
      views: 0,
      postedDate: '2024-01-25',
      deadline: '2024-02-25',
      description: 'We need a creative UI/UX Designer to enhance user experience...',
      requirements: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      benefits: ['Health Insurance', 'Creative Environment', 'Flexible Hours'],
      experience: '2-4 years'
    }
  ];

  const tabLabels = ['All Jobs', 'Active', 'Draft', 'Closed', 'Archived'];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobs(sampleJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { color: 'success', label: 'Active' },
      draft: { color: 'warning', label: 'Draft' },
      closed: { color: 'error', label: 'Closed' },
      paused: { color: 'info', label: 'Paused' },
      archived: { color: 'default', label: 'Archived' }
    };
    return configs[status] || configs.draft;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesTab = activeTab === 0 || 
                      (activeTab === 1 && job.status === 'active') ||
                      (activeTab === 2 && job.status === 'draft') ||
                      (activeTab === 3 && job.status === 'closed') ||
                      (activeTab === 4 && job.status === 'archived');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const handleJobAction = (action, job) => {
    switch (action) {
      case 'edit':
        setSelectedJob(job);
        setShowJobDialog(true);
        break;
      case 'view':
        setSelectedJob(job);
        break;
      case 'duplicate':
        const duplicatedJob = { ...job, id: Date.now(), title: `${job.title} (Copy)`, status: 'draft' };
        setJobs(prev => [...prev, duplicatedJob]);
        setSnackbar({ open: true, message: 'Job duplicated successfully!', severity: 'success' });
        break;
      case 'pause':
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'paused' } : j));
        setSnackbar({ open: true, message: 'Job paused successfully!', severity: 'info' });
        break;
      case 'activate':
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'active' } : j));
        setSnackbar({ open: true, message: 'Job activated successfully!', severity: 'success' });
        break;
      case 'archive':
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'archived' } : j));
        setSnackbar({ open: true, message: 'Job archived successfully!', severity: 'info' });
        break;
      case 'delete':
        setJobs(prev => prev.filter(j => j.id !== job.id));
        setSnackbar({ open: true, message: 'Job deleted successfully!', severity: 'success' });
        break;
      default:
        break;
    }
    setAnchorEl(null);
  };

  const JobCard = ({ job }) => {
    const statusConfig = getStatusConfig(job.status);
    
    return (
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
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          }}
          onClick={() => setSelectedJob(job)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {job.department}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  size="small"
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                    setSelectedJob(job);
                  }}
                >
                  <MoreVert />
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
              />
              <Chip
                icon={<AttachMoney />}
                label={job.salary}
                size="small"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Posted: {new Date(job.postedDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2">
                  <Visibility sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {job.views} views
                </Typography>
                <Typography variant="body2">
                  <People sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {job.applications} applications
                </Typography>
              </Box>
              
              <Button size="small" variant="outlined">
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 200, bgcolor: 'grey.200', borderRadius: 1 }} />
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Job Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, manage, and track your job postings
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedJob(null);
            setShowJobDialog(true);
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          Post New Job
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Jobs Grid */}
      {paginatedJobs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start by posting your first job'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedJob(null);
              setShowJobDialog(true);
            }}
          >
            Post New Job
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <JobCard job={job} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredJobs.length > jobsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(filteredJobs.length / jobsPerPage)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Job Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleJobAction('edit', selectedJob)}>
          <Edit sx={{ mr: 1 }} /> Edit Job
        </MenuItem>
        <MenuItem onClick={() => handleJobAction('duplicate', selectedJob)}>
          <ContentCopy sx={{ mr: 1 }} /> Duplicate
        </MenuItem>
        <MenuItem onClick={() => handleJobAction('share', selectedJob)}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
        <Divider />
        {selectedJob?.status === 'active' ? (
          <MenuItem onClick={() => handleJobAction('pause', selectedJob)}>
            <Pause sx={{ mr: 1 }} /> Pause Job
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleJobAction('activate', selectedJob)}>
            <PlayArrow sx={{ mr: 1 }} /> Activate Job
          </MenuItem>
        )}
        <MenuItem onClick={() => handleJobAction('archive', selectedJob)}>
          <Archive sx={{ mr: 1 }} /> Archive
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleJobAction('delete', selectedJob)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Job Detail/Edit Dialog */}
      <Dialog
        open={showJobDialog}
        onClose={() => setShowJobDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedJob ? 'Edit Job' : 'Post New Job'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                defaultValue={selectedJob?.title || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  defaultValue={selectedJob?.department || ''}
                  label="Department"
                >
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                defaultValue={selectedJob?.location || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  defaultValue={selectedJob?.type || ''}
                  label="Job Type"
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Work Mode</InputLabel>
                <Select
                  defaultValue={selectedJob?.workMode || ''}
                  label="Work Mode"
                >
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="On-site">On-site</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salary Range"
                defaultValue={selectedJob?.salary || ''}
                placeholder="e.g., ₹15-25 LPA"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                defaultValue={selectedJob?.description || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJobDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            {selectedJob ? 'Update Job' : 'Post Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecruiterJobsTab;
