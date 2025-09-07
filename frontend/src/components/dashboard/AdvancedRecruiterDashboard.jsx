import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon, Divider, Alert,
  useTheme, useMediaQuery, Drawer, AppBar, Toolbar, Menu
} from '@mui/material';
import {
  Dashboard, Work, Person, Add, Edit, Delete, Visibility, Search,
  FilterList, Notifications, Analytics, Business, Schedule, Send,
  TrendingUp, Assessment, Settings, MoreVert, CheckCircle, Cancel,
  Pending, Star, LocationOn, AttachMoney, Group, Assignment
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

const AdvancedRecruiterDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [jobPosts, setJobPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [notifications, setNotifications] = useState([]);

  const tabsConfig = [
    { label: 'Overview', icon: Dashboard, value: 0 },
    { label: 'Profile', icon: Person, value: 1 },
    { label: 'Post Job', icon: Add, value: 2 },
    { label: 'My Jobs', icon: Work, value: 3 },
    { label: 'Applications', icon: Assignment, value: 4 },
    { label: 'Candidates', icon: Group, value: 5 },
    { label: 'Interviews', icon: Schedule, value: 6 },
    { label: 'Analytics', icon: Analytics, value: 7 },
    { label: 'Alerts', icon: Notifications, value: 8 },
    { label: 'Settings', icon: Settings, value: 9 }
  ];

  const mockUser = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 555 123 4567',
    location: 'New York, NY',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    companyName: 'TechCorp Solutions',
    role: 'Senior Talent Acquisition Manager'
  };

  const mockJobPosts = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      applicationsCount: 45,
      viewsCount: 234,
      postedDate: '2024-01-15',
      salary: '$120,000 - $150,000'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      status: 'Active',
      applicationsCount: 67,
      viewsCount: 189,
      postedDate: '2024-01-10',
      salary: '$110,000 - $140,000'
    }
  ];

  const mockApplications = [
    {
      id: 1,
      candidateName: 'John Smith',
      jobTitle: 'Senior Software Engineer',
      status: 'Under Review',
      appliedDate: '2024-01-20',
      experience: '5 years',
      rating: 4.5,
      skills: ['React', 'Node.js', 'Python']
    },
    {
      id: 2,
      candidateName: 'Emily Davis',
      jobTitle: 'Product Manager',
      status: 'Interview Scheduled',
      appliedDate: '2024-01-18',
      experience: '7 years',
      rating: 4.8,
      skills: ['Product Strategy', 'Agile', 'Analytics']
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
      setJobPosts(mockJobPosts);
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, onClick }) => (
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
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
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
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Welcome back, {user?.firstName}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {user?.companyName} • {user?.role}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                  Ready to find your next great hire?
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Job Posts" 
            value="8" 
            icon={Work} 
            color={theme.palette.primary.main}
            trend={15}
            onClick={() => setActiveTab(3)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="New Applications" 
            value="142" 
            icon={Assignment} 
            color={theme.palette.success.main}
            trend={23}
            onClick={() => setActiveTab(4)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Interviews Scheduled" 
            value="12" 
            icon={Schedule} 
            color={theme.palette.warning.main}
            trend={8}
            onClick={() => setActiveTab(6)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Successful Hires" 
            value="5" 
            icon={CheckCircle} 
            color={theme.palette.info.main}
            trend={12}
          />
        </Grid>
      </Grid>

      {/* Recent Activity & Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Applications
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Applied</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockApplications.slice(0, 5).map((application) => (
                      <TableRow key={application.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              {application.candidateName.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {application.candidateName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {application.experience} experience
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{application.jobTitle}</TableCell>
                        <TableCell>
                          <Chip
                            label={application.status}
                            color={
                              application.status === 'Interview Scheduled' ? 'success' :
                              application.status === 'Under Review' ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
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
                  startIcon={<Add />}
                  onClick={() => setActiveTab(2)}
                  fullWidth
                >
                  Post New Job
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Assignment />}
                  onClick={() => setActiveTab(4)}
                  fullWidth
                >
                  Review Applications
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Schedule />}
                  onClick={() => setActiveTab(6)}
                  fullWidth
                >
                  Schedule Interviews
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Analytics />}
                  onClick={() => setActiveTab(7)}
                  fullWidth
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderProfileTab = () => (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Recruiter Profile
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
          <Grid item xs={12}>
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
                <MenuItem value="HR Manager">HR Manager</MenuItem>
                <MenuItem value="Talent Acquisition Manager">Talent Acquisition Manager</MenuItem>
                <MenuItem value="Senior Recruiter">Senior Recruiter</MenuItem>
                <MenuItem value="Recruitment Specialist">Recruitment Specialist</MenuItem>
                <MenuItem value="Head of Talent">Head of Talent</MenuItem>
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
            Recruiter Dashboard
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
              {/* Other tabs will be implemented */}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedRecruiterDashboard;
