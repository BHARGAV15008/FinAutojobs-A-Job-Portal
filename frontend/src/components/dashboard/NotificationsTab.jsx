import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Tabs,
  Tab,
  Badge,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications,
  Work,
  Person,
  CheckCircle,
  Schedule,
  Star,
  Email,
  MoreVert,
  MarkEmailRead,
  Delete,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const NotificationsTab = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Notification types
  const notificationTypes = [
    { label: 'All', value: 'all' },
    { label: 'Applications', value: 'new_application' },
    { label: 'Status Updates', value: 'status_update' },
    { label: 'Interviews', value: 'interview' },
    { label: 'Messages', value: 'message' },
  ];

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching notifications for user:', user?.userId);
        
        // Real API call
        const { getNotifications } = await import('../../api/notifications');
        const response = await getNotifications();
        
        if (response.success) {
          setNotifications(response.data.notifications || []);
        } else {
          // No mock data - show empty state
          console.warn('No notifications found');
          setNotifications([]);
        }
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchNotifications();
    }
  }, [user]);

  // Filter notifications by type
  const filteredNotifications = notifications.filter(notification => {
    const currentFilter = notificationTypes[selectedTab];
    if (currentFilter.value === 'all') return true;
    return notification.type === currentFilter.value;
  });

  // Get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      new_application: <Work />,
      status_update: <CheckCircle />,
      interview: <Schedule />,
      message: <Email />,
    };
    return icons[type] || <Notifications />;
  };

  // Get notification color
  const getNotificationColor = (type) => {
    const colors = {
      new_application: 'primary',
      status_update: 'success',
      interview: 'warning',
      message: 'info',
    };
    return colors[type] || 'default';
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { markAsRead: markAsReadAPI } = await import('../../api/notifications');
      await markAsReadAPI(notificationId);
      setNotifications(prev => prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const { deleteNotification: deleteNotificationAPI } = await import('../../api/notifications');
      await deleteNotificationAPI(notificationId);
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      setAnchorEl(null);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { markAllAsRead: markAllAsReadAPI } = await import('../../api/notifications');
      await markAllAsReadAPI();
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading notifications...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Notifications
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
                <Notifications />
              </Badge>
            )}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with your job applications and activities
          </Typography>
        </Box>
        
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkEmailRead />}
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      {/* Notification Type Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {notificationTypes.map((type, index) => (
            <Tab
              key={type.value}
              label={
                <Badge
                  badgeContent={
                    type.value === 'all' 
                      ? unreadCount 
                      : notifications.filter(n => n.type === type.value && !n.read).length
                  }
                  color="error"
                >
                  {type.label}
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedTab === 0 
              ? "You're all caught up! No new notifications."
              : `No ${notificationTypes[selectedTab].label.toLowerCase()} notifications.`
            }
          </Typography>
        </Paper>
      ) : (
        <List>
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    mb: 2, 
                    bgcolor: notification.read ? 'background.paper' : 'action.hover',
                    border: notification.read ? '1px solid' : '2px solid',
                    borderColor: notification.read ? 'divider' : 'primary.main',
                  }}
                >
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${getNotificationColor(notification.type)}.main`,
                          color: `${getNotificationColor(notification.type)}.contrastText`
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip 
                              label="New" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      onClick={() => !notification.read && markAsRead(notification._id)}
                      sx={{ cursor: notification.read ? 'default' : 'pointer' }}
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedNotification(notification);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => {
            markAsRead(selectedNotification._id);
            setAnchorEl(null);
          }}>
            <MarkEmailRead sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          deleteNotification(selectedNotification._id);
        }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotificationsTab;
