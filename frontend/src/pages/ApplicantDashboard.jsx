import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { api } from '../utils/api';
import AdvancedDashboardLayout from '../components/AdvancedDashboardLayout';
import SettingsPanel from '../components/SettingsPanel';
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
  Zoom,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  Dashboard,
  Work,
  Person,
  Bookmark,
  Assessment,
  Notifications,
  TrendingUp,
  Add,
  Edit,
  Delete,
  Visibility,
  GetApp,
  Schedule,
  LocationOn,
  AttachMoney,
  Business,
  Star,
  StarBorder,
  Send,
  CheckCircle,
  Cancel,
  Pending,
  KeyboardArrowUp,
  Settings,
  Search,
  FilterList,
  Sort,
  ViewList,
  ViewModule,
  Refresh,
  Download,
  Upload,
  Share,
  MoreVert,
  Launch,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  School,
  WorkHistory,
  Skills,
  Language,
  ExpandMore,
  CalendarToday,
  AccessTime,
  Group,
  Assignment,
  Timeline as TimelineIcon,
  Analytics,
  Insights,
  Speed,
  Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const ApplicantDashboard = () => {
  const [location, navigate] = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, profile, settings, etc.
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobAlerts, setJobAlerts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [viewMode, setViewMode] = useState('cards'); // cards or table
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [jobDetailsDialogOpen, setJobDetailsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState({ open: false, applicationId: null });
  const [filters, setFilters] = useState({ status: 'all', dateRange: 'all' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        userRes, 
        savedRes, 
        recRes, 
        appsRes, 
        interviewsRes, 
        alertsRes, 
        analyticsRes
      ] = await Promise.all([
        api.get('/api/users/profile'),
        api.get('/api/saved-jobs'),
        api.get('/api/jobs/recommended'),
        api.get('/api/applications'),
        api.get('/api/interviews'),
        api.get('/api/job-alerts'),
        api.get('/api/analytics/applicant')
      ]);

      const userData = await userRes.json();
      const savedData = await savedRes.json();
      const recData = await recRes.json();
      const appsData = await appsRes.json();
      const interviewsData = await interviewsRes.json();
      const alertsData = await alertsRes.json();
      const analyticsData = await analyticsRes.json();

      setUser(userData);
      setSavedJobs(savedData.saved || []);
      setRecommendedJobs(recData.jobs || []);
      setApplications(appsData.applications || []);
      setInterviews(interviewsData.interviews || []);
      setJobAlerts(alertsData.alerts || []);
      setAnalytics(analyticsData);
      
      // Calculate profile completion
      const completion = calculateProfileCompletion(userData);
      setProfileCompletion(completion);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (userData) => {
    const fields = [
      'full_name', 'email', 'phone', 'location', 'bio', 
      'highest_qualification', 'skills', 'resume_url'
    ];
    const completedFields = fields.filter(field => userData[field] && userData[field].toString().trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const handleWithdrawApplication = async () => {
    try {
      await api.delete(`/api/applications/${withdrawDialog.applicationId}`);
      setApplications(applications.filter(app => app.id !== withdrawDialog.applicationId));
      setWithdrawDialog({ open: false, applicationId: null });
    } catch (error) {
      console.error('Error withdrawing application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filters.status !== 'all' && app.status !== filters.status) return false;
    return true;
  });

  const stats = {
    applicationsSubmitted: applications.length,
    interviewsScheduled: interviews.length,
    jobsViewed: analytics?.jobsViewed || 0,
    profileViews: analytics?.profileViews || 0,
    savedJobs: savedJobs.length,
    activeJobAlerts: jobAlerts.filter(alert => alert.active).length,
  };

  const applicationStatusData = [
    { name: 'Pending', value: applications.filter(app => app.status === 'pending').length, color: '#FFA726' },
    { name: 'Under Review', value: applications.filter(app => app.status === 'under_review').length, color: '#42A5F5' },
    { name: 'Interview', value: applications.filter(app => app.status === 'interview').length, color: '#66BB6A' },
    { name: 'Rejected', value: applications.filter(app => app.status === 'rejected').length, color: '#EF5350' },
    { name: 'Accepted', value: applications.filter(app => app.status === 'accepted').length, color: '#26C6DA' },
  ];

  const skillsMatchData = recommendedJobs.map(job => ({
    name: job.title,
    match: job.match_percentage || Math.floor(Math.random() * 40) + 60,
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
                <StatCard title="Applications" value={stats.applicationsSubmitted} icon={Work} color="blue" trend={12} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Interviews" value={stats.interviewsScheduled} icon={Schedule} color="green" trend={8} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Saved Jobs" value={stats.savedJobs} icon={Bookmark} color="purple" trend={15} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Profile Views" value={stats.profileViews} icon={Visibility} color="orange" trend={5} />
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
                    href="/applicant-dashboard/applications" 
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
                        <TableCell>Job Title</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Applied</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.slice(0, 5).map((application) => (
                        <TableRow key={application.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {application.job_title}
                            </Typography>
                          </TableCell>
                          <TableCell>{application.company_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={application.status.replace('_', ' ')}
                              color={
                                application.status === 'accepted' ? 'success' :
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
            {/* Profile Completion */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Profile Completion
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
                    {user?.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </div>
                <Box className="mb-2">
                  <Typography variant="body2" gutterBottom>
                    {profileCompletion}% Complete
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={profileCompletion}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Button
                  component={Link}
                  href="/applicant-dashboard/profile"
                  variant="contained"
                  fullWidth
                  className="mt-3"
                  startIcon={<Person />}
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Upcoming Interviews
                </Typography>
                {interviews.length > 0 ? (
                  <List>
                    {interviews.slice(0, 3).map((interview) => (
                      <ListItem key={interview.id} className="px-0">
                        <ListItemIcon>
                          <CalendarToday color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="bold">
                              {interview.job_title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {interview.company_name}
                              </Typography>
                              <Typography variant="caption" color="primary">
                                {new Date(interview.scheduled_date).toLocaleDateString()} at {interview.scheduled_time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" className="text-center py-4">
                    No upcoming interviews
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
                    href="/jobs"
                    variant="outlined"
                    fullWidth
                    startIcon={<Work />}
                  >
                    Browse Jobs
                  </Button>
                  <Button
                    onClick={() => setResumeUploadDialog(true)}
                    variant="outlined"
                    fullWidth
                    startIcon={<Upload />}
                  >
                    Update Resume
                  </Button>
                  <Button
                    component={Link}
                    href="/applicant-dashboard/alerts"
                    variant="outlined"
                    fullWidth
                    startIcon={<Notifications />}
                  >
                    Job Alerts ({stats.activeJobAlerts})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Applications',
      content: (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <Typography variant="h6" fontWeight="bold">
                My Applications
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
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="interview">Interview</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
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
                    <TableCell>Job Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {application.job_title}
                        </Typography>
                      </TableCell>
                      <TableCell>{application.company_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={application.status.replace('_', ' ')}
                          color={
                            application.status === 'accepted' ? 'success' :
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
                        {new Date(application.updated_at).toLocaleDateString()}
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
                            setWithdrawDialog({ open: true, applicationId: application.id });
                            setAnchorEl(null);
                          }}>
                            <Delete className="mr-2" />
                            Withdraw Application
                          </MenuItem>
                          <MenuItem>
                            <Visibility className="mr-2" />
                            View Details
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
      label: 'Saved Jobs',
      content: (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" fontWeight="bold">
                Saved Jobs
              </Typography>
              <Button 
                component={Link} 
                href="/jobs" 
                variant="outlined" 
                size="small"
              >
                Browse More Jobs
              </Button>
            </div>
            <Grid container spacing={3}>
              {savedJobs.map((job) => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <Card className="h-full border hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Typography variant="h6" fontWeight="bold" className="text-sm">
                          {job.title}
                        </Typography>
                        <IconButton size="small" color="primary">
                          <Bookmark />
                        </IconButton>
                      </div>
                      <Typography variant="body2" color="text.secondary" className="mb-2">
                        {job.company_name}
                      </Typography>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <LocationOn className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      {(job.salary_min || job.salary_max) && (
                        <Typography variant="body2" color="primary" fontWeight="bold" className="mb-3">
                          {job.salary_min || ''}{job.salary_max ? ` - ${job.salary_max}` : ''} {job.salary_currency || ''}
                        </Typography>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          component={Link}
                          href={`/job/${job.job_id || job.id}`}
                          variant="contained" 
                          size="small"
                          fullWidth
                        >
                          View Job
                        </Button>
                        <Button variant="outlined" size="small">
                          Apply
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
      label: 'Recommended',
      content: (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" fontWeight="bold">
                Recommended For You
              </Typography>
              <Button 
                component={Link} 
                href="/jobs" 
                variant="outlined" 
                size="small"
              >
                See All Jobs
              </Button>
            </div>
            <Grid container spacing={3}>
              {recommendedJobs.map((job) => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <Card className="h-full border hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Typography variant="h6" fontWeight="bold" className="text-sm">
                          {job.title}
                        </Typography>
                        <Chip 
                          label={`${job.match_percentage || Math.floor(Math.random() * 40) + 60}% Match`}
                          color="success" 
                          size="small"
                        />
                      </div>
                      <Typography variant="body2" color="text.secondary" className="mb-2">
                        {job.company_name}
                      </Typography>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <LocationOn className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      {(job.salary_min || job.salary_max) && (
                        <Typography variant="body2" color="primary" fontWeight="bold" className="mb-3">
                          {job.salary_min || ''}{job.salary_max ? ` - ${job.salary_max}` : ''} {job.salary_currency || ''}
                        </Typography>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          component={Link}
                          href={`/job/${job.id}`}
                          variant="contained" 
                          size="small"
                          fullWidth
                        >
                          View Job
                        </Button>
                        <Button variant="outlined" size="small">
                          Save
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
      label: 'Interviews',
      content: (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Typography variant="h6" fontWeight="bold" className="mb-6">
              Interview Schedule
            </Typography>
            {interviews.length > 0 ? (
              <Grid container spacing={3}>
                {interviews.map((interview) => (
                  <Grid item xs={12} md={6} lg={4} key={interview.id}>
                    <Card className="border border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <CalendarToday className="h-5 w-5 text-blue-600 mr-2" />
                          <Typography variant="h6" fontWeight="bold" className="text-sm">
                            {interview.job_title}
                          </Typography>
                        </div>
                        <Typography variant="body2" color="text.secondary" className="mb-2">
                          {interview.company_name}
                        </Typography>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium">Date:</span>
                            <span className="ml-2">{new Date(interview.scheduled_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Time:</span>
                            <span className="ml-2">{interview.scheduled_time}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Type:</span>
                            <span className="ml-2">{interview.interview_type || 'Technical'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="contained" size="small" fullWidth>
                            Join Interview
                          </Button>
                          <Button variant="outlined" size="small">
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                <AlertTitle>No Interviews Scheduled</AlertTitle>
                You don't have any upcoming interviews. Keep applying to jobs!
              </Alert>
            )}
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
                  Application Trends
                </Typography>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.applicationTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="applications" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" fontWeight="bold" className="mb-4">
                  Skills Match Analysis
                </Typography>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={skillsMatchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="match" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
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
      <AdvancedDashboardLayout title="Applicant Dashboard" userRole="applicant">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdvancedDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout title="Applicant Dashboard" userRole="applicant">
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

      {/* Withdraw Application Dialog */}
      <Dialog
        open={withdrawDialog.open}
        onClose={() => setWithdrawDialog({ open: false, applicationId: null })}
      >
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to withdraw this application? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog({ open: false, applicationId: null })}>
            Cancel
          </Button>
          <Button onClick={handleWithdrawApplication} color="error" variant="contained">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resume Upload Dialog */}
      <Dialog
        open={resumeUploadDialog}
        onClose={() => setResumeUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Resume</DialogTitle>
        <DialogContent>
          <Box className="mt-4">
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<Upload />}
            >
              Choose Resume File
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
              />
            </Button>
            <Typography variant="caption" color="text.secondary" className="mt-2 block">
              Supported formats: PDF, DOC, DOCX (Max size: 5MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeUploadDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Upload Resume
          </Button>
        </DialogActions>
      </Dialog>
    </ModernDashboardLayout>
  );
};

export default ApplicantDashboard;
