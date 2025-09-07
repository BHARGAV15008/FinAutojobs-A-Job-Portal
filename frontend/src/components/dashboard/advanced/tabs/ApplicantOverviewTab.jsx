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
  useTheme,
  useMediaQuery,
  Alert,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  Assignment,
  Schedule,
  Star,
  Work,
  Person,
  Notifications,
  CheckCircle,
  Pending,
  Cancel,
  Interview,
  BookmarkBorder,
  Analytics,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
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

const ApplicantOverviewTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Sample data for charts
  const profileViewsData = [
    { name: 'Mon', views: 12 },
    { name: 'Tue', views: 19 },
    { name: 'Wed', views: 8 },
    { name: 'Thu', views: 25 },
    { name: 'Fri', views: 22 },
    { name: 'Sat', views: 15 },
    { name: 'Sun', views: 18 },
  ];

  const applicationStatusData = [
    { name: 'Pending', value: 8, color: '#ff9800' },
    { name: 'Reviewed', value: 5, color: '#2196f3' },
    { name: 'Interview', value: 2, color: '#4caf50' },
    { name: 'Rejected', value: 3, color: '#f44336' },
  ];

  const monthlyApplicationsData = [
    { month: 'Jan', applications: 4, interviews: 1 },
    { month: 'Feb', applications: 6, interviews: 2 },
    { month: 'Mar', applications: 8, interviews: 3 },
    { month: 'Apr', applications: 5, interviews: 1 },
  ];

  // Stats cards data
  const statsCards = [
    {
      title: 'Profile Views',
      value: data.analytics?.profileViews || 124,
      change: '+12%',
      changeType: 'increase',
      icon: <Visibility />,
      color: 'primary',
      description: 'This week'
    },
    {
      title: 'Applications Sent',
      value: data.analytics?.applicationsSent || 15,
      change: '+3',
      changeType: 'increase',
      icon: <Assignment />,
      color: 'info',
      description: 'This month'
    },
    {
      title: 'Interviews Scheduled',
      value: data.analytics?.interviewsScheduled || 3,
      change: '+1',
      changeType: 'increase',
      icon: <Schedule />,
      color: 'success',
      description: 'Upcoming'
    },
    {
      title: 'Response Rate',
      value: `${data.analytics?.responseRate || 20}%`,
      change: '+5%',
      changeType: 'increase',
      icon: <TrendingUp />,
      color: 'warning',
      description: 'Overall'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Pending sx={{ color: 'warning.main' }} />;
      case 'interview':
        return <Schedule sx={{ color: 'success.main' }} />;
      case 'rejected':
        return <Cancel sx={{ color: 'error.main' }} />;
      case 'accepted':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      default:
        return <Pending sx={{ color: 'grey.500' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'interview':
        return 'success';
      case 'rejected':
        return 'error';
      case 'accepted':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Welcome back, {user?.full_name || 'User'}! 👋
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                  Here's what's happening with your job search today
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${data.profile?.completeness || 85}% Profile Complete`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip 
                    label={`${data.applications?.length || 0} Active Applications`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '2rem'
                    }}
                  >
                    {user?.full_name?.[0] || 'U'}
                  </Avatar>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {stat.icon}
                    </Avatar>
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
                      {stat.description}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.changeType === 'increase' ? 'success' : 'error'}
                      icon={stat.changeType === 'increase' ? <ArrowUpward /> : <ArrowDownward />}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Profile Views Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Views This Week
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={profileViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Status */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Status
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {applicationStatusData.map((item, index) => (
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

        {/* Recent Applications */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Applications
                </Typography>
                <Button size="small" color="primary">
                  View All
                </Button>
              </Box>
              <List>
                {data.applications?.slice(0, 5).map((application, index) => (
                  <ListItem key={application.id} divider={index < 4}>
                    <ListItemIcon>
                      {getStatusIcon(application.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {application.position}
                          </Typography>
                          <Chip
                            label={application.status}
                            size="small"
                            color={getStatusColor(application.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {application.company}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Applied on {new Date(application.appliedDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommended Jobs */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recommended Jobs
                </Typography>
                <Button size="small" color="primary">
                  View All
                </Button>
              </Box>
              <List>
                {data.recommendations?.slice(0, 5).map((job, index) => (
                  <ListItem key={job.id} divider={index < 4}>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {job.position}
                          </Typography>
                          <Chip
                            label={`${job.match}% match`}
                            size="small"
                            color="success"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.company}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <BookmarkBorder />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Applications Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application & Interview Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyApplicationsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="applications" fill={theme.palette.primary.main} name="Applications" />
                  <Bar dataKey="interviews" fill={theme.palette.success.main} name="Interviews" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicantOverviewTab;
