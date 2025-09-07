import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import api from '../utils/api';
import ModernDashboardLayout from '../components/ModernDashboardLayout';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Alert,
  AlertTitle,
  Fab,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Work,
  Person,
  Business,
  TrendingUp,
  Notifications,
  CheckCircle,
  Schedule,
  Visibility,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Delete,
  MoreVert,
  CalendarToday,
  Assessment,
  Star,
  LocationOn,
  Mail,
  Phone,
  LinkedIn,
  Add,
  Refresh,
  Analytics,
  BarChart,
  PieChart,
  People,
  PostAdd,
  DollarSign,
  Eye,
  ThumbUp,
  ThumbDown,
  HourglassEmpty,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart as RechartsBarChart, Bar, AreaChart, Area, Pie } from 'recharts';

const RecruiterDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [jobDialog, setJobDialog] = useState({ open: false, job: null });
  const [filters, setFilters] = useState({ status: 'all', dateRange: 'all' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        userRes, 
        jobsRes, 
        appsRes, 
        candidatesRes, 
        analyticsRes,
        alertsRes
      ] = await Promise.all([
        api.get('/api/users/profile'),
        api.get('/api/jobs/my-jobs'),
        api.get('/api/applications'),
        api.get('/api/candidates'),
        api.get('/api/analytics/recruiter'),
        api.get('/api/alerts/recruiter')
      ]);

      const userData = await userRes.json();
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      const candidatesData = await candidatesRes.json();
      const analyticsData = await analyticsRes.json();
      const alertsData = await alertsRes.json();

      setUser(userData);
      setJobs(jobsData.jobs || []);
      setApplications(appsData.applications || []);
      setCandidates(candidatesData.candidates || []);
      setAnalytics(analyticsData);
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filters.status !== 'all' && app.status !== filters.status) return false;
    return true;
  });

  const stats = {
    activeJobs: jobs.filter(job => job.status === 'active').length,
    totalApplications: applications.length,
    interviewsScheduled: applications.filter(app => app.status === 'interview').length,
    hiredCandidates: applications.filter(app => app.status === 'hired').length,
    totalViews: analytics?.totalViews || 0,
    newApplications: applications.filter(app => {
      const appDate = new Date(app.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return appDate > weekAgo;
    }).length,
  };

  const applicationStatusData = [
    { name: 'New', value: applications.filter(app => app.status === 'new').length, color: '#42A5F5' },
    { name: 'Under Review', value: applications.filter(app => app.status === 'under_review').length, color: '#FFA726' },
    { name: 'Interview', value: applications.filter(app => app.status === 'interview').length, color: '#66BB6A' },
    { name: 'Rejected', value: applications.filter(app => app.status === 'rejected').length, color: '#EF5350' },
    { name: 'Hired', value: applications.filter(app => app.status === 'hired').length, color: '#26C6DA' },
  ];

  const jobPerformanceData = jobs.map(job => ({
    name: job.title,
    views: job.views || Math.floor(Math.random() * 1000),
    applications: job.applications_count || 0,
    interviews: job.interviews_count || 0,
  }));

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h4" fontWeight="bold" className="text-gray-800">
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                {title}
              </Typography>
              {trend && (
                <Typography 
                  variant="caption" 
                  className={`mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {trend > 0 ? '+' : ''}{trend}% from last month
                </Typography>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const tabContent = [
    {
      label: 'Overview',
      content: (
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            {/* Quick Stats */}
            <Grid container spacing={3} className="mb-6">
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Active Jobs" value={stats.activeJobs} icon={Work} color="blue" trend={8} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Applications" value={stats.totalApplications} icon={People} color="green" trend={15} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Interviews" value={stats.interviewsScheduled} icon={Schedule} color="purple" trend={12} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Hired" value={stats.hiredCandidates} icon={CheckCircle} color="orange" trend={5} />
              </Grid>
            </Grid>

            {/* Application Status Chart */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Application Status Overview
                </Typography>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {applicationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6" fontWeight="bold">
                    Recent Applications
                  </Typography>
                  <Button 
                    component={Link} 
                    href="/recruiter-dashboard/applications" 
                    variant="outlined" 
                    size="small"
                  >
                    View All
                  </Button>
                </div>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Candidate</TableCell>
                        <TableCell>Job</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Applied</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.slice(0, 5).map((application) => (
                        <TableRow key={application.id} hover>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="w-8 h-8 mr-2">
                                {application.candidate_name?.charAt(0)}
                              </Avatar>
                              <div>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {application.candidate_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {application.candidate_email}
                                </Typography>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{application.job_title}</TableCell>
                          <TableCell>
                            <Chip
                              label={application.status.replace('_', ' ')}
                              color={
                                application.status === 'hired' ? 'success' :
                                application.status === 'rejected' ? 'error' :
                                application.status === 'interview' ? 'warning' : 'info'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(application.applied_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
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

          <Grid item xs={12} lg={4}>
            {/* Company Profile */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Company Profile
                </Typography>
                <div className="text-center mb-4">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {user?.company_name?.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.company_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.position}
                  </Typography>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {user?.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {user?.phone}
                  </div>
                  <div className="flex items-center">
                    <LocationOn className="h-4 w-4 mr-2 text-gray-500" />
                    {user?.location}
                  </div>
                </div>
                <Button
                  component={Link}
                  href="/recruiter-dashboard/profile"
                  variant="contained"
                  fullWidth
                  className="mt-4"
                  startIcon={<Edit />}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6" fontWeight="bold">
                    Recent Alerts
                  </Typography>
                  <Badge badgeContent={alerts.length} color="error">
                    <Notifications />
                  </Badge>
                </div>
                {alerts.length > 0 ? (
                  <List>
                    {alerts.slice(0, 3).map((alert) => (
                      <ListItem key={alert.id} className="px-0">
                        <ListItemIcon>
                          {alert.type === 'new_application' && <People color="primary" />}
                          {alert.type === 'interview_scheduled' && <Schedule color="warning" />}
                          {alert.type === 'profile_view' && <Eye color="info" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="bold">
                              {alert.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {alert.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(alert.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" className="text-center py-4">
                    No new alerts
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Quick Actions
                </Typography>
                <div className="space-y-3">
                  <Button
                    component={Link}
                    href="/add-job"
                    variant="contained"
                    fullWidth
                    startIcon={<PostAdd />}
                  >
                    Post New Job
                  </Button>
                  <Button
                    component={Link}
                    href="/recruiter-dashboard/applications"
                    variant="outlined"
                    fullWidth
                    startIcon={<People />}
                  >
                    Review Applications
                  </Button>
                  <Button
                    component={Link}
                    href="/recruiter-dashboard/analytics"
                    variant="outlined"
                    fullWidth
                    startIcon={<Analytics />}
                  >
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'My Jobs',
      content: (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <Typography variant="h6" fontWeight="bold">
                My Job Postings
              </Typography>
              <div className="flex gap-2">
                <Button
                  component={Link}
                  href="/add-job"
                  variant="contained"
                  startIcon={<PostAdd />}
                >
                  Post New Job
                </Button>
                <FormControl size="small" className="min-w-[120px]">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Applications</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Posted</TableCell>
                    <TableCell>Views</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.filter(job => filters.status === 'all' || job.status === filters.status).map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Badge badgeContent={job.applications_count || 0} color="primary">
                          <People />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          color={
                            job.status === 'active' ? 'success' :
                            job.status === 'closed' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(job.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {job.views || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => setAnchorEl(null)}
                        >
                          <MenuItem onClick={() => {
                            setJobDialog({ open: true, job });
                            setAnchorEl(null);
                          }}>
                            <Edit className="mr-2" />
                            Edit Job
                          </MenuItem>
                          <MenuItem>
                            <Visibility className="mr-2" />
                            View Applications
                          </MenuItem>
                          <MenuItem>
                            <Analytics className="mr-2" />
                            View Analytics
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ),
    },
    {
      label: 'Applications',
      content: (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <Typography variant="h6" fontWeight="bold">
                All Applications
              </Typography>
              <div className="flex gap-2">
                <FormControl size="small" className="min-w-[120px]">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="interview">Interview</MenuItem>
                    <MenuItem value="hired">Hired</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" size="small" startIcon={<Download />}>
                  Export
                </Button>
              </div>
            </div>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Job</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id} hover>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="w-8 h-8 mr-2">
                            {application.candidate_name?.charAt(0)}
                          </Avatar>
                          <div>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {application.candidate_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {application.candidate_email}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{application.job_title}</TableCell>
                      <TableCell>
                        <Chip
                          label={application.status.replace('_', ' ')}
                          color={
                            application.status === 'hired' ? 'success' :
                            application.status === 'rejected' ? 'error' :
                            application.status === 'interview' ? 'warning' :
                            application.status === 'under_review' ? 'info' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(application.applied_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {application.experience || 'N/A'} years
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => setAnchorEl(null)}
                        >
                          <MenuItem>
                            <Visibility className="mr-2" />
                            View Profile
                          </MenuItem>
                          <MenuItem>
                            <Mail className="mr-2" />
                            Send Message
                          </MenuItem>
                          <MenuItem>
                            <Schedule className="mr-2" />
                            Schedule Interview
                          </MenuItem>
                          <MenuItem>
                            <ThumbUp className="mr-2" />
                            Accept
                          </MenuItem>
                          <MenuItem>
                            <ThumbDown className="mr-2" />
                            Reject
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ),
    },
    {
      label: 'Candidates',
      content: (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" fontWeight="bold">
                Candidate Pipeline
              </Typography>
              <div className="flex gap-2">
                <TextField
                  size="small"
                  placeholder="Search candidates..."
                  className="min-w-[200px]"
                />
                <Button variant="outlined" size="small" startIcon={<Filter />}>
                  Filter
                </Button>
              </div>
            </div>
            <Grid container spacing={3}>
              {candidates.slice(0, 6).map((candidate) => (
                <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                  <Card className="h-full border hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <Avatar className="w-10 h-10 mr-3">
                          {candidate.name?.charAt(0)}
                        </Avatar>
                        <div className="flex-1">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {candidate.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {candidate.title}
                          </Typography>
                        </div>
                        <Chip
                          label={candidate.status}
                          color={
                            candidate.status === 'available' ? 'success' :
                            candidate.status === 'interviewing' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {candidate.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {candidate.phone}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <LocationOn className="h-4 w-4 mr-2" />
                          {candidate.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Business className="h-4 w-4 mr-2" />
                          {candidate.experience} years experience
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="contained" size="small" fullWidth>
                          View Profile
                        </Button>
                        <Button variant="outlined" size="small">
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ),
    },
    {
      label: 'Analytics',
      content: (
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Card className="shadow-lg mb-6">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Job Performance Metrics
                </Typography>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="views" fill="#8884d8" />
                      <Bar dataKey="applications" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Key Metrics
                </Typography>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Typography variant="body2">Total Job Views</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {stats.totalViews.toLocaleString()}
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2">Application Rate</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success">
                      {stats.totalApplications > 0 ? Math.round((stats.totalApplications / stats.totalViews) * 100) : 0}%
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2">Interview Rate</Typography>
                    <Typography variant="h6" fontWeight="bold" color="warning">
                      {stats.totalApplications > 0 ? Math.round((stats.interviewsScheduled / stats.totalApplications) * 100) : 0}%
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2">Hire Rate</Typography>
                    <Typography variant="h6" fontWeight="bold" color="info">
                      {stats.totalApplications > 0 ? Math.round((stats.hiredCandidates / stats.totalApplications) * 100) : 0}%
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ),
    },
  ];

  if (loading) {
    return (
      <ModernDashboardLayout title="Recruiter Dashboard" userRole="recruiter">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout title="Recruiter Dashboard" userRole="recruiter">
      <Box>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          className="mb-6"
          variant={isMobile ? "scrollable" : "fullWidth"}
        >
          {tabContent.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>

        {tabContent[activeTab].content}
      </Box>

      {/* Job Edit Dialog */}
      <Dialog
        open={jobDialog.open}
        onClose={() => setJobDialog({ open: false, job: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Job Posting</DialogTitle>
        <DialogContent>
          <Box className="mt-4 space-y-4">
            <TextField
              label="Job Title"
              fullWidth
              defaultValue={jobDialog.job?.title}
            />
            <TextField
              label="Location"
              fullWidth
              defaultValue={jobDialog.job?.location}
            />
            <TextField
              label="Salary Range"
              fullWidth
              defaultValue={jobDialog.job?.salary_range}
            />
            <TextField
              label="Job Description"
              multiline
              rows={4}
              fullWidth
              defaultValue={jobDialog.job?.description}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialog({ open: false, job: null })}>
            Cancel
          </Button>
          <Button variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </ModernDashboardLayout>
  );
};

export default RecruiterDashboard;
