import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Menu, MenuItem, Divider, Tooltip, Button } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'wouter';
import { 
  Menu as MenuIcon, 
  Notifications, 
  Settings, 
  ExitToApp, 
  Dashboard, 
  Work, 
  People, 
  Person, 
  Business, 
  Assessment, 
  Bookmark, 
  Mail, 
  Calendar, 
  TrendingUp,
  Analytics,
  AdminPanelSettings,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const ModernDashboardLayout = ({ children, title, headerContent, userRole }) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ item, isCollapsed = false }) => (
    <NavLink href={item.path}>
      <a className={`flex items-center p-3 my-1 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] ${
        location === item.path 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-opacity-20">
          {item.icon}
        </div>
        {!isCollapsed && (
          <span className="ml-3 font-medium">{item.text}</span>
        )}
      </a>
    </NavLink>
  );

  // Navigation items for different roles
  const getNavItems = (role) => {
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: role === 'admin' ? '/admin-dashboard' : `/${role}-dashboard` },
    ];

    if (role === 'applicant') {
      return [
        ...baseItems,
        { text: 'Profile', icon: <Person />, path: '/applicant-dashboard/profile' },
        { text: 'Browse Jobs', icon: <Work />, path: '/jobs' },
        { text: 'Applications', icon: <Mail />, path: '/applicant-dashboard/applications' },
        { text: 'Saved Jobs', icon: <Bookmark />, path: '/applicant-dashboard/saved' },
        { text: 'Recommended', icon: <TrendingUp />, path: '/applicant-dashboard/recommended' },
        { text: 'Job Alerts', icon: <Notifications />, path: '/applicant-dashboard/alerts' },
        { text: 'Interviews', icon: <Calendar />, path: '/applicant-dashboard/interviews' },
        { text: 'Assessments', icon: <Assessment />, path: '/applicant-dashboard/assessments' },
        { text: 'Analytics', icon: <Analytics />, path: '/applicant-dashboard/analytics' },
        { text: 'Settings', icon: <Settings />, path: '/applicant-dashboard/settings' },
      ];
    }

    if (role === 'recruiter') {
      return [
        ...baseItems,
        { text: 'Profile', icon: <Person />, path: '/recruiter-dashboard/profile' },
        { text: 'Post Job', icon: <Work />, path: '/add-job' },
        { text: 'My Jobs', icon: <Business />, path: '/recruiter-dashboard/jobs' },
        { text: 'Applications', icon: <Mail />, path: '/recruiter-dashboard/applications' },
        { text: 'Candidates', icon: <People />, path: '/recruiter-dashboard/candidates' },
        { text: 'Analytics', icon: <Analytics />, path: '/recruiter-dashboard/analytics' },
        { text: 'Settings', icon: <Settings />, path: '/recruiter-dashboard/settings' },
      ];
    }

    if (role === 'admin') {
      return [
        ...baseItems,
        { text: 'Users', icon: <People />, path: '/admin-dashboard/users' },
        { text: 'Companies', icon: <Business />, path: '/admin-dashboard/companies' },
        { text: 'Jobs', icon: <Work />, path: '/admin-dashboard/jobs' },
        { text: 'Applications', icon: <Mail />, path: '/admin-dashboard/applications' },
        { text: 'Analytics', icon: <Analytics />, path: '/admin-dashboard/analytics' },
        { text: 'Settings', icon: <Settings />, path: '/admin-dashboard/settings' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems(userRole);

  const drawer = (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <Work sx={{ color: 'white', fontSize: 24 }} />
          </div>
          <div>
            <Typography variant="h6" className="font-bold text-gray-800">
              FinAutoJobs
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)} Portal
            </Typography>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.text} item={item} />
          ))}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 mr-3 ring-2 ring-blue-500 ring-offset-2"
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <div>
              <Typography variant="subtitle2" className="font-semibold text-gray-800">
                {user?.name}
              </Typography>
              <Typography variant="body2" className="text-gray-500 text-xs">
                {user?.role}
              </Typography>
            </div>
          </div>
          <Tooltip title="Logout">
            <IconButton 
              onClick={handleLogout} 
              size="small" 
              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <AppBar 
          position="sticky" 
          elevation={0}
          className="bg-white border-b border-gray-200"
        >
          <Toolbar className="px-6">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2 sm:hidden text-gray-600"
            >
              <MenuIcon />
            </IconButton>
            
            <div className="flex-1">
              <Typography variant="h6" className="font-bold text-gray-800">
                {title}
              </Typography>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={handleNotificationsMenuOpen}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Badge badgeContent={4} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Settings */}
              <Tooltip title="Settings">
                <IconButton 
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() => navigate(`/${userRole}-dashboard/settings`)}
                >
                  <Settings />
                </IconButton>
              </Tooltip>

              {/* Profile */}
              <Tooltip title="Profile">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Avatar 
                    src={user?.avatar} 
                    alt={user?.name} 
                    className="w-8 h-8 ring-2 ring-blue-500 ring-offset-2"
                  >
                    {user?.name?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </div>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              className="mt-2"
            >
              <MenuItem onClick={() => { navigate(`/${userRole}-dashboard/profile`); handleMenuClose(); }}>
                <Person className="mr-2" />
                Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate(`/${userRole}-dashboard/settings`); handleMenuClose(); }}>
                <Settings className="mr-2" />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ExitToApp className="mr-2" />
                Logout
              </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationsAnchorEl}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleMenuClose}
              className="mt-2"
            >
              <div className="p-4 max-w-sm">
                <Typography variant="h6" className="font-bold mb-3">Notifications</Typography>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <Typography variant="body2" className="font-medium">New application received</Typography>
                      <Typography variant="caption" className="text-gray-500">2 minutes ago</Typography>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <Typography variant="body2" className="font-medium">Profile viewed by recruiter</Typography>
                      <Typography variant="caption" className="text-gray-500">1 hour ago</Typography>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <Typography variant="body2" className="font-medium">Job alert match found</Typography>
                      <Typography variant="caption" className="text-gray-500">3 hours ago</Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <div className="p-6">
          {headerContent && (
            <div className="mb-6">
              {headerContent}
            </div>
          )}
          {children}
        </div>
      </Box>
    </div>
  );
};

export default ModernDashboardLayout;
