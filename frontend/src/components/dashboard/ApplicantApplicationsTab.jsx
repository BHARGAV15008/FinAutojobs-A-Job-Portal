import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Timeline, TimelineItem,
  TimelineSeparator, TimelineConnector, TimelineContent,
  TimelineDot, Avatar, Stack, Divider, Alert, Tabs, Tab,
  Badge, LinearProgress, Tooltip, Menu
} from '@mui/material';
import {
  Search, FilterList, Visibility, Cancel, GetApp, Schedule,
  CheckCircle, HourglassEmpty, Cancel as CancelIcon, Work,
  Business, LocationOn, AttachMoney, CalendarToday, Phone,
  Email, Description, MoreVert, Edit, Delete, Share
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicantApplicationsTab = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  // Mock applications data
  const mockApplications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Solutions",
      companyLogo: "/api/placeholder/40/40",
      appliedDate: "2024-01-15",
      status: "interview_scheduled",
      location: "San Francisco, CA",
      salary: "$90,000 - $120,000",
      jobType: "Full-time",
      applicationProgress: 75,
      timeline: [
        { status: "applied", date: "2024-01-15", description: "Application submitted" },
        { status: "reviewed", date: "2024-01-16", description: "Application under review" },
        { status: "interview_scheduled", date: "2024-01-18", description: "Interview scheduled for Jan 22" }
      ],
      interviewDate: "2024-01-22T10:00:00",
      recruiterContact: {
        name: "Sarah Johnson",
        email: "sarah.johnson@techcorp.com",
        phone: "+1 (555) 123-4567"
      },
      notes: "Great company culture, exciting projects"
    },
    {
      id: 2,
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      companyLogo: "/api/placeholder/40/40",
      appliedDate: "2024-01-14",
      status: "pending",
      location: "New York, NY",
      salary: "$80,000 - $110,000",
      jobType: "Full-time",
      applicationProgress: 25,
      timeline: [
        { status: "applied", date: "2024-01-14", description: "Application submitted" }
      ],
      notes: "Innovative startup with growth potential"
    },
    {
      id: 3,
      jobTitle: "React Developer",
      company: "Digital Agency Pro",
      companyLogo: "/api/placeholder/40/40",
      appliedDate: "2024-01-10",
      status: "rejected",
      location: "Remote",
      salary: "$60 - $80/hour",
      jobType: "Contract",
      applicationProgress: 100,
      timeline: [
        { status: "applied", date: "2024-01-10", description: "Application submitted" },
        { status: "reviewed", date: "2024-01-12", description: "Application reviewed" },
        { status: "rejected", date: "2024-01-13", description: "Position filled by another candidate" }
      ],
      rejectionReason: "Position filled by another candidate"
    },
    {
      id: 4,
      jobTitle: "UI/UX Developer",
      company: "Design Studios Inc",
      companyLogo: "/api/placeholder/40/40",
      appliedDate: "2024-01-08",
      status: "accepted",
      location: "Los Angeles, CA",
      salary: "$70,000 - $95,000",
      jobType: "Full-time",
      applicationProgress: 100,
      timeline: [
        { status: "applied", date: "2024-01-08", description: "Application submitted" },
        { status: "reviewed", date: "2024-01-09", description: "Application reviewed" },
        { status: "interview_scheduled", date: "2024-01-10", description: "Interview completed" },
        { status: "accepted", date: "2024-01-12", description: "Job offer received" }
      ],
      offerDetails: {
        startDate: "2024-02-01",
        salary: "$85,000",
        benefits: ["Health Insurance", "401k", "Flexible Hours"]
      }
    }
  ];

  useEffect(() => {
    setApplications(mockApplications);
    setFilteredApplications(mockApplications);
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications, currentTab]);

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by tab
    if (currentTab === 1) {
      filtered = filtered.filter(app => app.status === 'pending');
    } else if (currentTab === 2) {
      filtered = filtered.filter(app => app.status === 'interview_scheduled');
    } else if (currentTab === 3) {
      filtered = filtered.filter(app => app.status === 'accepted');
    } else if (currentTab === 4) {
      filtered = filtered.filter(app => app.status === 'rejected');
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'interview_scheduled': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <HourglassEmpty />;
      case 'reviewed': return <Visibility />;
      case 'interview_scheduled': return <Schedule />;
      case 'accepted': return <CheckCircle />;
      case 'rejected': return <CancelIcon />;
      default: return <Work />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'reviewed': return 'Under Review';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'accepted': return 'Offer Received';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleWithdrawApplication = (applicationId) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
  };

  const getTabCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      interviews: applications.filter(app => app.status === 'interview_scheduled').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            My Applications
          </Typography>
          <Button variant="outlined" startIcon={<GetApp />}>
            Export Applications
          </Button>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="reviewed">Under Review</MenuItem>
                    <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge badgeContent={tabCounts.all} color="primary">
                  All Applications
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.pending} color="warning">
                  Pending
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.interviews} color="primary">
                  Interviews
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.accepted} color="success">
                  Accepted
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={tabCounts.rejected} color="error">
                  Rejected
                </Badge>
              } 
            />
          </Tabs>
        </Card>

        {/* Applications Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job & Company</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Next Action</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredApplications.map((application) => (
                    <motion.tr
                      key={application.id}
                      component={TableRow}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={application.companyLogo}>
                            {application.company[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {application.jobTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.company}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="caption">
                                {application.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(application.status)}
                          label={getStatusText(application.status)}
                          color={getStatusColor(application.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={application.applicationProgress}
                            color={getStatusColor(application.status)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {application.applicationProgress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {application.status === 'interview_scheduled' && (
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              Interview
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(application.interviewDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        {application.status === 'pending' && (
                          <Typography variant="body2" color="text.secondary">
                            Awaiting review
                          </Typography>
                        )}
                        {application.status === 'accepted' && (
                          <Typography variant="body2" color="success.main">
                            Respond to offer
                          </Typography>
                        )}
                        {application.status === 'rejected' && (
                          <Typography variant="body2" color="text.secondary">
                            Application closed
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(application)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {application.status === 'pending' && (
                            <Tooltip title="Withdraw Application">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleWithdrawApplication(application.id)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>

          {filteredApplications.length === 0 && (
            <Box p={4} textAlign="center">
              <Alert severity="info">
                <Typography variant="h6" gutterBottom>
                  No applications found
                </Typography>
                <Typography>
                  {currentTab === 0 
                    ? "You haven't applied to any jobs yet. Start browsing jobs to apply!"
                    : "No applications match the current filter."
                  }
                </Typography>
              </Alert>
            </Box>
          )}
        </Card>
      </motion.div>

      {/* Application Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedApplication.companyLogo}>
                  {selectedApplication.company[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedApplication.jobTitle}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedApplication.company}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Application Timeline
                  </Typography>
                  <Timeline>
                    {selectedApplication.timeline.map((event, index) => (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot color={getStatusColor(event.status)}>
                            {getStatusIcon(event.status)}
                          </TimelineDot>
                          {index < selectedApplication.timeline.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {getStatusText(event.status)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(event.date).toLocaleDateString()}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>

                  {selectedApplication.notes && (
                    <Box mt={3}>
                      <Typography variant="h6" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {selectedApplication.notes}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body1">
                            {selectedApplication.location}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Job Type
                          </Typography>
                          <Typography variant="body1">
                            {selectedApplication.jobType}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Salary
                          </Typography>
                          <Typography variant="body1">
                            {selectedApplication.salary}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Applied Date
                          </Typography>
                          <Typography variant="body1">
                            {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  {selectedApplication.recruiterContact && (
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recruiter Contact
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            {selectedApplication.recruiterContact.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Email fontSize="small" />
                            <Typography variant="body2">
                              {selectedApplication.recruiterContact.email}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone fontSize="small" />
                            <Typography variant="body2">
                              {selectedApplication.recruiterContact.phone}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              {selectedApplication.status === 'pending' && (
                <Button
                  color="error"
                  onClick={() => handleWithdrawApplication(selectedApplication.id)}
                >
                  Withdraw Application
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Edit sx={{ mr: 1 }} />
          Edit Notes
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Share sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ApplicantApplicationsTab;
