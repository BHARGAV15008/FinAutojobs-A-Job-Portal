import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon, Divider, Alert, Switch,
  FormControlLabel, useTheme, useMediaQuery, Drawer, Menu
} from '@mui/material';
import {
  Dashboard, Person, Work, Business, Analytics, Settings, Security,
  Delete, Edit, Visibility, Search, FilterList, Add, Block, CheckCircle,
  Warning, Error, TrendingUp, TrendingDown, Group, Assignment,
  Database, Shield, Notifications, MoreVert, SupervisorAccount
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const AdvancedAdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const tabsConfig = [
    { label: 'Overview', icon: Dashboard, value: 0 },
    { label: 'Profile', icon: Person, value: 1 },
    { label: 'Users', icon: Group, value: 2 },
    { label: 'Applicants', icon: Person, value: 3 },
    { label: 'Recruiters', icon: SupervisorAccount, value: 4 },
    { label: 'Companies', icon: Business, value: 5 },
    { label: 'Jobs', icon: Work, value: 6 },
    { label: 'Analytics', icon: Analytics, value: 7 },
    { label: 'Database', icon: Database, value: 8 },
    { label: 'Security', icon: Security, value: 9 },
    { label: 'Settings', icon: Settings, value: 10 }
  ];

  const mockAdmin = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@finautojobs.com',
    phone: '+1 555 000 0000',
    location: 'Global',
    githubUrl: 'https://github.com/finautojobs',
    linkedinUrl: 'https://linkedin.com/company/finautojobs',
    companyName: 'FinAutoJobs',
    role: 'System Administrator'
  };

  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'applicant',
      status: 'active',
      joinedDate: '2024-01-15',
      lastLogin: '2024-01-20'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      role: 'recruiter',
      status: 'active',
      joinedDate: '2024-01-10',
      lastLogin: '2024-01-19'
    }
  ];

  const mockSystemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalJobs: 456,
    totalApplications: 3421,
    successfulHires: 89,
    systemUptime: '99.9%',
    dailyActiveUsers: 234,
    monthlyGrowth: 15.6
  };

  useEffect(() => {
    setTimeout(() => {
      setUser(mockAdmin);
      setUsers(mockUsers);
      setSystemStats(mockSystemStats);
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card sx={{ 
        height: '100%', 
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        '&:hover': { boxShadow: theme.shadows[8] }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" fontWeight="bold" color={color}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
              {trend && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1, 
                    color: trend > 0 ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {trend > 0 ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
                  {trend > 0 ? '+' : ''}{trend}% from last month
                </Typography>
              )}
            </Box>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon sx={{ fontSize: 32, color }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderOverviewTab = () => (
    <Box>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container alignItems="center" spacing={3}>
              <Grid item>
                <Avatar
                  sx={{ width: 80, height: 80, border: '3px solid white' }}
                  src={user?.profilePicture}
                >
                  <SupervisorAccount sx={{ fontSize: 40 }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  System Overview & Management
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                  Monitor platform performance and manage all system components
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={systemStats.totalUsers?.toLocaleString()} 
            icon={Group} 
            color={theme.palette.primary.main}
            trend={15.6}
            subtitle={`${systemStats.activeUsers} active`}
            onClick={() => setActiveTab(2)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Jobs" 
            value={systemStats.totalJobs} 
            icon={Work} 
            color={theme.palette.success.main}
            trend={8.2}
            onClick={() => setActiveTab(6)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Applications" 
            value={systemStats.totalApplications?.toLocaleString()} 
            icon={Assignment} 
            color={theme.palette.warning.main}
            trend={23.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="System Uptime" 
            value={systemStats.systemUptime} 
            icon={CheckCircle} 
            color={theme.palette.info.main}
            subtitle="Last 30 days"
          />
        </Grid>
      </Grid>

      {/* Recent Activity & System Health */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Activity
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Mon', users: 400, jobs: 240, applications: 180 },
                    { name: 'Tue', users: 300, jobs: 139, applications: 220 },
                    { name: 'Wed', users: 200, jobs: 980, applications: 290 },
                    { name: 'Thu', users: 278, jobs: 390, applications: 200 },
                    { name: 'Fri', users: 189, jobs: 480, applications: 181 },
                    { name: 'Sat', users: 239, jobs: 380, applications: 250 },
                    { name: 'Sun', users: 349, jobs: 430, applications: 210 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="jobs" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="applications" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Group />}
                  onClick={() => setActiveTab(2)}
                  fullWidth
                >
                  Manage Users
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Business />}
                  onClick={() => setActiveTab(5)}
                  fullWidth
                >
                  Manage Companies
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Analytics />}
                  onClick={() => setActiveTab(7)}
                  fullWidth
                >
                  View Analytics
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Security />}
                  onClick={() => setActiveTab(9)}
                  fullWidth
                  color="error"
                >
                  Security Center
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderUsersTab = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            User Management
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : user.role === 'recruiter' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Block />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderProfileTab = () => (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Admin Profile
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={user?.firstName || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={user?.lastName || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={user?.phone || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={user?.location || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GitHub Profile"
              value={user?.githubUrl || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="LinkedIn Profile"
              value={user?.linkedinUrl || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={user?.companyName || ''}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select value={user?.role || ''} label="Role">
                <MenuItem value="System Administrator">System Administrator</MenuItem>
                <MenuItem value="Platform Manager">Platform Manager</MenuItem>
                <MenuItem value="Content Moderator">Content Moderator</MenuItem>
                <MenuItem value="Support Manager">Support Manager</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" sx={{ mr: 2 }}>
                Save Changes
              </Button>
              <Button variant="outlined">
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

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
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white'
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h5" fontWeight="bold">
            FinAutoJobs
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Admin Dashboard
          </Typography>
        </Box>
        
        <List sx={{ p: 2 }}>
          {tabsConfig.map((tab) => (
            <ListItem
              key={tab.value}
              button
              onClick={() => setActiveTab(tab.value)}
              sx={{
                mb: 1,
                borderRadius: 2,
                backgroundColor: activeTab === tab.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <tab.icon />
              </ListItemIcon>
              <ListItemText primary={tab.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 0 && renderOverviewTab()}
              {activeTab === 1 && renderProfileTab()}
              {activeTab === 2 && renderUsersTab()}
              {/* Other tabs will be implemented */}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedAdminDashboard;
