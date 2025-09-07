import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Settings,
  Security,
  Palette,
  Storage,
  Email,
  Backup,
  Update,
  Delete,
  Save,
  Refresh,
  Language,
  Notifications,
  AdminPanelSettings,
  CloudUpload,
  Download,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AdminSettingsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showBackupDialog, setShowBackupDialog] = useState(false);

  const tabLabels = ['General', 'Security', 'Email', 'Backup & Restore', 'System'];

  const defaultSettings = {
    general: {
      siteName: 'FinAutoJobs',
      siteDescription: 'Premier job portal for finance professionals',
      timezone: 'Asia/Kolkata',
      language: 'en',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChars: true,
      twoFactorAuth: true,
      ipWhitelisting: false
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'noreply@finautojobs.com',
      smtpPassword: '••••••••',
      fromName: 'FinAutoJobs',
      fromEmail: 'noreply@finautojobs.com',
      enableSsl: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: '2024-01-25T02:00:00'
    },
    system: {
      debugMode: false,
      logLevel: 'info',
      cacheEnabled: true,
      compressionEnabled: true,
      apiRateLimit: 1000
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = (category) => {
    setSnackbar({
      open: true,
      message: `${category} settings saved successfully!`,
      severity: 'success'
    });
  };

  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Site Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Site Name"
                value={settings.general?.siteName || ''}
                onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Site Description"
                value={settings.general?.siteDescription || ''}
                onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
              />
              
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.general?.timezone || ''}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  label="Timezone"
                >
                  <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">America/New_York</MenuItem>
                  <MenuItem value="Europe/London">Europe/London</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Default Language</InputLabel>
                <Select
                  value={settings.general?.language || ''}
                  onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                  label="Default Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Platform Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general?.maintenanceMode || false}
                    onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general?.registrationEnabled || false}
                    onChange={(e) => handleSettingChange('general', 'registrationEnabled', e.target.checked)}
                  />
                }
                label="Enable User Registration"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general?.emailVerificationRequired || false}
                    onChange={(e) => handleSettingChange('general', 'emailVerificationRequired', e.target.checked)}
                  />
                }
                label="Require Email Verification"
              />

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => saveSettings('General')}
                sx={{ mt: 2 }}
              >
                Save General Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Authentication Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150 }}>
                  Session Timeout (minutes):
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={settings.security?.sessionTimeout || ''}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  sx={{ width: 100 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150 }}>
                  Max Login Attempts:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={settings.security?.maxLoginAttempts || ''}
                  onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  sx={{ width: 100 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150 }}>
                  Min Password Length:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={settings.security?.passwordMinLength || ''}
                  onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  sx={{ width: 100 }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security?.requireSpecialChars || false}
                    onChange={(e) => handleSettingChange('security', 'requireSpecialChars', e.target.checked)}
                  />
                }
                label="Require Special Characters in Password"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security?.twoFactorAuth || false}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                }
                label="Enable Two-Factor Authentication"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security?.ipWhitelisting || false}
                    onChange={(e) => handleSettingChange('security', 'ipWhitelisting', e.target.checked)}
                  />
                }
                label="Enable IP Whitelisting"
              />

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => saveSettings('Security')}
                sx={{ mt: 2 }}
              >
                Save Security Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Status
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Security color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="SSL Certificate"
                  secondary="Valid until Dec 2024"
                />
                <Chip label="Active" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Firewall Protection"
                  secondary="All ports secured"
                />
                <Chip label="Active" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Vulnerability Scan"
                  secondary="Last scan: 3 days ago"
                />
                <Chip label="Pending" color="warning" size="small" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEmailSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              SMTP Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={settings.email?.smtpHost || ''}
                  onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  type="number"
                  value={settings.email?.smtpPort || ''}
                  onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  value={settings.email?.smtpUsername || ''}
                  onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type="password"
                  value={settings.email?.smtpPassword || ''}
                  onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={settings.email?.fromName || ''}
                  onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  type="email"
                  value={settings.email?.fromEmail || ''}
                  onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email?.enableSsl || false}
                      onChange={(e) => handleSettingChange('email', 'enableSsl', e.target.checked)}
                    />
                  }
                  label="Enable SSL/TLS"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => saveSettings('Email')}
                  >
                    Save Email Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Email />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Test email sent successfully!',
                        severity: 'success'
                      });
                    }}
                  >
                    Send Test Email
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBackupSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backup Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.backup?.autoBackup || false}
                    onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                  />
                }
                label="Enable Automatic Backup"
              />

              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.backup?.backupFrequency || ''}
                  onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                  label="Backup Frequency"
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150 }}>
                  Retention Days:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={settings.backup?.retentionDays || ''}
                  onChange={(e) => handleSettingChange('backup', 'retentionDays', parseInt(e.target.value))}
                  sx={{ width: 100 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Last Backup: {new Date(settings.backup?.lastBackup || '').toLocaleString()}
              </Typography>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => saveSettings('Backup')}
              >
                Save Backup Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backup Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Backup />}
                onClick={() => {
                  setSnackbar({
                    open: true,
                    message: 'Manual backup started successfully!',
                    severity: 'success'
                  });
                }}
                fullWidth
              >
                Create Manual Backup
              </Button>

              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => setShowBackupDialog(true)}
                fullWidth
              >
                Restore from Backup
              </Button>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {
                  setSnackbar({
                    open: true,
                    message: 'Backup download started!',
                    severity: 'info'
                  });
                }}
                fullWidth
              >
                Download Latest Backup
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSystemSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.system?.debugMode || false}
                    onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
                  />
                }
                label="Debug Mode"
              />

              <FormControl fullWidth>
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={settings.system?.logLevel || ''}
                  onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
                  label="Log Level"
                >
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warn">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.system?.cacheEnabled || false}
                    onChange={(e) => handleSettingChange('system', 'cacheEnabled', e.target.checked)}
                  />
                }
                label="Enable Caching"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.system?.compressionEnabled || false}
                    onChange={(e) => handleSettingChange('system', 'compressionEnabled', e.target.checked)}
                  />
                }
                label="Enable Compression"
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: 150 }}>
                  API Rate Limit:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={settings.system?.apiRateLimit || ''}
                  onChange={(e) => handleSettingChange('system', 'apiRateLimit', parseInt(e.target.value))}
                  sx={{ width: 100 }}
                />
                <Typography variant="body2" color="text.secondary">
                  requests/hour
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => saveSettings('System')}
              >
                Save System Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Platform Version"
                  secondary="v2.1.0"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Database Version"
                  secondary="SQLite 3.40.1"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Node.js Version"
                  secondary="v18.17.0"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Uptime"
                  secondary="15 days, 8 hours"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderGeneralSettings();
      case 1: return renderSecuritySettings();
      case 2: return renderEmailSettings();
      case 3: return renderBackupSettings();
      case 4: return renderSystemSettings();
      default: return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
                  <Box sx={{ height: 200, bgcolor: 'grey.200', borderRadius: 1 }} />
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
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure platform settings and preferences
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadSettings}
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

      {/* Backup Dialog */}
      <Dialog
        open={showBackupDialog}
        onClose={() => setShowBackupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Restore from Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a backup file to restore from. This will overwrite current data.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUpload />}
          >
            Choose Backup File
            <input type="file" hidden accept=".zip,.sql" />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="warning">
            Restore
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

export default AdminSettingsTab;
