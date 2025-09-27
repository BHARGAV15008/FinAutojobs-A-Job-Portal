import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Grid,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Work,
  Business,
  LocationOn,
  CalendarToday,
  MoreVert,
  Visibility,
  Delete,
  Download,
  Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ApplicationsTab = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    const fetchApplications = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockApplications = [
        {
          id: '1',
          jobTitle: 'Senior Software Engineer',
          company: 'TechCorp Solutions',
          location: 'Mumbai, India',
          appliedAt: '2024-01-15T10:30:00Z',
          status: 'under_review',
          progress: 60,
          salary: '₹800000-₹1200000 LPA',
          jobType: 'Full-time',
          description: 'We are looking for a Senior Software Engineer to join our dynamic team...',
          recruiterName: 'John Smith',
          recruiterEmail: 'john.smith@techcorp.com',
          applicationSteps: [
            { step: 'Applied', completed: true, date: '2024-01-15' },
            { step: 'Resume Reviewed', completed: true, date: '2024-01-16' },
            { step: 'Phone Screening', completed: true, date: '2024-01-18' },
            { step: 'Technical Interview', completed: false, date: null },
            { step: 'Final Interview', completed: false, date: null },
            { step: 'Offer', completed: false, date: null },
          ],
        },
        {
          id: '2',
          jobTitle: 'Product Manager',
          company: 'FinTech Innovations',
          location: 'Bangalore, India',
          appliedAt: '2024-01-10T14:20:00Z',
          status: 'accepted',
          progress: 100,
          salary: '₹1500000-₹2000000 LPA',
          jobType: 'Full-time',
          description: 'Join our product team to drive innovation in financial technology...',
          recruiterName: 'Sarah Johnson',
          recruiterEmail: 'sarah.j@fintech.com',
          applicationSteps: [
            { step: 'Applied', completed: true, date: '2024-01-10' },
            { step: 'Resume Reviewed', completed: true, date: '2024-01-11' },
            { step: 'Phone Screening', completed: true, date: '2024-01-12' },
            { step: 'Technical Interview', completed: true, date: '2024-01-15' },
            { step: 'Final Interview', completed: true, date: '2024-01-17' },
            { step: 'Offer', completed: true, date: '2024-01-20' },
          ],
        },
        {
          id: '3',
          jobTitle: 'Data Scientist',
          company: 'Analytics Pro',
          location: 'Delhi, India',
          appliedAt: '2024-01-08T09:15:00Z',
          status: 'rejected',
          progress: 40,
          salary: '₹1000000-₹1400000 LPA',
          jobType: 'Full-time',
          description: 'We are seeking a talented Data Scientist to analyze complex datasets...',
          recruiterName: 'Mike Chen',
          recruiterEmail: 'mike.chen@analyticspro.com',
          applicationSteps: [
            { step: 'Applied', completed: true, date: '2024-01-08' },
            { step: 'Resume Reviewed', completed: true, date: '2024-01-09' },
            { step: 'Phone Screening', completed: true, date: '2024-01-11' },
            { step: 'Technical Interview', completed: false, date: null },
            { step: 'Final Interview', completed: false, date: null },
            { step: 'Offer', completed: false, date: null },
          ],
        },
      ];
      
      setApplications(mockApplications);
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
  };

  const handleMenuClick = (event, application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loading Applications...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        My Applications
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track your job applications and their progress
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {applications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {applications.filter(app => app.status === 'under_review').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {applications.filter(app => app.status === 'accepted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accepted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {applications.filter(app => app.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Details</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {application.jobTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {application.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {application.jobType}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {application.company.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {application.company}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(application.appliedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={application.progress}
                          sx={{ width: 80, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {application.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, application)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleViewDetails(selectedApplication);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 1 }} />
          Download Application
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Delete sx={{ mr: 1 }} />
          Withdraw Application
        </MenuItem>
      </Menu>

      {/* Application Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Application Details
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Job Information
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedApplication.jobTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedApplication.company}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedApplication.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Salary:</strong> {selectedApplication.salary}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {selectedApplication.location}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedApplication.jobType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Application Progress
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedApplication.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedApplication.progress}% Complete
                    </Typography>
                  </Box>
                  <Box>
                    {selectedApplication.applicationSteps.map((step, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                          opacity: step.completed ? 1 : 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: step.completed ? 'success.main' : 'grey.300',
                            mr: 2,
                          }}
                        />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {step.step}
                        </Typography>
                        {step.date && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(step.date)}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationsTab;
