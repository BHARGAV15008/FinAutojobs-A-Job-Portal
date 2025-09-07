import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Avatar, Stack, Divider, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction,
  IconButton, Tooltip, Badge, Calendar, Paper
} from '@mui/material';
import {
  Search, VideoCall, Phone, LocationOn, Schedule, Person,
  Business, CalendarToday, AccessTime, Add, Edit, Delete,
  Notifications, CheckCircle, Cancel, Info, Warning
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicantInterviewsTab = ({ user }) => {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Mock interviews data
  const mockInterviews = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Solutions",
      companyLogo: "/api/placeholder/40/40",
      interviewDate: "2024-01-22T10:00:00",
      duration: 60,
      type: "video",
      status: "scheduled",
      interviewer: {
        name: "Sarah Johnson",
        title: "Engineering Manager",
        email: "sarah.johnson@techcorp.com",
        phone: "+1 (555) 123-4567"
      },
      location: "Zoom Meeting",
      meetingLink: "https://zoom.us/j/123456789",
      notes: "Technical interview focusing on React and system design",
      preparation: [
        "Review React hooks and state management",
        "Prepare system design examples",
        "Research company recent projects"
      ],
      round: 1,
      totalRounds: 3
    },
    {
      id: 2,
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      companyLogo: "/api/placeholder/40/40",
      interviewDate: "2024-01-25T14:30:00",
      duration: 45,
      type: "phone",
      status: "scheduled",
      interviewer: {
        name: "Mike Chen",
        title: "CTO",
        email: "mike.chen@startupxyz.com",
        phone: "+1 (555) 987-6543"
      },
      location: "Phone Interview",
      notes: "Initial screening call",
      preparation: [
        "Review resume and experience",
        "Prepare questions about the role",
        "Research startup background"
      ],
      round: 1,
      totalRounds: 2
    },
    {
      id: 3,
      jobTitle: "React Developer",
      company: "Digital Agency Pro",
      companyLogo: "/api/placeholder/40/40",
      interviewDate: "2024-01-20T09:00:00",
      duration: 90,
      type: "in-person",
      status: "completed",
      interviewer: {
        name: "Lisa Wang",
        title: "Lead Developer",
        email: "lisa.wang@digitalagency.com"
      },
      location: "123 Tech Street, San Francisco, CA",
      notes: "Completed technical interview - went well",
      feedback: "Strong technical skills, good cultural fit",
      round: 2,
      totalRounds: 2
    },
    {
      id: 4,
      jobTitle: "UI/UX Developer",
      company: "Design Studios Inc",
      companyLogo: "/api/placeholder/40/40",
      interviewDate: "2024-01-18T11:00:00",
      duration: 60,
      type: "video",
      status: "cancelled",
      interviewer: {
        name: "John Smith",
        title: "Design Director",
        email: "john.smith@designstudios.com"
      },
      location: "Google Meet",
      notes: "Interview cancelled due to scheduling conflict",
      round: 1,
      totalRounds: 3
    }
  ];

  useEffect(() => {
    setInterviews(mockInterviews);
    setFilteredInterviews(mockInterviews);
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [searchTerm, statusFilter, interviews]);

  const filterInterviews = () => {
    let filtered = [...interviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview =>
        interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.interviewer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));

    setFilteredInterviews(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'rescheduled': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <VideoCall />;
      case 'phone': return <Phone />;
      case 'in-person': return <LocationOn />;
      default: return <Schedule />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'rescheduled': return <Warning />;
      default: return <Info />;
    }
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  const isToday = (date) => {
    const today = new Date();
    const interviewDate = new Date(date);
    return today.toDateString() === interviewDate.toDateString();
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setDetailDialogOpen(true);
  };

  const upcomingInterviews = filteredInterviews.filter(i => isUpcoming(i.interviewDate) && i.status === 'scheduled');
  const todayInterviews = filteredInterviews.filter(i => isToday(i.interviewDate) && i.status === 'scheduled');

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
            My Interviews
          </Typography>
          <Button variant="contained" startIcon={<Add />}>
            Schedule Interview
          </Button>
        </Box>

        {/* Today's Interviews Alert */}
        {todayInterviews.length > 0 && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            icon={<CalendarToday />}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              You have {todayInterviews.length} interview{todayInterviews.length > 1 ? 's' : ''} today!
            </Typography>
            {todayInterviews.map(interview => (
              <Typography key={interview.id} variant="body2">
                • {interview.jobTitle} at {interview.company} - {formatDateTime(interview.interviewDate).time}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Badge badgeContent={upcomingInterviews.length} color="primary">
                  <Schedule fontSize="large" color="primary" />
                </Badge>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  Upcoming
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheduled interviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Badge badgeContent={interviews.filter(i => i.status === 'completed').length} color="success">
                  <CheckCircle fontSize="large" color="success" />
                </Badge>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  Completed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Finished interviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Badge badgeContent={todayInterviews.length} color="warning">
                  <CalendarToday fontSize="large" color="warning" />
                </Badge>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  Today
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interviews today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Badge badgeContent={interviews.filter(i => i.type === 'video').length} color="info">
                  <VideoCall fontSize="large" color="info" />
                </Badge>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  Virtual
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Online interviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search interviews..."
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
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="rescheduled">Rescheduled</MenuItem>
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

        {/* Interviews List */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredInterviews.map((interview) => (
              <Grid item xs={12} key={interview.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    sx={{ 
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      },
                      transition: 'all 0.3s ease',
                      border: isToday(interview.interviewDate) ? '2px solid #ff9800' : 'none'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar src={interview.companyLogo}>
                              {interview.company[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {interview.jobTitle}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {interview.company}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={1} ml="auto">
                              <Chip
                                icon={getStatusIcon(interview.status)}
                                label={interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                color={getStatusColor(interview.status)}
                                size="small"
                              />
                              {isToday(interview.interviewDate) && (
                                <Chip
                                  label="Today"
                                  color="warning"
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CalendarToday fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {formatDateTime(interview.interviewDate).date}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {formatDateTime(interview.interviewDate).time} ({interview.duration} min)
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {getTypeIcon(interview.type)}
                                <Typography variant="body2">
                                  {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Person fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {interview.interviewer.name}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {interview.notes && (
                            <Box mt={2}>
                              <Typography variant="body2" color="text.secondary">
                                {interview.notes}
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Round {interview.round} of {interview.totalRounds}
                            </Typography>
                            
                            {interview.status === 'scheduled' && isUpcoming(interview.interviewDate) && (
                              <Stack spacing={1}>
                                {interview.meetingLink && (
                                  <Button
                                    variant="contained"
                                    startIcon={<VideoCall />}
                                    href={interview.meetingLink}
                                    target="_blank"
                                    size="small"
                                  >
                                    Join Meeting
                                  </Button>
                                )}
                                <Button
                                  variant="outlined"
                                  startIcon={<Notifications />}
                                  size="small"
                                >
                                  Set Reminder
                                </Button>
                              </Stack>
                            )}

                            <Box display="flex" gap={1}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(interview)}
                                >
                                  <Info />
                                </IconButton>
                              </Tooltip>
                              {interview.status === 'scheduled' && (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton size="small">
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancel">
                                    <IconButton size="small" color="error">
                                      <Cancel />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {filteredInterviews.length === 0 && (
          <Box textAlign="center" py={6}>
            <Alert severity="info">
              <Typography variant="h6" gutterBottom>
                No interviews found
              </Typography>
              <Typography>
                {searchTerm || statusFilter
                  ? "Try adjusting your search criteria"
                  : "You don't have any interviews scheduled yet"
                }
              </Typography>
            </Alert>
          </Box>
        )}
      </motion.div>

      {/* Interview Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedInterview && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedInterview.companyLogo}>
                  {selectedInterview.company[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedInterview.jobTitle}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedInterview.company}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Interview Details
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(selectedInterview.interviewDate).date} at {formatDateTime(selectedInterview.interviewDate).time}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {selectedInterview.duration} minutes
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedInterview.type.charAt(0).toUpperCase() + selectedInterview.type.slice(1)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {selectedInterview.location}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Round
                      </Typography>
                      <Typography variant="body1">
                        {selectedInterview.round} of {selectedInterview.totalRounds}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Interviewer
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedInterview.interviewer.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Title
                      </Typography>
                      <Typography variant="body1">
                        {selectedInterview.interviewer.title}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedInterview.interviewer.email}
                      </Typography>
                    </Box>
                    {selectedInterview.interviewer.phone && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {selectedInterview.interviewer.phone}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                {selectedInterview.preparation && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Preparation Notes
                    </Typography>
                    <List dense>
                      {selectedInterview.preparation.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                {selectedInterview.feedback && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Feedback
                    </Typography>
                    <Typography variant="body1">
                      {selectedInterview.feedback}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              {selectedInterview.status === 'scheduled' && selectedInterview.meetingLink && (
                <Button
                  variant="contained"
                  startIcon={<VideoCall />}
                  href={selectedInterview.meetingLink}
                  target="_blank"
                >
                  Join Meeting
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ApplicantInterviewsTab;
