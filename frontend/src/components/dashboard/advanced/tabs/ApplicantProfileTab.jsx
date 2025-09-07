import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
  CloudUpload,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Star,
  Verified,
  PhotoCamera,
  Link as LinkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ApplicantProfileTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    linkedinUrl: user?.linkedin_url || '',
    githubUrl: user?.github_url || '',
    portfolioUrl: user?.portfolio_url || '',
    qualification: user?.qualification || '',
    isExperienced: user?.experience_years > 0 || false,
    experience: user?.experience_years || 0,
    skills: user?.skills ? JSON.parse(user.skills) : [],
    profilePicture: user?.profile_picture || null
  });
  
  const [skillsDialog, setSkillsDialog] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Predefined options
  const qualificationOptions = [
    'High School',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Professional Certification'
  ];

  const skillSuggestions = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML/CSS', 'TypeScript', 'Angular',
    'Vue.js', 'Spring Boot', 'Django', 'Flask', 'PostgreSQL', 'Redis', 'GraphQL'
  ];

  // Calculate profile completion
  useEffect(() => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phone,
      profileData.location,
      profileData.bio,
      profileData.qualification,
      profileData.skills.length > 0,
      profileData.linkedinUrl || profileData.githubUrl,
    ];
    
    const completedFields = fields.filter(field => field && field !== '').length;
    const completion = Math.round((completedFields / fields.length) * 100);
    setProfileCompletion(completion);
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      
      // Update parent data
      onDataUpdate(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          completeness: profileCompletion
        }
      }));
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Profile Completion Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Profile Completion: {profileCompletion}%
              </Typography>
              <Chip
                label={profileCompletion === 100 ? 'Complete' : 'In Progress'}
                color={profileCompletion === 100 ? 'success' : 'warning'}
                icon={profileCompletion === 100 ? <Verified /> : undefined}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={profileCompletion}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'primary.100',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
            {profileCompletion < 100 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Complete your profile to increase your visibility to recruiters
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={3}>
        {/* Profile Picture & Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={profileData.profilePicture}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto',
                    fontSize: '3rem'
                  }}
                >
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </Avatar>
                {editing && (
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </IconButton>
                )}
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.qualification}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                {profileData.location}
              </Typography>

              {/* Social Links */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                {profileData.linkedinUrl && (
                  <IconButton
                    component="a"
                    href={profileData.linkedinUrl}
                    target="_blank"
                    color="primary"
                  >
                    <LinkedIn />
                  </IconButton>
                )}
                {profileData.githubUrl && (
                  <IconButton
                    component="a"
                    href={profileData.githubUrl}
                    target="_blank"
                    color="primary"
                  >
                    <GitHub />
                  </IconButton>
                )}
                {profileData.portfolioUrl && (
                  <IconButton
                    component="a"
                    href={profileData.portfolioUrl}
                    target="_blank"
                    color="primary"
                  >
                    <LinkIcon />
                  </IconButton>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                {editing ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editing}>
                    <InputLabel>Highest Qualification</InputLabel>
                    <Select
                      value={profileData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      variant={editing ? "outlined" : "filled"}
                    >
                      {qualificationOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.isExperienced}
                        onChange={(e) => handleInputChange('isExperienced', e.target.checked)}
                        disabled={!editing}
                      />
                    }
                    label="I have work experience"
                  />
                </Grid>

                {profileData.isExperienced && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Years of Experience"
                      type="number"
                      value={profileData.experience}
                      onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                      inputProps={{ min: 0, max: 50 }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    placeholder="Tell us about yourself, your interests, and career goals..."
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Links
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    value={profileData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <LinkedIn sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="GitHub URL"
                    value={profileData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <GitHub sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Portfolio URL"
                    value={profileData.portfolioUrl}
                    onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Skills
                </Typography>
                {editing && (
                  <Button
                    startIcon={<Add />}
                    onClick={() => setSkillsDialog(true)}
                    variant="outlined"
                    size="small"
                  >
                    Add Skill
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={editing ? () => handleRemoveSkill(skill) : undefined}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {profileData.skills.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No skills added yet. {editing && 'Click "Add Skill" to get started.'}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skills Dialog */}
      <Dialog open={skillsDialog} onClose={() => setSkillsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Skills</DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={skillSuggestions}
            value={newSkill}
            onChange={(event, newValue) => setNewSkill(newValue || '')}
            onInputChange={(event, newInputValue) => setNewSkill(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Skill"
                fullWidth
                margin="normal"
                placeholder="Type or select a skill"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillsDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            handleAddSkill();
            setSkillsDialog(false);
          }} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicantProfileTab;
