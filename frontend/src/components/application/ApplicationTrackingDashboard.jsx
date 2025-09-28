import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  LinearProgress,
  Alert,
  Tooltip,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Work,
  Business,
  LocationOn,
  Schedule,
  TrendingUp,
  Visibility,
  Edit,
  Delete,
  Download,
  Share,
  FilterList,
  Search,
  Refresh,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Assignment,
  Person,
  Email,
  Phone,
  AttachFile,
  Timeline as TimelineIcon,
  Analytics,
  Notifications,
  Star,
  StarBorder
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import * as applicationsAPI from '../../api/applications';

/**
 * Application Tracking Dashboard
 * Comprehensive dashboard for tracking job applications with real-time updates
 */
const ApplicationTrackingDashboard = ({ userRole = 'applicant' }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();

  // State management
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'appliedAt',
    sortOrder: 'desc'
  });
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Application status configurations
  const statusConfig = {
    submitted: { 
      color: 'info', 
      icon: <HourglassEmpty />, 
      label: 'Submitted',
      description: 'Application received and under initial review'
    },
    under_review: { 
      color: 'warning', 
      icon: <Assignment />, 
      label: 'Under Review',
      description: 'HR team is reviewing your application'
    },
    screening: { 
      color: 'warning', 
      icon: <FilterList />, 
      label: 'Screening',
      description: 'Initial screening in progress'
    },
    shortlisted: { 
      color: 'success', 
      icon: <CheckCircle />, 
      label: 'Shortlisted',
      description: 'Congratulations! You have been shortlisted'
    },
    interview_scheduled: { 
      color: 'primary', 
      icon: <Schedule />, 
      label: 'Interview Scheduled',
      description: 'Interview has been scheduled'
    },
    interviewed: { 
      color: 'primary', 
      icon: <Person />, 
      label: 'Interviewed',
      description: 'Interview completed, awaiting decision'
    },
    offer_extended: { 
      color: 'success', 
      icon: <Star />, 
      label: 'Offer Extended',
      description: 'Job offer has been extended to you'
    },
    hired: { 
      color: 'success', 
      icon: <CheckCircle />, 
      label: 'Hired',
      description: 'Congratulations! You have been hired'
    },
    rejected: { 
      color: 'error', 
      icon: <Cancel />, 
      label: 'Rejected',
      description: 'Application was not successful this time'
    },
    withdrawn: { 
      color: 'default', 
      icon: <Cancel />, 
      label: 'Withdrawn',
      description: 'Application was withdrawn'
    }
  };

  // Load applications and stats
  useEffect(() => {
    loadApplications();
    loadStats();
  }, [filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getApplications({
        status: filters.status === 'all' ? undefined : filters.status,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: 1,
        limit: 50
      });

      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await applicationsAPI.getApplicationStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadApplications(), loadStats()]);
    setRefreshing(false);
  };

  const handleViewDetails = async (applicationId) => {
    try {
      const response = await applicationsAPI.getApplicationById(applicationId);
      setSelectedApplication(response.data.application);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error loading application details:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusProgress = (status) => {
    const statusOrder = [
      'submitted', 'under_review', 'screening', 'shortlisted', 
      'interview_scheduled', 'interviewed', 'offer_extended', 'hired'
    ];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const renderApplicationCard = (application) => (
    <motion.div
      key={application.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          '&:hover': { 
            boxShadow: 4,
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleViewDetails(application.id)}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <Work />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h3">
                    {application.job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {application.job.company}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Chip
                icon={statusConfig[application.status]?.icon}
                label={statusConfig[application.status]?.label || application.status}
                color={statusConfig[application.status]?.color || 'default'}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="body2" color="text.secondary">
                Applied: {new Date(application.appliedAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {application.metadata.daysInCurrentStatus} days in current status
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              {application.aiScoring && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Match Score
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={application.aiScoring.overallScore}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Typography variant="body2">
                      {application.aiScoring.overallScore}%
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={12} md={2}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Tooltip title="View Details">
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                </Tooltip>
                {userRole === 'applicant' && application.status === 'submitted' && (
                  <Tooltip title="Withdraw Application">
                    <IconButton size="small" color="error">
                      <Cancel />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Progress bar for application status */}
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={getStatusProgress(application.status)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStatsCards = () => (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {stats.totalApplications || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Applications
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {stats.statusBreakdown?.shortlisted || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shortlisted
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <HourglassEmpty />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {stats.statusBreakdown?.under_review || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Under Review
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {Math.round(stats.averageResponseTime / (1000 * 60 * 60 * 24)) || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Response (Days)
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search applications..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              {Object.keys(statusConfig).map(status => (
                <MenuItem key={status} value={status}>
                  {statusConfig[status].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <MenuItem value="appliedAt">Applied Date</MenuItem>
              <MenuItem value="lastUpdated">Last Updated</MenuItem>
              <MenuItem value="aiScoring.overallScore">Match Score</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={12} md={3}>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
            >
              Export
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderApplicationDetails = () => (
    <Dialog
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Application Details
          </Typography>
          <Chip
            icon={statusConfig[selectedApplication?.status]?.icon}
            label={statusConfig[selectedApplication?.status]?.label}
            color={statusConfig[selectedApplication?.status]?.color}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {selectedApplication && (
          <Box>
            {/* Job Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Position
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.jobId?.jobTitle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Company
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.jobId?.companyName}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Timeline
                </Typography>
                <Timeline>
                  {selectedApplication.timeline?.map((item, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color={statusConfig[item.status]?.color || 'grey'}>
                          {statusConfig[item.status]?.icon}
                        </TimelineDot>
                        {index < selectedApplication.timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body1">
                          {item.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                        {item.note && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {item.note}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>

            {/* AI Scoring */}
            {selectedApplication.aiScoring && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Match Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {selectedApplication.aiScoring.overallScore}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Match
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main">
                          {selectedApplication.aiScoring.skillsMatchPercentage}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Skills Match
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="info.main">
                          {selectedApplication.aiScoring.experienceMatch}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Experience Match
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setDetailsOpen(false)}>
          Close
        </Button>
        {userRole === 'applicant' && selectedApplication?.status === 'submitted' && (
          <Button color="error" variant="outlined">
            Withdraw Application
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {userRole === 'applicant' ? 'My Applications' : 'Received Applications'}
        </Typography>
        <Badge badgeContent={applications.length} color="primary">
          <Assignment />
        </Badge>
      </Box>

      {/* Statistics Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* Applications List */}
      <Box>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : applications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No applications found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userRole === 'applicant' 
                ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                : "No applications received yet."
              }
            </Typography>
          </Paper>
        ) : (
          <AnimatePresence>
            {applications.map(renderApplicationCard)}
          </AnimatePresence>
        )}
      </Box>

      {/* Application Details Modal */}
      {renderApplicationDetails()}
    </Box>
  );
};

export default ApplicationTrackingDashboard;
