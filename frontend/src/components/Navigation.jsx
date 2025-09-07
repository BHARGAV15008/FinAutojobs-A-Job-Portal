import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Work,
  Description,
  School,
  Login,
  Info,
  Phone,
  Gavel,
  Shield,
  Logout,
  Dashboard,
  PostAdd,
  Business,
  TrendingUp,
  Notifications,
  Psychology,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const mainMenuItems = [
    { label: 'Jobs', path: '/jobs', icon: <Work /> },
    { label: 'Companies', path: '/companies', icon: <Business /> },
    { label: 'Salary Insights', path: '/salary-insights', icon: <TrendingUp /> },
    { label: 'Skills Assessment', path: '/skills-assessment', icon: <School /> },
    { label: 'Resume Builder', path: '/resume', icon: <Description /> },
    ...(user && user.role === 'jobseeker' ? [{ label: 'Job Alerts', path: '/job-alerts', icon: <Notifications /> }] : []),
  ];

  const companyMenuItems = [
    { label: 'About Us', path: '/about', icon: <Info /> },
    { label: 'Contact', path: '/contact', icon: <Phone /> },
    { label: 'Terms of Service', path: '/terms-of-service', icon: <Gavel /> },
    { label: 'Privacy Policy', path: '/privacy-policy', icon: <Shield /> },
  ];

  const userMenuItems = user ? [
    { label: 'Dashboard', path: user.role === 'recruiter' ? '/recruiter-dashboard' : '/applicant-dashboard', icon: <Dashboard /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
    ...(user.role === 'recruiter' ? [{ label: 'Post Job', path: '/add-job', icon: <PostAdd /> }] : []),
    { label: 'Applications', path: '/applications', icon: <Description /> },
  ] : [];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {mainMenuItems.map((item) => (
          <ListItem
            key={item.label}
            component={Link}
            href={item.path}
            onClick={handleDrawerToggle}
            selected={location === item.path}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {companyMenuItems.map((item) => (
          <ListItem
            key={item.label}
            component={Link}
            href={item.path}
            onClick={handleDrawerToggle}
            selected={location === item.path}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Link href="/">
              <Box sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1
              }}>
                <Work sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            </Link>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
              }}
            >
              FinAutoJobs
            </Typography>
          </Box>

          {/* Mobile menu button */}
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo - Mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
            <Link href="/">
              <Box sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1
              }}>
                <Work sx={{ color: 'white', fontSize: 20 }} />
              </Box>
            </Link>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
              }}
            >
              FinAutoJobs
            </Typography>
          </Box>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            {mainMenuItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                href={item.path}
                onClick={handleCloseNavMenu}
                sx={{
                  mx: 1,
                  color: location === item.path ? 'primary.main' : 'text.primary',
                  bgcolor: location === item.path ? 'primary.50' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                  },
                }}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                {user.role === 'recruiter' && (
                  <Button
                    component={Link}
                    href="/add-job"
                    variant="contained"
                    color="primary"
                    startIcon={<PostAdd />}
                    sx={{ mr: 2 }}
                  >
                    Post Job
                  </Button>
                )}
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user.name}
                      src={user.avatar}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                      }}
                    >
                      {user.name?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.label}
                      component={Link}
                      href={item.path}
                      onClick={handleCloseUserMenu}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {item.icon}
                      <Typography textAlign="center">{item.label}</Typography>
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      logout();
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'error.main',
                    }}
                  >
                    <Logout />
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  color="primary"
                  startIcon={<Login />}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  color="primary"
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navigation;
