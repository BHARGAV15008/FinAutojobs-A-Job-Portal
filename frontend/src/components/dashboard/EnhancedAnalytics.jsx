import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  Send,
  CheckCircle,
  Schedule,
  Person,
  Work,
  Business,
  Star,
  ThumbUp,
  ShowChart,
  Assessment,
  Insights,
  Speed,
  GpsFixed,
  EmojiEvents
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const EnhancedAnalytics = ({ userRole = 'applicant', analyticsData = {} }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('applications');

  // Mock data - replace with real data from props/API
  const mockApplicantData = {
    profileViews: 1250,
    profileViewsChange: 15.3,
    applications: 23,
    applicationsChange: -5.2,
    interviews: 8,
    interviewsChange: 12.5,
    offers: 2,
    offersChange: 100,
    profileCompletion: 85,
    responseRate: 34.8,
    avgResponseTime: '2.3 days',
    topSkills: [
      { name: 'React', demand: 95, yourLevel: 'Expert' },
      { name: 'JavaScript', demand: 90, yourLevel: 'Expert' },
      { name: 'Node.js', demand: 85, yourLevel: 'Advanced' },
      { name: 'Python', demand: 80, yourLevel: 'Intermediate' },
      { name: 'TypeScript', demand: 75, yourLevel: 'Advanced' }
    ],
    applicationTrend: [
      { month: 'Jan', applications: 12, interviews: 3, offers: 1 },
      { month: 'Feb', applications: 18, interviews: 5, offers: 0 },
      { month: 'Mar', applications: 15, interviews: 4, offers: 1 },
      { month: 'Apr', applications: 23, interviews: 8, offers: 2 },
    ],
    industryInterest: [
      { name: 'Technology', value: 45, color: '#8884d8' },
      { name: 'Finance', value: 25, color: '#82ca9d' },
      { name: 'Healthcare', value: 15, color: '#ffc658' },
      { name: 'Education', value: 10, color: '#ff7300' },
      { name: 'Others', value: 5, color: '#00ff00' }
    ],
    recentActivity: [
      { type: 'application', company: 'Google', position: 'Senior Developer', date: '2 hours ago', status: 'pending' },
      { type: 'view', company: 'Microsoft', position: 'Profile viewed', date: '5 hours ago', status: 'info' },
      { type: 'interview', company: 'Amazon', position: 'Technical Interview', date: '1 day ago', status: 'scheduled' },
      { type: 'offer', company: 'Netflix', position: 'Frontend Developer', date: '3 days ago', status: 'received' }
    ]
  };

  const mockRecruiterData = {
    jobsPosted: 45,
    jobsPostedChange: 22.5,
    totalApplications: 1250,
    totalApplicationsChange: 18.7,
    interviews: 156,
    interviewsChange: 8.3,
    hires: 23,
    hiresChange: 15.2,
    avgTimeToHire: '18 days',
    topPerformingJobs: [
      { title: 'Senior React Developer', applications: 89, views: 450 },
      { title: 'Product Manager', applications: 76, views: 380 },
      { title: 'UX Designer', applications: 65, views: 320 }
    ]
  };

  const data = userRole === 'applicant' ? mockApplicantData : mockRecruiterData;

  const MetricCard = ({ title, value, change, icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight="bold">
                {value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {change > 0 ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography 
                  variant="caption" 
                  color={change > 0 ? 'success.main' : 'error.main'}
                  fontWeight="medium"
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ApplicantAnalytics = () => (
    <Box>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Profile Views"
            value={data.profileViews}
            change={data.profileViewsChange}
            icon={<Visibility />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Applications Sent"
            value={data.applications}
            change={data.applicationsChange}
            icon={<Send />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Interviews"
            value={data.interviews}
            change={data.interviewsChange}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Job Offers"
            value={data.offers}
            change={data.offersChange}
            icon={<EmojiEvents />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Application Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Activity Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.applicationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="interviews" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="offers" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Completion */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Strength
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {data.profileCompletion}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={data.profileCompletion} 
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Profile Completion
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Response Rate</Typography>
                <Typography variant="body2" fontWeight="medium">{data.responseRate}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Avg. Response Time</Typography>
                <Typography variant="body2" fontWeight="medium">{data.avgResponseTime}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills Market Demand
              </Typography>
              <List dense>
                {data.topSkills.map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={skill.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={skill.demand} 
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          />
                          <Chip 
                            label={skill.yourLevel} 
                            size="small" 
                            color={skill.yourLevel === 'Expert' ? 'success' : skill.yourLevel === 'Advanced' ? 'info' : 'default'}
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

        {/* Industry Interest */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Industry Interest Distribution
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.industryInterest}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.industryInterest.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {activity.type === 'application' && <Send color="primary" />}
                            {activity.type === 'view' && <Visibility color="info" />}
                            {activity.type === 'interview' && <Schedule color="warning" />}
                            {activity.type === 'offer' && <EmojiEvents color="success" />}
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </Box>
                        </TableCell>
                        <TableCell>{activity.company}</TableCell>
                        <TableCell>{activity.position}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={activity.status} 
                            size="small"
                            color={
                              activity.status === 'received' ? 'success' :
                              activity.status === 'scheduled' ? 'warning' :
                              activity.status === 'pending' ? 'default' : 'info'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          📊 Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </Box>
      </Box>

      {userRole === 'applicant' && <ApplicantAnalytics />}
      
      {/* Add RecruiterAnalytics component here if needed */}
    </Box>
  );
};

export default EnhancedAnalytics;
