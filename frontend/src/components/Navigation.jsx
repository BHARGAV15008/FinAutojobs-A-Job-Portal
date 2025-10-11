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
import { useAuth } from '../contexts/AuthContext.jsx';

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
    { label: 'Profile', path: user.role === 'recruiter' ? '/recruiter-dashboard/profile' : '/applicant-dashboard/profile', icon: <Person /> },
    ...(user.role === 'recruiter' ? [{ label: 'Post Job', path: '/recruiter-dashboard/jobs', icon: <PostAdd /> }] : []),
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
            sx={{ 
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
              '&.Mui-selected': {
                bgcolor: 'rgba(25, 118, 210, 0.12)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: '60%',
                  bgcolor: 'primary.main',
                  borderRadius: '4px 0 0 4px',
                },
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                transition: 'color 0.3s ease-in-out',
                color: location === item.path ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  transition: 'all 0.3s ease-in-out',
                  fontWeight: location === item.path ? 600 : 400,
                  color: location === item.path ? 'primary.main' : 'text.primary',
                },
              }}
            />
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
            sx={{ 
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
              '&.Mui-selected': {
                bgcolor: 'rgba(25, 118, 210, 0.12)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: '60%',
                  bgcolor: 'primary.main',
                  borderRadius: '4px 0 0 4px',
                },
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                transition: 'color 0.3s ease-in-out',
                color: location === item.path ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  transition: 'all 0.3s ease-in-out',
                  fontWeight: location === item.path ? 600 : 400,
                  color: location === item.path ? 'primary.main' : 'text.primary',
                },
              }}
            />
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
              <Box
                key={item.label}
                sx={{
                  position: 'relative',
                  mx: 1,
                  '&:hover .nav-underline': {
                    width: '80%',
                    opacity: 0.7,
                  },
                }}
              >
                <Button
                  component={Link}
                  href={item.path}
                  onClick={handleCloseNavMenu}
                  sx={{
                    color: location === item.path ? 'primary.main' : 'text.primary',
                    bgcolor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: location === item.path ? 600 : 500,
                    textTransform: 'none',
                    fontSize: '1rem',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      color: 'primary.main',
                      transform: 'translateY(-1px)',
                      fontWeight: 600,
                    },
                  }}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
                {/* Active underline */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: location === item.path ? '80%' : '0%',
                    height: 3,
                    bgcolor: 'primary.main',
                    borderRadius: '2px 2px 0 0',
                    transition: 'width 0.3s ease-in-out',
                    opacity: location === item.path ? 1 : 0,
                    zIndex: 2,
                  }}
                />
                {/* Hover underline */}
                <Box
                  className="nav-underline"
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: location === item.path ? '0%' : '0%',
                    height: 3,
                    bgcolor: 'primary.main',
                    borderRadius: '2px 2px 0 0',
                    transition: 'all 0.3s ease-in-out',
                    opacity: 0,
                    zIndex: 1,
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                {user.role === 'recruiter' && (
                  <Button
                    component={Link}
                    href="/recruiter-dashboard/jobs"
                    variant="contained"
                    color="primary"
                    startIcon={<PostAdd sx={{ display: { xs: 'none', sm: 'block' } }} />}
                    sx={{ 
                      mr: { xs: 1, sm: 2 },
                      textTransform: 'none',
                      fontWeight: 600,
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      borderRadius: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      minWidth: { xs: 'auto', sm: 'auto' },
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Post Job</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Post</Box>
                  </Button>
                )}
                <Tooltip title="Open settings">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0,
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Avatar
                      alt={user.name}
                      src={user.avatar}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        transition: 'all 0.3s ease-in-out',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
                        },
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
              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
                <Button
                  component={Link}
                  href="/admin-login"
                  variant="text"
                  size="small"
                  startIcon={<Shield sx={{ display: { xs: 'none', sm: 'block' } }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    px: { xs: 1.5, sm: 2 },
                    py: 0.5,
                    borderRadius: 1,
                    color: 'text.secondary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minWidth: { xs: 'auto', sm: 'auto' },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      color: 'primary.main',
                    },
                  }}
                >
                  Admin
                </Button>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  color="primary"
                  startIcon={<Login sx={{ display: { xs: 'none', sm: 'block' } }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    borderRadius: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minWidth: { xs: 'auto', sm: 'auto' },
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    borderRadius: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minWidth: { xs: 'auto', sm: 'auto' },
                    transition: 'all 0.3s ease-in-out',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                      bgcolor: 'primary.dark',
                    },
                  }}
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
