import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';
import { Link, useLocation } from 'wouter';
import api from '../../utils/api';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip,
  IconButton, Badge, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem,
  ListItemText, ListItemAvatar, ListItemSecondaryAction, Divider, Paper,
  useTheme, useMediaQuery, Alert, CircularProgress, Stack, Container,
  AppBar, Toolbar, Drawer, ListItemIcon, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Switch,
  FormControlLabel, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Dashboard, People, Work, Business, Analytics, Settings, Security,
  AdminPanelSettings, Database, Shield, Report, Delete, Edit, Visibility,
  Add, Search, FilterList, TrendingUp, BarChart, PieChart, ShowChart,
  Timeline, CheckCircle, Cancel, Warning, Info, Error, Success,
  ExpandMore, Menu as MenuIcon, ExitToApp, AccountCircle, Refresh,
  Block, Restore, PersonAdd, WorkOutline, Notifications
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const AdminDashboardNew = () => {
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
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, user: null });

  // Filters and pagination
  const [userFilter, setUserFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/admin');
      setDashboardData(response.data);
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

  const handleUserAction = async (userId, action) => {
    try {
      let endpoint = '';
      let successMessage = '';

      switch (action) {
        case 'suspend':
          endpoint = `/admin/users/${userId}/suspend`;
          successMessage = 'User suspended successfully';
          break;
        case 'activate':
          endpoint = `/admin/users/${userId}/activate`;
          successMessage = 'User activated successfully';
          break;
        case 'delete':
          endpoint = `/admin/users/${userId}`;
          successMessage = 'User deleted successfully';
          break;
        default:
          return;
      }

      if (action === 'delete') {
        await api.delete(endpoint);
      } else {
        await api.put(endpoint);
      }

      await loadDashboardData();
      setConfirmDialog({ open: false, action: null, user: null });
      toast({
        title: 'Success',
        description: successMessage
      });
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} user`,
        variant: 'destructive'
      });
    }
  };

  // Navigation items
  const navigationItems = [
    { icon: <Dashboard />, label: 'Overview', value: 0 },
    { icon: <People />, label: 'Manage Users', value: 1 },
    { icon: <PersonAdd />, label: 'Applicants', value: 2 },
    { icon: <WorkOutline />, label: 'Recruiters', value: 3 },
    { icon: <Work />, label: 'Jobs Management', value: 4 },
    { icon: <Business />, label: 'Companies', value: 5 },
    { icon: <Analytics />, label: 'Analytics', value: 6 },
    { icon: <Report />, label: 'Reports', value: 7 },
    { icon: <Database />, label: 'Database', value: 8 },
    { icon: <Security />, label: 'Security', value: 9 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getUserRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'employer': return 'primary';
      case 'jobseeker': return 'secondary';
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
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
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
              <AdminPanelSettings />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {user?.fullName || 'Administrator'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                System Admin
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
              {navigationItems.find(item => item.value === activeTab)?.label || 'Admin Dashboard'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => loadDashboardData()}>
                <Refresh />
              </IconButton>
              
              <Badge badgeContent={0} color="error">
                <IconButton>
                  <Notifications />
                </IconButton>
              </Badge>

              <IconButton>
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
              {activeTab === 0 && <AdminOverviewTab data={dashboardData} />}
              {activeTab === 1 && <ManageUsersTab data={dashboardData} onUserAction={handleUserAction} setConfirmDialog={setConfirmDialog} />}
              {activeTab === 2 && <ApplicantsTab data={dashboardData} />}
              {activeTab === 3 && <RecruitersTab data={dashboardData} />}
              {activeTab === 4 && <JobsManagementTab data={dashboardData} />}
              {activeTab === 5 && <CompaniesTab data={dashboardData} />}
              {activeTab === 6 && <AdminAnalyticsTab data={dashboardData} />}
              {activeTab === 7 && <ReportsTab data={dashboardData} />}
              {activeTab === 8 && <DatabaseTab data={dashboardData} />}
              {activeTab === 9 && <SecurityTab data={dashboardData} />}
            </motion.div>
          </AnimatePresence>
        </Container>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null, user: null })}
      >
        <DialogTitle>
          Confirm {confirmDialog.action?.charAt(0).toUpperCase() + confirmDialog.action?.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} user "{confirmDialog.user?.fullName}"?
            {confirmDialog.action === 'delete' && ' This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, user: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleUserAction(confirmDialog.user?.id, confirmDialog.action)}
            color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
            variant="contained"
          >
            {confirmDialog.action?.charAt(0).toUpperCase() + confirmDialog.action?.slice(1)}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Admin Overview Tab
const AdminOverviewTab = ({ data }) => {
  const theme = useTheme();
  const stats = data?.stats || {};

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.users?.total || 0,
      icon: <People />,
      color: theme.palette.primary.main,
      subtitle: `${stats.users?.active || 0} active`
    },
    {
      title: 'Job Seekers',
      value: stats.users?.jobseekers || 0,
      icon: <PersonAdd />,
      color: theme.palette.secondary.main,
      subtitle: 'Registered candidates'
    },
    {
      title: 'Employers',
      value: stats.users?.employers || 0,
      icon: <Business />,
      color: theme.palette.success.main,
      subtitle: 'Active recruiters'
    },
    {
      title: 'Total Jobs',
      value: stats.jobs?.total || 0,
      icon: <Work />,
      color: theme.palette.warning.main,
      subtitle: `${stats.jobs?.active || 0} active`
    }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard 🛡️
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Monitor and manage the entire FinAutoJobs platform from here.
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
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
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
                Recent Users
              </Typography>
              <List>
                {data?.recentUsers?.slice(0, 5).map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getUserRoleColor(user.role) }}>
                          {user.fullName?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.fullName}
                        secondary={`${user.role} • ${user.email} • ${format(parseISO(user.createdAt), 'MMM dd, yyyy')}`}
                      />
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
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
                System Health
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Database</Typography>
                  <Chip label="Healthy" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">API Status</Typography>
                  <Chip label="Online" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Storage</Typography>
                  <Chip label="85% Used" color="warning" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" startIcon={<People />} fullWidth>
                  Manage Users
                </Button>
                <Button variant="outlined" startIcon={<Analytics />} fullWidth>
                  View Reports
                </Button>
                <Button variant="outlined" startIcon={<Security />} fullWidth>
                  Security Settings
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
  ManageUsersTab,
  ApplicantsTab,
  RecruitersTab,
  JobsManagementTab,
  CompaniesTab,
  AdminAnalyticsTab,
  ReportsTab,
  DatabaseTab,
  SecurityTab
} from './AdminDashboardTabs';

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'warning';
    case 'suspended': return 'error';
    default: return 'default';
  }
};

const getUserRoleColor = (role) => {
  switch (role) {
    case 'admin': return 'error';
    case 'employer': return 'primary';
    case 'jobseeker': return 'secondary';
    default: return 'default';
  }
};

export default AdminDashboardNew;
