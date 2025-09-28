import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Grid,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload,
  CheckCircle,
  Work,
  Person,
  Email,
  Phone,
  LocationOn,
  AttachFile,
  Send,
  Edit,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { profileService } from '../../services/profileService';

const JobApplicationModal = ({ open, onClose, job, user, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileDataFetched, setProfileDataFetched] = useState(false);
  const [applicationData, setApplicationData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    
    // Professional Info
    currentJobTitle: '',
    currentCompany: '',
    experience: '',
    expectedSalary: '',
    noticePeriod: '',
    
    // Application Specific
    coverLetter: '',
    resumeFile: null,
    portfolioUrl: '',
    linkedinUrl: '',
    
    // Preferences
    willingToRelocate: false,
    remoteWorkPreference: false,
    
    // Additional
    additionalInfo: '',
    referralSource: '',
  });

  const steps = ['Profile Review', 'Application Details', 'Submit'];

  // Fetch complete profile data when modal opens
  useEffect(() => {
    const fetchCompleteProfileData = async () => {
      if (user && open && !profileDataFetched) {
        setProfileLoading(true);
        try {
          console.log('🔍 Fetching complete profile data for application...');
          
          // Fetch comprehensive profile data from database
          const profileData = await profileService.getApplicationData();
          
          console.log('✅ Profile data fetched:', profileData);
          console.log('🔍 Key fields extracted:', {
            location: profileData.location,
            currentLocation: profileData.currentLocation,
            experience: profileData.experience,
            yearsOfExperience: profileData.yearsOfExperience,
            linkedinUrl: profileData.linkedinUrl,
            portfolioUrl: profileData.portfolioUrl,
            primarySkills: profileData.primarySkills
          });
          
          // Pre-fill application form with database data
          setApplicationData(prev => ({
            ...prev,
            // Personal Information (from database)
            firstName: profileData.firstName || user.firstName || user.name?.split(' ')[0] || '',
            lastName: profileData.lastName || user.lastName || user.name?.split(' ')[1] || '',
            email: profileData.email || user.email || '',
            phone: profileData.phone || user.phone || '',
            location: profileData.location || '',
            
            // Professional Information (from database)
            currentJobTitle: profileData.currentJobTitle || '',
            currentCompany: profileData.currentCompany || '',
            experience: profileData.experience || (profileData.yearsOfExperience ? `${profileData.yearsOfExperience}` : ''),
            expectedSalary: profileData.expectedSalary || '',
            
            // Skills (from database)
            primarySkills: profileData.primarySkills || [],
            technicalSkills: profileData.technicalSkills || [],
            softSkills: profileData.softSkills || [],
            
            // Social Links (from database)
            linkedinUrl: profileData.linkedinUrl || '',
            portfolioUrl: profileData.portfolioUrl || '',
            githubUrl: profileData.githubUrl || '',
            
            // Preferences (from database)
            willingToRelocate: profileData.willingToRelocate || false,
            remoteWorkPreference: profileData.remoteWorkPreference || false,
            noticePeriod: profileData.noticePeriod || '',
            
            // Additional data
            bio: profileData.bio || '',
            languages: profileData.languages || [],
            education: profileData.education || [],
            workExperience: profileData.workExperience || [],
          }));
          
          setProfileDataFetched(true);
          console.log('✅ Application form pre-filled with database data');
          
        } catch (error) {
          console.error('❌ Error fetching profile data:', error);
          
          // Fallback to basic user data if database fetch fails
          setApplicationData(prev => ({
            ...prev,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ')[1] || '',
            email: user.email || '',
            phone: user.phone || '',
          }));
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchCompleteProfileData();
  }, [user, open, profileDataFetched]);

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setApplicationData(prev => ({
        ...prev,
        resumeFile: file
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Profile Review
        return applicationData.firstName && applicationData.lastName && applicationData.email && applicationData.phone;
      case 1: // Application Details
        return applicationData.coverLetter.length > 50;
      case 2: // Submit
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add all application data
      Object.keys(applicationData).forEach(key => {
        if (key === 'resumeFile' && applicationData[key]) {
          formData.append('resume', applicationData[key]);
        } else if (applicationData[key] !== null && applicationData[key] !== '') {
          formData.append(key, applicationData[key]);
        }
      });
      
      // Add job and user info (handle different field name formats)
      const jobId = job.id || job._id;
      const jobTitle = job.title || job.jobTitle;
      const companyName = job.company || job.companyName;
      const userId = user.id || user._id || user.userId;
      
      console.log('🔍 Job application data being submitted:', {
        jobId,
        jobTitle,
        companyName,
        userId,
        jobFields: Object.keys(job),
        userFields: Object.keys(user)
      });
      
      formData.append('jobId', jobId);
      formData.append('jobTitle', jobTitle);
      formData.append('companyName', companyName);
      formData.append('userId', userId);
      
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Profile Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please verify and update your information before applying
            </Typography>
            {profileDataFetched && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  ✓ Your profile information has been automatically loaded from your dashboard. 
                  You can edit any field below if needed.
                </Typography>
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={applicationData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={applicationData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={applicationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={applicationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Location"
                  value={applicationData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  helperText={applicationData.location ? "✓ Auto-filled from profile" : "Please enter your location"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Job Title"
                  value={applicationData.currentJobTitle}
                  onChange={(e) => handleInputChange('currentJobTitle', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Company"
                  value={applicationData.currentCompany}
                  onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Years of Experience</InputLabel>
                  <Select
                    value={applicationData.experience || (applicationData.experience === '' ? '' : '3-5')}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  >
                    <MenuItem value="0-1">0-1 years</MenuItem>
                    <MenuItem value="1-3">1-3 years</MenuItem>
                    <MenuItem value="3-5">3-5 years</MenuItem>
                    <MenuItem value="5-8">5-8 years</MenuItem>
                    <MenuItem value="8-12">8-12 years</MenuItem>
                    <MenuItem value="12+">12+ years</MenuItem>
                  </Select>
                  {applicationData.experience && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                      ✓ Auto-filled from profile (4 years experience)
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Salary (LPA)"
                  value={applicationData.expectedSalary}
                  onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                  placeholder="e.g., 8-12 LPA"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Application Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tell us why you're interested in this position
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Cover Letter"
                  value={applicationData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  placeholder="Write a compelling cover letter explaining why you're perfect for this role..."
                  helperText={`${applicationData.coverLetter.length}/1000 characters (minimum 50)`}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center' }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{ mb: 1 }}
                    >
                      Upload Resume
                    </Button>
                  </label>
                  {applicationData.resumeFile && (
                    <Typography variant="body2" color="primary">
                      ✓ {applicationData.resumeFile.name}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary">
                    PDF, DOC, or DOCX (Max 5MB)
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn Profile URL"
                  value={applicationData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  helperText={applicationData.linkedinUrl ? "✓ Auto-filled from profile" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Portfolio URL"
                  value={applicationData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  placeholder="https://yourportfolio.com"
                  helperText={applicationData.portfolioUrl ? "✓ Auto-filled from profile" : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Notice Period</InputLabel>
                  <Select
                    value={applicationData.noticePeriod}
                    onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                  >
                    <MenuItem value="immediate">Immediate</MenuItem>
                    <MenuItem value="15-days">15 days</MenuItem>
                    <MenuItem value="1-month">1 month</MenuItem>
                    <MenuItem value="2-months">2 months</MenuItem>
                    <MenuItem value="3-months">3 months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>How did you hear about us?</InputLabel>
                  <Select
                    value={applicationData.referralSource}
                    onChange={(e) => handleInputChange('referralSource', e.target.value)}
                  >
                    <MenuItem value="job-portal">Job Portal</MenuItem>
                    <MenuItem value="company-website">Company Website</MenuItem>
                    <MenuItem value="referral">Employee Referral</MenuItem>
                    <MenuItem value="linkedin">LinkedIn</MenuItem>
                    <MenuItem value="social-media">Social Media</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applicationData.willingToRelocate}
                      onChange={(e) => handleInputChange('willingToRelocate', e.target.checked)}
                    />
                  }
                  label="I am willing to relocate for this position"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applicationData.remoteWorkPreference}
                      onChange={(e) => handleInputChange('remoteWorkPreference', e.target.checked)}
                    />
                  }
                  label="I prefer remote work opportunities"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Information"
                  value={applicationData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Any additional information you'd like to share..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review & Submit Application
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review your application before submitting
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Job Details
                </Typography>
                <Typography variant="body2"><strong>Position:</strong> {job?.title}</Typography>
                <Typography variant="body2"><strong>Company:</strong> {job?.company}</Typography>
                <Typography variant="body2"><strong>Location:</strong> {job?.location}</Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Your Information
                </Typography>
                <Typography variant="body2"><strong>Name:</strong> {applicationData.firstName} {applicationData.lastName}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {applicationData.email}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {applicationData.phone}</Typography>
                <Typography variant="body2"><strong>Experience:</strong> {applicationData.experience}</Typography>
                {applicationData.resumeFile && (
                  <Typography variant="body2"><strong>Resume:</strong> {applicationData.resumeFile.name}</Typography>
                )}
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 2 }}>
              By submitting this application, you agree to our terms and conditions. 
              The employer will be able to see your profile information and contact you directly.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!job) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Apply for {job.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              at {job.company}
            </Typography>
            {profileLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="primary">
                  Loading your profile data...
                </Typography>
              </Box>
            )}
            {profileDataFetched && !profileLoading && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                ✓ Profile data loaded from database
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh profile data">
              <IconButton 
                onClick={() => {
                  setProfileDataFetched(false);
                  setProfileLoading(true);
                }}
                disabled={profileLoading}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!validateStep(activeStep) || loading}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<Send />}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobApplicationModal;
