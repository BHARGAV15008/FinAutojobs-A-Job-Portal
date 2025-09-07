import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';
import { Link, useLocation } from 'wouter';
import api from '../../utils/api';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Avatar, Chip, LinearProgress, IconButton, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, List, ListItem, ListItemText, ListItemAvatar,
  ListItemSecondaryAction, Divider, Paper, Tab, Tabs, Menu, Tooltip,
  useTheme, useMediaQuery, Alert, Skeleton, CircularProgress, Stack,
  Container, AppBar, Toolbar, Drawer, ListItemIcon, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Dashboard, Work, People, Analytics, Notifications, Settings,
  Add, Edit, Delete, Visibility, Search, FilterList, Schedule,
  Business, LocationOn, AttachMoney, TrendingUp, Assessment,
  Email, Phone, LinkedIn, CheckCircle, Cancel, Pending,
  ExpandMore, Close, Menu as MenuIcon, ExitToApp, AccountCircle,
  PostAdd, ManageAccounts, RateReview, BarChart, PieChart,
  ShowChart, Timeline, CalendarToday, Star, Warning, Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const RecruiterDashboardNew = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [, setLocation] = useLocation();

  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    companyName: '',
    position: '',
    linkedinUrl: ''
  });

  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    jobType: 'Full Time',
    workMode: 'Work from Office',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    skills: []
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/recruiter');
      setDashboardData(response.data);
      
      const userData = response.data.user;
      setProfileForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        companyName: userData.companyName || '',
        position: userData.position || '',
        linkedinUrl: userData.linkedinUrl || ''
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await api.put('/users/profile', profileForm);
      await loadDashboardData();
      setProfileDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const createJob = async () => {
    try {
      await api.post('/jobs', jobForm);
      await loadDashboardData();
      setJobDialogOpen(false);
      setJobForm({
        title: '',
        location: '',
        jobType: 'Full Time',
        workMode: 'Work from Office',
        salaryMin: '',
        salaryMax: '',
        description: '',
        requirements: '',
        skills: []
      });
      toast({
        title: 'Success',
        description: 'Job posted successfully'
      });
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to create job',
        variant: 'destructive'
      });
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}`, { status });
      await loadDashboardData();
      toast({
        title: 'Success',
        description: 'Application status updated'
      });
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application',
        variant: 'destructive'
      });
    }
  };

  // Navigation items
  const navigationItems = [
    { icon: <Dashboard />, label: 'Overview', value: 0 },
    { icon: <AccountCircle />, label: 'Profile', value: 1 },
    { icon: <PostAdd />, label: 'Post Job', value: 2 },
    { icon: <Notifications />, label: 'Alerts', value: 3 },
    { icon: <Edit />, label: 'Edit Posts', value: 4 },
    { icon: <ManageAccounts />, label: 'Manage Applicants', value: 5 },
    { icon: <RateReview />, label: 'Review Applications', value: 6 },
    { icon: <Analytics />, label: 'Company Analytics', value: 7 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      case 'hired': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            FinAutoJobs
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)' }}>
              {dashboardData?.user?.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {dashboardData?.user?.fullName || 'Recruiter'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Recruiter
              </Typography>
            </Box>
          </Box>
        </Box>

        <List sx={{ flex: 1, py: 2 }}>
          {navigationItems.map((item) => (
            <ListItem
              key={item.value}
              button
              selected={activeTab === item.value}
              onClick={() => setActiveTab(item.value)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            fullWidth
            startIcon={<Settings />}
            onClick={() => setSettingsOpen(true)}
            sx={{ color: 'white', justifyContent: 'flex-start', mb: 1 }}
          >
            Settings
          </Button>
          <Button
            fullWidth
            startIcon={<ExitToApp />}
            onClick={logout}
            sx={{ color: 'white', justifyContent: 'flex-start' }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {navigationItems.find(item => item.value === activeTab)?.label || 'Dashboard'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={dashboardData?.recentApplications?.filter(app => app.status === 'pending').length || 0} color="error">
                <IconButton>
                  <Notifications />
                </IconButton>
              </Badge>

              <IconButton onClick={() => setProfileDialogOpen(true)}>
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Dashboard Content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 0 && <RecruiterOverviewTab data={dashboardData} />}
              {activeTab === 1 && <RecruiterProfileTab data={dashboardData} onEdit={() => setProfileDialogOpen(true)} />}
              {activeTab === 2 && <PostJobTab onCreateJob={() => setJobDialogOpen(true)} />}
              {activeTab === 3 && <AlertsTab data={dashboardData} />}
              {activeTab === 4 && <EditPostsTab data={dashboardData} />}
              {activeTab === 5 && <ManageApplicantsTab data={dashboardData} onUpdateStatus={updateApplicationStatus} />}
              {activeTab === 6 && <ReviewApplicationsTab data={dashboardData} onUpdateStatus={updateApplicationStatus} />}
              {activeTab === 7 && <CompanyAnalyticsTab data={dashboardData} />}
            </motion.div>
          </AnimatePresence>
        </Container>
      </Box>

      {/* Profile Edit Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={profileForm.companyName}
                onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={profileForm.position}
                onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                value={profileForm.linkedinUrl}
                onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
          <Button onClick={updateProfile} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Job Creation Dialog */}
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={jobForm.jobType}
                  onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                  label="Job Type"
                >
                  <MenuItem value="Full Time">Full Time</MenuItem>
                  <MenuItem value="Part Time">Part Time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={jobForm.salaryMin}
                onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={jobForm.salaryMax}
                onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                multiline
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                multiline
                rows={3}
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialogOpen(false)}>Cancel</Button>
          <Button onClick={createJob} variant="contained">Post Job</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Recruiter Overview Tab
const RecruiterOverviewTab = ({ data }) => {
  const theme = useTheme();
  const stats = data?.stats || {};

  const statsCards = [
    {
      title: 'Active Jobs',
      value: stats.jobs?.active || 0,
      icon: <Work />,
      color: theme.palette.primary.main,
      trend: '+3 this week'
    },
    {
      title: 'Total Applications',
      value: stats.applications?.total || 0,
      icon: <People />,
      color: theme.palette.secondary.main,
      trend: '+15 this week'
    },
    {
      title: 'Pending Reviews',
      value: stats.applications?.pending || 0,
      icon: <Pending />,
      color: theme.palette.warning.main,
      trend: 'Needs attention'
    },
    {
      title: 'Hired Candidates',
      value: stats.applications?.hired || 0,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      trend: '+2 this month'
    }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {data?.user?.fullName?.split(' ')[0] || 'Recruiter'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Manage your job postings and find the best candidates for your company.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.color}20`,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip
                    label={stat.trend}
                    size="small"
                    color={stat.trend.includes('+') ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Applications
              </Typography>
              <List>
                {data?.recentApplications?.slice(0, 5).map((application, index) => (
                  <React.Fragment key={application.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {application.applicantName?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={application.applicantName}
                        secondary={`Applied for ${application.jobTitle} • ${format(parseISO(application.appliedAt), 'MMM dd, yyyy')}`}
                      />
                      <Chip
                        label={application.status}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Active Jobs
              </Typography>
              <List>
                {data?.activeJobs?.slice(0, 3).map((job) => (
                  <ListItem key={job.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <Work />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={job.title}
                      secondary={`${job.applicationsCount || 0} applications`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" startIcon={<Add />} fullWidth>
                  Post New Job
                </Button>
                <Button variant="outlined" startIcon={<People />} fullWidth>
                  Review Applications
                </Button>
                <Button variant="outlined" startIcon={<Analytics />} fullWidth>
                  View Analytics
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Import additional tab components
import {
  RecruiterProfileTab,
  PostJobTab,
  AlertsTab,
  EditPostsTab,
  ManageApplicantsTab,
  ReviewApplicationsTab,
  CompanyAnalyticsTab
} from './RecruiterDashboardTabs';

export default RecruiterDashboardNew;
