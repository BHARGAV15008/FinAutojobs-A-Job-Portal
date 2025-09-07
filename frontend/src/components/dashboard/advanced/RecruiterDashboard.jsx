import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Work,
  People,
  Assessment,
  Business,
  Schedule,
  Settings,
  Add,
  PersonAdd,
  PostAdd,
  Event,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import tab components
import RecruiterOverviewTab from './tabs/RecruiterOverviewTab';
import RecruiterJobsTab from './tabs/RecruiterJobsTab';
import RecruiterCandidatesTab from './tabs/RecruiterCandidatesTab';
import RecruiterAnalyticsTab from './tabs/RecruiterAnalyticsTab';
import RecruiterCompanyTab from './tabs/RecruiterCompanyTab';
import RecruiterInterviewsTab from './tabs/RecruiterInterviewsTab';
import RecruiterSettingsTab from './tabs/RecruiterSettingsTab';

const RecruiterDashboard = ({ user, onDataUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    jobs: [],
    candidates: [],
    analytics: {},
    company: {},
    interviews: [],
    settings: {}
  });

  const tabs = [
    {
      label: 'Overview',
      icon: <Dashboard />,
      component: RecruiterOverviewTab,
      description: 'Dashboard overview and key metrics'
    },
    {
      label: 'Jobs',
      icon: <Work />,
      component: RecruiterJobsTab,
      description: 'Manage job postings and requirements'
    },
    {
      label: 'Candidates',
      icon: <People />,
      component: RecruiterCandidatesTab,
      description: 'Review and manage job applications'
    },
    {
      label: 'Analytics',
      icon: <Assessment />,
      component: RecruiterAnalyticsTab,
      description: 'Recruitment analytics and insights'
    },
    {
      label: 'Company',
      icon: <Business />,
      component: RecruiterCompanyTab,
      description: 'Company profile and branding'
    },
    {
      label: 'Interviews',
      icon: <Schedule />,
      component: RecruiterInterviewsTab,
      description: 'Schedule and manage interviews'
    },
    {
      label: 'Settings',
      icon: <Settings />,
      component: RecruiterSettingsTab,
      description: 'Account and notification settings'
    }
  ];

  const speedDialActions = [
    {
      icon: <PostAdd />,
      name: 'Post Job',
      action: () => handleQuickAction('post-job')
    },
    {
      icon: <PersonAdd />,
      name: 'Invite Candidate',
      action: () => handleQuickAction('invite-candidate')
    },
    {
      icon: <Event />,
      name: 'Schedule Interview',
      action: () => handleQuickAction('schedule-interview')
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDashboardData({
        overview: {
          totalJobs: 24,
          activeJobs: 18,
          totalApplications: 342,
          newApplications: 28,
          scheduledInterviews: 12,
          hiredCandidates: 8
        },
        jobs: [],
        candidates: [],
        analytics: {},
        company: {},
        interviews: [],
        settings: {}
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'post-job':
        setActiveTab(1); // Switch to Jobs tab
        break;
      case 'invite-candidate':
        setActiveTab(2); // Switch to Candidates tab
        break;
      case 'schedule-interview':
        setActiveTab(5); // Switch to Interviews tab
        break;
      default:
        break;
    }
  };

  const handleDataUpdate = (tabData, tabIndex) => {
    setDashboardData(prev => ({
      ...prev,
      [Object.keys(prev)[tabIndex]]: tabData
    }));
    
    if (onDataUpdate) {
      onDataUpdate(dashboardData);
    }
  };

  const CurrentTabComponent = tabs[activeTab]?.component;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Tab Navigation */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={!isMobile ? tab.label : ''}
              iconPosition="start"
              sx={{
                minWidth: isMobile ? 'auto' : 120,
                px: isMobile ? 1 : 2,
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ 
        flexGrow: 1, 
        bgcolor: 'background.default',
        minHeight: 'calc(100vh - 64px)',
        position: 'relative'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            {CurrentTabComponent && (
              <CurrentTabComponent
                data={dashboardData[Object.keys(dashboardData)[activeTab]]}
                onDataUpdate={(data) => handleDataUpdate(data, activeTab)}
                user={user}
                loading={loading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          '& .MuiSpeedDial-fab': {
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }
        }}
        icon={<SpeedDialIcon icon={<Add />} />}
        direction="up"
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={
              <Tooltip title={action.name} placement="left">
                {action.icon}
              </Tooltip>
            }
            tooltipTitle={action.name}
            onClick={action.action}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                bgcolor: 'secondary.main',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default RecruiterDashboard;
