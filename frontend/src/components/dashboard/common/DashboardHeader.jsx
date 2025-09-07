import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material';
import {
  Notifications,
  Settings,
  ExitToApp,
  Menu as MenuIcon,
  NavigateNext,
  Search,
  Refresh,
  Help,
} from '@mui/icons-material';

const DashboardHeader = ({
  title,
  user,
  onDrawerToggle,
  onLogout,
  breadcrumbs = [],
  notifications = [],
  showSearch = true,
  actions,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClick = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom={Boolean(breadcrumbs.length)}>
          {title}
        </Typography>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mt: -1 }}
          >
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                href={crumb.path}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline' }
                }}
              >
                {crumb.icon && <Box component="span" sx={{ mr: 0.5, display: 'flex' }}>{crumb.icon}</Box>}
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        )}
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        {showSearch && (
          <Tooltip title="Search">
            <IconButton>
              <Search />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Refresh">
          <IconButton onClick={() => window.location.reload()}>
            <Refresh />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton onClick={handleNotificationsClick}>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Help">
          <IconButton>
            <Help />
          </IconButton>
        </Tooltip>

        {actions}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={handleProfileClick}
            sx={{ textTransform: 'none' }}
            startIcon={
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{ width: 32, height: 32 }}
              >
                {user?.name?.[0]}
              </Avatar>
            }
          >
            {!isMobile && user?.name}
          </Button>
        </Box>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <Settings sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <ExitToApp sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleClose}>
              {notification.message}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No new notifications</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default DashboardHeader;
