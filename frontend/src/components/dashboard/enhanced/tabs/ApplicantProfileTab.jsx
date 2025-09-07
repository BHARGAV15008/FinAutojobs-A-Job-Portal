import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, LinearProgress,
  Tabs, Tab, TextField, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Accordion, AccordionSummary, AccordionDetails,
  useTheme, motion, Tooltip, Badge, Stack, Autocomplete, OutlinedInput,
  InputAdornment, FormHelperText, Alert, AlertTitle
} from '@mui/material';
import {
  Edit, Upload, Download, Save, Cancel, Email, Phone, LocationOn,
  LinkedIn, GitHub, Language, School, Work, Psychology, Star,
  ExpandMore, CloudUpload, Description, PictureAsPdf, Add, Delete,
  CheckCircle, Error, Info
} from '@mui/icons-material';

const ApplicantProfileTab = ({ user }) => {
  const theme = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [profileImageDialogOpen, setProfileImageDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { label: 'Basic Information', icon: Email },
    { label: 'Professional Details', icon: Work },
    { label: 'Skills & Education', icon: Psychology },
    { label: 'Links & Portfolio', icon: Language },
    { label: 'Resume', icon: Description },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      skills: newValue
    }));
  };

  const handleSave = () => {
    // Save logic here
    console.log('Saving profile data:', formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setEditMode(false);
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic
      console.log('Uploading resume:', file);
      setResumeDialogOpen(false);
    }
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic
      console.log('Uploading profile image:', file);
      setProfileImageDialogOpen(false);
    }
  };

  const renderBasicInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData?.firstName || ''}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          disabled={!editMode}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData?.lastName || ''}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          disabled={!editMode}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData?.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={!editMode}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData?.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          disabled={!editMode}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Location"
          value={formData?.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          disabled={!editMode}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Bio"
          multiline
          rows={4}
          value={formData?.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          disabled={!editMode}
          helperText="Tell us about yourself, your experience, and what you're looking for"
        />
      </Grid>
    </Grid>
  );

  const renderProfessionalDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Highest Qualification</InputLabel>
          <Select
            value={formData?.highestQualification || ''}
            onChange={(e) => handleInputChange('highestQualification', e.target.value)}
            disabled={!editMode}
            label="Highest Qualification"
          >
            <MenuItem value="High School">High School</MenuItem>
            <MenuItem value="Bachelor's Degree">Bachelor's Degree</MenuItem>
            <MenuItem value="Master's Degree">Master's Degree</MenuItem>
            <MenuItem value="PhD">PhD</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formData?.isExperienced || false}
              onChange={(e) => handleInputChange('isExperienced', e.target.checked)}
              disabled={!editMode}
            />
          }
          label="Is Experienced"
        />
      </Grid>
      {formData?.isExperienced && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Years of Experience"
              type="number"
              value={formData?.experienceYears || ''}
              onChange={(e) => handleInputChange('experienceYears', e.target.value)}
              disabled={!editMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Work />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Role"
              value={formData?.currentRole || ''}
              onChange={(e) => handleInputChange('currentRole', e.target.value)}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Company"
              value={formData?.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              disabled={!editMode}
            />
          </Grid>
        </>
      )}
    </Grid>
  );

  const renderSkillsEducation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={formData?.skills || []}
          onChange={handleSkillsChange}
          disabled={!editMode}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
                key={index}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Skills"
              placeholder="Add your skills"
              helperText="Press Enter to add skills"
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Certifications
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData?.certifications?.map((cert, index) => (
            <Chip
              key={index}
              icon={<School />}
              label={cert}
              variant="outlined"
              onDelete={editMode ? () => {
                const newCerts = [...formData.certifications];
                newCerts.splice(index, 1);
                handleInputChange('certifications', newCerts);
              } : undefined}
            />
          ))}
          {editMode && (
            <Chip
              icon={<Add />}
              label="Add Certification"
              onClick={() => {
                const certName = prompt('Enter certification name:');
                if (certName) {
                  handleInputChange('certifications', [...(formData.certifications || []), certName]);
                }
              }}
              color="primary"
            />
          )}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Achievements
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData?.achievements?.map((achievement, index) => (
            <Chip
              key={index}
              icon={<Star />}
              label={achievement}
              variant="outlined"
              onDelete={editMode ? () => {
                const newAchievements = [...formData.achievements];
                newAchievements.splice(index, 1);
                handleInputChange('achievements', newAchievements);
              } : undefined}
            />
          ))}
          {editMode && (
            <Chip
              icon={<Add />}
              label="Add Achievement"
              onClick={() => {
                const achievement = prompt('Enter achievement:');
                if (achievement) {
                  handleInputChange('achievements', [...(formData.achievements || []), achievement]);
                }
              }}
              color="primary"
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );

  const renderLinksPortfolio = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="LinkedIn Profile"
          value={formData?.linkedinUrl || ''}
          onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
          disabled={!editMode}
          placeholder="https://linkedin.com/in/yourprofile"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkedIn />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="GitHub Profile"
          value={formData?.githubUrl || ''}
          onChange={(e) => handleInputChange('githubUrl', e.target.value)}
          disabled={!editMode}
          placeholder="https://github.com/yourusername"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GitHub />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Portfolio Website"
          value={formData?.portfolioUrl || ''}
          onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
          disabled={!editMode}
          placeholder="https://yourportfolio.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Language />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );

  const renderResumeSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Current Resume
              </Typography>
              {editMode && (
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={() => setResumeDialogOpen(true)}
                >
                  Update Resume
                </Button>
              )}
            </Box>
            
            {formData?.resumeUrl ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Description sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formData.resumeFileName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded on {new Date(formData.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => window.open(formData.resumeUrl, '_blank')}
                >
                  Download
                </Button>
              </Box>
            ) : (
              <Alert severity="info">
                <AlertTitle>No Resume Uploaded</AlertTitle>
                Please upload your resume to complete your profile.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderProfessionalDetails();
      case 2:
        return renderSkillsEducation();
      case 3:
        return renderLinksPortfolio();
      case 4:
        return renderResumeSection();
      default:
        return renderBasicInformation();
    }
  };

  return (
    <Box>
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{ width: 100, height: 100 }}
                    src={formData?.profilePicture}
                  >
                    {formData?.firstName?.[0]}{formData?.lastName?.[0]}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'primary.dark' }
                      }}
                      onClick={() => setProfileImageDialogOpen(true)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formData?.firstName} {formData?.lastName}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {formData?.currentRole}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData?.location}
                  </Typography>
                </Box>
              </Box>
              <Box>
                {editMode ? (
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Completion */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Profile Completion
          </Typography>
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={formData?.profileCompletionPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formData?.profileCompletionPercentage}% Complete
          </Typography>
        </CardContent>
      </Card>

      {/* Profile Sections */}
      <Card>
        <CardContent>
          <Tabs
            value={activeSection}
            onChange={(e, newValue) => setActiveSection(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            {sections.map((section, index) => (
              <Tab
                key={index}
                icon={<section.icon />}
                label={section.label}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSectionContent()}
          </motion.div>
        </CardContent>
      </Card>

      {/* Resume Upload Dialog */}
      <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)}>
        <DialogTitle>Upload Resume</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="resume-upload"
              type="file"
              onChange={handleResumeUpload}
            />
            <label htmlFor="resume-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
              >
                Choose File
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Supported formats: PDF, DOC, DOCX (Max size: 5MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Image Upload Dialog */}
      <Dialog open={profileImageDialogOpen} onClose={() => setProfileImageDialogOpen(false)}>
        <DialogTitle>Upload Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-image-upload"
              type="file"
              onChange={handleProfileImageUpload}
            />
            <label htmlFor="profile-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
              >
                Choose Image
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Supported formats: JPG, PNG, GIF (Max size: 2MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileImageDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicantProfileTab;
