import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, Stack, Divider, Chip,
  List, ListItem, ListItemText, ListItemIcon, Avatar,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Visibility, Apply, Schedule,
  CheckCircle, Cancel, Work, Business, LocationOn, Star,
  Timeline, Assessment, PieChart, BarChart
} from '@mui/icons-material';
import {
  LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart,
  Bar, PieChart as RechartsPieChart, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const ApplicantAnalyticsTab = ({ user }) => {
  const [timeRange, setTimeRange] = useState('30');
  const [analytics, setAnalytics] = useState({});

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalApplications: 24,
      interviewsScheduled: 8,
      offersReceived: 2,
      profileViews: 156,
      applicationSuccessRate: 33.3,
      averageResponseTime: 3.2
    },
    applicationTrends: [
      { month: 'Oct', applications: 5, interviews: 2, offers: 0 },
      { month: 'Nov', applications: 8, interviews: 3, offers: 1 },
      { month: 'Dec', applications: 6, interviews: 2, offers: 0 },
      { month: 'Jan', applications: 5, interviews: 1, offers: 1 }
    ],
    statusDistribution: [
      { name: 'Pending', value: 8, color: '#ff9800' },
      { name: 'Under Review', value: 6, color: '#2196f3' },
      { name: 'Interview Scheduled', value: 4, color: '#9c27b0' },
      { name: 'Rejected', value: 4, color: '#f44336' },
      { name: 'Accepted', value: 2, color: '#4caf50' }
    ],
    topCompanies: [
      { name: 'TechCorp Solutions', applications: 3, interviews: 2, logo: '/api/placeholder/32/32' },
      { name: 'StartupXYZ', applications: 2, interviews: 1, logo: '/api/placeholder/32/32' },
      { name: 'Digital Agency Pro', applications: 2, interviews: 0, logo: '/api/placeholder/32/32' },
      { name: 'Design Studios Inc', applications: 1, interviews: 1, logo: '/api/placeholder/32/32' }
    ],
    skillsInDemand: [
      { skill: 'React.js', demand: 85, jobs: 12 },
      { skill: 'JavaScript', demand: 90, jobs: 15 },
      { skill: 'Node.js', demand: 70, jobs: 8 },
      { skill: 'TypeScript', demand: 65, jobs: 7 },
      { skill: 'Python', demand: 60, jobs: 6 }
    ],
    locationInsights: [
      { location: 'San Francisco, CA', jobs: 8, avgSalary: '$95,000' },
      { location: 'New York, NY', jobs: 6, avgSalary: '$88,000' },
      { location: 'Remote', jobs: 5, avgSalary: '$75,000' },
      { location: 'Los Angeles, CA', jobs: 3, avgSalary: '$82,000' }
    ],
    recentActivity: [
      { type: 'application', company: 'TechCorp Solutions', job: 'Senior Frontend Developer', date: '2024-01-15' },
      { type: 'interview', company: 'StartupXYZ', job: 'Full Stack Engineer', date: '2024-01-14' },
      { type: 'view', company: 'Digital Agency Pro', job: 'React Developer', date: '2024-01-13' },
      { type: 'offer', company: 'Design Studios Inc', job: 'UI/UX Developer', date: '2024-01-12' }
    ]
  };

  useEffect(() => {
    setAnalytics(mockAnalytics);
  }, [timeRange]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'application': return <Apply color="primary" />;
      case 'interview': return <Schedule color="warning" />;
      case 'view': return <Visibility color="info" />;
      case 'offer': return <CheckCircle color="success" />;
      default: return <Work />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'application': return `Applied to ${activity.job}`;
      case 'interview': return `Interview scheduled for ${activity.job}`;
      case 'view': return `Profile viewed by ${activity.company}`;
      case 'offer': return `Offer received for ${activity.job}`;
      default: return activity.type;
    }
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Analytics & Insights
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 3 months</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Overview Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {analytics.overview?.totalApplications}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Applications
                    </Typography>
                  </Box>
                  <Apply fontSize="large" color="primary" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" ml={0.5}>
                    +12% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {analytics.overview?.interviewsScheduled}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Interviews Scheduled
                    </Typography>
                  </Box>
                  <Schedule fontSize="large" color="warning" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" ml={0.5}>
                    +25% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {analytics.overview?.offersReceived}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Offers Received
                    </Typography>
                  </Box>
                  <CheckCircle fontSize="large" color="success" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" ml={0.5}>
                    +100% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {analytics.overview?.profileViews}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Profile Views
                    </Typography>
                  </Box>
                  <Visibility fontSize="large" color="info" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" ml={0.5}>
                    +8% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="secondary.main">
                      {analytics.overview?.applicationSuccessRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                  <Star fontSize="large" color="secondary" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" ml={0.5}>
                    +5% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {analytics.overview?.averageResponseTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time (days)
                    </Typography>
                  </Box>
                  <Timeline fontSize="large" color="action" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingDown fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" ml={0.5}>
                    -0.5 days improved
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Application Trends */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Application Trends
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.applicationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="applications" 
                        stroke="#2196f3" 
                        strokeWidth={2}
                        name="Applications"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="interviews" 
                        stroke="#ff9800" 
                        strokeWidth={2}
                        name="Interviews"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="offers" 
                        stroke="#4caf50" 
                        strokeWidth={2}
                        name="Offers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Application Status Distribution */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Application Status
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.statusDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Companies */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Top Companies Applied
                </Typography>
                <List>
                  {analytics.topCompanies?.map((company, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Avatar src={company.logo} sx={{ width: 32, height: 32 }}>
                          {company.name[0]}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={company.name}
                        secondary={`${company.applications} applications, ${company.interviews} interviews`}
                      />
                      <Chip 
                        label={`${Math.round((company.interviews / company.applications) * 100)}%`}
                        size="small"
                        color="primary"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Skills in Demand */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Skills in Demand
                </Typography>
                <Stack spacing={2}>
                  {analytics.skillsInDemand?.map((skill, index) => (
                    <Box key={index}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {skill.skill}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {skill.jobs} jobs
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={skill.demand}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Location Insights */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Location Insights
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell align="center">Jobs</TableCell>
                        <TableCell align="right">Avg Salary</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.locationInsights?.map((location, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LocationOn fontSize="small" color="action" />
                              {location.location}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={location.jobs} size="small" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {location.avgSalary}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {analytics.recentActivity?.map((activity, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={getActivityText(activity)}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {activity.company}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.date).toLocaleDateString()}
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
        </Grid>
      </motion.div>
    </Box>
  );
};

export default ApplicantAnalyticsTab;
