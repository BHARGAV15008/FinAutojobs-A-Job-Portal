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
  People,
  Business,
  Analytics,
  Security,
  Settings,
  Notifications,
  Add,
  PersonAdd,
  BusinessCenter,
  Report,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import tab components
import AdminOverviewTab from './tabs/AdminOverviewTab';
import AdminUsersTab from './tabs/AdminUsersTab';
import AdminCompaniesTab from './tabs/AdminCompaniesTab';
import AdminAnalyticsTab from './tabs/AdminAnalyticsTab';
import AdminSecurityTab from './tabs/AdminSecurityTab';
import AdminNotificationsTab from './tabs/AdminNotificationsTab';
import AdminSettingsTab from './tabs/AdminSettingsTab';

const AdminDashboard = ({ user, onDataUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    users: [],
    companies: [],
    analytics: {},
    security: {},
    notifications: [],
    settings: {}
  });

  const tabs = [
    {
      label: 'Overview',
      icon: <Dashboard />,
      component: AdminOverviewTab,
      description: 'System overview and key metrics'
    },
    {
      label: 'Users',
      icon: <People />,
      component: AdminUsersTab,
      description: 'Manage users and permissions'
    },
    {
      label: 'Companies',
      icon: <Business />,
      component: AdminCompaniesTab,
      description: 'Manage company accounts'
    },
    {
      label: 'Analytics',
      icon: <Analytics />,
      component: AdminAnalyticsTab,
      description: 'System analytics and reports'
    },
    {
      label: 'Security',
      icon: <Security />,
      component: AdminSecurityTab,
      description: 'Security and audit logs'
    },
    {
      label: 'Notifications',
      icon: <Notifications />,
      component: AdminNotificationsTab,
      description: 'System notifications'
    },
    {
      label: 'Settings',
      icon: <Settings />,
      component: AdminSettingsTab,
      description: 'System configuration'
    }
  ];

  const speedDialActions = [
    {
      icon: <PersonAdd />,
      name: 'Add User',
      action: () => handleQuickAction('add-user')
    },
    {
      icon: <BusinessCenter />,
      name: 'Add Company',
      action: () => handleQuickAction('add-company')
    },
    {
      icon: <Report />,
      name: 'Generate Report',
      action: () => handleQuickAction('generate-report')
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
          totalUsers: 1250,
          totalCompanies: 85,
          totalJobs: 420,
          totalApplications: 8500,
          activeUsers: 890,
          systemHealth: 98.5
        },
        users: [],
        companies: [],
        analytics: {},
        security: {},
        notifications: [],
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
      case 'add-user':
        setActiveTab(1); // Switch to Users tab
        break;
      case 'add-company':
        setActiveTab(2); // Switch to Companies tab
        break;
      case 'generate-report':
        setActiveTab(3); // Switch to Analytics tab
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
        ariaLabel="Admin Quick Actions"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          '& .MuiSpeedDial-fab': {
            bgcolor: 'error.main',
            '&:hover': {
              bgcolor: 'error.dark',
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

export default AdminDashboard;
