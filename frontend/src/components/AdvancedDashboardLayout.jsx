import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  Breadcrumbs,
  Link,
  Fab,
  Zoom,
  Slide,
  Fade,
} from '@mui/material';
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
  ChevronRight,
  ExpandLess,
  ExpandMore,
  DarkMode,
  LightMode,
  Search,
  Add,
  Home,
  NavigateNext,
  Refresh,
  FullscreenExit,
  Fullscreen,
  Help,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const AdvancedDashboardLayout = ({ 
  children, 
  title, 
  headerContent, 
  userRole = 'applicant',
  breadcrumbs = [],
  showSearch = true,
  showNotifications = true,
  customActions = null
}) => {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State management
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(isTablet);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New job match found', message: 'Software Engineer at TechCorp', time: '2 min ago', unread: true },
    { id: 2, title: 'Application update', message: 'Your application was reviewed', time: '1 hour ago', unread: true },
    { id: 3, title: 'Interview scheduled', message: 'Tomorrow at 2:00 PM', time: '3 hours ago', unread: false },
  ]);

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCollapsed(isTablet);
  }, [isTablet]);

  // Event handlers
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
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

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Navigation items for different roles
  const getNavItems = (role) => {
    const baseItems = [
      { 
        text: 'Dashboard', 
        icon: <Dashboard />, 
        path: role === 'admin' ? '/admin-dashboard' : `/${role}-dashboard`,
        color: 'primary'
      },
    ];

    if (role === 'applicant') {
      return [
        ...baseItems,
        {
          text: 'Profile & Settings',
          icon: <Person />,
          color: 'secondary',
          submenu: [
            { text: 'My Profile', icon: <Person />, path: '/profile' },
            { text: 'Settings', icon: <Settings />, path: '/applicant-dashboard/settings' },
            { text: 'Resume', icon: <Assessment />, path: '/applicant-dashboard/resume' },
          ]
        },
        {
          text: 'Job Search',
          icon: <Work />,
          color: 'info',
          submenu: [
            { text: 'Browse Jobs', icon: <Work />, path: '/jobs' },
            { text: 'Recommended', icon: <TrendingUp />, path: '/applicant-dashboard/recommended' },
            { text: 'Job Alerts', icon: <Notifications />, path: '/applicant-dashboard/alerts' },
          ]
        },
        {
          text: 'Applications',
          icon: <Mail />,
          color: 'warning',
          submenu: [
            { text: 'My Applications', icon: <Mail />, path: '/applicant-dashboard/applications' },
            { text: 'Saved Jobs', icon: <Bookmark />, path: '/applicant-dashboard/saved' },
            { text: 'Interviews', icon: <Calendar />, path: '/applicant-dashboard/interviews' },
          ]
        },
        { text: 'Analytics', icon: <Analytics />, path: '/applicant-dashboard/analytics', color: 'success' },
      ];
    }

    if (role === 'recruiter') {
      return [
        ...baseItems,
        {
          text: 'Profile & Company',
          icon: <Business />,
          color: 'secondary',
          submenu: [
            { text: 'My Profile', icon: <Person />, path: '/recruiter-dashboard/profile' },
            { text: 'Company Profile', icon: <Business />, path: '/recruiter-dashboard/company' },
            { text: 'Settings', icon: <Settings />, path: '/recruiter-dashboard/settings' },
          ]
        },
        {
          text: 'Job Management',
          icon: <Work />,
          color: 'info',
          submenu: [
            { text: 'Post New Job', icon: <Add />, path: '/add-job' },
            { text: 'Manage Jobs', icon: <Work />, path: '/recruiter-dashboard/jobs' },
            { text: 'Edit Posts', icon: <Settings />, path: '/recruiter-dashboard/edit-jobs' },
          ]
        },
        {
          text: 'Applications',
          icon: <People />,
          color: 'warning',
          submenu: [
            { text: 'Review Applications', icon: <Assessment />, path: '/recruiter-dashboard/applications' },
            { text: 'Manage Applicants', icon: <People />, path: '/recruiter-dashboard/applicants' },
            { text: 'Alerts', icon: <Notifications />, path: '/recruiter-dashboard/alerts' },
          ]
        },
        { text: 'Company Analytics', icon: <Analytics />, path: '/recruiter-dashboard/analytics', color: 'success' },
      ];
    }

    if (role === 'admin') {
      return [
        ...baseItems,
        {
          text: 'User Management',
          icon: <People />,
          color: 'secondary',
          submenu: [
            { text: 'Manage Applicants', icon: <Person />, path: '/admin-dashboard/applicants' },
            { text: 'Manage Recruiters', icon: <Business />, path: '/admin-dashboard/recruiters' },
            { text: 'User Analytics', icon: <Analytics />, path: '/admin-dashboard/user-analytics' },
          ]
        },
        {
          text: 'System Management',
          icon: <AdminPanelSettings />,
          color: 'error',
          submenu: [
            { text: 'System Settings', icon: <Settings />, path: '/admin-dashboard/settings' },
            { text: 'Database Management', icon: <Assessment />, path: '/admin-dashboard/database' },
            { text: 'Reports', icon: <Analytics />, path: '/admin-dashboard/reports' },
          ]
        },
        { text: 'Analytics & Progress', icon: <TrendingUp />, path: '/admin-dashboard/analytics', color: 'success' },
      ];
    }

    return baseItems;
  };

  const NavItem = ({ item, level = 0 }) => {
    const isActive = location === item.path;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.text];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              if (hasSubmenu) {
                toggleSubmenu(item.text);
              } else if (item.path) {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'initial',
              px: 2.5,
              py: 1,
              mx: 1,
              borderRadius: 2,
              backgroundColor: isActive ? `${item.color || 'primary'}.main` : 'transparent',
              color: isActive ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: isActive ? `${item.color || 'primary'}.dark` : `${item.color || 'primary'}.50`,
                transform: 'translateX(4px)',
              },
              transition: 'all 0.2s ease-in-out',
              ml: level * 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 'auto' : 3,
                justifyContent: 'center',
                color: isActive ? 'white' : `${item.color || 'primary'}.main`,
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: collapsed ? 0 : 1,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                    }
                  }} 
                />
                {hasSubmenu && (
                  <IconButton size="small" sx={{ color: 'inherit' }}>
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {hasSubmenu && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.submenu.map((subItem) => (
                <NavItem key={subItem.text} item={subItem} level={level + 1} />
              ))}
            </List>
          </Collapse>
        )}
      </motion.div>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: collapsed ? 0 : 2 }}>
          <Work />
        </Avatar>
        {!collapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            FinAutoJobs
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      {/* User Info */}
      {!collapsed && (
        <Card sx={{ m: 2, mb: 1 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                {user?.full_name?.[0] || user?.email?.[0] || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {user?.full_name || 'User'}
                </Typography>
                <Chip 
                  label={userRole.charAt(0).toUpperCase() + userRole.slice(1)} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List>
          {getNavItems(userRole).map((item) => (
            <NavItem key={item.text} item={item} />
          ))}
        </List>
      </Box>
      
      <Divider />
      
      {/* Bottom Actions */}
      <Box sx={{ p: 2 }}>
        {!collapsed && (
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="caption">Dark Mode</Typography>}
            sx={{ mb: 1 }}
          />
        )}
        
        <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center' }}>
          <Tooltip title="Help">
            <IconButton size="small">
              <Help />
            </IconButton>
          </Tooltip>
          {!collapsed && (
            <Button
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              size="small"
              color="error"
              variant="outlined"
            >
              Logout
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { md: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {breadcrumbs.length > 0 && (
                <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mt: 0.5 }}>
                  <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                  </Link>
                  {breadcrumbs.map((crumb, index) => (
                    <Typography key={index} color="text.primary" sx={{ fontSize: '0.875rem' }}>
                      {crumb}
                    </Typography>
                  ))}
                </Breadcrumbs>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {headerContent}
            {customActions}
            
            <Tooltip title="Refresh">
              <IconButton onClick={() => window.location.reload()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <IconButton onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
            
            {showNotifications && (
              <Tooltip title="Notifications">
                <IconButton onClick={handleNotificationsMenuOpen}>
                  <Badge badgeContent={notifications.filter(n => n.unread).length} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Profile">
              <IconButton onClick={handleProfileMenuOpen}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: collapsed ? collapsedDrawerWidth : drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
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
          width: { md: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <Person sx={{ mr: 2 }} /> Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/${userRole}-dashboard/settings`); handleMenuClose(); }}>
          <Settings sx={{ mr: 2 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp sx={{ mr: 2 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem key={notification.id} sx={{ whiteSpace: 'normal', py: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: notification.unread ? 600 : 400 }}>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">View All Notifications</Typography>
        </MenuItem>
      </Menu>

      {/* Scroll to Top FAB */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default AdvancedDashboardLayout;