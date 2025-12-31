import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button,
  FormControlLabel, Select, MenuItem, FormControl, InputLabel,
  Slider, Divider, Alert, Snackbar, Accordion, AccordionSummary,
  AccordionDetails, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings, Palette, Language, ExpandMore, Save, RestoreFromTrash,
  VolumeUp, Mail, Smartphone, Briefcase, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

const CustomSwitch = ({ checked, onChange }) => {
  // Use internal state to manage visual state immediately, then call prop
  const [isEnabled, setIsEnabled] = useState(checked);

  const handleClick = () => {
    const newChecked = !isEnabled;
    setIsEnabled(newChecked);
    onChange(newChecked);
  };

  return (
    <div
      onClick={handleClick}
      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        isEnabled ? 'bg-blue-600 justify-end' : 'bg-gray-200 dark:bg-gray-600 justify-start'
      }`}
    >
      <motion.div
        layout
        className="w-5 h-5 bg-white rounded-full shadow-md"
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      />
    </div>
  );
};

const NotificationRow = ({ icon, title, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl transition-colors duration-300">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
    <CustomSwitch checked={checked} onChange={onChange} />
  </div>
);

const ApplicantSettingsTab = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    jobAlertNotifications: true,
    interviewReminders: true,
    dashboardLayout: 'grid',
    sidebarCollapsed: false,
    showWelcomeTour: true,
    autoSaveProfile: true,
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    soundEnabled: true,
    soundVolume: 50
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate?.(settings);
    setSnackbarOpen(true);
  };

  const handleReset = () => {
    setSettings({
      theme: 'light',
      fontSize: 'medium',
      language: 'en',
      emailNotifications: true,
      pushNotifications: true,
      jobAlertNotifications: true,
      interviewReminders: true,
      dashboardLayout: 'grid',
      sidebarCollapsed: false,
      showWelcomeTour: true,
      autoSaveProfile: true,
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowDirectMessages: true,
      soundEnabled: true,
      soundVolume: 50
    });
    setResetDialogOpen(false);
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Settings & Preferences
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<RestoreFromTrash />}
                  onClick={() => setResetDialogOpen(true)}
                  color="error"
                >
                  Reset to Default
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>

            {/* Appearance Settings */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Palette sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Appearance</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Theme</InputLabel>
                      <Select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                        label="Theme"
                      >
                        <MenuItem value="light">
                          <Box display="flex" alignItems="center">
                            <Brightness7 sx={{ mr: 1 }} />
                            Light
                          </Box>
                        </MenuItem>
                        <MenuItem value="dark">
                          <Box display="flex" alignItems="center">
                            <Brightness4 sx={{ mr: 1 }} />
                            Dark
                          </Box>
                        </MenuItem>
                        <MenuItem value="auto">Auto (System)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Font Size</InputLabel>
                      <Select
                        value={settings.fontSize}
                        onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                        label="Font Size"
                      >
                        <MenuItem value="small">Small</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="large">Large</MenuItem>
                        <MenuItem value="extra-large">Extra Large</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Dashboard Layout</InputLabel>
                      <Select
                        value={settings.dashboardLayout}
                        onChange={(e) => handleSettingChange('dashboardLayout', e.target.value)}
                        label="Dashboard Layout"
                      >
                        <MenuItem value="grid">Grid View</MenuItem>
                        <MenuItem value="list">List View</MenuItem>
                        <MenuItem value="compact">Compact View</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.sidebarCollapsed}
                          onChange={(e) => handleSettingChange('sidebarCollapsed', e.target.checked)}
                        />
                      }
                      label="Collapse sidebar by default"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Language & Region */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Language sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Language & Region</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        label="Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                        <MenuItem value="de">Deutsch</MenuItem>
                        <MenuItem value="it">Italiano</MenuItem>
                        <MenuItem value="pt">Português</MenuItem>
                        <MenuItem value="zh">中文</MenuItem>
                        <MenuItem value="ja">日本語</MenuItem>
                        <MenuItem value="ko">한국어</MenuItem>
                        <MenuItem value="hi">हिन्दी</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value="Asia/Kolkata"
                        label="Timezone"
                      >
                        <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                        <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                        <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                        <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                        <MenuItem value="Australia/Sydney">Australia/Sydney (AEST)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Notifications */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Notifications sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <div className="space-y-4">
                  <NotificationRow 
                    icon={<Mail className="w-6 h-6 text-blue-500"/>}
                    title="Email Notifications"
                    description="Receive job alerts and updates via email"
                    checked={settings.emailNotifications}
                    onChange={(val) => handleSettingChange('emailNotifications', val)}
                  />
                  <NotificationRow 
                    icon={<Smartphone className="w-6 h-6 text-green-500"/>}
                    title="Push Notifications"
                    description="Get instant notifications on your device"
                    checked={settings.pushNotifications}
                    onChange={(val) => handleSettingChange('pushNotifications', val)}
                  />
                   <NotificationRow 
                    icon={<Briefcase className="w-6 h-6 text-indigo-500"/>}
                    title="Job Alerts"
                    description="Notifications for new job matches"
                    checked={settings.jobAlertNotifications}
                    onChange={(val) => handleSettingChange('jobAlertNotifications', val)}
                  />
                  <NotificationRow 
                    icon={<MessageSquare className="w-6 h-6 text-orange-500"/>}
                    title="Interview Reminders"
                    description="Reminders for upcoming interviews"
                    checked={settings.interviewReminders}
                    onChange={(val) => handleSettingChange('interviewReminders', val)}
                  />
                </div>
              </AccordionDetails>
            </Accordion>

            {/* Sound Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <VolumeUp sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Sound</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.soundEnabled}
                          onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                        />
                      }
                      label="Enable notification sounds"
                    />
                  </Grid>
                  {settings.soundEnabled && (
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Sound Volume: {settings.soundVolume}%
                      </Typography>
                      <Slider
                        value={settings.soundVolume}
                        onChange={(e, value) => handleSettingChange('soundVolume', value)}
                        min={0}
                        max={100}
                        step={10}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Privacy Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Privacy sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Privacy</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Profile Visibility</InputLabel>
                      <Select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        label="Profile Visibility"
                      >
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="recruiters">Recruiters Only</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Show Online Status"
                          secondary="Let others see when you're online"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.showOnlineStatus}
                            onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Allow Direct Messages"
                          secondary="Allow recruiters to message you directly"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.allowDirectMessages}
                            onChange={(e) => handleSettingChange('allowDirectMessages', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* General Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Settings sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">General</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Auto-save Profile Changes"
                      secondary="Automatically save profile changes as you type"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.autoSaveProfile}
                        onChange={(e) => handleSettingChange('autoSaveProfile', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Show Welcome Tour"
                      secondary="Show guided tour for new features"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.showWelcomeTour}
                        onChange={(e) => handleSettingChange('showWelcomeTour', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleReset} color="error" variant="contained">
            Reset All Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicantSettingsTab;
