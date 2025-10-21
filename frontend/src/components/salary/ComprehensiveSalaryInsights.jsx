import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  LocationOn,
  Work,
  School,
  Business,
  ShowChart,
  Assessment,
  MonetizationOn,
  BarChart,
  CompareArrows,
  FilterList,
  Share,
  Download,
  Insights,
  Speed
} from '@mui/icons-material';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useSalaryInsights } from '../../hooks/useDataFetching';
import EmptyState from '../common/EmptyState';

const ComprehensiveSalaryInsights = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('applications');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [experienceRange, setExperienceRange] = useState([0, 10]);
  const [comparisonMode, setComparisonMode] = useState(false);
  
  // Use real data fetching hook
  const { data: salaryData, loading, error, isEmpty, refetch } = useSalaryInsights({
    role: selectedRole,
    location: selectedLocation,
    experienceRange,
    timeRange
  }, {
    dependencies: [selectedRole, selectedLocation, experienceRange, timeRange]
  });

  // Handle loading and empty states
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading salary insights...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading salary insights: {error}
      </Alert>
    );
  }

  if (isEmpty || !salaryData) {
    return (
      <EmptyState
        type="analytics"
        title="No Salary Data Available"
        description="Salary insights will be available once we have sufficient data for your selected criteria."
        showRefresh={true}
        onRefresh={refetch}
      />
    );
  }

  // Default structure for salary data if not provided by API
  const defaultSalaryData = {
    roles: [
      'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 
      'DevOps Engineer', 'Business Analyst', 'Marketing Manager', 'Sales Executive'
    ],
    locations: [
      'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'
    ],
    industries: [
      'Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting', 'Manufacturing'
    ],
    salaryTrends: [
      { year: '2020', avgSalary: 12, medianSalary: 10, topPercentile: 25 },
      { year: '2021', avgSalary: 14, medianSalary: 12, topPercentile: 28 },
      { year: '2022', avgSalary: 16, medianSalary: 14, topPercentile: 32 },
      { year: '2023', avgSalary: 18, medianSalary: 16, topPercentile: 36 },
      { year: '2024', avgSalary: 20, medianSalary: 18, topPercentile: 40 }
    ],
    roleComparison: [
      { role: 'Software Engineer', junior: 8, mid: 15, senior: 25, lead: 40 },
      { role: 'Product Manager', junior: 12, mid: 20, senior: 35, lead: 55 },
      { role: 'Data Scientist', junior: 10, mid: 18, senior: 30, lead: 45 },
      { role: 'UX Designer', junior: 7, mid: 12, senior: 20, lead: 30 }
    ],
    locationSalaries: [
      { location: 'Bangalore', avgSalary: 18, costOfLiving: 85, salaryIndex: 95 },
      { location: 'Mumbai', avgSalary: 20, costOfLiving: 100, salaryIndex: 90 },
      { location: 'Delhi', avgSalary: 17, costOfLiving: 90, salaryIndex: 88 },
      { location: 'Hyderabad', avgSalary: 15, costOfLiving: 70, salaryIndex: 92 },
      { location: 'Chennai', avgSalary: 14, costOfLiving: 65, salaryIndex: 90 },
      { location: 'Pune', avgSalary: 16, costOfLiving: 75, salaryIndex: 93 }
    ],
    skillPremium: [
      { skill: 'React', premium: 25, demand: 95 },
      { skill: 'Python', premium: 30, demand: 90 },
      { skill: 'AWS', premium: 35, demand: 85 },
      { skill: 'Machine Learning', premium: 40, demand: 80 },
      { skill: 'Kubernetes', premium: 45, demand: 75 },
      { skill: 'Blockchain', premium: 50, demand: 60 }
    ],
    industryBreakdown: [
      { name: 'Technology', value: 35, avgSalary: 22, color: '#8884d8' },
      { name: 'Finance', value: 25, avgSalary: 28, color: '#82ca9d' },
      { name: 'Healthcare', value: 15, avgSalary: 18, color: '#ffc658' },
      { name: 'E-commerce', value: 15, avgSalary: 20, color: '#ff7300' },
      { name: 'Others', value: 10, avgSalary: 16, color: '#00ff00' }
    ]
  };

  const SalaryMetricCard = ({ title, value, subtitle, trend, icon, color = 'primary' }) => (
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
                ₹{value}L
              </Typography>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  {trend > 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                  )}
                  <Typography 
                    variant="caption" 
                    color={trend > 0 ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {Math.abs(trend)}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const SalaryCalculator = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          💰 Salary Calculator
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={salaryData.roles}
              value={selectedRole}
              onChange={(event, newValue) => setSelectedRole(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Job Role" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={salaryData.locations}
              value={selectedLocation}
              onChange={(event, newValue) => setSelectedLocation(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Location" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography gutterBottom>Experience Range: {experienceRange[0]} - {experienceRange[1]} years</Typography>
            <Slider
              value={experienceRange}
              onChange={(event, newValue) => setExperienceRange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={20}
              marks={[
                { value: 0, label: '0y' },
                { value: 5, label: '5y' },
                { value: 10, label: '10y' },
                { value: 15, label: '15y' },
                { value: 20, label: '20y+' }
              ]}
            />
          </Grid>
          {selectedRole && selectedLocation && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="h6">
                  Estimated Salary Range for {selectedRole} in {selectedLocation}
                </Typography>
                <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
                  ₹{8 + experienceRange[1] * 1.5}L - ₹{15 + experienceRange[1] * 2.5}L
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Based on {experienceRange[1]} years of experience
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  const SalaryTrendsChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📈 Salary Trends Over Time
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salaryData.salaryTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}L`, '']} />
              <Legend />
              <Line type="monotone" dataKey="avgSalary" stroke="#8884d8" strokeWidth={2} name="Average Salary" />
              <Line type="monotone" dataKey="medianSalary" stroke="#82ca9d" strokeWidth={2} name="Median Salary" />
              <Line type="monotone" dataKey="topPercentile" stroke="#ffc658" strokeWidth={2} name="Top 10%" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const RoleComparisonChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎯 Role-wise Salary Comparison
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={salaryData.roleComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}L`, '']} />
              <Legend />
              <Bar dataKey="junior" fill="#8884d8" name="Junior (0-2y)" />
              <Bar dataKey="mid" fill="#82ca9d" name="Mid (3-5y)" />
              <Bar dataKey="senior" fill="#ffc658" name="Senior (6-10y)" />
              <Bar dataKey="lead" fill="#ff7300" name="Lead (10y+)" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const LocationAnalysis = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🏙️ Location-wise Analysis
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell align="right">Avg Salary</TableCell>
                <TableCell align="right">Cost of Living</TableCell>
                <TableCell align="right">Salary Index</TableCell>
                <TableCell align="right">Recommendation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salaryData.locationSalaries.map((location) => (
                <TableRow key={location.location}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="primary" />
                      {location.location}
                    </Box>
                  </TableCell>
                  <TableCell align="right">₹{location.avgSalary}L</TableCell>
                  <TableCell align="right">
                    <LinearProgress 
                      variant="determinate" 
                      value={location.costOfLiving} 
                      sx={{ width: 60, mr: 1, display: 'inline-block' }}
                    />
                    {location.costOfLiving}%
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={location.salaryIndex} 
                      color={location.salaryIndex >= 90 ? 'success' : location.salaryIndex >= 85 ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {location.salaryIndex >= 90 ? '🌟 Excellent' : 
                     location.salaryIndex >= 85 ? '👍 Good' : '⚠️ Average'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const SkillPremiumAnalysis = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🚀 Skills Premium Analysis
        </Typography>
        <List>
          {salaryData.skillPremium.map((skill, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                  {index + 1}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={skill.skill}
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Salary Premium</Typography>
                      <Typography variant="caption" fontWeight="bold">+{skill.premium}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={skill.premium * 2} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption">Market Demand</Typography>
                      <Typography variant="caption" fontWeight="bold">{skill.demand}%</Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const IndustryBreakdown = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🏢 Industry Salary Breakdown
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salaryData.industryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {salaryData.industryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value}% (₹${props.payload.avgSalary}L avg)`, 
                props.payload.name
              ]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={<Switch checked={comparisonMode} onChange={(e) => setComparisonMode(e.target.checked)} />}
            label="Comparison Mode"
          />
          <Button startIcon={<Share />} variant="outlined" size="small">
            Share
          </Button>
          <Button startIcon={<Download />} variant="outlined" size="small">
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SalaryMetricCard
            title="Market Average"
            value="18"
            subtitle="All roles, all locations"
            trend={12.5}
            icon={<MonetizationOn />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SalaryMetricCard
            title="Top 10%"
            value="35"
            subtitle="High performers"
            trend={15.3}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SalaryMetricCard
            title="Entry Level"
            value="8"
            subtitle="0-2 years experience"
            trend={8.7}
            icon={<School />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SalaryMetricCard
            title="Senior Level"
            value="28"
            subtitle="8+ years experience"
            trend={18.2}
            icon={<Work />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Calculator" />
        <Tab label="Trends" />
        <Tab label="Comparison" />
        <Tab label="Locations" />
        <Tab label="Skills" />
        <Tab label="Industries" />
      </Tabs>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SalaryCalculator />
            </Grid>
          </Grid>
        )}
        
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SalaryTrendsChart />
            </Grid>
          </Grid>
        )}
        
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RoleComparisonChart />
            </Grid>
          </Grid>
        )}
        
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LocationAnalysis />
            </Grid>
          </Grid>
        )}
        
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <SkillPremiumAnalysis />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💡 Skill Recommendations
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">High Demand Skills</Typography>
                    <Typography variant="body2">
                      React, Python, AWS are in highest demand with 25-35% salary premium
                    </Typography>
                  </Alert>
                  <Alert severity="info">
                    <Typography variant="subtitle2">Emerging Skills</Typography>
                    <Typography variant="body2">
                      Machine Learning, Blockchain offer 40-50% premium but lower demand
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <IndustryBreakdown />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎯 Industry Insights
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Finance" 
                        secondary="Highest paying (₹28L avg)" 
                      />
                      <Chip label="🏆 Top" color="success" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Technology" 
                        secondary="Most opportunities (35%)" 
                      />
                      <Chip label="📈 Growth" color="primary" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="E-commerce" 
                        secondary="Balanced growth (₹20L avg)" 
                      />
                      <Chip label="⚖️ Stable" color="info" size="small" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ComprehensiveSalaryInsights;
