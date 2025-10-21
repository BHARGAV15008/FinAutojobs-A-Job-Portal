import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Chip,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  Tooltip,
  Paper,
  Grid
} from '@mui/material';
import {
  Notifications,
  Work,
  Schedule,
  CheckCircle,
  Cancel,
  Star,
  Message,
  Business,
  TrendingUp,
  School,
  EmojiEvents,
  Warning,
  Info,
  Error,
  MoreVert,
  Delete,
  DoneAll,
  Settings,
  Clear,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const ComprehensiveNotificationSystem = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    interviewReminders: true,
    offerNotifications: true,
    marketingEmails: false
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'application_update',
      title: 'Application Status Updated',
      message: 'Your application for Senior Frontend Developer at Google has been shortlisted for technical interview.',
      timestamp: '2024-10-21T10:30:00Z',
      read: false,
      priority: 'high',
      icon: <CheckCircle />,
      color: 'success',
      actionUrl: '/applications/1',
      metadata: {
        company: 'Google',
        jobTitle: 'Senior Frontend Developer',
        status: 'shortlisted'
      }
    },
    {
      id: 2,
      type: 'interview_reminder',
      title: 'Interview Reminder',
      message: 'You have a technical interview scheduled for tomorrow at 2:00 PM with Microsoft.',
      timestamp: '2024-10-20T15:45:00Z',
      read: false,
      priority: 'urgent',
      icon: <Schedule />,
      color: 'warning',
      actionUrl: '/interviews/2',
      metadata: {
        company: 'Microsoft',
        interviewType: 'Technical Interview',
        scheduledTime: '2024-10-22T14:00:00Z'
      }
    },
    {
      id: 3,
      type: 'job_recommendation',
      title: 'New Job Matches',
      message: '5 new jobs matching your profile have been posted. Check them out!',
      timestamp: '2024-10-20T09:15:00Z',
      read: true,
      priority: 'medium',
      icon: <Work />,
      color: 'primary',
      actionUrl: '/jobs?recommended=true',
      metadata: {
        jobCount: 5,
        matchScore: 85
      }
    },
    {
      id: 4,
      type: 'offer_received',
      title: 'Job Offer Received!',
      message: 'Congratulations! You have received a job offer from Amazon for the Product Manager position.',
      timestamp: '2024-10-19T16:20:00Z',
      read: false,
      priority: 'urgent',
      icon: <EmojiEvents />,
      color: 'success',
      actionUrl: '/offers/4',
      metadata: {
        company: 'Amazon',
        jobTitle: 'Product Manager',
        salary: '₹45L',
        deadline: '2024-10-30T23:59:59Z'
      }
    },
    {
      id: 5,
      type: 'profile_view',
      title: 'Profile Viewed',
      message: 'Your profile was viewed by 3 recruiters from top companies today.',
      timestamp: '2024-10-19T11:30:00Z',
      read: true,
      priority: 'low',
      icon: <TrendingUp />,
      color: 'info',
      actionUrl: '/profile/analytics',
      metadata: {
        viewCount: 3,
        companies: ['Flipkart', 'Swiggy', 'Zomato']
      }
    },
    {
      id: 6,
      type: 'skill_assessment',
      title: 'Skill Assessment Available',
      message: 'New React.js assessment is available. Complete it to boost your profile score.',
      timestamp: '2024-10-18T14:10:00Z',
      read: true,
      priority: 'medium',
      icon: <School />,
      color: 'secondary',
      actionUrl: '/assessments/react',
      metadata: {
        skill: 'React.js',
        difficulty: 'Intermediate',
        duration: '30 minutes'
      }
    },
    {
      id: 7,
      type: 'application_rejected',
      title: 'Application Update',
      message: 'Unfortunately, your application for Data Scientist at Netflix was not selected.',
      timestamp: '2024-10-17T13:45:00Z',
      read: true,
      priority: 'medium',
      icon: <Cancel />,
      color: 'error',
      actionUrl: '/applications/7',
      metadata: {
        company: 'Netflix',
        jobTitle: 'Data Scientist',
        feedback: 'Strong technical skills but looking for more ML experience'
      }
    },
    {
      id: 8,
      type: 'message_received',
      title: 'New Message',
      message: 'You have a new message from recruiter at Uber regarding your application.',
      timestamp: '2024-10-16T10:20:00Z',
      read: true,
      priority: 'medium',
      icon: <Message />,
      color: 'primary',
      actionUrl: '/messages/8',
      metadata: {
        sender: 'Rahul Gupta',
        company: 'Uber',
        subject: 'Follow-up on your application'
      }
    }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found');
          setNotifications([]);
          return;
        }

        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.isRead).length);
          } else {
            console.warn('No notifications found');
            setNotifications([]);
            setUnreadCount(0);
          }
        } else {
          console.error('Failed to fetch notifications:', response.status);
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    const icons = {
      application_update: <CheckCircle />,
      interview_reminder: <Schedule />,
      job_recommendation: <Work />,
      offer_received: <EmojiEvents />,
      profile_view: <TrendingUp />,
      skill_assessment: <School />,
      application_rejected: <Cancel />,
      message_received: <Message />,
      company_update: <Business />
    };
    return icons[type] || <Notifications />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default'
    };
    return colors[priority] || 'default';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const filterNotifications = (type) => {
    if (type === 'all') return notifications;
    if (type === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === type);
  };

  const NotificationItem = ({ notification }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <ListItem
        sx={{
          bgcolor: notification.read ? 'transparent' : 'action.hover',
          borderRadius: 1,
          mb: 1,
          border: notification.priority === 'urgent' ? '1px solid' : 'none',
          borderColor: 'error.main'
        }}
      >
        <ListItemIcon>
          <Avatar sx={{ bgcolor: `${notification.color}.main`, width: 40, height: 40 }}>
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemIcon>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
                {notification.title}
              </Typography>
              {notification.priority === 'urgent' && (
                <Chip label="Urgent" color="error" size="small" />
              )}
              {!notification.read && (
                <Badge color="primary" variant="dot" />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(notification.timestamp)}
              </Typography>
            </Box>
          }
        />
        
        <ListItemSecondaryAction>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
              setSelectedNotification(notification);
            }}
            size="small"
          >
            <MoreVert />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </motion.div>
  );

  const NotificationSettings = () => (
    <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Notification Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>General Notifications</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                />
              }
              label="Push Notifications"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Job-Related Notifications</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.jobAlerts}
                  onChange={(e) => setSettings(prev => ({ ...prev, jobAlerts: e.target.checked }))}
                />
              }
              label="Job Alerts & Recommendations"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.applicationUpdates}
                  onChange={(e) => setSettings(prev => ({ ...prev, applicationUpdates: e.target.checked }))}
                />
              }
              label="Application Status Updates"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.interviewReminders}
                  onChange={(e) => setSettings(prev => ({ ...prev, interviewReminders: e.target.checked }))}
                />
              }
              label="Interview Reminders"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.offerNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, offerNotifications: e.target.checked }))}
                />
              }
              label="Job Offer Notifications"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Marketing</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                />
              }
              label="Marketing Emails & Promotions"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSettings(false)}>Cancel</Button>
        <Button variant="contained" onClick={() => setShowSettings(false)}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error">
            <Notifications />
          </Badge>
          <Typography variant="h6" fontWeight="bold">
            {unreadCount} Unread Notifications
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Refresh />} variant="outlined" size="small">
            Refresh
          </Button>
          <Button startIcon={<DoneAll />} onClick={markAllAsRead} variant="outlined" size="small">
            Mark All Read
          </Button>
          <Button startIcon={<Clear />} onClick={clearAllNotifications} variant="outlined" size="small" color="error">
            Clear All
          </Button>
          <Button startIcon={<Settings />} onClick={() => setShowSettings(true)} variant="outlined" size="small">
            Settings
          </Button>
        </Box>
      </Box>

      {/* Notification Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {notifications.length}
              </Typography>
              <Typography variant="caption">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {unreadCount}
              </Typography>
              <Typography variant="caption">Unread</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {notifications.filter(n => n.priority === 'urgent').length}
              </Typography>
              <Typography variant="caption">Urgent</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {notifications.filter(n => n.type === 'offer_received').length}
              </Typography>
              <Typography variant="caption">Offers</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All" />
        <Tab label="Unread" />
        <Tab label="Job Updates" />
        <Tab label="Interviews" />
        <Tab label="Messages" />
      </Tabs>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <List sx={{ p: 2 }}>
            <AnimatePresence>
              {filterNotifications(
                activeTab === 0 ? 'all' :
                activeTab === 1 ? 'unread' :
                activeTab === 2 ? 'application_update' :
                activeTab === 3 ? 'interview_reminder' :
                'message_received'
              ).map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </AnimatePresence>
          </List>
          
          {notifications.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll notify you about job updates, interviews, and more
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          if (selectedNotification && !selectedNotification.read) {
            markAsRead(selectedNotification.id);
          }
          setAnchorEl(null);
        }}>
          <DoneAll sx={{ mr: 1 }} />
          Mark as Read
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedNotification) {
            deleteNotification(selectedNotification.id);
          }
          setAnchorEl(null);
        }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <NotificationSettings />
    </Box>
  );
};

export default ComprehensiveNotificationSystem;
