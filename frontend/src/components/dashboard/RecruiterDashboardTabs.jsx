import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  IconButton, Tooltip, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Work, People, Add, Edit, Delete, Visibility, CheckCircle, Cancel,
  Pending, Schedule, Email, Phone, LinkedIn, Business, LocationOn,
  AttachMoney, BarChart, PieChart, ShowChart, Timeline, Assessment,
  Notifications, PostAdd, ManageAccounts, RateReview, Analytics
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

// Recruiter Profile Tab
export const RecruiterProfileTab = ({ data, onEdit }) => {
  const user = data?.user || {};
  const company = data?.company || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Recruiter Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Personal Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{user.fullName || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{user.email || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{user.phone || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{user.location || 'Not provided'}</Typography>
                </Box>
              </Stack>
              <Button variant="contained" startIcon={<Edit />} onClick={onEdit} sx={{ mt: 3 }}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Company Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Company Name</Typography>
                  <Typography variant="body1">{user.companyName || company?.name || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Position</Typography>
                  <Typography variant="body1">{user.position || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">LinkedIn</Typography>
                  <Typography variant="body1">{user.linkedinUrl || 'Not provided'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Post Job Tab
export const PostJobTab = ({ onCreateJob }) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Post New Job
      </Typography>

      <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
        <PostAdd sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Create a New Job Posting
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Attract the best candidates by posting detailed job descriptions with all required information.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={onCreateJob}
        >
          Post New Job
        </Button>
      </Card>
    </Box>
  );
};

// Alerts Tab
export const AlertsTab = ({ data }) => {
  const pendingApplications = data?.recentApplications?.filter(app => app.status === 'pending') || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Alerts & Notifications
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                New Applications
              </Typography>
              {pendingApplications.length === 0 ? (
                <Alert severity="info">No new applications to review</Alert>
              ) : (
                <List>
                  {pendingApplications.map((application, index) => (
                    <React.Fragment key={application.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <Notifications />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`New application from ${application.applicantName}`}
                          secondary={`Applied for ${application.jobTitle} • ${format(parseISO(application.appliedAt), 'MMM dd, yyyy')}`}
                        />
                        <Chip label="New" color="warning" size="small" />
                      </ListItem>
                      {index < pendingApplications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Alert Summary
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">New Applications</Typography>
                  <Chip label={pendingApplications.length} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Interviews Today</Typography>
                  <Chip label="0" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Expiring Jobs</Typography>
                  <Chip label="0" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Edit Posts Tab
export const EditPostsTab = ({ data }) => {
  const activeJobs = data?.activeJobs || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Manage Job Posts
      </Typography>

      {activeJobs.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No active job posts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first job posting to start attracting candidates.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {activeJobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {job.title}
                    </Typography>
                    <Chip
                      label={job.status}
                      color={job.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {job.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {job.applicationsCount || 0} applications
                    </Typography>
                  </Box>

                  <Chip label={job.jobType} size="small" variant="outlined" />
                </CardContent>
                
                <CardActions>
                  <Button size="small" startIcon={<Edit />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<Visibility />}>
                    View
                  </Button>
                  <Button size="small" startIcon={<Delete />} color="error">
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Manage Applicants Tab
export const ManageApplicantsTab = ({ data, onUpdateStatus }) => {
  const [filter, setFilter] = useState('all');
  const applications = data?.recentApplications || [];

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hired', label: 'Hired' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      case 'hired': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Manage Applicants
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter by Status"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>{application.applicantName?.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {application.applicantName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.applicantEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{application.jobTitle}</TableCell>
                  <TableCell>{format(parseISO(application.appliedAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Chip
                      label={application.status}
                      color={getStatusColor(application.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Resume">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Shortlist">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onUpdateStatus(application.id, 'shortlisted')}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onUpdateStatus(application.id, 'rejected')}
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

// Review Applications Tab
export const ReviewApplicationsTab = ({ data, onUpdateStatus }) => {
  const pendingApplications = data?.recentApplications?.filter(app => app.status === 'pending') || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Review Applications
      </Typography>

      {pendingApplications.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <RateReview sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications to review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All applications have been reviewed. New applications will appear here.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {pendingApplications.map((application) => (
            <Grid item xs={12} key={application.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 56, height: 56 }}>
                          {application.applicantName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {application.applicantName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Applied for {application.jobTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {format(parseISO(application.appliedAt), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Stack spacing={2}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => onUpdateStatus(application.id, 'shortlisted')}
                          fullWidth
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => onUpdateStatus(application.id, 'reviewed')}
                          fullWidth
                        >
                          Mark as Reviewed
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => onUpdateStatus(application.id, 'rejected')}
                          fullWidth
                        >
                          Reject
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Company Analytics Tab
export const CompanyAnalyticsTab = ({ data }) => {
  const stats = data?.stats || {};
  const analytics = data?.analytics || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Company Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Analytics dashboard coming soon
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Jobs Posted</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.jobs?.total || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Applications</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.applications?.total || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Hired Candidates</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.applications?.hired || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.applications?.total > 0 
                      ? Math.round((stats.applications?.hired || 0) / stats.applications.total * 100)
                      : 0}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default {
  RecruiterProfileTab,
  PostJobTab,
  AlertsTab,
  EditPostsTab,
  ManageApplicantsTab,
  ReviewApplicationsTab,
  CompanyAnalyticsTab
};
