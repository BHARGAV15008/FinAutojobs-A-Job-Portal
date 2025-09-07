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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Alert,
  Tooltip,
  Badge,
  Divider,
  Calendar,
} from '@mui/material';
import {
  Schedule,
  VideoCall,
  Phone,
  LocationOn,
  Person,
  Business,
  CalendarToday,
  AccessTime,
  CheckCircle,
  Cancel,
  Pending,
  Edit,
  Delete,
  Add,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ApplicantInterviewsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const sampleInterviews = [
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp India',
      companyLogo: null,
      scheduledAt: '2024-01-25T14:00:00',
      duration: 60,
      type: 'video',
      status: 'scheduled',
      interviewer: 'John Smith',
      interviewerRole: 'Senior Engineering Manager',
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      location: null,
      round: 'Technical Round',
      description: 'Technical discussion about React, JavaScript, and system design',
      preparationNotes: 'Review React hooks, state management, and be ready for coding questions',
      applicationId: 1
    },
    {
      id: 2,
      jobTitle: 'Full Stack Developer',
      company: 'StartupXYZ',
      companyLogo: null,
      scheduledAt: '2024-01-22T10:30:00',
      duration: 45,
      type: 'phone',
      status: 'completed',
      interviewer: 'Sarah Johnson',
      interviewerRole: 'CTO',
      meetingLink: null,
      location: null,
      round: 'HR Round',
      description: 'Initial screening and cultural fit assessment',
      feedback: 'Great communication skills and enthusiasm for the role',
      rating: 4,
      applicationId: 2
    }
  ];

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInterviews(sampleInterviews);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { color: 'primary', icon: <Schedule />, label: 'Scheduled' },
      completed: { color: 'success', icon: <CheckCircle />, label: 'Completed' },
      cancelled: { color: 'error', icon: <Cancel />, label: 'Cancelled' },
      rescheduled: { color: 'warning', icon: <Pending />, label: 'Rescheduled' }
    };
    return configs[status] || configs.scheduled;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <VideoCall />;
      case 'phone': return <Phone />;
      case 'in-person': return <LocationOn />;
      default: return <Schedule />;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const InterviewCard = ({ interview }) => {
    const statusConfig = getStatusConfig(interview.status);
    const { date, time } = formatDateTime(interview.scheduledAt);
    const isUpcoming = new Date(interview.scheduledAt) > new Date();

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            mb: 2,
            cursor: 'pointer',
            border: isUpcoming && interview.status === 'scheduled' ? '2px solid' : '1px solid',
            borderColor: isUpcoming && interview.status === 'scheduled' ? 'primary.main' : 'divider',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          }}
          onClick={() => setSelectedInterview(interview)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={interview.companyLogo}
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {interview.company[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {interview.jobTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {interview.company} • {interview.round}
                  </Typography>
                </Box>
              </Box>
              
              <Chip
                label={statusConfig.label}
                color={statusConfig.color}
                icon={statusConfig.icon}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                icon={<CalendarToday />}
                label={date}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<AccessTime />}
                label={`${time} (${interview.duration} min)`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={getTypeIcon(interview.type)}
                label={interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <Person sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Interviewer: {interview.interviewer} ({interview.interviewerRole})
            </Typography>

            {interview.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {interview.description}
              </Typography>
            )}

            {isUpcoming && interview.status === 'scheduled' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Interview in {Math.ceil((new Date(interview.scheduledAt) - new Date()) / (1000 * 60 * 60 * 24))} days
                </Typography>
              </Alert>
            )}

            {interview.feedback && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Feedback:</strong> {interview.feedback}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((item) => (
          <Card key={item} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: 'grey.300', borderRadius: '50%' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ height: 20, bgcolor: 'grey.300', mb: 1, borderRadius: 1 }} />
                  <Box sx={{ height: 16, bgcolor: 'grey.200', width: '60%', borderRadius: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            My Interviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your scheduled interviews and track your progress
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadInterviews}
          size={isMobile ? 'small' : 'medium'}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {interviews.filter(i => i.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {interviews.filter(i => i.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {interviews.filter(i => new Date(i.scheduledAt) > new Date()).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {Math.round(interviews.filter(i => i.rating).reduce((sum, i) => sum + i.rating, 0) / interviews.filter(i => i.rating).length * 10) / 10 || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No interviews scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your scheduled interviews will appear here
          </Typography>
        </Paper>
      ) : (
        <Box>
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </Box>
      )}

      {/* Interview Detail Dialog */}
      <Dialog
        open={!!selectedInterview}
        onClose={() => setSelectedInterview(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedInterview && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedInterview.companyLogo}
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {selectedInterview.company[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedInterview.jobTitle}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedInterview.company} • {selectedInterview.round}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Interview Details
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Date & Time"
                        secondary={`${formatDateTime(selectedInterview.scheduledAt).date} at ${formatDateTime(selectedInterview.scheduledAt).time}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Duration"
                        secondary={`${selectedInterview.duration} minutes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Type"
                        secondary={selectedInterview.type.charAt(0).toUpperCase() + selectedInterview.type.slice(1)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={getStatusConfig(selectedInterview.status).label}
                            color={getStatusConfig(selectedInterview.status).color}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>

                  {selectedInterview.meetingLink && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<VideoCall />}
                        onClick={() => window.open(selectedInterview.meetingLink, '_blank')}
                        fullWidth
                      >
                        Join Meeting
                      </Button>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Interviewer
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {selectedInterview.interviewer[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedInterview.interviewer}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInterview.interviewerRole}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedInterview.description && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedInterview.description}
                      </Typography>
                    </Box>
                  )}

                  {selectedInterview.preparationNotes && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Preparation Notes
                      </Typography>
                      <Alert severity="info">
                        <Typography variant="body2">
                          {selectedInterview.preparationNotes}
                        </Typography>
                      </Alert>
                    </Box>
                  )}

                  {selectedInterview.feedback && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Feedback
                      </Typography>
                      <Alert severity="success">
                        <Typography variant="body2">
                          {selectedInterview.feedback}
                        </Typography>
                        {selectedInterview.rating && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Rating:</strong> {selectedInterview.rating}/5
                          </Typography>
                        )}
                      </Alert>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setSelectedInterview(null)}>
                Close
              </Button>
              {selectedInterview.status === 'scheduled' && (
                <Button variant="contained">
                  Reschedule
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
