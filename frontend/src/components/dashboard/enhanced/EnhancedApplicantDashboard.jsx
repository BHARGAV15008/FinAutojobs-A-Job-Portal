import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress,
  Tabs, Tab, TextField, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, Chip, IconButton, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Accordion, AccordionSummary,
  AccordionDetails, Slider, Alert, AlertTitle, Snackbar, Tooltip,
  useTheme, useMediaQuery, Drawer, AppBar, Toolbar, Menu, MenuItem as MenuItemComponent,
  Fab, Container, Stack, Breadcrumbs, Link, Stepper, Step, StepLabel,
  StepContent, CircularProgress, Backdrop, Skeleton, Rating, Pagination,
  InputAdornment, OutlinedInput, Chip as MuiChip, Autocomplete
} from '@mui/material';
import {
  Dashboard, Person, Work, Bookmark, Assessment, Settings, Notifications,
  Edit, Upload, Download, Search, FilterList, ViewList, ViewModule,
  ExpandMore, Add, Delete, Visibility, Schedule, LocationOn, AttachMoney,
  Star, StarBorder, Send, CheckCircle, Cancel, Pending, TrendingUp,
  Analytics, CalendarToday, Email, Phone, LinkedIn, GitHub, School,
  Business, Language, Psychology, Speed, Timeline, Insights, FilterAlt,
  Refresh, MoreVert, ArrowForward, ArrowBack, Home, Apps, AccountCircle,
  Security, PrivacyTip, Palette, TextFields, NotificationsActive,
  Save, Cancel as CancelIcon, Update, History, Event, Assignment,
  Groups, BarChart, PieChart, DonutLarge, ScatterPlot, TableChart,
  CloudUpload, Description, PictureAsPdf, Folder, FolderShared,
  Public, Lock, ExitToApp, MenuOpen, Menu, ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart, FunnelChart, Funnel
} from 'recharts';

// Import tab components
import ApplicantOverviewTab from './tabs/ApplicantOverviewTab';
import ApplicantProfileTab from './tabs/ApplicantProfileTab';
import ApplicantJobsTab from './tabs/ApplicantJobsTab';
import ApplicantRecommendedTab from './tabs/ApplicantRecommendedTab';
import ApplicantBookmarksTab from './tabs/ApplicantBookmarksTab';
import ApplicantApplicationsTab from './tabs/ApplicantApplicationsTab';
import ApplicantInterviewsTab from './tabs/ApplicantInterviewsTab';
import ApplicantJobAlertsTab from './tabs/ApplicantJobAlertsTab';
import ApplicantAnalyticsTab from './tabs/ApplicantAnalyticsTab';
import ApplicantSettingsTab from './tabs/ApplicantSettingsTab';

const EnhancedApplicantDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock data for demonstration
  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    githubUrl: 'https://github.com/johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    portfolioUrl: 'https://johndoe.dev',
    bio: 'Passionate software developer with 5 years of experience in React, Node.js, and full-stack development. Seeking challenging opportunities to contribute to innovative projects.',
    profilePicture: null,
    highestQualification: 'Master\'s Degree in Computer Science',
    isExperienced: true,
    experienceYears: 5,
    currentRole: 'Senior Frontend Developer',
    companyName: 'TechCorp Inc.',
    skills: [
      'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 
      'Docker', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Redux'
    ],
    languages: ['English', 'Spanish'],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
    achievements: [
      'Led development of flagship product',
      'Reduced application load time by 60%',
      'Mentored 5 junior developers'
    ],
    profileCompletionPercentage: 85,
    resumeUrl: '/resumes/john-doe-resume.pdf',
    resumeFileName: 'john-doe-resume.pdf',
    createdAt: '2024-01-15T00:00:00Z'
  };

  const tabsConfig = [
    { label: 'Overview', icon: Dashboard, value: 0, component: ApplicantOverviewTab },
    { label: 'Profile', icon: Person, value: 1, component: ApplicantProfileTab },
    { label: 'Browse Jobs', icon: Work, value: 2, component: ApplicantJobsTab },
    { label: 'Recommended', icon: Star, value: 3, component: ApplicantRecommendedTab },
    { label: 'Bookmarks', icon: Bookmark, value: 4, component: ApplicantBookmarksTab },
    { label: 'Applications', icon: Send, value: 5, component: ApplicantApplicationsTab },
    { label: 'Interviews', icon: Schedule, value: 6, component: ApplicantInterviewsTab },
    { label: 'Job Alerts', icon: NotificationsActive, value: 7, component: ApplicantJobAlertsTab },
    { label: 'Analytics', icon: Assessment, value: 8, component: ApplicantAnalyticsTab },
    { label: 'Settings', icon: Settings, value: 9, component: ApplicantSettingsTab }
  ];

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1500);

    // Simulate notifications
    const mockNotifications = [
      {
        id: 1,
        title: 'New Job Match',
        message: 'Senior Frontend Developer at Google matches your profile',
        type: 'info',
        isRead: false,
        createdAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 2,
        title: 'Interview Scheduled',
        message: 'Technical interview with Microsoft scheduled for tomorrow',
        type: 'success',
        isRead: false,
        createdAt: '2024-01-20T09:15:00Z'
      },
      {
        id: 3,
        title: 'Application Status Update',
        message: 'Your application for Senior Developer at Amazon is under review',
        type: 'warning',
        isRead: true,
        createdAt: '2024-01-19T16:45:00Z'
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const ActiveTabComponent = tabsConfig[activeTab]?.component || (() => null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Dashboard sx={{ fontSize: 48, color: 'primary.main' }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? 280 : 80,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 280 : 80,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            transition: 'width 0.3s ease',
            overflowX: 'hidden'
          },
        }}
      >
        <Box sx={{ p: sidebarOpen ? 3 : 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen ? (
            <>
              <Typography variant="h5" fontWeight="bold">
                FinAutoJobs
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Applicant Dashboard
              </Typography>
            </>
          ) : (
            <Dashboard sx={{ fontSize: 32 }} />
          )}
        </Box>
        
        <List sx={{ p: sidebarOpen ? 2 : 1 }}>
          {tabsConfig.map((tab) => (
            <ListItem
              key={tab.value}
              button
              onClick={() => setActiveTab(tab.value)}
              sx={{
                mb: 1,
                borderRadius: 2,
                backgroundColor: activeTab === tab.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                px: sidebarOpen ? 2 : 1
              }}
            >
              <ListItemIcon sx={{ 
                color: 'white', 
                minWidth: sidebarOpen ? 40 : 'auto',
                mr: sidebarOpen ? 2 : 0
              }}>
                <tab.icon />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText primary={tab.label} />
              )}
            </ListItem>
          ))}
        </List>

        {sidebarOpen && (
          <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <Card sx={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Profile Completion
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={user?.profileCompletionPercentage} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { backgroundColor: 'white' }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {user?.profileCompletionPercentage}% Complete
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={1}
          sx={{ 
            background: 'white', 
            color: 'text.primary',
            borderBottom: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              edge="start"
              sx={{ mr: 2 }}
            >
              {sidebarOpen ? <ChevronLeft /> : <Menu />}
            </IconButton>

            <Breadcrumbs sx={{ flexGrow: 1 }}>
              <Link color="inherit" href="#" onClick={() => setActiveTab(0)}>
                <Home sx={{ fontSize: 20, mr: 0.5 }} />
                Dashboard
              </Link>
              <Typography color="text.primary">
                {tabsConfig[activeTab]?.label}
              </Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationClick}
                  sx={{ position: 'relative' }}
                >
                  <Notifications />
                  {unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        '& .MuiBadge-badge': {
                          fontSize: 10,
                          height: 18,
                          minWidth: 18,
                          borderRadius: 9
                        }
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Profile">
                <IconButton
                  color="inherit"
                  onClick={() => setActiveTab(1)}
                >
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    src={user?.profilePicture}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <MoreVert />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Notifications Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: { 
              width: 360, 
              maxHeight: 400,
              mt: 1,
              boxShadow: theme.shadows[8]
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
          </Box>
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => markNotificationAsRead(notification.id)}
                sx={{ 
                  py: 2,
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {!notification.isRead && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                )}
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveTabComponent user={user} />
              </motion.div>
            </AnimatePresence>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default EnhancedApplicantDashboard;
