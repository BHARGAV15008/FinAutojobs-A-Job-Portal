import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress,
  Tabs, Tab, TextField, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, Chip, IconButton, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Accordion, AccordionSummary,
  AccordionDetails, Slider, Alert, AlertTitle, Snackbar, Tooltip,
  useTheme, useMediaQuery, Drawer, AppBar, Toolbar, Menu, MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Dashboard, Person, Work, Bookmark, Assessment, Settings, Notifications,
  Edit, Upload, Download, Search, FilterList, ViewList, ViewModule,
  ExpandMore, Add, Delete, Visibility, Schedule, LocationOn, AttachMoney,
  Star, StarBorder, Send, CheckCircle, Cancel, Pending, TrendingUp,
  Analytics, CalendarToday, Email, Phone, LinkedIn, GitHub, School,
  Business, Language, Psychology, Speed, Timeline, Insights
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Import tab components
import ApplicantOverviewTab from './advanced/tabs/ApplicantOverviewTab';
import ApplicantProfileTab from './advanced/tabs/ApplicantProfileTab';
import ApplicantJobsTab from './advanced/tabs/ApplicantJobsTab';
import ApplicantApplicationsTab from './advanced/tabs/ApplicantApplicationsTab';
import ApplicantInterviewsTab from './advanced/tabs/ApplicantInterviewsTab';
import ApplicantAnalyticsTab from './advanced/tabs/ApplicantAnalyticsTab';
import ApplicantResumeTab from './advanced/tabs/ApplicantResumeTab';
import ApplicantSettingsTab from './advanced/tabs/ApplicantSettingsTab';

const AdvancedApplicantDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobAlerts, setJobAlerts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  // Mock data for demonstration
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    githubUrl: 'https://github.com/johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    bio: 'Passionate software developer with 5 years of experience',
    profilePicture: null,
    highestQualification: 'Master\'s Degree',
    isExperienced: true,
    experienceYears: 5,
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    profileCompletionPercentage: 85
  };

  // Mock data for tabs
  const dashboardData = {
    profile: {
      completeness: 85,
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      experience: 5,
      education: 'Master\'s Degree'
    },
    applications: [
      {
        id: 1,
        position: 'Senior Software Engineer',
        company: 'TechCorp',
        status: 'pending',
        appliedDate: '2024-01-20',
        location: 'San Francisco, CA'
      },
      {
        id: 2,
        position: 'Frontend Developer',
        company: 'StartupXYZ',
        status: 'interview',
        appliedDate: '2024-01-18',
        location: 'Remote'
      }
    ],
    recommendations: [
      {
        id: 1,
        position: 'Full Stack Developer',
        company: 'DataCorp',
        location: 'New York, NY',
        match: 92
      },
      {
        id: 2,
        position: 'React Developer',
        company: 'WebSolutions',
        location: 'Remote',
        match: 88
      }
    ],
    analytics: {
      profileViews: 124,
      applicationsSent: 15,
      interviewsScheduled: 3,
      responseRate: 20
    }
  };

  const tabsConfig = [
    { label: 'Overview', icon: Dashboard, value: 0 },
    { label: 'Profile', icon: Person, value: 1 },
    { label: 'Browse Jobs', icon: Work, value: 2 },
    { label: 'Recommended', icon: Star, value: 3 },
    { label: 'Bookmarks', icon: Bookmark, value: 4 },
    { label: 'Applications', icon: Send, value: 5 },
    { label: 'Interviews', icon: Schedule, value: 6 },
    { label: 'Job Alerts', icon: Notifications, value: 7 },
    { label: 'Analytics', icon: Assessment, value: 8 },
    { label: 'Settings', icon: Settings, value: 9 }
  ];

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

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
                    color: trend > 0 ? 'success.main' : '
