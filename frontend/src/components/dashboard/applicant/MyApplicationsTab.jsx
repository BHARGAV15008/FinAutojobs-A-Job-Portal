import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Work,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  Star,
  Business,
  LocationOn,
  CalendarToday,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationService } from '../../../services/applicationService';
import { useAuth } from '../../../contexts/AuthContext';

const MyApplicationsTab = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    shortlisted: 0,
    interviewed: 0,
    accepted: 0,
    rejected: 0,
  });

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching applications for applicant:', user?.userId || user?._id);
        
        const response = await applicationService.getUserApplications(50, 1);
        console.log('✅ Applications fetched:', response);
        
        if (response.success) {
          const apps = response.data?.applications || [];
          setApplications(apps);
          
          // Calculate stats
          const newStats = {
            total: apps.length,
            pending: apps.filter(app => app.status === 'pending').length,
            underReview: apps.filter(app => app.status === 'under_review').length,
            shortlisted: apps.filter(app => app.status === 'shortlisted').length,
            interviewed: apps.filter(app => app.status === 'interviewed').length,
            accepted: apps.filter(app => app.status === 'accepted').length,
            rejected: apps.filter(app => app.status === 'rejected').length,
          };
          setStats(newStats);
        } else {
          setError('Failed to fetch applications');
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        setError('Error loading applications');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId || user?._id) {
      fetchApplications();
    }
  }, [user]);

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      under_review: 'info',
      shortlisted: 'primary',
      interviewed: 'secondary',
      accepted: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: <Schedule />,
      under_review: <Visibility />,
      shortlisted: <Star />,
      interviewed: <Assessment />,
      accepted: <CheckCircle />,
      rejected: <Cancel />,
    };
    return icons[status] || <Schedule />;
  };

  // Get application progress percentage
  const getProgressPercentage = (status) => {
    const progressMap = {
      pending: 20,
      under_review: 40,
      shortlisted: 60,
      interviewed: 80,
      accepted: 100,
      rejected: 0,
    };
    return progressMap[status] || 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading your applications...</Typography>
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the status of your job applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Work color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Applications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.pending + stats.underReview}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.accepted}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.total > 0 ? Math.round(((stats.shortlisted + stats.interviewed + stats.accepted) / stats.total) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start applying to jobs to see your applications here.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} href="/jobs">
            Browse Jobs
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} lg={4} key={application._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => {
                  setSelectedApplication(application);
                  setViewDetailsModal(true);
                }}>
                  <CardContent>
                    {/* Job Title and Company */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {application.jobSnapshot?.title || 'Unknown Position'}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <Business sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {application.jobSnapshot?.company || 'Unknown Company'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={getStatusIcon(application.status)}
                        label={application.status?.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(application.status)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      
                      {/* Progress Bar */}
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Application Progress
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressPercentage(application.status)}
                          color={getStatusColor(application.status)}
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>

                    {/* Application Details */}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Experience:</strong> {application.applicantSnapshot?.experience || application.applicationData?.experience || 'Not specified'}
                      </Typography>
                      {(application.applicantSnapshot?.currentJobTitle || application.applicationData?.currentJobTitle) && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Current Role:</strong> {application.applicantSnapshot?.currentJobTitle || application.applicationData?.currentJobTitle}
                        </Typography>
                      )}
                    </Box>

                    {/* Recruiter Notes */}
                    {application.recruiterNotes && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Recruiter Notes:
                        </Typography>
                        <Typography variant="body2">
                          {application.recruiterNotes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Application Details Modal */}
      <Dialog
        open={viewDetailsModal}
        onClose={() => setViewDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              {/* Job Information */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Job Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Position:</strong> {selectedApplication.jobSnapshot?.title}</Typography>
                    <Typography><strong>Company:</strong> {selectedApplication.jobSnapshot?.company}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography><strong>Status:</strong></Typography>
                      <Chip
                        icon={getStatusIcon(selectedApplication.status)}
                        label={selectedApplication.status?.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(selectedApplication.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Application Timeline */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Application Timeline</Typography>
                <Box sx={{ pl: 2 }}>
                  {/* Application Submitted */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                      <Work sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">Application Submitted</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(selectedApplication.appliedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Current Status */}
                  {selectedApplication.status !== 'pending' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: `${getStatusColor(selectedApplication.status)}.main`, 
                        mr: 2, 
                        width: 32, 
                        height: 32 
                      }}>
                        {React.cloneElement(getStatusIcon(selectedApplication.status), { sx: { fontSize: 16 } })}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          Status: {selectedApplication.status?.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(selectedApplication.updatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Your Application Data */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Your Application</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Experience:</strong> {selectedApplication.applicantSnapshot?.experience || selectedApplication.applicationData?.experience || 'Not specified'}</Typography>
                    <Typography><strong>Current Job:</strong> {selectedApplication.applicantSnapshot?.currentJobTitle || selectedApplication.applicationData?.currentJobTitle || 'Not specified'}</Typography>
                    <Typography><strong>Current Company:</strong> {selectedApplication.applicantSnapshot?.currentCompany || selectedApplication.applicationData?.currentCompany || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Location:</strong> {selectedApplication.applicantSnapshot?.location || selectedApplication.applicationData?.location || 'Not specified'}</Typography>
                    <Typography><strong>Phone:</strong> {selectedApplication.applicantSnapshot?.phone || selectedApplication.applicationData?.phone || 'Not specified'}</Typography>
                    <Typography><strong>Email:</strong> {selectedApplication.applicantSnapshot?.email || selectedApplication.applicationData?.email || 'Not specified'}</Typography>
                  </Grid>
                </Grid>
                
                {/* Skills */}
                {selectedApplication.applicantSnapshot?.skills && selectedApplication.applicantSnapshot.skills.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Skills:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedApplication.applicantSnapshot.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Education */}
                {selectedApplication.applicantSnapshot?.education && selectedApplication.applicantSnapshot.education.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Education:</Typography>
                    {selectedApplication.applicantSnapshot.education.map((edu, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{edu.degree}</strong> {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                        </Typography>
                        {edu.institution && (
                          <Typography variant="body2" color="text.secondary">
                            {edu.institution}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
                
                {/* Work Experience */}
                {selectedApplication.applicantSnapshot?.workExperience && selectedApplication.applicantSnapshot.workExperience.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Work Experience:</Typography>
                    {selectedApplication.applicantSnapshot.workExperience.map((work, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{work.jobTitle}</strong> {work.companyName && `at ${work.companyName}`}
                        </Typography>
                        {work.description && (
                          <Typography variant="body2" color="text.secondary">
                            {work.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
                
                {selectedApplication.applicationData?.coverLetter && 
                 !selectedApplication.applicationData.coverLetter.includes('applicationService.js') && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Cover Letter:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">
                        {selectedApplication.applicationData.coverLetter}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {selectedApplication.recruiterNotes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Recruiter Feedback:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <Typography variant="body2">
                        {selectedApplication.recruiterNotes}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyApplicationsTab;
