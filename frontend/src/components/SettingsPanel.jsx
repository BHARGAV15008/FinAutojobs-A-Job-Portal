import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Divider,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TextField,
  RadioGroup,
  Radio,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Palette,
  TextFields,
  Notifications,
  Security,
  Language,
  Storage,
  Backup,
  RestoreFromTrash,
  Download,
  Upload,
  ExpandMore,
  Save,
  Refresh,
  Visibility,
  VisibilityOff,
  Edit,
  Delete,
  Add,
  Check,
  Close,
  Info,
  Warning,
  Error as ErrorIcon,
  Success,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SettingsPanel = ({ userRole = 'applicant', onSettingsChange }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    // Appearance Settings
    darkMode: false,
    theme: 'default',
    fontSize: 14,
    fontFamily: 'Roboto',
    compactMode: false,
    animations: true,
    colorScheme: 'blue',

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    interviewReminders: true,
    weeklyDigest: false,
    marketingEmails: false,

    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessaging: true,
    dataSharing: false,
    analyticsTracking: true,

    // Language & Region
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',

    // Advanced Settings
    autoSave: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    loginAlerts: true,
    dataExport: false,
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(`settings_${userRole}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [userRole]);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(`settings_${userRole}`, JSON.stringify(settings));
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, userRole, onSettingsChange]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showSuccessAlert('Settings updated successfully!');
  };

  const showSuccessAlert = (message) => {
    setAlertMessage(message);
    setAlertSeverity('success');
    setShowAlert(true);
  };

  const showErrorAlert = (message) => {
    setAlertMessage(message);
    setAlertSeverity('error');
    setShowAlert(true);
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      darkMode: false,
      theme: 'default',
      fontSize: 14,
      fontFamily: 'Roboto',
      compactMode: false,
      animations: true,
      colorScheme: 'blue',
      emailNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      applicationUpdates: true,
      interviewReminders: true,
      weeklyDigest: false,
      marketingEmails: false,
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessaging: true,
      dataSharing: false,
      analyticsTracking: true,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      autoSave: true,
      sessionTimeout: 30,
      twoFactorAuth: false,
      loginAlerts: true,
      dataExport: false,
    };
    setSettings(defaultSettings);
    setShowResetDialog(false);
    showSuccessAlert('Settings reset to default values!');
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${userRole}_settings_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setShowExportDialog(false);
    showSuccessAlert('Settings exported successfully!');
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          showSuccessAlert('Settings imported successfully!');
        } catch (error) {
          showErrorAlert('Invalid settings file format!');
        }
      };
      reader.readAsText(file);
    }
  };

  const themeOptions = [
    { value: 'default', label: 'Default' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'minimal', label: 'Minimal' },
  ];

  const fontFamilyOptions = [
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
  ];

  const colorSchemeOptions = [
    { value: 'blue', label: 'Blue', color: '#1976d2' },
    { value: 'green', label: 'Green', color: '#388e3c' },
    { value: 'purple', label: 'Purple', color: '#7b1fa2' },
    { value: 'orange', label: 'Orange', color: '#f57c00' },
    { value: 'red', label: 'Red', color: '#d32f2f' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
  ];

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const SettingCard = ({ title, description, children, icon }) => (
    <Card sx={{ mb: 2, transition: 'all 0.2s ease-in-out', '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>}
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Settings & Preferences
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Palette />} label="Appearance" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Security />} label="Privacy & Security" />
            <Tab icon={<Language />} label="Language & Region" />
            <Tab icon={<Storage />} label="Data & Backup" />
          </Tabs>
        </Paper>

        {/* Appearance Settings */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SettingCard
                title="Theme Settings"
                description="Customize the visual appearance of your dashboard"
                icon={<DarkMode />}
              >
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                      />
                    }
                    label="Dark Mode"
                  />
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Theme Style</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    label="Theme Style"
                  >
                    {themeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography gutterBottom>Color Scheme</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  {colorSchemeOptions.map((color) => (
                    <Tooltip key={color.value} title={color.label}>
                      <IconButton
                        onClick={() => handleSettingChange('colorScheme', color.value)}
                        sx={{
                          bgcolor: color.color,
                          color: 'white',
                          border: settings.colorScheme === color.value ? '3px solid' : 'none',
                          borderColor: 'primary.main',
                          '&:hover': { bgcolor: color.color, opacity: 0.8 }
                        }}
                      >
                        {settings.colorScheme === color.value && <Check />}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              </SettingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingCard
                title="Typography"
                description="Adjust font settings for better readability"
                icon={<TextFields />}
              >
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Font Family</InputLabel>
                  <Select
                    value={settings.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                    label="Font Family"
                  >
                    {fontFamilyOptions.map((font) => (
                      <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.value }}>
                        {font.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography gutterBottom>Font Size: {settings.fontSize}px</Typography>
                <Slider
                  value={settings.fontSize}
                  onChange={(e, value) => handleSettingChange('fontSize', value)}
                  min={12}
                  max={20}
                  step={1}
                  marks
                  sx={{ mb: 3 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactMode}
                      onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    />
                  }
                  label="Compact Mode"
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.animations}
                      onChange={(e) => handleSettingChange('animations', e.target.checked)}
                    />
                  }
                  label="Enable Animations"
                />
              </SettingCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={activeTab} index={1}>
          <SettingCard
            title="Notification Preferences"
            description="Control how and when you receive notifications"
            icon={<Notifications />}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Push Notifications" secondary="Browser notifications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Job Alerts" secondary="New job opportunities" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.jobAlerts}
                        onChange={(e) => handleSettingChange('jobAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Application Updates" secondary="Status changes on applications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.applicationUpdates}
                        onChange={(e) => handleSettingChange('applicationUpdates', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Interview Reminders" secondary="Upcoming interview alerts" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.interviewReminders}
                        onChange={(e) => handleSettingChange('interviewReminders', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Weekly Digest" secondary="Summary of weekly activity" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.weeklyDigest}
                        onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </SettingCard>
        </TabPanel>

        {/* Privacy & Security Settings */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SettingCard
                title="Privacy Settings"
                description="Control your profile visibility and data sharing"
                icon={<Security />}
              >
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <FormLabel>Profile Visibility</FormLabel>
                  <RadioGroup
                    value={settings.profileVisibility}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                  >
                    <FormControlLabel value="public" control={<Radio />} label="Public - Visible to everyone" />
                    <FormControlLabel value="recruiters" control={<Radio />} label="Recruiters Only" />
                    <FormControlLabel value="private" control={<Radio />} label="Private - Hidden" />
                  </RadioGroup>
                </FormControl>

                <List>
                  <ListItem>
                    <ListItemIcon><Visibility /></ListItemIcon>
                    <ListItemText primary="Show Email Address" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.showEmail}
                        onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Visibility /></ListItemIcon>
                    <ListItemText primary="Show Phone Number" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.showPhone}
                        onChange={(e) => handleSettingChange('showPhone', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </SettingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingCard
                title="Security Settings"
                description="Enhance your account security"
                icon={<Security />}
              >
                <List>
                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText primary="Two-Factor Authentication" secondary="Add extra security to your account" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText primary="Login Alerts" secondary="Get notified of new logins" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.loginAlerts}
                        onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Typography gutterBottom sx={{ mt: 2 }}>Session Timeout: {settings.sessionTimeout} minutes</Typography>
                <Slider
                  value={settings.sessionTimeout}
                  onChange={(e, value) => handleSettingChange('sessionTimeout', value)}
                  min={15}
                  max={120}
                  step={15}
                  marks={[
                    { value: 15, label: '15m' },
                    { value: 30, label: '30m' },
                    { value: 60, label: '1h' },
                    { value: 120, label: '2h' },
                  ]}
                />
              </SettingCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Language & Region Settings */}
        <TabPanel value={activeTab} index={3}>
          <SettingCard
            title="Language & Regional Settings"
            description="Customize language, timezone, and format preferences"
            icon={<Language />}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    label="Language"
                  >
                    {languageOptions.map((lang) => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    label="Timezone"
                  >
                    {timezoneOptions.map((tz) => (
                      <MenuItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date Format"
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  sx={{ mb: 3 }}
                  helperText="e.g., MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD"
                />

                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                    <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                    <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingCard>
        </TabPanel>

        {/* Data & Backup Settings */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SettingCard
                title="Data Management"
                description="Control your data and backup preferences"
                icon={<Storage />}
              >
                <List>
                  <ListItem>
                    <ListItemIcon><Save /></ListItemIcon>
                    <ListItemText primary="Auto-save" secondary="Automatically save changes" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Storage /></ListItemIcon>
                    <ListItemText primary="Data Sharing" secondary="Share anonymous usage data" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.dataSharing}
                        onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon><Analytics /></ListItemIcon>
                    <ListItemText primary="Analytics Tracking" secondary="Help improve our service" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.analyticsTracking}
                        onChange={(e) => handleSettingChange('analyticsTracking', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </SettingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingCard
                title="Backup & Export"
                description="Manage your data backup and export options"
                icon={<Backup />}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => setShowExportDialog(true)}
                    fullWidth
                  >
                    Export Settings
                  </Button>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                  >
                    Import Settings
                    <input
                      type="file"
                      accept=".json"
                      hidden
                      onChange={handleImportSettings}
                    />
                  </Button>

                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Refresh />}
                    onClick={() => setShowResetDialog(true)}
                    fullWidth
                  >
                    Reset to Default
                  </Button>
                </Box>
              </SettingCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => showSuccessAlert('All settings saved successfully!')}
          >
            Save All Changes
          </Button>
        </Box>
      </motion.div>

      {/* Dialogs */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetSettings} color="warning" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Settings</DialogTitle>
        <DialogContent>
          <Typography>
            This will download your current settings as a JSON file that you can import later or share with other devices.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExportSettings} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Alerts */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity={alertSeverity}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPanel;