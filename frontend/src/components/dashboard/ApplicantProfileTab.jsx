import React, { useState, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, TextField,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, List, ListItem, ListItemText, ListItemIcon, Accordion,
  AccordionSummary, AccordionDetails, Alert, Snackbar, Autocomplete
} from '@mui/material';
import {
  Edit, Save, Cancel, Upload, Delete, Add, ExpandMore, Person,
  Email, Phone, LocationOn, LinkedIn, GitHub, School, Work,
  Language, Psychology, EmojiEvents, Link as LinkIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ApplicantProfileTab = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    bio: user?.bio || '',
    highestQualification: user?.highestQualification || '',
    isExperienced: user?.isExperienced || false,
    experienceYears: user?.experienceYears || 0,
    currentRole: user?.currentRole || '',
    companyName: user?.companyName || '',
    skills: user?.skills || [],
    languages: user?.languages || [],
    certifications: user?.certifications || [],
    achievements: user?.achievements || []
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const fileInputRef = useRef(null);

  const qualificationOptions = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Professional Certificate',
    'Diploma',
    'Other'
  ];

  const skillSuggestions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'TypeScript', 'PHP', 'C++', 'C#', '.NET', 'Ruby', 'Go', 'Rust',
    'HTML/CSS', 'SASS', 'Bootstrap', 'Tailwind CSS', 'Material-UI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Git', 'Jenkins', 'CI/CD', 'Agile', 'Scrum'
  ];

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hindi',
    'Russian', 'Dutch', 'Swedish', 'Norwegian'
  ];

  const handleSave = () => {
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      alert('Please fill in all required fields');
      return;
    }

    onUpdate(profileData);
    setEditing(false);
    setSnackbarOpen(true);
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      githubUrl: user?.githubUrl || '',
      linkedinUrl: user?.linkedinUrl || '',
      portfolioUrl: user?.portfolioUrl || '',
      bio: user?.bio || '',
      highestQualification: user?.highestQualification || '',
      isExperienced: user?.isExperienced || false,
      experienceYears: user?.experienceYears || 0,
      currentRole: user?.currentRole || '',
      companyName: user?.companyName || '',
      skills: user?.skills || [],
      languages: user?.languages || [],
      certifications: user?.certifications || [],
      achievements: user?.achievements || []
    });
    setEditing(false);
  };

  const addSkill = () => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLanguage = () => {
    if (newLanguage && !profileData.languages.includes(newLanguage)) {
      setProfileData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (langToRemove) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== langToRemove)
    }));
  };

  const addCertification = () => {
    if (newCertification && !profileData.certifications.includes(newCertification)) {
      setProfileData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (certToRemove) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certToRemove)
    }));
  };

  const addAchievement = () => {
    if (newAchievement && !profileData.achievements.includes(newAchievement)) {
      setProfileData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievementToRemove) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement !== achievementToRemove)
    }));
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Profile Information
              </Typography>
              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    color="primary"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            {/* Profile Picture Section */}
            <Box display="flex" alignItems="center" mb={4}>
              <Avatar
                sx={{ width: 120, height: 120, mr: 3 }}
                src={user?.profilePicture}
              >
                {profileData.firstName?.[0]}{profileData.lastName?.[0]}
              </Avatar>
              {editing && (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Upload Photo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      // Handle file upload
                      console.log('File selected:', e.target.files[0]);
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Recommended: 400x400px, max 2MB
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Basic Information */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Person sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Basic Information</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name *"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address *"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
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
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                      placeholder="Tell us about yourself, your interests, and career goals..."
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Professional Links */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <LinkIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Professional Links</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="LinkedIn Profile"
                      value={profileData.linkedinUrl}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077B5' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="GitHub Profile"
                      value={profileData.githubUrl}
                      onChange={(e) => setProfileData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <GitHub sx={{ mr: 1, color: '#333' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Portfolio Website"
                      value={profileData.portfolioUrl}
                      onChange={(e) => setProfileData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Education & Experience */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <School sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Education & Experience</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!editing}>
                      <InputLabel>Highest Qualification</InputLabel>
                      <Select
                        value={profileData.highestQualification}
                        onChange={(e) => setProfileData(prev => ({ ...prev, highestQualification: e.target.value }))}
                        label="Highest Qualification"
                      >
                        {qualificationOptions.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profileData.isExperienced}
                          onChange={(e) => setProfileData(prev => ({ ...prev, isExperienced: e.target.checked }))}
                          disabled={!editing}
                        />
                      }
                      label="I have work experience"
                    />
                  </Grid>
                  {profileData.isExperienced && (
                    <>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Years of Experience"
                          type="number"
                          value={profileData.experienceYears}
                          onChange={(e) => setProfileData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                          disabled={!editing}
                          variant={editing ? "outlined" : "filled"}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Current Role"
                          value={profileData.currentRole}
                          onChange={(e) => setProfileData(prev => ({ ...prev, currentRole: e.target.value }))}
                          disabled={!editing}
                          variant={editing ? "outlined" : "filled"}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Company Name"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                          disabled={!editing}
                          variant={editing ? "outlined" : "filled"}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Skills */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Psychology sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Skills</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box mb={2}>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {profileData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={editing ? () => removeSkill(skill) : undefined}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  {editing && (
                    <Box display="flex" gap={2} alignItems="center">
                      <Autocomplete
                        freeSolo
                        options={skillSuggestions}
                        value={newSkill}
                        onChange={(event, value) => setNewSkill(value || '')}
                        onInputChange={(event, value) => setNewSkill(value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Add Skill"
                            size="small"
                            sx={{ minWidth: 200 }}
                          />
                        )}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addSkill}
                        disabled={!newSkill}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Languages */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <Language sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Languages</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box mb={2}>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {profileData.languages.map((language, index) => (
                      <Chip
                        key={index}
                        label={language}
                        onDelete={editing ? () => removeLanguage(language) : undefined}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  {editing && (
                    <Box display="flex" gap={2} alignItems="center">
                      <Autocomplete
                        options={languageOptions}
                        value={newLanguage}
                        onChange={(event, value) => setNewLanguage(value || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Add Language"
                            size="small"
                            sx={{ minWidth: 200 }}
                          />
                        )}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addLanguage}
                        disabled={!newLanguage}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Certifications */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center">
                  <EmojiEvents sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Certifications</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box mb={2}>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {profileData.certifications.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        onDelete={editing ? () => removeCertification(cert) : undefined}
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  {editing && (
                    <Box display="flex" gap={2} alignItems="center">
                      <TextField
                        label="Add Certification"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        size="small"
                        sx={{ minWidth: 200 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addCertification}
                        disabled={!newCertification}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicantProfileTab;
