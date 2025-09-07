import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Work,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const AdminAnalyticsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({});

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const tabLabels = ['Overview', 'Users', 'Companies', 'Jobs', 'Revenue'];

  // Sample analytics data
  const sampleData = {
    userGrowth: [
      { month: 'Jan', users: 1200, active: 980 },
      { month: 'Feb', users: 1450, active: 1180 },
      { month: 'Mar', users: 1680, active: 1320 },
      { month: 'Apr', users: 1920, active: 1540 },
      { month: 'May', users: 2150, active: 1720 },
      { month: 'Jun', users: 2380, active: 1890 },
    ],
    userTypes: [
      { name: 'Applicants', value: 1850, color: '#0088FE' },
      { name: 'Recruiters', value: 420, color: '#00C49F' },
      { name: 'Admins', value: 110, color: '#FFBB28' },
    ],
    companyGrowth: [
      { month: 'Jan', companies: 45, verified: 38 },
      { month: 'Feb', companies: 52, verified: 44 },
      { month: 'Mar', companies: 61, verified: 51 },
      { month: 'Apr', companies: 68, verified: 58 },
      { month: 'May', companies: 75, verified: 64 },
      { month: 'Jun', companies: 82, verified: 71 },
    ],
    jobStats: [
      { category: 'Technology', jobs: 245, applications: 1850 },
      { category: 'Finance', jobs: 180, applications: 1420 },
      { category: 'Healthcare', jobs: 120, applications: 890 },
      { category: 'Marketing', jobs: 95, applications: 720 },
      { category: 'Sales', jobs: 85, applications: 650 },
    ],
    revenue: [
      { month: 'Jan', subscription: 45000, premium: 12000 },
      { month: 'Feb', subscription: 48000, premium: 15000 },
      { month: 'Mar', subscription: 52000, premium: 18000 },
      { month: 'Apr', subscription: 55000, premium: 21000 },
      { month: 'May', subscription: 58000, premium: 24000 },
      { month: 'Jun', subscription: 62000, premium: 27000 },
    ],
    platformMetrics: {
      totalUsers: 2380,
      activeUsers: 1890,
      totalCompanies: 82,
      verifiedCompanies: 71,
      totalJobs: 725,
      totalApplications: 5530,
      monthlyRevenue: 89000,
      growthRate: 15.2
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(sampleData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {analyticsData.platformMetrics?.totalUsers?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
            <Typography variant="caption" color="success.main">
              +{analyticsData.platformMetrics?.growthRate}% this month
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Business sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {analyticsData.platformMetrics?.totalCompanies}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Companies
            </Typography>
            <Typography variant="caption" color="success.main">
              {analyticsData.platformMetrics?.verifiedCompanies} verified
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Work sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {analyticsData.platformMetrics?.totalJobs}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Jobs
            </Typography>
            <Typography variant="caption" color="info.main">
              {analyticsData.platformMetrics?.totalApplications} applications
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ₹{(analyticsData.platformMetrics?.monthlyRevenue / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monthly Revenue
            </Typography>
            <Typography variant="caption" color="success.main">
              +12.5% from last month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* User Growth Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Growth Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Total Users"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* User Distribution */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analyticsData.userTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.userTypes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUsersTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Registration & Activity
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  strokeWidth={3}
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCompaniesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Company Registration & Verification
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsBarChart data={analyticsData.companyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="companies" fill="#8884d8" name="Total Companies" />
                <Bar dataKey="verified" fill="#82ca9d" name="Verified Companies" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderJobsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Jobs by Category
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsBarChart data={analyticsData.jobStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" fill="#8884d8" name="Jobs Posted" />
                <Bar dataKey="applications" fill="#82ca9d" name="Applications" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRevenueTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Revenue Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analyticsData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="subscription"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Subscription Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="premium"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Premium Features"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderOverviewTab();
      case 1: return renderUsersTab();
      case 2: return renderCompaniesTab();
      case 3: return renderJobsTab();
      case 4: return renderRevenueTab();
      default: return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ height: 40, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
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
            Platform Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights into platform performance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 3 months</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAnalytics}
            size={isMobile ? 'small' : 'medium'}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </Box>
  );
};

export default AdminAnalyticsTab;
