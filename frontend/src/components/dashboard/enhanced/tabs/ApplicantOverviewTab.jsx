import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress,
  Chip, IconButton, List, ListItem, ListItemText, ListItemIcon,
  Divider, useTheme, motion, Tooltip, Badge, Paper
} from '@mui/material';
import {
  Work, Bookmark, Send, Schedule, Visibility, TrendingUp,
  ArrowForward, Upload, Person, Timeline, Assessment
} from '@mui/icons-material';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const ApplicantOverviewTab = ({ user }) => {
  const theme = useTheme();

  // Mock data for demonstration
  const statsData = [
    { title: 'Applications Sent', value: '24', icon: Send, color: theme.palette.primary.main, trend: 12 },
    { title: 'Interviews Scheduled', value: '5', icon: Schedule, color: theme.palette.success.main, trend: 8 },
    { title: 'Bookmarked Jobs', value: '12', icon: Bookmark, color: theme.palette.warning.main, trend: -2 },
    { title: 'Profile Views', value: '156', icon: Visibility, color: theme.palette.info.main, trend: 25 },
  ];

  const recentActivity = [
    { action: 'Applied to Software Engineer at TechCorp', time: '2 hours ago', icon: Send, color: 'primary' },
    { action: 'Bookmarked Frontend Developer at StartupXYZ', time: '5 hours ago', icon: Bookmark, color: 'warning' },
    { action: 'Interview scheduled with DataCorp', time: '1 day ago', icon: Schedule, color: 'success' },
    { action: 'Profile viewed by 3 recruiters', time: '2 days ago', icon: Visibility, color: 'info' },
  ];

  const applicationTrendData = [
    { month: 'Jan', applications: 12, interviews: 2 },
    { month: 'Feb', applications: 18, interviews: 3 },
    { month: 'Mar', applications: 15, interviews: 4 },
    { month: 'Apr', applications: 22, interviews: 5 },
    { month: 'May', applications: 24, interviews: 5 },
    { month: 'Jun', applications: 28, interviews: 7 },
  ];

  const skillsDistribution = [
    { name: 'Frontend', value: 40, color: '#8884d8' },
    { name: 'Backend', value: 30, color: '#82ca9d' },
    { name: 'DevOps', value: 20, color: '#ffc658' },
    { name: 'Other', value: 10, color: '#ff7c7c' },
  ];

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

  return (
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
                  Ready to find your next opportunity?
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Profile Completion: {user?.profileCompletionPercentage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={user?.profileCompletionPercentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': { backgroundColor: 'white' }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts and Activity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Application Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={applicationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stackId="1" 
                      stroke={theme.palette.primary.main} 
                      fill={theme.palette.primary.main + '40'} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interviews" 
                      stackId="2" 
                      stroke={theme.palette.success.main} 
                      fill={theme.palette.success.main + '40'} 
                    />
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
                Skills Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillsDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {skillsDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <item.icon color={item.color} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.action}
                        secondary={item.time}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
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
                  startIcon={<Work />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Browse Jobs
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Upload />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Update Resume
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Person />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Complete Profile
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Assessment />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
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
};

export default ApplicantOverviewTab;
