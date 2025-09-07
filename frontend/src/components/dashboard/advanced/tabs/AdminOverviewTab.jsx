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
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Work,
  Assessment,
  Security,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  MoreVert,
  Notifications,
  Storage,
  Speed,
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

const AdminOverviewTab = ({ data, onDataUpdate, user, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sample data
  const userGrowthData = [
    { month: 'Oct', users: 850, companies: 65 },
    { month: 'Nov', users: 920, companies: 72 },
    { month: 'Dec', users: 1050, companies: 78 },
    { month: 'Jan', users: 1250, companies: 85 },
  ];

  const systemHealthData = [
    { name: 'API Response', value: 98.5, color: '#4caf50' },
    { name: 'Database', value: 99.2, color: '#2196f3' },
    { name: 'Storage', value: 97.8, color: '#ff9800' },
    { name: 'Network', value: 99.5, color: '#9c27b0' },
  ];

  const activityData = [
    { hour: '00', logins: 45, jobs: 12, applications: 23 },
    { hour: '06', logins: 120, jobs: 28, applications: 67 },
    { hour: '12', logins: 280, jobs: 45, applications: 156 },
    { hour: '18', logins: 350, jobs: 38, applications: 189 },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Server Load',
      message: 'Server CPU usage is above 85%',
      timestamp: '2024-01-25T14:30:00',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Database maintenance scheduled for tonight',
      timestamp: '2024-01-25T10:00:00',
      severity: 'low'
    },
    {
      id: 3,
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily backup completed successfully',
      timestamp: '2024-01-25T02:00:00',
      severity: 'low'
    }
  ];

  const topCompanies = [
    { name: 'TechCorp India', users: 45, jobs: 18, applications: 234 },
    { name: 'StartupXYZ', users: 32, jobs: 12, applications: 189 },
    { name: 'InnovateLab', users: 28, jobs: 15, applications: 156 },
    { name: 'DevSolutions', users: 25, jobs: 10, applications: 134 }
  ];

  const statsCards = [
    {
      title: 'Total Users',
      value: data?.totalUsers || '1,250',
      change: '+12%',
      changeType: 'increase',
      icon: <People />,
      color: 'primary',
      description: 'Active platform users'
    },
    {
      title: 'Companies',
      value: data?.totalCompanies || '85',
      change: '+8%',
      changeType: 'increase',
      icon: <Business />,
      color: 'info',
      description: 'Registered companies'
    },
    {
      title: 'Active Jobs',
      value: data?.totalJobs || '420',
      change: '+15%',
      changeType: 'increase',
      icon: <Work />,
      color: 'success',
      description: 'Currently posted jobs'
    },
    {
      title: 'System Health',
      value: `${data?.systemHealth || '98.5'}%`,
      change: '+0.2%',
      changeType: 'increase',
      icon: <Assessment />,
      color: 'warning',
      description: 'Overall system status'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Info color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
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
          Welcome back, Admin! 🛡️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your system overview and key metrics for today.
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
                      {stat.description}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.changeType === 'increase' ? 'success' : 'error'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* User Growth Trends */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Platform Growth
                </Typography>
                <IconButton size="small">
                  <Refresh />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                    name="Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="companies"
                    stackId="2"
                    stroke={theme.palette.secondary.main}
                    fill={theme.palette.secondary.main}
                    fillOpacity={0.6}
                    name="Companies"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                System Health
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={systemHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {systemHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {systemHealthData.map((item, index) => (
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
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Alerts
                </Typography>
                <Button size="small">
                  View All
                </Button>
              </Box>
              <List>
                {recentAlerts.map((alert) => (
                  <ListItem key={alert.id} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getAlertIcon(alert.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {alert.title}
                          </Typography>
                          <Chip
                            label={alert.severity}
                            size="small"
                            color={getSeverityColor(alert.severity)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Companies */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Top Companies
                </Typography>
                <Button size="small">
                  View All
                </Button>
              </Box>
              <List>
                {topCompanies.map((company, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {company.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {company.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Typography variant="caption">
                              <People sx={{ fontSize: 14, mr: 0.5 }} />
                              {company.users} users
                            </Typography>
                            <Typography variant="caption">
                              <Work sx={{ fontSize: 14, mr: 0.5 }} />
                              {company.jobs} jobs
                            </Typography>
                            <Typography variant="caption">
                              <Assessment sx={{ fontSize: 14, mr: 0.5 }} />
                              {company.applications} applications
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

        {/* Activity Timeline */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Daily Activity Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="logins" fill={theme.palette.primary.main} name="Logins" />
                  <Bar dataKey="jobs" fill={theme.palette.success.main} name="Jobs Posted" />
                  <Bar dataKey="applications" fill={theme.palette.info.main} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Admin Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<People />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Business />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Review Companies
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Security Audit
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverviewTab;
