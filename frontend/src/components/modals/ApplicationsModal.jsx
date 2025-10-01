import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Work,
  Download,
  Visibility,
  CheckCircle,
  AccessTime,
  Cancel,
  Star,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicationsModal = ({ isOpen, onClose, job, applications = [] }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  // Group applications by status
  const groupedApplications = applications.reduce((acc, app) => {
    const status = app.status || app.applicationStatus || 'pending';
    if (!acc[status]) acc[status] = [];
    acc[status].push(app);
    return acc;
  }, {});

  const statusTabs = [
    { label: 'All Applications', key: 'all', count: applications.length },
    { label: 'Pending', key: 'pending', count: groupedApplications.pending?.length || 0 },
    { label: 'Reviewed', key: 'reviewing', count: groupedApplications.reviewing?.length || 0 },
    { label: 'Shortlisted', key: 'shortlisted', count: groupedApplications.shortlisted?.length || 0 },
    { label: 'Rejected', key: 'rejected', count: groupedApplications.rejected?.length || 0 },
  ];

  const getDisplayApplications = () => {
    if (selectedTab === 0) return applications;
    const selectedStatus = statusTabs[selectedTab]?.key;
    return groupedApplications[selectedStatus] || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewing': return 'info';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      case 'hired': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AccessTime />;
      case 'reviewing': return <Visibility />;
      case 'shortlisted': return <Star />;
      case 'rejected': return <Cancel />;
      case 'hired': return <CheckCircle />;
      default: return <AccessTime />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadResume = (application) => {
    console.log('Download resume for:', application);
    // Implement resume download logic
  };

  const handleViewProfile = (application) => {
    console.log('View profile for:', application);
    // Implement profile view logic
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              Job Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job?.jobTitle || job?.title || 'Job Position'} - {applications.length} applications
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 0, pb: 0 }}>
        {/* Job Info Card */}
        {job && (
          <Box sx={{ px: 3, mb: 2 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6" fontWeight="bold">
                      {job.jobTitle || job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.companyName || job.company} • {job.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} textAlign="right">
                    <Chip
                      label={`${applications.length} Applications`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Status Tabs */}
        <Box sx={{ px: 3, mb: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {statusTabs.map((tab, index) => (
              <Tab
                key={tab.key}
                label={
                  <Badge badgeContent={tab.count} color="primary" showZero>
                    {tab.label}
                  </Badge>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Applications List */}
        <Box sx={{ px: 3, maxHeight: '400px', overflow: 'auto' }}>
          {getDisplayApplications().length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No applications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Applications will appear here once candidates apply
              </Typography>
            </Paper>
          ) : (
            <List>
              {getDisplayApplications().map((application, index) => {
                // Debug application structure
                console.log('🔍 Application data structure:', application);
                console.log('🔍 Available fields:', Object.keys(application));
                
                // Handle both API response formats
                const applicant = application.applicantSnapshot || {
                  fullName: application.applicantName,
                  email: application.email,
                  phone: application.phone,
                  location: application.location
                };
                                
                console.log('🔍 Extracted applicant data:', applicant);
                
                const status = application.status || application.applicationStatus || 'pending';
                
                return (
                  <motion.div
                    key={application._id || application.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {applicant.fullName || 'Unknown Applicant'}
                            </Typography>
                            <Chip
                              icon={getStatusIcon(status)}
                              label={status.charAt(0).toUpperCase() + status.slice(1)}
                              color={getStatusColor(status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <span style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                              <Email sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                              {applicant.email || 'No email provided'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                              Applied {formatDate(application.appliedAt || application.createdAt)}
                            </span>
                            {applicant.phone && (
                              <span style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                {applicant.phone}
                              </span>
                            )}
                            {applicant.location && (
                              <span style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                {applicant.location}
                              </span>
                            )}
                          </React.Fragment>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Profile">
                            <IconButton
                              size="small"
                              onClick={() => handleViewProfile(application)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Resume">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadResume(application)}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {applications.length > 0 && (
          <Button variant="contained" startIcon={<Download />}>
            Export Applications
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationsModal;
