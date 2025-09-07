import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Stack,
  Alert,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Work,
  Business,
  LocationOn,
  AttachMoney,
  Schedule,
  Star,
  StarBorder,
  Edit,
  Delete,
  Visibility,
  GetApp,
  CloudUpload,
  Search,
  FilterList,
  CheckCircle,
  Cancel,
  Pending,
  Assignment,
  Assessment,
  CalendarToday,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  ExpandMore,
  Add,
  Refresh,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  Language,
  School,
  Code,
  DarkMode,
  LightMode,
  FontDownload,
  Palette,
  Security,
  Notifications,
  Settings
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

// Profile Tab Component
export const ProfileTab = ({ data, onEdit }) => {
  const user = data?.user || {};
  const profileCompletion = data?.stats?.profileCompletion || 0;

  const profileSections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', value: user.fullName, icon: <Edit /> },
        { label: 'Email', value: user.email, icon: <Email /> },
        { label: 'Phone', value: user.phone, icon: <Phone /> },
        { label: 'Location', value: user.location, icon: <LocationOn /> }
      ]
    },
    {
      title: 'Professional Details',
      fields: [
        { label: 'Bio', value: user.bio, multiline: true },
        { label: 'Qualification', value: user.qualification, icon: <School /> },
        { label: 'Experience', value: `${user.experienceYears || 0} years` },
        { label: 'Skills', value: user.skills?.join(', '), icon: <Code /> }
      ]
    },
    {
      title: 'Links & Portfolio',
      fields: [
        { label: 'LinkedIn', value: user.linkedinUrl, icon: <LinkedIn /> },
        { label: 'GitHub', value: user.githubUrl, icon: <GitHub /> },
        { label: 'Portfolio', value: user.portfolioUrl, icon: <Language /> }
      ]
    }
  ];

  return (
    <Box>
      {/* Profile Completion Card */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Profile Completion
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {profileCompletion}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={profileCompletion}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Complete your profile to get better job recommendations and increase visibility to recruiters.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{ mt: 2 }}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Profile Sections */}
      <Grid container spacing={3}>
        {profileSections.map((section, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {section.title}
                </Typography>
                <Stack spacing={2}>
                  {section.fields.map((field, fieldIndex) => (
                    <Box key={fieldIndex}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {field.icon}
                        <Typography variant="subtitle2" fontWeight="medium">
                          {field.label}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color={field.value ? 'text.primary' : 'text.secondary'}
                        sx={{
                          ml: 4,
                          fontStyle: field.value ? 'normal' : 'italic',
                          whiteSpace: field.multiline ? 'pre-wrap' : 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {field.value || 'Not provided'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Recommended Jobs Tab
export const RecommendedTab = ({ data, onToggleSave }) => {
  const [viewMode, setViewMode] = useState('grid');
  const recommendedJobs = data?.recommendedJobs || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Recommended Jobs
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            size="small"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('list')}
            size="small"
          >
            List
          </Button>
        </Box>
      </Box>

      {recommendedJobs.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recommendations yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete your profile and add skills to get personalized job recommendations.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {recommendedJobs.map((job) => (
            <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} key={job.id}>
              <JobCard job={job} onToggleSave={onToggleSave} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Favorites Tab
export const FavoritesTab = ({ data, onToggleSave }) => {
  const savedJobs = data?.savedJobs || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Favorite Jobs
      </Typography>

      {savedJobs.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No saved jobs yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Save jobs you're interested in to easily find them later.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {savedJobs.map((savedJob) => (
            <Grid item xs={12} md={6} key={savedJob.id}>
              <JobCard
                job={{
                  id: savedJob.jobId,
                  title: savedJob.jobTitle,
                  companyName: savedJob.companyName,
                  location: savedJob.location,
                  salaryMin: savedJob.salaryMin,
                  salaryMax: savedJob.salaryMax,
                  jobType: savedJob.jobType,
                  workMode: savedJob.workMode
                }}
                onToggleSave={onToggleSave}
                isSaved={true}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Applications Tab
export const ApplicationsTab = ({ data, onWithdraw, filter, setFilter }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
          My Applications
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
                <TableCell>Job Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {application.jobTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>{application.companyName}</TableCell>
                    <TableCell>{application.location}</TableCell>
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
                        <Tooltip title="View Job">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {application.status === 'pending' && (
                          <Tooltip title="Withdraw Application">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onWithdraw(application.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredApplications.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Card>
    </Box>
  );
};

// Resume Tab
export const ResumeTab = ({ data }) => {
  const [uploading, setUploading] = useState(false);
  const user = data?.user || {};

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    // TODO: Implement resume upload logic
    setTimeout(() => {
      setUploading(false);
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Resume Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Current Resume
              </Typography>
              
              {user.resumeUrl ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Assignment />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        Resume.pdf
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last updated: {format(new Date(), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      href={user.resumeUrl}
                      target="_blank"
                    >
                      View Resume
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<GetApp />}
                      href={user.resumeUrl}
                      download
                    >
                      Download
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Alert severity="info">
                  No resume uploaded yet. Upload your resume to apply for jobs.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Upload New Resume
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="resume-upload"
                  type="file"
                  onChange={handleResumeUpload}
                />
                <label htmlFor="resume-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={uploading}
                    fullWidth
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </label>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Supported formats: PDF, DOC, DOCX
                  <br />
                  Max size: 5MB
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Resume Tips
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Keep it concise"
                    secondary="1-2 pages maximum"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Use keywords"
                    secondary="Match job descriptions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Update regularly"
                    secondary="Keep skills current"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Job Card Component
const JobCard = ({ job, onToggleSave, isSaved = false }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    const formatAmount = (amount) => {
      if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return amount.toString();
    };
    
    if (min && max) {
      return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
    }
    return `₹${formatAmount(min || max)}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card sx={{ borderRadius: 3, height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              {job.title}
            </Typography>
            <IconButton
              onClick={() => onToggleSave(job.id, isSaved)}
              color={isSaved ? 'primary' : 'default'}
            >
              {isSaved ? <Star /> : <StarBorder />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Business fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {job.companyName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {job.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AttachMoney fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={job.jobType} size="small" variant="outlined" />
            <Chip label={job.workMode} size="small" variant="outlined" />
          </Box>
        </CardContent>

        <CardActions>
          <Button size="small" variant="contained">
            Apply Now
          </Button>
          <Button size="small">
            View Details
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

// Settings Dialog Component
export const SettingsDialog = ({ open, onClose, preferences, onUpdatePreferences }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleSave = () => {
    onUpdatePreferences(localPreferences);
    onClose();
  };

  const settingSections = [
    {
      title: 'Appearance',
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' }
          ],
          icon: <Palette />
        },
        {
          key: 'fontSize',
          label: 'Font Size',
          type: 'select',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
          ],
          icon: <FontDownload />
        }
      ]
    },
    {
      title: 'Notifications',
      settings: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          type: 'switch',
          icon: <Email />
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          type: 'switch',
          icon: <Notifications />
        },
        {
          key: 'jobAlerts',
          label: 'Job Alerts',
          type: 'switch',
          icon: <Work />
        }
      ]
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings />
          Settings
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {settingSections.map((section, index) => (
          <Accordion key={index} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {section.settings.map((setting) => (
                  <Box key={setting.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {setting.icon}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{setting.label}</Typography>
                      {setting.type === 'switch' ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={localPreferences[setting.key]}
                              onChange={(e) =>
                                setLocalPreferences({
                                  ...localPreferences,
                                  [setting.key]: e.target.checked
                                })
                              }
                            />
                          }
                          label=""
                        />
                      ) : (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={localPreferences[setting.key]}
                            onChange={(e) =>
                              setLocalPreferences({
                                ...localPreferences,
                                [setting.key]: e.target.value
                              })
                            }
                          >
                            {setting.options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Profile Edit Dialog Component
export const ProfileEditDialog = ({ open, onClose, profileForm, setProfileForm, onSave }) => {
  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
    'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis',
    'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication'
  ];

  const qualificationOptions = [
    'High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD',
    'Diploma', 'Certificate', 'Professional Certification'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              value={profileForm.location}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Qualification</InputLabel>
              <Select
                value={profileForm.qualification}
                onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                label="Qualification"
              >
                {qualificationOptions.map((qual) => (
                  <MenuItem key={qual} value={qual}>{qual}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Experience (Years)"
              type="number"
              value={profileForm.experienceYears}
              onChange={(e) => setProfileForm({ ...profileForm, experienceYears: parseInt(e.target.value) || 0 })}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Skills</InputLabel>
              <Select
                multiple
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                label="Skills"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {skillOptions.map((skill) => (
                  <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="LinkedIn URL"
              value={profileForm.linkedinUrl}
              onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="GitHub URL"
              value={profileForm.githubUrl}
              onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Portfolio URL"
              value={profileForm.portfolioUrl}
              onChange={(e) => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default {
  ProfileTab,
  RecommendedTab,
  FavoritesTab,
  ApplicationsTab,
  ResumeTab,
  SettingsDialog,
  ProfileEditDialog
};
