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
  Work,
  People,
  Schedule,
  Visibility,
  CheckCircle,
  Assessment,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const RecruiterAnalyticsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [timeRange, setTimeRange] = useState('3months');
  const [loading, setLoading] = useState(true);

  // Sample analytics data
  const hiringTrendsData = [
    { month: 'Oct', applications: 145, interviews: 28, hires: 8 },
    { month: 'Nov', applications: 162, interviews: 35, hires: 12 },
    { month: 'Dec', applications: 178, interviews: 42, hires: 15 },
    { month: 'Jan', applications: 224, interviews: 48, hires: 18 },
  ];

  const sourceEffectivenessData = [
    { name: 'Job Boards', applications: 45, hires: 8, color: '#4caf50' },
    { name: 'LinkedIn', applications: 38, hires: 12, color: '#2196f3' },
    { name: 'Referrals', applications: 25, hires: 15, color: '#ff9800' },
    { name: 'Company Website', applications: 32, hires: 6, color: '#9c27b0' },
    { name: 'Social Media', applications: 18, hires: 3, color: '#f44336' },
  ];

  const departmentHiringData = [
    { department: 'Engineering', openings: 12, filled: 8, pending: 4 },
    { department: 'Design', openings: 6, filled: 4, pending: 2 },
    { department: 'Marketing', openings: 4, filled: 3, pending: 1 },
    { department: 'Sales', openings: 8, filled: 5, pending: 3 },
    { department: 'HR', openings: 3, filled: 2, pending: 1 },
  ];

  const skillsDemandData = [
    { skill: 'React', demand: 85, supply: 65 },
    { skill: 'Node.js', demand: 78, supply: 58 },
    { skill: 'Python', demand: 72, supply: 68 },
    { skill: 'UI/UX', demand: 68, supply: 45 },
    { skill: 'DevOps', demand: 82, supply: 38 },
    { skill: 'Data Science', demand: 75, supply: 42 },
  ];

  const timeToHireData = [
    { position: 'Frontend Dev', avgDays: 28, target: 30 },
    { position: 'Backend Dev', avgDays: 35, target: 30 },
    { position: 'Designer', avgDays: 22, target: 25 },
    { position: 'Product Manager', avgDays: 45, target: 40 },
    { position: 'Data Analyst', avgDays: 32, target: 35 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const statsCards = [
    {
      title: 'Total Applications',
      value: '224',
      change: '+18%',
      changeType: 'increase',
      icon: <People />,
      color: 'primary',
      description: 'This month'
    },
    {
      title: 'Interview Rate',
      value: '21%',
      change: '+3%',
      changeType: 'increase',
      icon: <Schedule />,
      color: 'info',
      description: 'Applications to interviews'
    },
    {
      title: 'Hire Rate',
      value: '8%',
      change: '+2%',
      changeType: 'increase',
      icon: <CheckCircle />,
      color: 'success',
      description: 'Applications to hires'
    },
    {
      title: 'Avg Time to Hire',
      value: '32 days',
      change: '-5 days',
      changeType: 'decrease',
      icon: <TrendingUp />,
      color: 'warning',
      description: 'From application to offer'
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
            Recruitment Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your hiring performance and insights
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
                      color={stat.changeType === 'increase' ? 'success' : stat.changeType === 'decrease' ? 'info' : 'default'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Hiring Trends */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hiring Funnel Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hiringTrendsData}>
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
                    dataKey="interviews"
                    stackId="2"
                    stroke={theme.palette.info.main}
                    fill={theme.palette.info.main}
                    fillOpacity={0.6}
                    name="Interviews"
                  />
                  <Area
                    type="monotone"
                    dataKey="hires"
                    stackId="3"
                    stroke={theme.palette.success.main}
                    fill={theme.palette.success.main}
                    fillOpacity={0.6}
                    name="Hires"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Source Effectiveness */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Source Effectiveness
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sourceEffectivenessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="hires"
                  >
                    {sourceEffectivenessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {sourceEffectivenessData.map((item, index) => (
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
                      {item.hires}/{item.applications}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Hiring Status */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Hiring Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentHiringData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={80} />
                  <RechartsTooltip />
                  <Bar dataKey="filled" fill={theme.palette.success.main} name="Filled" />
                  <Bar dataKey="pending" fill={theme.palette.warning.main} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Demand vs Supply */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills: Demand vs Supply
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillsDemandData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Demand"
                    dataKey="demand"
                    stroke={theme.palette.error.main}
                    fill={theme.palette.error.main}
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Supply"
                    dataKey="supply"
                    stroke={theme.palette.success.main}
                    fill={theme.palette.success.main}
                    fillOpacity={0.3}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Time to Hire Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time to Hire Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeToHireData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="avgDays" fill={theme.palette.primary.main} name="Actual Days" />
                  <Bar dataKey="target" fill={theme.palette.success.main} name="Target Days" />
                </BarChart>
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
                      Your hire rate improved by 2% this month. LinkedIn referrals are performing exceptionally well.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUp color="warning" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="warning.main">
                        Opportunity
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      DevOps and UI/UX skills are in high demand but low supply. Consider expanding sourcing strategies.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Assessment color="info" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="info.main">
                        Recommendation
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Time to hire for Backend Developers is above target. Consider streamlining the interview process.
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

export default RecruiterAnalyticsTab;
