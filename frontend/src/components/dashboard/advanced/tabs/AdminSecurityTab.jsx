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
  Divider,
} from '@mui/material';
import {
  Security,
  Warning,
  Shield,
  Lock,
  VpnKey,
  Visibility,
  Block,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Settings,
  AdminPanelSettings,
  VerifiedUser,
  GppBad,
  GppGood,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AdminSecurityTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [securityData, setSecurityData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const tabLabels = ['Security Overview', 'Access Logs', 'Threat Detection', 'Settings'];

  const sampleSecurityData = {
    securityMetrics: {
      totalLogins: 15420,
      failedAttempts: 234,
      blockedIPs: 12,
      activeThreats: 3,
      securityScore: 85
    },
    recentLogs: [
      {
        id: 1,
        timestamp: '2024-01-25T14:30:00',
        user: 'john.smith@email.com',
        action: 'Login Success',
        ip: '192.168.1.100',
        location: 'Mumbai, India',
        device: 'Chrome on Windows',
        risk: 'low'
      },
      {
        id: 2,
        timestamp: '2024-01-25T14:25:00',
        user: 'suspicious@email.com',
        action: 'Failed Login',
        ip: '45.123.45.67',
        location: 'Unknown',
        device: 'Unknown Browser',
        risk: 'high'
      },
      {
        id: 3,
        timestamp: '2024-01-25T14:20:00',
        user: 'admin@finautojobs.com',
        action: 'Admin Access',
        ip: '192.168.1.101',
        location: 'Delhi, India',
        device: 'Firefox on Mac',
        risk: 'low'
      }
    ],
    threats: [
      {
        id: 1,
        type: 'Brute Force Attack',
        severity: 'high',
        source: '45.123.45.67',
        attempts: 25,
        status: 'blocked',
        timestamp: '2024-01-25T13:45:00'
      },
      {
        id: 2,
        type: 'Suspicious Login Pattern',
        severity: 'medium',
        source: '78.234.56.89',
        attempts: 8,
        status: 'monitoring',
        timestamp: '2024-01-25T12:30:00'
      },
      {
        id: 3,
        type: 'Multiple Account Access',
        severity: 'low',
        source: '192.168.1.150',
        attempts: 3,
        status: 'resolved',
        timestamp: '2024-01-25T11:15:00'
      }
    ],
    securitySettings: {
      twoFactorRequired: true,
      passwordComplexity: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      ipWhitelisting: false,
      auditLogging: true
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecurityData(sampleSecurityData);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error'
    };
    return colors[risk] || 'default';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      blocked: 'error',
      monitoring: 'warning',
      resolved: 'success'
    };
    return colors[status] || 'default';
  };

  const renderSecurityOverview = () => (
    <Grid container spacing={3}>
      {/* Security Metrics */}
      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Shield sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {securityData.securityMetrics?.securityScore}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Security Score
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <VerifiedUser sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {securityData.securityMetrics?.totalLogins?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Logins
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {securityData.securityMetrics?.failedAttempts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Failed Attempts
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Block sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {securityData.securityMetrics?.blockedIPs}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Blocked IPs
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <GppBad sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {securityData.securityMetrics?.activeThreats}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Threats
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Security Events */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Security Events
            </Typography>
            <List>
              {securityData.recentLogs?.slice(0, 5).map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemIcon>
                      {log.risk === 'high' ? (
                        <Error color="error" />
                      ) : log.risk === 'medium' ? (
                        <Warning color="warning" />
                      ) : (
                        <CheckCircle color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${log.action} - ${log.user}`}
                      secondary={`${new Date(log.timestamp).toLocaleString()} | ${log.ip} | ${log.location}`}
                    />
                    <Chip
                      label={log.risk}
                      color={getRiskColor(log.risk)}
                      size="small"
                    />
                  </ListItem>
                  {index < 4 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAccessLogs = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Access Logs
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Risk Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityData.recentLogs?.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>{log.location}</TableCell>
                      <TableCell>{log.device}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.risk}
                          color={getRiskColor(log.risk)}
                          size="small"
                        />
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

  const renderThreatDetection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Threat Detection & Response
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Threat Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Source IP</TableCell>
                    <TableCell>Attempts</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Detected At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityData.threats?.map((threat) => (
                    <TableRow key={threat.id} hover>
                      <TableCell>{threat.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={threat.severity}
                          color={getSeverityColor(threat.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{threat.source}</TableCell>
                      <TableCell>{threat.attempts}</TableCell>
                      <TableCell>
                        <Chip
                          label={threat.status}
                          color={getStatusColor(threat.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(threat.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setSnackbar({
                              open: true,
                              message: `IP ${threat.source} has been blocked`,
                              severity: 'success'
                            });
                          }}
                        >
                          Block IP
                        </Button>
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

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Authentication Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securityData.securitySettings?.twoFactorRequired}
                    onChange={(e) => {
                      setSecurityData(prev => ({
                        ...prev,
                        securitySettings: {
                          ...prev.securitySettings,
                          twoFactorRequired: e.target.checked
                        }
                      }));
                    }}
                  />
                }
                label="Require Two-Factor Authentication"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={securityData.securitySettings?.passwordComplexity}
                    onChange={(e) => {
                      setSecurityData(prev => ({
                        ...prev,
                        securitySettings: {
                          ...prev.securitySettings,
                          passwordComplexity: e.target.checked
                        }
                      }));
                    }}
                  />
                }
                label="Enforce Password Complexity"
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Session Timeout (minutes):</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={securityData.securitySettings?.sessionTimeout}
                  onChange={(e) => {
                    setSecurityData(prev => ({
                      ...prev,
                      securitySettings: {
                        ...prev.securitySettings,
                        sessionTimeout: parseInt(e.target.value)
                      }
                    }));
                  }}
                  sx={{ width: 100 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Max Login Attempts:</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={securityData.securitySettings?.maxLoginAttempts}
                  onChange={(e) => {
                    setSecurityData(prev => ({
                      ...prev,
                      securitySettings: {
                        ...prev.securitySettings,
                        maxLoginAttempts: parseInt(e.target.value)
                      }
                    }));
                  }}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Security
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securityData.securitySettings?.ipWhitelisting}
                    onChange={(e) => {
                      setSecurityData(prev => ({
                        ...prev,
                        securitySettings: {
                          ...prev.securitySettings,
                          ipWhitelisting: e.target.checked
                        }
                      }));
                    }}
                  />
                }
                label="Enable IP Whitelisting"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={securityData.securitySettings?.auditLogging}
                    onChange={(e) => {
                      setSecurityData(prev => ({
                        ...prev,
                        securitySettings: {
                          ...prev.securitySettings,
                          auditLogging: e.target.checked
                        }
                      }));
                    }}
                  />
                }
                label="Enable Audit Logging"
              />

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setSnackbar({
                    open: true,
                    message: 'Security settings updated successfully',
                    severity: 'success'
                  });
                }}
              >
                Update Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            Security settings changes will take effect immediately. Make sure to test the changes 
            in a controlled environment before applying to production.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderSecurityOverview();
      case 1: return renderAccessLogs();
      case 2: return renderThreatDetection();
      case 3: return renderSecuritySettings();
      default: return renderSecurityOverview();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Grid item xs={12} sm={6} md={2.4} key={item}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ height: 40, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
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
            Security Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage platform security
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadSecurityData}
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

export default AdminSecurityTab;
