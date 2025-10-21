import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Send,
  Visibility,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  Work,
  Business,
  LocationOn,
  CalendarToday,
  MoreVert,
  FilterList,
  Search,
  Download,
  Refresh,
  TrendingUp,
  Assessment,
  Message,
  Phone,
  VideoCall,
  AttachFile,
  Star,
  StarBorder
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const ApplicationTrackingSystem = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Mock application data
  const mockApplications = [
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'Google India',
      companyLogo: 'G',
      location: 'Bangalore',
      appliedDate: '2024-10-15',
      status: 'interview_scheduled',
      stage: 'Technical Interview',
      progress: 75,
      salary: '₹25-35L',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      applicationMethod: 'quick_apply',
      timeline: [
        { date: '2024-10-15', status: 'applied', title: 'Application Submitted', description: 'Your application was successfully submitted' },
        { date: '2024-10-17', status: 'reviewed', title: 'Application Reviewed', description: 'HR team reviewed your profile' },
        { date: '2024-10-19', status: 'shortlisted', title: 'Shortlisted', description: 'You have been shortlisted for the next round' },
        { date: '2024-10-22', status: 'interview_scheduled', title: 'Interview Scheduled', description: 'Technical interview scheduled for Oct 25, 2024 at 2:00 PM' }
      ],
      nextAction: 'Prepare for technical interview',
      interviewDetails: {
        date: '2024-10-25',
        time: '2:00 PM',
        type: 'Technical Interview',
        interviewer: 'Rajesh Kumar',
        duration: '60 minutes',
        mode: 'Video Call'
      },
      recruiterContact: {
        name: 'Priya Sharma',
        email: 'priya.sharma@google.com',
        phone: '+91-9876543210'
      }
    },
    {
      id: 2,
      jobTitle: 'Product Manager',
      company: 'Microsoft',
      companyLogo: 'M',
      location: 'Hyderabad',
      appliedDate: '2024-10-10',
      status: 'offer_received',
      stage: 'Offer Negotiation',
      progress: 95,
      salary: '₹30-45L',
      jobType: 'Full-time',
      workMode: 'Remote',
      applicationMethod: 'custom_apply',
      timeline: [
        { date: '2024-10-10', status: 'applied', title: 'Application Submitted' },
        { date: '2024-10-12', status: 'reviewed', title: 'Application Reviewed' },
        { date: '2024-10-14', status: 'interview_completed', title: 'First Round Completed' },
        { date: '2024-10-18', status: 'interview_completed', title: 'Final Round Completed' },
        { date: '2024-10-20', status: 'offer_received', title: 'Offer Received', description: 'Congratulations! You received a job offer' }
      ],
      nextAction: 'Review and respond to offer',
      offerDetails: {
        salary: '₹42L',
        joiningDate: '2024-11-15',
        benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours'],
        deadline: '2024-10-30'
      }
    },
    {
      id: 3,
      jobTitle: 'Data Scientist',
      company: 'Amazon',
      companyLogo: 'A',
      location: 'Mumbai',
      appliedDate: '2024-10-08',
      status: 'rejected',
      stage: 'Application Review',
      progress: 25,
      salary: '₹20-30L',
      jobType: 'Full-time',
      workMode: 'On-site',
      applicationMethod: 'review_apply',
      timeline: [
        { date: '2024-10-08', status: 'applied', title: 'Application Submitted' },
        { date: '2024-10-12', status: 'reviewed', title: 'Application Reviewed' },
        { date: '2024-10-16', status: 'rejected', title: 'Application Not Selected', description: 'Thank you for your interest. We have decided to move forward with other candidates.' }
      ],
      nextAction: 'Apply to similar positions',
      feedback: 'Strong technical skills but looking for more experience in machine learning'
    },
    {
      id: 4,
      jobTitle: 'UX Designer',
      company: 'Flipkart',
      companyLogo: 'F',
      location: 'Bangalore',
      appliedDate: '2024-10-20',
      status: 'applied',
      stage: 'Application Submitted',
      progress: 10,
      salary: '₹15-25L',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      applicationMethod: 'quick_apply',
      timeline: [
        { date: '2024-10-20', status: 'applied', title: 'Application Submitted', description: 'Your application is under review' }
      ],
      nextAction: 'Wait for response from HR'
    }
  ];

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found');
          setApplications([]);
          return;
        }

        const response = await fetch('/api/applications/my-applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.applications) {
            setApplications(data.applications);
          } else {
            console.warn('No applications found');
            setApplications([]);
          }
        } else {
          console.error('Failed to fetch applications:', response.status);
          setApplications([]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      applied: 'info',
      reviewed: 'warning',
      shortlisted: 'primary',
      interview_scheduled: 'secondary',
      interview_completed: 'success',
      offer_received: 'success',
      rejected: 'error',
      withdrawn: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      applied: <Send />,
      reviewed: <Visibility />,
      shortlisted: <Star />,
      interview_scheduled: <Schedule />,
      interview_completed: <CheckCircle />,
      offer_received: <CheckCircle />,
      rejected: <Cancel />,
      withdrawn: <Cancel />
    };
    return icons[status] || <Pending />;
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const ApplicationCard = ({ application }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            onClick={() => {
              setSelectedApplication(application);
              setShowDetails(true);
            }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                {application.companyLogo}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {application.jobTitle}
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  {application.company}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <LocationOn sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {application.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {application.workMode}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Chip 
                label={application.stage}
                color={getStatusColor(application.status)}
                icon={getStatusIcon(application.status)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" display="block" color="text.secondary">
                Applied: {application.appliedDate}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2">{application.progress}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={application.progress} 
              sx={{ height: 6, borderRadius: 3 }}
              color={getStatusColor(application.status)}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={application.salary} size="small" variant="outlined" />
              <Chip label={application.jobType} size="small" variant="outlined" />
            </Box>
            <Typography variant="body2" color="primary" fontWeight="medium">
              {application.nextAction}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ApplicationDetailsDialog = () => (
    <Dialog 
      open={showDetails} 
      onClose={() => setShowDetails(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Application Details</Typography>
          <IconButton onClick={() => setShowDetails(false)}>
            <Cancel />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedApplication && (
          <Grid container spacing={3}>
            {/* Job Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Job Information</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {selectedApplication.companyLogo}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedApplication.jobTitle}</Typography>
                      <Typography variant="subtitle1" color="primary">
                        {selectedApplication.company}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip icon={<LocationOn />} label={selectedApplication.location} size="small" />
                    <Chip icon={<Work />} label={selectedApplication.jobType} size="small" />
                    <Chip label={selectedApplication.workMode} size="small" />
                  </Box>
                  <Typography variant="h6" color="primary">
                    {selectedApplication.salary}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Application Status */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Application Status</Typography>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Chip 
                      label={selectedApplication.stage}
                      color={getStatusColor(selectedApplication.status)}
                      icon={getStatusIcon(selectedApplication.status)}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {selectedApplication.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedApplication.progress} 
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Applied on {selectedApplication.appliedDate}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    Next: {selectedApplication.nextAction}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Timeline */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Application Timeline</Typography>
                  <Box sx={{ pl: 2 }}>
                    {selectedApplication.timeline.map((event, index) => (
                      <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                        <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: `${getStatusColor(event.status)}.main`,
                              width: 32, 
                              height: 32 
                            }}
                          >
                            {getStatusIcon(event.status)}
                          </Avatar>
                          {index < selectedApplication.timeline.length - 1 && (
                            <Box sx={{ 
                              width: 2, 
                              height: 40, 
                              bgcolor: 'grey.300', 
                              mt: 1 
                            }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.date}
                          </Typography>
                          {event.description && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {event.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Interview Details */}
            {selectedApplication.interviewDetails && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Interview Details</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday />
                      <Typography>{selectedApplication.interviewDetails.date} at {selectedApplication.interviewDetails.time}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <VideoCall />
                      <Typography>{selectedApplication.interviewDetails.mode}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Interviewer: {selectedApplication.interviewDetails.interviewer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {selectedApplication.interviewDetails.duration}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Offer Details */}
            {selectedApplication.offerDetails && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Offer Details</Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                      {selectedApplication.offerDetails.salary}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Joining Date: {selectedApplication.offerDetails.joiningDate}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Response Deadline: {selectedApplication.offerDetails.deadline}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>Benefits:</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedApplication.offerDetails.benefits.map((benefit, index) => (
                        <Chip key={index} label={benefit} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDetails(false)}>Close</Button>
        <Button variant="contained" startIcon={<Message />}>
          Contact Recruiter
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ApplicationStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => ['applied', 'reviewed'].includes(app.status)).length,
      interviews: applications.filter(app => ['interview_scheduled', 'interview_completed'].includes(app.status)).length,
      offers: applications.filter(app => app.status === 'offer_received').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="caption">Total Applications</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.pending}
              </Typography>
              <Typography variant="caption">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.interviews}
              </Typography>
              <Typography variant="caption">Interviews</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.offers}
              </Typography>
              <Typography variant="caption">Offers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {stats.rejected}
              </Typography>
              <Typography variant="caption">Rejected</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Refresh />} variant="outlined" size="small">
            Refresh
          </Button>
          <Button startIcon={<Download />} variant="outlined" size="small">
            Export
          </Button>
        </Box>
      </Box>

      <ApplicationStats />

      {/* Filters and Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="reviewed">Reviewed</MenuItem>
            <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
            <MenuItem value="offer_received">Offer Received</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Applications List */}
      <Box>
        <AnimatePresence>
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </AnimatePresence>
        
        {filteredApplications.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No applications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'Start applying to jobs to track your applications here'
                }
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <ApplicationDetailsDialog />
    </Box>
  );
};

export default ApplicationTrackingSystem;
