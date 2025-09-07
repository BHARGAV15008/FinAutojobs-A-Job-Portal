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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Pagination,
  Skeleton,
  Alert,
  Tooltip,
  Badge,
  Divider,
  Tabs,
  Tab,
  Menu,
} from '@mui/material';
import {
  Assignment,
  Business,
  Schedule,
  LocationOn,
  AttachMoney,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  CheckCircle,
  Cancel,
  Pending,
  Interview,
  Send,
  Download,
  FilterList,
  Sort,
  Refresh,
  Search,
  Clear,
  Timeline as TimelineIcon,
  Description,
  CalendarToday,
  Person,
  Email,
  Phone,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicantApplicationsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppForMenu, setSelectedAppForMenu] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: '',
    company: ''
  });

  // Sample applications data
  const sampleApplications = [
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp India',
      companyLogo: null,
      location: 'Bangalore, India',
      appliedDate: '2024-01-15',
      status: 'interview',
      stage: 'technical_round',
      salary: { min: 80000, max: 120000, currency: 'INR' },
      jobType: 'Full Time',
      workMode: 'Hybrid',
      coverLetter: 'I am excited to apply for this position...',
      resume: 'resume_v1.pdf',
      expectedSalary: 100000,
      noticePeriod: '1 month',
      statusHistory: [
        { status: 'applied', date: '2024-01-15', note: 'Application submitted' },
        { status: 'reviewed', date: '2024-01-17', note: 'Application under review' },
        { status: 'interview', date: '2024-01-20', note: 'Technical interview scheduled' }
      ],
      nextInterview: {
        date: '2024-01-25',
        time: '14:00',
        type: 'Technical Round',
        interviewer: 'John Smith',
        meetingLink: 'https://meet.google.com/abc-def-ghi'
      },
      canWithdraw: true
    },
    {
      id: 2,
      jobTitle: 'Full Stack Developer',
      company: 'StartupXYZ',
      companyLogo: null,
      location: 'Mumbai, India',
      appliedDate: '2024-01-10',
      status: 'pending',
      stage: 'application_review',
      salary: { min: 60000, max: 90000, currency: 'INR' },
      jobType: 'Full Time',
      workMode: 'Remote',
      coverLetter: 'I would love to join your innovative team...',
      resume: 'resume_v2.pdf',
      expectedSalary: 75000,
      noticePeriod: '2 weeks',
      statusHistory: [
        { status: 'applied', date: '2024-01-10', note: 'Application submitted' }
      ],
      canWithdraw: true
    },
    {
      id: 3,
      jobTitle: 'React Developer',
      company: 'WebTech Solutions',
      companyLogo: null,
      location: 'Pune, India',
      appliedDate: '2024-01-05',
      status: 'rejected',
      stage: 'final',
      salary: { min: 50000, max: 70000, currency: 'INR' },
      jobType: 'Full Time',
      workMode: 'On-site',
      coverLetter: 'I am passionate about React development...',
      resume: 'resume_v1.pdf',
      expectedSalary: 60000,
      noticePeriod: '1 month',
      statusHistory: [
        { status: 'applied', date: '2024-01-05', note: 'Application submitted' },
        { status: 'reviewed', date: '2024-01-07', note: 'Application reviewed' },
        { status: 'interview', date: '2024-01-10', note: 'First round interview' },
        { status: 'rejected', date: '2024-01-12', note: 'Position filled by another candidate' }
      ],
      feedback: 'Great technical skills, but we found a candidate with more relevant experience.',
      canWithdraw: false
    }
  ];

  const statusConfig = {
    pending: { color: 'warning', icon: <Pending />, label: 'Pending' },
    reviewed: { color: 'info', icon: <Visibility />, label: 'Reviewed' },
    interview: { color: 'primary', icon: <Interview />, label: 'Interview' },
    offered: { color: 'success', icon: <CheckCircle />, label: 'Offered' },
    hired: { color: 'success', icon: <CheckCircle />, label: 'Hired' },
    rejected: { color: 'error', icon: <Cancel />, label: 'Rejected' },
    withdrawn: { color: 'default', icon: <Cancel />, label: 'Withdrawn' }
  };

  const tabLabels = ['All Applications', 'Active', 'Interviews', 'Completed'];

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters, activeTab]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplications(sampleApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Tab-based filtering
    switch (activeTab) {
      case 1: // Active
        filtered = filtered.filter(app => ['pending', 'reviewed', 'interview'].includes(app.status));
        break;
      case 2: // Interviews
        filtered = filtered.filter(app => app.status === 'interview');
        break;
      case 3: // Completed
        filtered = filtered.filter(app => ['offered', 'hired', 'rejected', 'withdrawn'].includes(app.status));
        break;
      default: // All
        break;
    }

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(app =>
        app.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.company.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Company filter
    if (filters.company) {
      filtered = filtered.filter(app =>
        app.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleWithdrawApplication = async (applicationId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? {
                ...app,
                status: 'withdrawn',
                canWithdraw: false,
                statusHistory: [
                  ...app.statusHistory,
                  { status: 'withdrawn', date: new Date().toISOString().split('T')[0], note: 'Application withdrawn by candidate' }
                ]
              }
            : app
        )
      );
      
      setAnchorEl(null);
      setSelectedAppForMenu(null);
    } catch (error) {
      console.error('Error withdrawing application:', error);
    }
  };

  const formatSalary = (salary) => {
    const { min, max, currency } = salary;
    const formatAmount = (amount) => {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)}L`;
      }
      return `${(amount / 1000).toFixed(0)}K`;
    };
    
    return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const applied = new Date(dateString);
    const diffTime = Math.abs(now - applied);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleMenuOpen = (event, application) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppForMenu(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppForMenu(null);
  };

  // Pagination
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const ApplicationCard = ({ application }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
          }
        }}
        onClick={() => setSelectedApplication(application)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={application.companyLogo}
                sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
              >
                {application.company[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {application.jobTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {application.company}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Applied {getTimeAgo(application.appliedDate)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={statusConfig[application.status].label}
                color={statusConfig[application.status].color}
                icon={statusConfig[application.status].icon}
                size="small"
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, application);
                }}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              icon={<LocationOn />}
              label={application.location}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<AttachMoney />}
              label={formatSalary(application.salary)}
              size="small"
              variant="outlined"
              color="success"
            />
            <Chip
              label={application.workMode}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>

          {application.nextInterview && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Upcoming Interview:</strong> {application.nextInterview.type} on{' '}
                {new Date(application.nextInterview.date).toLocaleDateString()} at{' '}
                {application.nextInterview.time}
              </Typography>
            </Alert>
          )}

          {application.feedback && application.status === 'rejected' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Feedback:</strong> {application.feedback}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Card key={item} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="30%" height={16} />
                </Box>
                <Skeleton variant="rectangular" width={80} height={24} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {applications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {applications.filter(app => ['pending', 'reviewed', 'interview'].includes(app.status)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {applications.filter(app => app.status === 'interview').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interviews Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {Math.round((applications.filter(app => ['offered', 'hired'].includes(app.status)).length / applications.length) * 100) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Filters */}
      <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
          >
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search applications..."
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
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      {config.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Company"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadApplications}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 0 ? "You haven't applied to any jobs yet." : "No applications match the current filter."}
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {currentApplications.length} of {filteredApplications.length} applications
          </Typography>
          
          <AnimatePresence>
            {currentApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </>
      )}

      {/* Application Detail Dialog */}
      <Dialog
        open={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedApplication.companyLogo}
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {selectedApplication.company[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedApplication.jobTitle}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedApplication.company}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Application Details
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Applied Date"
                        secondary={new Date(selectedApplication.appliedDate).toLocaleDateString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={statusConfig[selectedApplication.status].label}
                            color={statusConfig[selectedApplication.status].color}
                            icon={statusConfig[selectedApplication.status].icon}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Expected Salary"
                        secondary={`₹${(selectedApplication.expectedSalary / 100000).toFixed(1)}L per year`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Notice Period"
                        secondary={selectedApplication.noticePeriod}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Resume"
                        secondary={
                          <Button
                            size="small"
                            startIcon={<Download />}
                            onClick={() => {/* Handle resume download */}}
                          >
                            {selectedApplication.resume}
                          </Button>
                        }
                      />
                    </ListItem>
                  </List>

                  {selectedApplication.nextInterview && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Next Interview
                      </Typography>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {selectedApplication.nextInterview.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            {new Date(selectedApplication.nextInterview.date).toLocaleDateString()} at {selectedApplication.nextInterview.time}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            Interviewer: {selectedApplication.nextInterview.interviewer}
                          </Typography>
                          {selectedApplication.nextInterview.meetingLink && (
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1 }}
                              onClick={() => window.open(selectedApplication.nextInterview.meetingLink, '_blank')}
                            >
                              Join Meeting
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Application Timeline
                  </Typography>
                  
                  <Box sx={{ position: 'relative', pl: 3 }}>
                    {selectedApplication.statusHistory.map((event, index) => (
                      <Box key={index} sx={{ display: 'flex', mb: 3, position: 'relative' }}>
                        {/* Timeline Line */}
                        {index < selectedApplication.statusHistory.length - 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 15,
                              top: 32,
                              width: 2,
                              height: 40,
                              bgcolor: 'divider'
                            }}
                          />
                        )}
                        
                        {/* Timeline Dot */}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: `${statusConfig[event.status]?.color || 'grey'}.main`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            mr: 2,
                            zIndex: 1
                          }}
                        >
                          {statusConfig[event.status]?.icon || <TimelineIcon />}
                        </Box>
                        
                        {/* Timeline Content */}
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {statusConfig[event.status]?.label || event.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(event.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {event.note}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>
                
                {selectedApplication.coverLetter && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Cover Letter
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {selectedApplication.coverLetter}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
              {selectedApplication.canWithdraw && (
                <Button
                  color="error"
                  onClick={() => handleWithdrawApplication(selectedApplication.id)}
                >
                  Withdraw Application
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setSelectedApplication(selectedAppForMenu);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 2 }} />
          View Details
        </MenuItem>
        {selectedAppForMenu?.canWithdraw && (
          <MenuItem
            onClick={() => {
              handleWithdrawApplication(selectedAppForMenu.id);
            }}
            sx={{ color: 'error.main' }}
          >
            <Cancel sx={{ mr: 2 }} />
            Withdraw Application
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ApplicantApplicationsTab;
