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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  Download,
  MoreVert,
  CheckCircle,
  Cancel,
  Schedule,
  Visibility,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';

const RealApplicationsTab = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Status filters
  const statusFilters = [
    { label: 'All Applications', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Interviewed', value: 'interviewed' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
  ];

  // Fetch applications for recruiter
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching applications for recruiter:', user?.userId);
        
        // Get applications for recruiter's jobs (role-based filtering handled by backend)
        const response = await applicationService.getUserApplications(50, 1);
        console.log('✅ Applications fetched:', response);
        
        if (response.success) {
          setApplications(response.data?.applications || []);
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

    if (user?.userId) {
      fetchApplications();
    }
  }, [user]);

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    const currentFilter = statusFilters[selectedTab];
    if (currentFilter.value === 'all') return true;
    return app.status === currentFilter.value;
  });

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      console.log('🔄 Updating application status:', {
        applicationId: selectedApplication._id,
        status: newStatus,
        notes
      });

      const response = await applicationService.updateApplicationStatus(
        selectedApplication._id,
        newStatus,
        notes
      );

      if (response.success) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app._id === selectedApplication._id 
            ? { ...app, status: newStatus, recruiterNotes: notes }
            : app
        ));
        
        setStatusUpdateModal(false);
        setSelectedApplication(null);
        setNewStatus('');
        setNotes('');
        
        console.log('✅ Application status updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating application status:', error);
    }
  };

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
      interviewed: <Person />,
      accepted: <CheckCircle />,
      rejected: <Cancel />,
    };
    return icons[status] || <Schedule />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading applications...</Typography>
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
          Job Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage applications for your job postings
        </Typography>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusFilters.map((filter, index) => (
            <Tab
              key={filter.value}
              label={
                <Badge
                  badgeContent={
                    filter.value === 'all' 
                      ? applications.length 
                      : applications.filter(app => app.status === filter.value).length
                  }
                  color="primary"
                >
                  {filter.label}
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No applications found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedTab === 0 
              ? "You haven't received any applications yet."
              : `No applications with status: ${statusFilters[selectedTab].label}`
            }
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Job Position</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>
                        {application.applicantSnapshot?.fullName?.charAt(0) || 'A'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {application.applicantSnapshot?.fullName || 'Unknown Applicant'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.applicantSnapshot?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="subtitle2">
                      {application.jobSnapshot?.title || 'Unknown Position'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.jobSnapshot?.company}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(application.status)}
                      label={application.status?.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(application.status)}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {application.applicationData?.experience || 'Not specified'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {application.applicantSnapshot?.location || 'Not specified'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedApplication(application);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setViewDetailsModal(true);
          setAnchorEl(null);
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          setStatusUpdateModal(true);
          setAnchorEl(null);
        }}>
          <CheckCircle sx={{ mr: 1 }} />
          Update Status
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle resume download
          setAnchorEl(null);
        }}>
          <Download sx={{ mr: 1 }} />
          Download Resume
        </MenuItem>
      </Menu>

      {/* View Details Modal */}
      <Dialog
        open={viewDetailsModal}
        onClose={() => setViewDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Applicant Information</Typography>
                <Typography><strong>Name:</strong> {selectedApplication.applicantSnapshot?.fullName}</Typography>
                <Typography><strong>Email:</strong> {selectedApplication.applicantSnapshot?.email}</Typography>
                <Typography><strong>Phone:</strong> {selectedApplication.applicantSnapshot?.phone}</Typography>
                <Typography><strong>Location:</strong> {selectedApplication.applicantSnapshot?.location}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Job Information</Typography>
                <Typography><strong>Position:</strong> {selectedApplication.jobSnapshot?.title}</Typography>
                <Typography><strong>Company:</strong> {selectedApplication.jobSnapshot?.company}</Typography>
                <Typography><strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Application Data</Typography>
                <Typography><strong>Experience:</strong> {selectedApplication.applicationData?.experience}</Typography>
                <Typography><strong>Current Job:</strong> {selectedApplication.applicationData?.currentJobTitle}</Typography>
                <Typography><strong>Current Company:</strong> {selectedApplication.applicationData?.currentCompany}</Typography>
                
                {selectedApplication.applicationData?.coverLetter && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Cover Letter:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">
                        {selectedApplication.applicationData.coverLetter}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog
        open={statusUpdateModal}
        onClose={() => setStatusUpdateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="shortlisted">Shortlisted</MenuItem>
              <MenuItem value="interviewed">Interviewed</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this status update..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateModal(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealApplicationsTab;
