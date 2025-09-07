import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  Avatar,
  Typography,
  Divider,
  Button,
  Chip,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  MoreVert,
  Delete,
  MarkEmailRead,
  Settings,
  Work,
  Person,
  Schedule,
  Security,
  Info,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'job_application':
    case 'job_match':
      return <Work />;
    case 'interview':
      return <Schedule />;
    case 'profile':
      return <Person />;
    case 'security':
      return <Security />;
    default:
      return <Info />;
  }
};

const getNotificationColor = (type, priority) => {
  if (priority === 'high') return 'error';
  if (priority === 'medium') return 'warning';
  
  switch (type) {
    case 'job_application':
      return 'primary';
    case 'interview':
      return 'success';
    case 'security':
      return 'error';
    default:
      return 'info';
  }
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(notification.id);
    handleMenuClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <ListItem
        sx={{
          bgcolor: notification.isRead ? 'transparent' : 'action.hover',
          borderLeft: notification.isRead ? 'none' : '4px solid',
          borderLeftColor: `${getNotificationColor(notification.type, notification.priority)}.main`,
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: `${getNotificationColor(notification.type, notification.priority)}.main`,
              width: 40,
              height: 40,
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: notification.isRead ? 'normal' : 'bold',
                  flex: 1,
                }}
              >
                {notification.title}
              </Typography>
              {notification.priority === 'high' && (
                <Chip label="High" color="error" size="small" />
              )}
              {!notification.isRead && (
                <Box
                  width={8}
                  height={8}
                  borderRadius="50%"
                  bgcolor="primary.main"
                />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          }
        />

        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          {!notification.isRead && (
            <MenuItem onClick={handleMarkAsRead}>
              <MarkEmailRead sx={{ mr: 1 }} />
              Mark as Read
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </ListItem>
    </motion.div>
  );
};

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            overflow: 'hidden',
          },
        }}
      >
        <Box p={2} borderBottom={1} borderColor="divider">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Notifications</Typography>
            <Box display="flex" gap={1}>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              )}
              <IconButton size="small">
                <Settings />
              </IconButton>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            {['all', 'unread', 'read'].map((filterType) => (
              <Chip
                key={filterType}
                label={filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                variant={filter === filterType ? 'filled' : 'outlined'}
                size="small"
                onClick={() => setFilter(filterType)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography color="text.secondary">
                {filter === 'unread' 
                  ? 'No unread notifications' 
                  : filter === 'read'
                  ? 'No read notifications'
                  : 'No notifications'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                    <Divider />
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </List>
          )}
        </Box>

        {filteredNotifications.length > 0 && (
          <Box p={2} borderTop={1} borderColor="divider" textAlign="center">
            <Button fullWidth variant="outlined" size="small">
              View All Notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;
