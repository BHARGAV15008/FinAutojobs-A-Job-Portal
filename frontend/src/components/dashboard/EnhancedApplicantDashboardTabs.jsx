import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Work,
  Assessment,
  MonetizationOn,
  Notifications,
  Send,
  Analytics,
  Person,
  Star,
  TrendingUp,
  Schedule,
  Message
} from '@mui/icons-material';

// Import our comprehensive components
import ApplicantProfileTab from './ApplicantProfileTab';
import EnhancedAnalytics from './EnhancedAnalytics';
import ApplicationTrackingSystem from '../applications/ApplicationTrackingSystem';
import ComprehensiveSkillsAssessment from '../assessment/ComprehensiveSkillsAssessment';
import ComprehensiveSalaryInsights from '../salary/ComprehensiveSalaryInsights';
import ComprehensiveNotificationSystem from '../notifications/ComprehensiveNotificationSystem';
import ComprehensiveMessagingSystem from '../messaging/ComprehensiveMessagingSystem';

const EnhancedApplicantDashboardTabs = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabsConfig = [
    {
      label: 'Dashboard',
      icon: <Analytics />,
      component: <DashboardOverview user={user} />
    },
    {
      label: 'Applications',
      icon: <Send />,
      component: <ApplicationTrackingSystem />
    },
    {
      label: 'Profile',
      icon: <Person />,
      component: <ApplicantProfileTab user={user} onUpdate={() => {}} />
    },
    {
      label: 'Skills Assessment',
      icon: <Assessment />,
      component: <ComprehensiveSkillsAssessment />
    },
    {
      label: 'Salary Insights',
      icon: <MonetizationOn />,
      component: <ComprehensiveSalaryInsights />
    },
    {
      label: 'Analytics',
      icon: <TrendingUp />,
      component: <EnhancedAnalytics userRole="applicant" />
    },
    {
      label: 'Messages',
      icon: <Message />,
      component: <ComprehensiveMessagingSystem />
    },
    {
      label: 'Notifications',
      icon: <Notifications />,
      component: <ComprehensiveNotificationSystem />
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              fontWeight: 600
            }
          }}
        >
          {tabsConfig.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {tabsConfig[activeTab]?.component}
      </Box>
    </Box>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ user }) => {
  const dashboardStats = {
    applications: 23,
    interviews: 8,
    offers: 2,
    profileViews: 156,
    profileCompletion: 85,
    skillsAssessed: 5,
    avgResponseTime: '3.2 days'
  };

  const recentActivity = [
    { type: 'application', message: 'Applied to Senior Developer at Google', time: '2 hours ago' },
    { type: 'interview', message: 'Interview scheduled with Microsoft', time: '1 day ago' },
    { type: 'offer', message: 'Offer received from Amazon', time: '3 days ago' },
    { type: 'profile', message: 'Profile viewed by Netflix recruiter', time: '5 days ago' }
  ];

  const recommendedActions = [
    { title: 'Complete Skills Assessment', description: 'Take React.js assessment to boost profile', priority: 'high' },
    { title: 'Update Profile', description: 'Add recent project experience', priority: 'medium' },
    { title: 'Prepare for Interview', description: 'Microsoft interview in 2 days', priority: 'urgent' },
    { title: 'Review Job Matches', description: '5 new jobs match your profile', priority: 'low' }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user?.firstName}! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Ready to find your next opportunity?
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${dashboardStats.profileCompletion}% Profile Complete`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mr: 1 }}
                />
                <Chip 
                  label={`${dashboardStats.applications} Applications`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Send sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {dashboardStats.applications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Applications Sent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {dashboardStats.interviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interviews Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {dashboardStats.offers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Job Offers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {dashboardStats.profileViews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profile Views
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Profile Completion */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Strength
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {dashboardStats.profileCompletion}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={dashboardStats.profileCompletion} 
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Profile Completion
                </Typography>
              </Box>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {recentActivity.map((activity, index) => (
                  <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < recentActivity.length - 1 ? '1px solid #eee' : 'none' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommended Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommended Actions
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {recommendedActions.map((action, index) => (
                  <Alert 
                    key={index} 
                    severity={action.priority === 'urgent' ? 'error' : action.priority === 'high' ? 'warning' : 'info'}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {action.title}
                    </Typography>
                    <Typography variant="caption">
                      {action.description}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedApplicantDashboardTabs;
