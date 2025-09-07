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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  Tabs,
  Tab,
  Divider,
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
  MoreVert,
  Event,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const RecruiterInterviewsTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sampleInterviews = [
    {
      id: 1,
      candidateName: 'John Smith',
      candidateEmail: 'john.smith@email.com',
      jobTitle: 'Senior Frontend Developer',
      scheduledAt: '2024-01-25T14:00:00',
      duration: 60,
      type: 'video',
      status: 'scheduled',
      interviewer: 'Sarah Johnson',
      interviewerRole: 'Senior Engineering Manager',
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      location: null,
      round: 'Technical Round',
      description: 'Technical discussion about React, JavaScript, and system design',
      notes: 'Candidate has strong background in React and TypeScript',
      candidateAvatar: null
    },
    {
      id: 2,
      candidateName: 'Mike Chen',
      candidateEmail: 'mike.chen@email.com',
      jobTitle: 'Full Stack Engineer',
      scheduledAt: '2024-01-26T10:30:00',
      duration: 45,
      type: 'phone',
      status: 'scheduled',
      interviewer: 'David Wilson',
      interviewerRole: 'CTO',
      meetingLink: null,
      location: null,
      round: 'Final Round',
      description: 'Final interview with leadership team',
      notes: 'Excellent technical skills, good cultural fit',
      candidateAvatar: null
    },
    {
      id: 3,
      candidateName: 'Sarah Johnson',
      candidateEmail: 'sarah.johnson@email.com',
      jobTitle: 'UI/UX Designer',
      scheduledAt: '2024-01-22T15:00:00',
      duration: 45,
      type: 'video',
      status: 'completed',
      interviewer: 'Lisa Brown',
      interviewerRole: 'Design Lead',
      meetingLink: 'https://meet.google.com/def-ghi-jkl',
      location: null,
      round: 'Portfolio Review',
      description: 'Review of design portfolio and creative process',
      notes: 'Outstanding portfolio, creative thinking',
      feedback: 'Excellent design skills and user-centered approach',
      rating: 5,
      candidateAvatar: null
    }
  ];

  const tabLabels = ['All Interviews', 'Scheduled', 'Completed', 'Cancelled'];

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

  const filteredInterviews = interviews.filter(interview => {
    const matchesTab = activeTab === 0 || 
                      (activeTab === 1 && interview.status === 'scheduled') ||
                      (activeTab === 2 && interview.status === 'completed') ||
                      (activeTab === 3 && interview.status === 'cancelled');
    return matchesTab;
  });

  const handleInterviewAction = (action, interview) => {
    switch (action) {
      case 'edit':
        setSelectedInterview(interview);
        setShowInterviewDialog(true);
        break;
      case 'cancel':
        setInterviews(prev => prev.map(i => i.id === interview.id ? { ...i, status: 'cancelled' } : i));
        setSnackbar({ open: true, message: 'Interview cancelled', severity: 'info' });
        break;
      case 'complete':
        setInterviews(prev => prev.map(i => i.id === interview.id ? { ...i, status: 'completed' } : i));
        setSnackbar({ open: true, message: 'Interview marked as completed', severity: 'success' });
        break;
      case 'reschedule':
        setSelectedInterview(interview);
        setShowInterviewDialog(true);
        break;
      default:
        break;
    }
    setAnchorEl(null);
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
                  src={interview.candidateAvatar}
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {interview.candidateName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {interview.candidateName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {interview.jobTitle} • {interview.round}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  icon={statusConfig.icon}
                  size="small"
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                    setSelectedInterview(interview);
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              {interview.meetingLink && interview.status === 'scheduled' && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<VideoCall />}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(interview.meetingLink, '_blank');
                  }}
                >
                  Join Meeting
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInterview(interview);
                }}
              >
                View Details
              </Button>
            </Box>
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
            Interview Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Schedule and manage candidate interviews
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadInterviews}
            size={isMobile ? 'small' : 'medium'}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedInterview(null);
              setShowInterviewDialog(true);
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Schedule Interview
          </Button>
        </Box>
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
                Today
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

      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No interviews found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Schedule interviews with your candidates
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedInterview(null);
              setShowInterviewDialog(true);
            }}
          >
            Schedule Interview
          </Button>
        </Paper>
      ) : (
        <Box>
          {filteredInterviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </Box>
      )}

      {/* Interview Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleInterviewAction('edit', selectedInterview)}>
          <Edit sx={{ mr: 1 }} /> Edit Interview
        </MenuItem>
        <MenuItem onClick={() => handleInterviewAction('reschedule', selectedInterview)}>
          <Event sx={{ mr: 1 }} /> Reschedule
        </MenuItem>
        <Divider />
        {selectedInterview?.status === 'scheduled' && (
          <MenuItem onClick={() => handleInterviewAction('complete', selectedInterview)}>
            <CheckCircle sx={{ mr: 1 }} /> Mark Complete
          </MenuItem>
        )}
        <MenuItem onClick={() => handleInterviewAction('cancel', selectedInterview)} sx={{ color: 'error.main' }}>
          <Cancel sx={{ mr: 1 }} /> Cancel Interview
        </MenuItem>
      </Menu>

      {/* Schedule Interview Dialog */}
      <Dialog
        open={showInterviewDialog}
        onClose={() => setShowInterviewDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedInterview ? 'Edit Interview' : 'Schedule New Interview'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Candidate Name"
                defaultValue={selectedInterview?.candidateName || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Position"
                defaultValue={selectedInterview?.jobTitle || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interview Date"
                type="date"
                defaultValue={selectedInterview?.scheduledAt?.split('T')[0] || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interview Time"
                type="time"
                defaultValue={selectedInterview?.scheduledAt?.split('T')[1]?.substring(0, 5) || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Interview Type</InputLabel>
                <Select
                  defaultValue={selectedInterview?.type || 'video'}
                  label="Interview Type"
                >
                  <MenuItem value="video">Video Call</MenuItem>
                  <MenuItem value="phone">Phone Call</MenuItem>
                  <MenuItem value="in-person">In-Person</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                defaultValue={selectedInterview?.duration || 60}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Link"
                defaultValue={selectedInterview?.meetingLink || ''}
                placeholder="https://meet.google.com/..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Interview Description"
                defaultValue={selectedInterview?.description || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInterviewDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            {selectedInterview ? 'Update Interview' : 'Schedule Interview'}
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

export default RecruiterInterviewsTab;
