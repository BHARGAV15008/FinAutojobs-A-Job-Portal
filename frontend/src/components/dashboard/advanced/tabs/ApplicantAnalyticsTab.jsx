import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  Assignment,
  Schedule,
  CheckCircle,
  Cancel,
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
  RadialBarChart,
  RadialBar,
} from 'recharts';

const ApplicantAnalyticsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [timeRange, setTimeRange] = useState('3months');
  const [loading, setLoading] = useState(true);

  // Sample analytics data
  const profileViewsData = [
    { month: 'Oct', views: 45, applications: 8 },
    { month: 'Nov', views: 62, applications: 12 },
    { month: 'Dec', views: 78, applications: 15 },
    { month: 'Jan', views: 124, applications: 18 },
  ];

  const applicationStatusData = [
    { name: 'Pending', value: 8, color: '#ff9800' },
    { name: 'Reviewed', value: 5, color: '#2196f3' },
    { name: 'Interview', value: 3, color: '#4caf50' },
    { name: 'Rejected', value: 4, color: '#f44336' },
  ];

  const skillsMatchData = [
    { skill: 'React', match: 95, jobs: 45 },
    { skill: 'JavaScript', match: 88, jobs: 52 },
    { skill: 'Node.js', match: 82, jobs: 38 },
    { skill: 'Python', match: 75, jobs: 28 },
    { skill: 'SQL', match: 70, jobs: 35 },
  ];

  const responseRateData = [
    { week: 'Week 1', rate: 15 },
    { week: 'Week 2', rate: 22 },
    { week: 'Week 3', rate: 18 },
    { week: 'Week 4', rate: 25 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const statsCards = [
    {
      title: 'Profile Views',
      value: '124',
      change: '+15%',
      changeType: 'increase',
      icon: <Visibility />,
      color: 'primary',
      description: 'This month'
    },
    {
      title: 'Applications Sent',
      value: '18',
      change: '+20%',
      changeType: 'increase',
      icon: <Assignment />,
      color: 'info',
      description: 'This month'
    },
    {
      title: 'Response Rate',
      value: '22%',
      change: '+3%',
      changeType: 'increase',
      icon: <TrendingUp />,
      color: 'success',
      description: 'Average'
    },
    {
      title: 'Interview Rate',
      value: '17%',
      change: '+5%',
      changeType: 'increase',
      icon: <Schedule />,
      color: 'warning',
      description: 'Success rate'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} lg={3} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 100, bgcolor: 'grey.200', borderRadius: 1 }} />
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your job search performance and insights
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="1month">1 Month</MenuItem>
            <MenuItem value="3months">3 Months</MenuItem>
            <MenuItem value="6months">6 Months</MenuItem>
            <MenuItem value="1year">1 Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        color: 'white',
                        p: 1,
                        borderRadius: 2,
                        mr: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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
        {/* Profile Views & Applications Trend */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Views & Applications Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={profileViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                    name="Profile Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stackId="2"
                    stroke={theme.palette.secondary.main}
                    fill={theme.palette.secondary.main}
                    fillOpacity={0.6}
                    name="Applications"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Status Distribution */}
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

        {/* Skills Match Analysis */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills Match Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillsMatchData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="skill" type="category" width={80} />
                  <RechartsTooltip />
                  <Bar dataKey="match" fill={theme.palette.success.main} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Response Rate Trend */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Response Rate
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={theme.palette.warning.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.warning.main, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Insights
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="success.main">
                        Strong Performance
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Your profile views increased by 15% this month. Keep optimizing your profile!
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUp color="warning" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="warning.main">
                        Improvement Opportunity
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Consider applying to more jobs to increase your response rate.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Assignment color="info" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="info.main">
                        Recommendation
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Focus on React and JavaScript skills - they have the highest match rates.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicantAnalyticsTab;
