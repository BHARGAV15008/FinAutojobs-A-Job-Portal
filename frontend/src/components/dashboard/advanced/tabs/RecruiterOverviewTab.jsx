import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  useMediaQuery,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Work,
  People,
  Schedule,
  CheckCircle,
  Visibility,
  MoreVert,
  Add,
  Business,
  Assessment,
  Star,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const RecruiterOverviewTab = ({ data, onDataUpdate, user, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sample data
  const applicationTrendsData = [
    { month: 'Oct', applications: 45, hired: 3 },
    { month: 'Nov', applications: 62, hired: 5 },
    { month: 'Dec', applications: 78, hired: 4 },
    { month: 'Jan', applications: 124, hired: 8 },
  ];

  const jobStatusData = [
    { name: 'Active', value: 18, color: '#4caf50' },
    { name: 'Draft', value: 4, color: '#ff9800' },
    { name: 'Closed', value: 6, color: '#f44336' },
    { name: 'On Hold', value: 2, color: '#9e9e9e' },
  ];

  const topPerformingJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      applications: 45,
      views: 234,
      hires: 2,
      status: 'active',
      postedDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      applications: 38,
      views: 189,
      hires: 1,
      status: 'active',
      postedDate: '2024-01-20'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      applications: 52,
      views: 298,
      hires: 3,
      status: 'active',
      postedDate: '2024-01-10'
    }
  ];

  const recentApplications = [
    {
      id: 1,
      candidateName: 'John Smith',
      jobTitle: 'Senior Frontend Developer',
      appliedDate: '2024-01-25',
      status: 'pending',
      avatar: null,
      experience: '5 years',
      skills: ['React', 'JavaScript', 'TypeScript']
    },
    {
      id: 2,
      candidateName: 'Sarah Johnson',
      jobTitle: 'UI/UX Designer',
      appliedDate: '2024-01-24',
      status: 'reviewed',
      avatar: null,
      experience: '3 years',
      skills: ['Figma', 'Adobe XD', 'Prototyping']
    },
    {
      id: 3,
      candidateName: 'Mike Chen',
      jobTitle: 'Full Stack Engineer',
      appliedDate: '2024-01-24',
      status: 'interview',
      avatar: null,
      experience: '4 years',
      skills: ['Node.js', 'React', 'MongoDB']
    }
  ];

  const statsCards = [
    {
      title: 'Total Jobs',
      value: data?.totalJobs || '24',
      change: '+3 this month',
      changeType: 'increase',
      icon: <Work />,
      color: 'primary',
      action: 'View All Jobs'
    },
    {
      title: 'Active Applications',
      value: data?.totalApplications || '342',
      change: '+28 new',
      changeType: 'increase',
      icon: <People />,
      color: 'info',
      action: 'Review Applications'
    },
    {
      title: 'Scheduled Interviews',
      value: data?.scheduledInterviews || '12',
      change: '5 today',
      changeType: 'neutral',
      icon: <Schedule />,
      color: 'warning',
      action: 'View Schedule'
    },
    {
      title: 'Successful Hires',
      value: data?.hiredCandidates || '8',
      change: '+2 this week',
      changeType: 'increase',
      icon: <CheckCircle />,
      color: 'success',
      action: 'View Hires'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      reviewed: 'info',
      interview: 'primary',
      hired: 'success',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} lg={3} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 120, bgcolor: 'grey.200', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.name || 'Recruiter'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your recruitment activities today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        color: 'white',
                        p: 1.5,
                        borderRadius: 2,
                        mr: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {stat.change}
                    </Typography>
                    <Button size="small" variant="text">
                      {stat.action}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Application Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Application Trends
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={applicationTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                    name="Applications"
                  />
                  <Area
                    type="monotone"
                    dataKey="hired"
                    stackId="2"
                    stroke={theme.palette.success.main}
                    fill={theme.palette.success.main}
                    fillOpacity={0.6}
                    name="Hired"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Job Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {jobStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {jobStatusData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: item.color,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Jobs */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Top Performing Jobs
                </Typography>
                <Button startIcon={<Add />} size="small">
                  Post New Job
                </Button>
              </Box>
              <List>
                {topPerformingJobs.map((job, index) => (
                  <ListItem key={job.id} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Work />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {job.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Typography variant="caption">
                              <Visibility sx={{ fontSize: 14, mr: 0.5 }} />
                              {job.views} views
                            </Typography>
                            <Typography variant="caption">
                              <People sx={{ fontSize: 14, mr: 0.5 }} />
                              {job.applications} applications
                            </Typography>
                            <Typography variant="caption">
                              <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                              {job.hires} hires
                            </Typography>
                          </Box>
                          <Chip
                            label={job.status}
                            size="small"
                            color="success"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Applications */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Applications
                </Typography>
                <Button size="small">
                  View All
                </Button>
              </Box>
              <List>
                {recentApplications.map((application) => (
                  <ListItem key={application.id} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {application.candidateName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {application.candidateName}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {application.jobTitle} • {application.experience}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {application.skills.slice(0, 2).map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            ))}
                            {application.skills.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{application.skills.length - 2} more
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip
                              label={application.status}
                              size="small"
                              color={getStatusColor(application.status)}
                              sx={{ textTransform: 'capitalize' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                              {new Date(application.appliedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Post New Job
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Review Applications
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Schedule Interview
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  View Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecruiterOverviewTab;
