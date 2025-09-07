import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Notifications,
  Security,
  Palette,
  Language,
  Delete,
  Edit,
  Add,
  Save,
  Visibility,
  VisibilityOff,
  Download,
  Upload,
  Lock,
  Person,
  Email,
  Phone,
  Work,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ApplicantSettingsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      applicationUpdates: true,
      interviewReminders: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowRecruiterContact: true,
      showSalaryExpectations: true,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC+05:30',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
    },
    account: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: '30',
    }
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
      if (onDataUpdate) {
        onDataUpdate({ settings });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({ open: true, message: 'Password updated successfully!', severity: 'success' });
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update password', severity: 'error' });
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const dataToExport = {
      profile: user,
      settings: settings,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Data exported successfully!', severity: 'success' });
  };

  const SettingsSection = ({ title, icon, children }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 2, mr: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Account Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account preferences and privacy settings
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          size={isMobile ? 'small' : 'medium'}
        >
          Save Changes
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Notification Settings */}
          <SettingsSection title="Notifications" icon={<Notifications />}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.jobAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'jobAlerts', e.target.checked)}
                    />
                  }
                  label="Job Alerts"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.applicationUpdates}
                      onChange={(e) => handleSettingChange('notifications', 'applicationUpdates', e.target.checked)}
                    />
                  }
                  label="Application Updates"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.interviewReminders}
                      onChange={(e) => handleSettingChange('notifications', 'interviewReminders', e.target.checked)}
                    />
                  }
                  label="Interview Reminders"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.weeklyDigest}
                      onChange={(e) => handleSettingChange('notifications', 'weeklyDigest', e.target.checked)}
                    />
                  }
                  label="Weekly Digest"
                />
              </Grid>
            </Grid>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection title="Privacy & Visibility" icon={<Security />}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    label="Profile Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="recruiters">Recruiters Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.allowRecruiterContact}
                      onChange={(e) => handleSettingChange('privacy', 'allowRecruiterContact', e.target.checked)}
                    />
                  }
                  label="Allow Recruiter Contact"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showEmail}
                      onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                    />
                  }
                  label="Show Email Address"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showPhone}
                      onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.checked)}
                    />
                  }
                  label="Show Phone Number"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showSalaryExpectations}
                      onChange={(e) => handleSettingChange('privacy', 'showSalaryExpectations', e.target.checked)}
                    />
                  }
                  label="Show Salary Expectations"
                />
              </Grid>
            </Grid>
          </SettingsSection>

          {/* Preferences */}
          <SettingsSection title="Preferences" icon={<Palette />}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.preferences.theme}
                    onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.preferences.language}
                    onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.preferences.timezone}
                    onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                    label="Timezone"
                  >
                    <MenuItem value="UTC+05:30">India Standard Time (UTC+05:30)</MenuItem>
                    <MenuItem value="UTC+00:00">UTC (UTC+00:00)</MenuItem>
                    <MenuItem value="UTC-05:00">Eastern Time (UTC-05:00)</MenuItem>
                    <MenuItem value="UTC-08:00">Pacific Time (UTC-08:00)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.preferences.currency}
                    onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                    label="Currency"
                  >
                    <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                    <MenuItem value="USD">US Dollar ($)</MenuItem>
                    <MenuItem value="EUR">Euro (€)</MenuItem>
                    <MenuItem value="GBP">British Pound (£)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingsSection>

          {/* Security Settings */}
          <SettingsSection title="Security" icon={<Lock />}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1">Password</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last changed 3 months ago
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.account.twoFactorAuth}
                      onChange={(e) => handleSettingChange('account', 'twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.account.loginAlerts}
                      onChange={(e) => handleSettingChange('account', 'loginAlerts', e.target.checked)}
                    />
                  }
                  label="Login Alerts"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Session Timeout</InputLabel>
                  <Select
                    value={settings.account.sessionTimeout}
                    onChange={(e) => handleSettingChange('account', 'sessionTimeout', e.target.value)}
                    label="Session Timeout"
                  >
                    <MenuItem value="15">15 minutes</MenuItem>
                    <MenuItem value="30">30 minutes</MenuItem>
                    <MenuItem value="60">1 hour</MenuItem>
                    <MenuItem value="120">2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingsSection>
        </Grid>

        {/* Account Actions Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Account Actions
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Export Data"
                    secondary="Download your account data"
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={handleExportData}>
                      <Download />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Import Data"
                    secondary="Upload your data backup"
                  />
                  <ListItemSecondaryAction>
                    <IconButton>
                      <Upload />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem>
                  <ListItemText
                    primary="Delete Account"
                    secondary="Permanently delete your account"
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      color="error"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Account Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}>
                  {user?.name?.[0] || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{user?.name || 'User'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date().getFullYear() - 1}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip icon={<Email />} label="Email Verified" color="success" size="small" />
                <Chip icon={<Phone />} label="Phone Verified" color="success" size="small" />
                <Chip icon={<Work />} label="Profile Complete" color="info" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type={showPasswords.current ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  edge="end"
                >
                  {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  edge="end"
                >
                  {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  edge="end"
                >
                  {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">Update Password</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle color="error.main">Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to delete your account? This will remove all your profile information, 
            applications, and other data from our system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained">Delete Account</Button>
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

export default ApplicantSettingsTab;
