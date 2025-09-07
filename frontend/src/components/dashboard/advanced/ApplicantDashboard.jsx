import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Badge,
  LinearProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Skeleton,
  Alert,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Bookmark as BookmarkIcon,
  Assignment as AssignmentIcon,
  Description as ResumeIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  TrendingUp,
  Schedule,
  LocationOn,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  School,
  Business,
  Star,
  Visibility,
  Apply,
  Download,
  Upload,
  Edit,
  Add,
  FilterList,
  Sort,
  Refresh,
  MoreVert,
  CheckCircle,
  Cancel,
  Pending,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import AdvancedDashboardLayout from '../../AdvancedDashboardLayout';

// Import tab components
import ApplicantOverviewTab from './tabs/ApplicantOverviewTab';
import ApplicantProfileTab from './tabs/ApplicantProfileTab';
import ApplicantJobsTab from './tabs/ApplicantJobsTab';
import ApplicantApplicationsTab from './tabs/ApplicantApplicationsTab';
import ApplicantResumeTab from './tabs/ApplicantResumeTab';
import ApplicantInterviewsTab from './tabs/ApplicantInterviewsTab';
import ApplicantAnalyticsTab from './tabs/ApplicantAnalyticsTab';
import ApplicantSettingsTab from './tabs/ApplicantSettingsTab';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    applications: [],
    recommendations: [],
    interviews: [],
    analytics: {},
    notifications: [],
    settings: {}
  });

  // Tab configuration
  const tabs = [
    {
      label: 'Overview',
      icon: <DashboardIcon />,
      component: ApplicantOverviewTab,
      color: 'primary'
    },
    {
      label: 'Profile',
      icon: <PersonIcon />,
      component: ApplicantProfileTab,
      color: 'secondary'
    },
    {
      label: 'Browse Jobs',
      icon: <SearchIcon />,
      component: ApplicantJobsTab,
      color: 'info'
    },
    {
      label: 'Applications',
      icon: <AssignmentIcon />,
      component: ApplicantApplicationsTab,
      color: 'warning'
    },
    {
      label: 'Resume',
      icon: <ResumeIcon />,
      component: ApplicantResumeTab,
      color: 'success'
    },
    {
      label: 'Interviews',
      icon: <ScheduleIcon />,
      component: ApplicantInterviewsTab,
      color: 'error'
    },
    {
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      component: ApplicantAnalyticsTab,
      color: 'success'
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      component: ApplicantSettingsTab,
      color: 'default'
    }
  ];

  // Quick actions for speed dial
  const quickActions = [
    {
      icon: <SearchIcon />,
      name: 'Browse Jobs',
      action: () => setActiveTab(2)
    },
    {
      icon: <Upload />,
      name: 'Upload Resume',
      action: () => setActiveTab(4)
    },
    {
      icon: <Edit />,
      name: 'Edit Profile',
      action: () => setActiveTab(1)
    },
    {
      icon: <NotificationsIcon />,
      name: 'Job Alerts',
      action: () => setActiveTab(7)
    }
  ];

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API calls - replace with actual API endpoints
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDashboardData({
          profile: {
            completeness: 85,
            views: 124,
            skills: ['React', 'Node.js', 'Python', 'SQL'],
            experience: '2 years',
            location: 'Mumbai, India'
          },
          applications: [
            { id: 1, company: 'TechCorp', position: 'Frontend Developer', status: 'pending', appliedDate: '2024-01-15' },
            { id: 2, company: 'StartupXYZ', position: 'Full Stack Developer', status: 'interview', appliedDate: '2024-01-10' }
          ],
          recommendations: [
            { id: 1, company: 'Google', position: 'Software Engineer', match: 95, location: 'Bangalore' },
            { id: 2, company: 'Microsoft', position: 'Frontend Developer', match: 88, location: 'Hyderabad' }
          ],
          interviews: [
            { id: 1, company: 'TechCorp', position: 'Frontend Developer', date: '2024-01-20', time: '14:00', type: 'video' }
          ],
          analytics: {
            profileViews: 124,
            applicationsSent: 15,
            interviewsScheduled: 3,
            responseRate: 20
          },
          notifications: [
            { id: 1, title: 'New job match', message: 'Software Engineer at Google', time: '2 hours ago', unread: true },
            { id: 2, title: 'Application update', message: 'Your application was reviewed', time: '1 day ago', unread: false }
          ]
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ActiveTabComponent = tabs[activeTab].component;

  if (loading) {
    return (
      <AdvancedDashboardLayout
        title="Applicant Dashboard"
        userRole="applicant"
        breadcrumbs={['Dashboard']}
      >
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={6} lg={3} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" width="100%" height={60} />
                    <Skeleton variant="text" sx={{ mt: 2 }} />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </AdvancedDashboardLayout>
    );
  }

  return (
    <AdvancedDashboardLayout
      title="Applicant Dashboard"
      userRole="applicant"
      breadcrumbs={['Dashboard', tabs[activeTab].label]}
      headerContent={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => window.location.reload()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Badge badgeContent={dashboardData.notifications.filter(n => n.unread).length} color="error">
            <NotificationsIcon />
          </Badge>
        </Box>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tab Navigation */}
        <Paper 
          elevation={1} 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{
                  color: `${tab.color}.main`,
                  '&.Mui-selected': {
                    color: `${tab.color}.main`,
                    fontWeight: 600,
                  }
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveTabComponent 
              data={dashboardData}
              onDataUpdate={setDashboardData}
              user={user}
            />
          </motion.div>
        </AnimatePresence>

        {/* Speed Dial for Quick Actions */}
        {!isMobile && (
          <SpeedDial
            ariaLabel="Quick Actions"
            sx={{ 
              position: 'fixed', 
              bottom: 24, 
              right: 24,
              '& .MuiSpeedDial-fab': {
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }
            }}
            icon={<SpeedDialIcon />}
          >
            {quickActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
          </SpeedDial>
        )}

        {/* Mobile Quick Actions */}
        {isMobile && (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              p: 2,
              display: 'flex',
              justifyContent: 'space-around',
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
            }}
          >
            {quickActions.slice(0, 4).map((action, index) => (
              <Tooltip key={index} title={action.name}>
                <IconButton
                  onClick={action.action}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Paper>
        )}
      </motion.div>
    </AdvancedDashboardLayout>
  );
};

export default ApplicantDashboard;
