import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Send,
  Edit,
  Delete,
  Add,
  Email,
  Sms,
  Campaign,
  Schedule,
  Group,
  Person,
  Business,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AdminNotificationsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const tabLabels = ['Send Notifications', 'Notification History', 'Templates', 'Settings'];

  const sampleNotifications = [
    {
      id: 1,
      title: 'System Maintenance Notice',
      message: 'Scheduled maintenance on Sunday 2 AM - 4 AM IST',
      type: 'system',
      priority: 'high',
      recipients: 'all_users',
      recipientCount: 2380,
      status: 'sent',
      sentAt: '2024-01-25T10:00:00',
      deliveredCount: 2350,
      openedCount: 1890
    },
    {
      id: 2,
      title: 'New Feature Announcement',
      message: 'Introducing advanced job matching algorithm',
      type: 'feature',
      priority: 'medium',
      recipients: 'applicants',
      recipientCount: 1850,
      status: 'sent',
      sentAt: '2024-01-24T14:30:00',
      deliveredCount: 1820,
      openedCount: 1456
    },
    {
      id: 3,
      title: 'Security Alert',
      message: 'Please update your password for better security',
      type: 'security',
      priority: 'high',
      recipients: 'flagged_users',
      recipientCount: 45,
      status: 'scheduled',
      scheduledFor: '2024-01-26T09:00:00',
      deliveredCount: 0,
      openedCount: 0
    }
  ];

  const sampleTemplates = [
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to FinAutoJobs!',
      content: 'Thank you for joining our platform...',
      type: 'email',
      category: 'onboarding'
    },
    {
      id: 2,
      name: 'Job Alert',
      subject: 'New jobs matching your profile',
      content: 'We found {job_count} new jobs for you...',
      type: 'email',
      category: 'job_alerts'
    },
    {
      id: 3,
      name: 'System Maintenance',
      subject: 'Scheduled Maintenance Notice',
      content: 'Our platform will be under maintenance...',
      type: 'system',
      category: 'announcements'
    }
  ];

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(sampleNotifications);
      setTemplates(sampleTemplates);
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error'
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      sent: 'success',
      scheduled: 'warning',
      draft: 'info',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type) => {
    const icons = {
      system: <Notifications />,
      feature: <Campaign />,
      security: <Warning />,
      job_alert: <Email />,
      onboarding: <Person />
    };
    return icons[type] || <Info />;
  };

  const renderSendNotifications = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compose Notification
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Notification Title"
                  placeholder="Enter notification title"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select label="Priority" defaultValue="medium">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Notification Type</InputLabel>
                  <Select label="Notification Type" defaultValue="system">
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="feature">Feature</MenuItem>
                    <MenuItem value="security">Security</MenuItem>
                    <MenuItem value="job_alert">Job Alert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Recipients</InputLabel>
                  <Select label="Recipients" defaultValue="all_users">
                    <MenuItem value="all_users">All Users</MenuItem>
                    <MenuItem value="applicants">Applicants Only</MenuItem>
                    <MenuItem value="recruiters">Recruiters Only</MenuItem>
                    <MenuItem value="admins">Admins Only</MenuItem>
                    <MenuItem value="custom">Custom Selection</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message Content"
                  placeholder="Enter your notification message..."
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Notification sent successfully!',
                        severity: 'success'
                      });
                    }}
                  >
                    Send Now
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Notification scheduled successfully!',
                        severity: 'success'
                      });
                    }}
                  >
                    Schedule
                  </Button>
                  <Button variant="text">
                    Save as Draft
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Users:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  2,380
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Applicants:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  1,850
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Recruiters:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  420
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Admins:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  110
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Templates
            </Typography>
            <List dense>
              {templates.slice(0, 3).map((template) => (
                <ListItem key={template.id} button>
                  <ListItemIcon>
                    {getTypeIcon(template.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={template.name}
                    secondary={template.category}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationHistory = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Sent/Scheduled</TableCell>
                    <TableCell>Delivery Rate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.message.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(notification.type)}
                          <Typography variant="body2">
                            {notification.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.priority}
                          color={getPriorityColor(notification.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notification.recipientCount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.recipients.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.status}
                          color={getStatusColor(notification.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {notification.status === 'sent' ? (
                          <Typography variant="body2">
                            {new Date(notification.sentAt).toLocaleString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2">
                            {new Date(notification.scheduledFor).toLocaleString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {notification.status === 'sent' ? (
                          <Box>
                            <Typography variant="body2">
                              {((notification.deliveredCount / notification.recipientCount) * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.openedCount} opened
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTemplates = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Notification Templates
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowNotificationDialog(true)}
          >
            Add Template
          </Button>
        </Box>
      </Grid>

      {templates.map((template) => (
        <Grid item xs={12} md={6} key={template.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Chip label={template.category} size="small" />
                </Box>
                <Box>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Subject: {template.subject}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {template.content.substring(0, 100)}...
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button size="small" variant="outlined">
                  Use Template
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Email Notifications"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable SMS Notifications"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Push Notifications"
              />
              <FormControlLabel
                control={<Switch />}
                label="Send Delivery Reports"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rate Limiting
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Max emails per hour:</Typography>
                <TextField size="small" type="number" defaultValue="1000" sx={{ width: 100 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Max SMS per hour:</Typography>
                <TextField size="small" type="number" defaultValue="500" sx={{ width: 100 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Batch size:</Typography>
                <TextField size="small" type="number" defaultValue="100" sx={{ width: 100 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderSendNotifications();
      case 1: return renderNotificationHistory();
      case 2: return renderTemplates();
      case 3: return renderSettings();
      default: return renderSendNotifications();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
                  <Box sx={{ height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Notification Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send and manage platform notifications
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadNotificationData}
          size={isMobile ? 'small' : 'medium'}
        >
          Refresh
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>

      {/* Template Dialog */}
      <Dialog
        open={showNotificationDialog}
        onClose={() => setShowNotificationDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Create Notification Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Template Name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value="onboarding">Onboarding</MenuItem>
                  <MenuItem value="job_alerts">Job Alerts</MenuItem>
                  <MenuItem value="announcements">Announcements</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Subject Line" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Template Content"
                placeholder="Enter your template content with variables like {user_name}, {job_title}, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotificationDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNotificationsTab;
