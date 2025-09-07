import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';
import { Link, useLocation } from 'wouter';
import api from '../../utils/api';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Tab,
  Tabs,
  Menu,
  Tooltip,
  Fab,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle,
  Skeleton,
  CircularProgress,
  Stack,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Container,
  AppBar,
  Toolbar,
  Drawer,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Breadcrumbs,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Dashboard,
  Person,
  Work,
  Bookmark,
  Notifications,
  Settings,
  TrendingUp,
  Search,
  FilterList,
  GetApp,
  CloudUpload,
  Edit,
  Delete,
  Visibility,
  Schedule,
  LocationOn,
  AttachMoney,
  Business,
  School,
  Code,
  Language,
  GitHub,
  LinkedIn,
  Email,
  Phone,
  Star,
  StarBorder,
  CheckCircle,
  Cancel,
  Pending,
  Assignment,
  Assessment,
  CalendarToday,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  Refresh,
  Add,
  ExpandMore,
  Close,
  Menu as MenuIcon,
  Home,
  ExitToApp,
  AccountCircle,
  WorkOutline,
  BookmarkBorder,
  NotificationsNone,
  SettingsOutlined,
  DarkMode,
  LightMode,
  FontDownload,
  Palette,
  Language as LanguageIcon,
  Security,
  Help,
  Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

const ApplicantDashboardNew = () => {
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
  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    dashboardLayout: 'grid'
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    qualification: '',
    experienceYears: 0,
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: ''
  });

  // Filters and pagination
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    loadUserPreferences();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/applicant');
      setDashboardData(response.data);
      
      // Initialize profile form with user data
      const userData = response.data.user;
      setProfileForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        qualification: userData.qualification || '',
        experienceYears: userData.experienceYears || 0,
        linkedinUrl: userData.linkedinUrl || '',
        githubUrl: userData.githubUrl || '',
        portfolioUrl: userData.portfolioUrl || ''
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

  const loadUserPreferences = async () => {
    try {
      const response = await api.get('/dashboard/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await api.put('/dashboard/preferences', newPreferences);
      setPreferences(newPreferences);
      toast({
        title: 'Success',
        description: 'Preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive'
      });
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

  const withdrawApplication = async (applicationId) => {
    try {
      await api.delete(`/applications/${applicationId}`);
      await loadDashboardData();
      toast({
        title: 'Success',
        description: 'Application withdrawn successfully'
      });
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast({
        title: 'Error',
        description: 'Failed to withdraw application',
        variant: 'destructive'
      });
    }
  };

  const toggleSaveJob = async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${jobId}`);
      } else {
        await api.post('/saved-jobs', { jobId });
      }
      await loadDashboardData();
      toast({
        title: 'Success',
        description: isSaved ? 'Job removed from favorites' : 'Job added to favorites'
      });
    } catch (error) {
      console.error('Error toggling saved job:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved job',
        variant: 'destructive'
      });
    }
  };

  // Navigation items
  const navigationItems = [
    { icon: <Dashboard />, label: 'Overview', value: 0 },
    { icon: <Person />, label: 'Profile', value: 1 },
    { icon: <TrendingUp />, label: 'Recommended', value: 2 },
    { icon: <Bookmark />, label: 'Favorites', value: 3 },
    { icon: <Assignment />, label: 'Applications', value: 4 },
    { icon: <CloudUpload />, label: 'Resume', value: 5 },
    { icon: <Search />, label: 'Browse Jobs', value: 6 },
    { icon: <Notifications />, label: 'Job Alerts', value: 7 },
    { icon: <Schedule />, label: 'Interviews', value: 8 },
    { icon: <BarChart />, label: 'Analytics', value: 9 }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'reviewed': return <Visibility />;
      case 'shortlisted': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'hired': return <Star />;
      default: return <Assignment />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  const formatSalary = (min, max, currency = 'INR') => {
    if (!min && !max) return 'Not specified';
    const formatAmount = (amount) => {
      if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return amount.toString();
    };
    
    if (min && max) {
      return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
    }
    return `₹${formatAmount(min || max)}`;
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            FinAutoJobs
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={dashboardData?.user?.profilePicture}
              sx={{ width: 48, height: 48 }}
            >
              {dashboardData?.user?.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {dashboardData?.user?.fullName || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Job Seeker
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
              <IconButton onClick={() => loadDashboardData()}>
                <Refresh />
              </IconButton>
              
              <Badge badgeContent={dashboardData?.notifications?.filter(n => !n.isRead).length || 0} color="error">
                <IconButton>
                  <NotificationsNone />
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
              {activeTab === 0 && <OverviewTab data={dashboardData} />}
              {activeTab === 1 && <ProfileTab data={dashboardData} onEdit={() => setProfileDialogOpen(true)} />}
              {activeTab === 2 && <RecommendedTab data={dashboardData} onToggleSave={toggleSaveJob} />}
              {activeTab === 3 && <FavoritesTab data={dashboardData} onToggleSave={toggleSaveJob} />}
              {activeTab === 4 && <ApplicationsTab data={dashboardData} onWithdraw={withdrawApplication} filter={applicationFilter} setFilter={setApplicationFilter} />}
              {activeTab === 5 && <ResumeTab data={dashboardData} />}
              {activeTab === 6 && <BrowseJobsTab searchQuery={jobSearchQuery} setSearchQuery={setJobSearchQuery} />}
              {activeTab === 7 && <JobAlertsTab />}
              {activeTab === 8 && <InterviewsTab data={dashboardData} />}
              {activeTab === 9 && <AnalyticsTab data={dashboardData} />}
            </motion.div>
          </AnimatePresence>
        </Container>
      </Box>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
      />

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        onSave={updateProfile}
      />

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Browse Jobs"
          onClick={() => setActiveTab(6)}
        />
        <SpeedDialAction
          icon={<CloudUpload />}
          tooltipTitle="Update Resume"
          onClick={() => setActiveTab(5)}
        />
        <SpeedDialAction
          icon={<Edit />}
          tooltipTitle="Edit Profile"
          onClick={() => setProfileDialogOpen(true)}
        />
      </SpeedDial>
    </Box>
  );
};

// Overview Tab Component
const OverviewTab = ({ data }) => {
  const theme = useTheme();

  const statsCards = [
    {
      title: 'Applications',
      value: data?.stats?.applications?.total || 0,
      icon: <Assignment />,
      color: theme.palette.primary.main,
      trend: '+12%'
    },
    {
      title: 'Saved Jobs',
      value: data?.stats?.savedJobs || 0,
      icon: <Bookmark />,
      color: theme.palette.secondary.main,
      trend: '+5%'
    },
    {
      title: 'Profile Views',
      value: data?.stats?.profileViews || 0,
      icon: <Visibility />,
      color: theme.palette.success.main,
      trend: '+8%'
    },
    {
      title: 'Profile Completion',
      value: `${data?.stats?.profileCompletion || 0}%`,
      icon: <Person />,
      color: theme.palette.warning.main,
      trend: data?.stats?.profileCompletion >= 80 ? 'Complete' : 'Incomplete'
    }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {data?.user?.fullName?.split(' ')[0] || 'User'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Here's what's happening with your job search today.
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
                  border: '1px solid',
                  borderColor: 'divider',
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
                          <Work />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={application.jobTitle}
                        secondary={`${application.companyName} • ${formatDate(application.appliedAt)}`}
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
                Upcoming Interviews
              </Typography>
              {data?.upcomingInterviews?.length > 0 ? (
                <List>
                  {data.upcomingInterviews.slice(0, 3).map((interview, index) => (
                    <ListItem key={interview.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <Schedule />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={interview.title}
                        secondary={`${formatDate(interview.scheduledAt)} • ${interview.type}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming interviews
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Search />}
                  fullWidth
                  onClick={() => setActiveTab(6)}
                >
                  Browse Jobs
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  onClick={() => setActiveTab(5)}
                >
                  Update Resume
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  fullWidth
                  onClick={() => setProfileDialogOpen(true)}
                >
                  Edit Profile
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
  BrowseJobsTab, 
  JobAlertsTab, 
  InterviewsTab, 
  AnalyticsTab 
} from './ApplicantDashboardTabs';

import {
  ProfileTab,
  RecommendedTab,
  FavoritesTab,
  ApplicationsTab,
  ResumeTab,
  SettingsDialog,
  ProfileEditDialog
} from './DashboardTabs';

export default ApplicantDashboardNew;
