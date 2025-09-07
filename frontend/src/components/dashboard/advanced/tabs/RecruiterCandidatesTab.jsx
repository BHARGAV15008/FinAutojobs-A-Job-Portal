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
  Pagination,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  Tabs,
  Tab,
  Divider,
  Rating,
  LinearProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  School,
  Star,
  Download,
  Schedule,
  CheckCircle,
  Cancel,
  MoreVert,
  Search,
  FilterList,
  Visibility,
  Message,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const RecruiterCandidatesTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPerPage] = useState(8);

  const sampleCandidates = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+91 9876543210',
      location: 'Mumbai, India',
      jobTitle: 'Senior Frontend Developer',
      experience: '5 years',
      currentCompany: 'TechCorp',
      education: 'B.Tech Computer Science',
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Node.js'],
      status: 'pending',
      appliedDate: '2024-01-25',
      rating: 4.5,
      resumeUrl: '/resumes/john-smith.pdf',
      avatar: null,
      notes: 'Strong technical background, good communication skills',
      salaryExpectation: '₹25 LPA',
      availability: 'Immediate'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+91 9876543211',
      location: 'Bangalore, India',
      jobTitle: 'UI/UX Designer',
      experience: '3 years',
      currentCompany: 'DesignStudio',
      education: 'B.Des Visual Communication',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Sketch'],
      status: 'reviewed',
      appliedDate: '2024-01-24',
      rating: 4.2,
      resumeUrl: '/resumes/sarah-johnson.pdf',
      avatar: null,
      notes: 'Excellent portfolio, creative thinking',
      salaryExpectation: '₹18 LPA',
      availability: '2 weeks notice'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+91 9876543212',
      location: 'Delhi, India',
      jobTitle: 'Full Stack Engineer',
      experience: '4 years',
      currentCompany: 'StartupXYZ',
      education: 'M.Tech Software Engineering',
      skills: ['Node.js', 'React', 'MongoDB', 'AWS', 'Docker'],
      status: 'interview',
      appliedDate: '2024-01-23',
      rating: 4.8,
      resumeUrl: '/resumes/mike-chen.pdf',
      avatar: null,
      notes: 'Impressive technical skills, team player',
      salaryExpectation: '₹30 LPA',
      availability: '1 month notice'
    },
    {
      id: 4,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543213',
      location: 'Pune, India',
      jobTitle: 'Senior Frontend Developer',
      experience: '6 years',
      currentCompany: 'WebTech Solutions',
      education: 'B.E. Information Technology',
      skills: ['React', 'Vue.js', 'Angular', 'JavaScript', 'Python'],
      status: 'hired',
      appliedDate: '2024-01-20',
      rating: 4.9,
      resumeUrl: '/resumes/priya-sharma.pdf',
      avatar: null,
      notes: 'Exceptional candidate, great cultural fit',
      salaryExpectation: '₹28 LPA',
      availability: 'Joined'
    }
  ];

  const tabLabels = ['All Candidates', 'Pending', 'Reviewed', 'Interview', 'Hired', 'Rejected'];

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCandidates(sampleCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'warning', label: 'Pending Review' },
      reviewed: { color: 'info', label: 'Reviewed' },
      interview: { color: 'primary', label: 'Interview Scheduled' },
      hired: { color: 'success', label: 'Hired' },
      rejected: { color: 'error', label: 'Rejected' }
    };
    return configs[status] || configs.pending;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
    const matchesJob = filterJob === 'all' || candidate.jobTitle === filterJob;
    const matchesTab = activeTab === 0 || 
                      (activeTab === 1 && candidate.status === 'pending') ||
                      (activeTab === 2 && candidate.status === 'reviewed') ||
                      (activeTab === 3 && candidate.status === 'interview') ||
                      (activeTab === 4 && candidate.status === 'hired') ||
                      (activeTab === 5 && candidate.status === 'rejected');
    
    return matchesSearch && matchesStatus && matchesJob && matchesTab;
  });

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  const handleCandidateAction = (action, candidate) => {
    switch (action) {
      case 'review':
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'reviewed' } : c));
        setSnackbar({ open: true, message: 'Candidate marked as reviewed!', severity: 'success' });
        break;
      case 'schedule-interview':
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'interview' } : c));
        setSnackbar({ open: true, message: 'Interview scheduled!', severity: 'success' });
        break;
      case 'hire':
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'hired' } : c));
        setSnackbar({ open: true, message: 'Candidate hired!', severity: 'success' });
        break;
      case 'reject':
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'rejected' } : c));
        setSnackbar({ open: true, message: 'Candidate rejected', severity: 'info' });
        break;
      case 'download-resume':
        // Simulate resume download
        setSnackbar({ open: true, message: 'Resume downloaded!', severity: 'success' });
        break;
      case 'send-message':
        setSnackbar({ open: true, message: 'Message sent to candidate!', severity: 'success' });
        break;
      default:
        break;
    }
    setAnchorEl(null);
  };

  const CandidateCard = ({ candidate }) => {
    const statusConfig = getStatusConfig(candidate.status);
    
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
            height: '100%',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          }}
          onClick={() => {
            setSelectedCandidate(candidate);
            setShowCandidateDialog(true);
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={candidate.avatar}
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {candidate.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {candidate.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {candidate.jobTitle}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  size="small"
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                    setSelectedCandidate(candidate);
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {candidate.experience} at {candidate.currentCompany}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {candidate.location}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <School sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {candidate.education}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Key Skills:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {candidate.skills.slice(0, 3).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                ))}
                {candidate.skills.length > 3 && (
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    +{candidate.skills.length - 3} more
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="body2">
                  {candidate.rating}/5
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" fullWidth>
                View Profile
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCandidateAction('download-resume', candidate);
                }}
              >
                <Download sx={{ fontSize: 16 }} />
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
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Grid item xs={12} md={6} lg={3} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ height: 250, bgcolor: 'grey.200', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Candidate Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage job applications from candidates
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {candidates.filter(c => c.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {candidates.filter(c => c.status === 'interview').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interviews Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {candidates.filter(c => c.status === 'hired').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hired
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {Math.round(candidates.reduce((sum, c) => sum + c.rating, 0) / candidates.length * 10) / 10 || 0}
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

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="reviewed">Reviewed</MenuItem>
            <MenuItem value="interview">Interview</MenuItem>
            <MenuItem value="hired">Hired</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Job Position</InputLabel>
          <Select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            label="Job Position"
          >
            <MenuItem value="all">All Positions</MenuItem>
            <MenuItem value="Senior Frontend Developer">Senior Frontend Developer</MenuItem>
            <MenuItem value="Full Stack Engineer">Full Stack Engineer</MenuItem>
            <MenuItem value="UI/UX Designer">UI/UX Designer</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Candidates Grid */}
      {paginatedCandidates.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No candidates found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || filterStatus !== 'all' || filterJob !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Candidates will appear here when they apply to your jobs'
            }
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedCandidates.map((candidate) => (
              <Grid item xs={12} sm={6} lg={3} key={candidate.id}>
                <CandidateCard candidate={candidate} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredCandidates.length > candidatesPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(filteredCandidates.length / candidatesPerPage)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Candidate Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleCandidateAction('review', selectedCandidate)}>
          <Visibility sx={{ mr: 1 }} /> Mark as Reviewed
        </MenuItem>
        <MenuItem onClick={() => handleCandidateAction('schedule-interview', selectedCandidate)}>
          <Schedule sx={{ mr: 1 }} /> Schedule Interview
        </MenuItem>
        <MenuItem onClick={() => handleCandidateAction('send-message', selectedCandidate)}>
          <Message sx={{ mr: 1 }} /> Send Message
        </MenuItem>
        <MenuItem onClick={() => handleCandidateAction('download-resume', selectedCandidate)}>
          <Download sx={{ mr: 1 }} /> Download Resume
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleCandidateAction('hire', selectedCandidate)} sx={{ color: 'success.main' }}>
          <ThumbUp sx={{ mr: 1 }} /> Hire Candidate
        </MenuItem>
        <MenuItem onClick={() => handleCandidateAction('reject', selectedCandidate)} sx={{ color: 'error.main' }}>
          <ThumbDown sx={{ mr: 1 }} /> Reject
        </MenuItem>
      </Menu>

      {/* Candidate Detail Dialog */}
      <Dialog
        open={showCandidateDialog}
        onClose={() => setShowCandidateDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedCandidate && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedCandidate.avatar}
                  sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                >
                  {selectedCandidate.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedCandidate.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedCandidate.jobTitle}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={selectedCandidate.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedCandidate.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Location"
                        secondary={selectedCandidate.location}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Availability"
                        secondary={selectedCandidate.availability}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Professional Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Experience"
                        secondary={`${selectedCandidate.experience} at ${selectedCandidate.currentCompany}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Education"
                        secondary={selectedCandidate.education}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Salary Expectation"
                        secondary={selectedCandidate.salaryExpectation}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Rating"
                        secondary={
                          <Rating value={selectedCandidate.rating} readOnly size="small" />
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCandidate.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>

                {selectedCandidate.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {selectedCandidate.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setShowCandidateDialog(false)}>
                Close
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleCandidateAction('download-resume', selectedCandidate)}
              >
                Download Resume
              </Button>
              <Button
                variant="contained"
                startIcon={<Schedule />}
                onClick={() => handleCandidateAction('schedule-interview', selectedCandidate)}
              >
                Schedule Interview
              </Button>
            </DialogActions>
          </>
        )}
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

export default RecruiterCandidatesTab;
