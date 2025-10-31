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

  // State to track if user has resume in profile
  const [hasProfileResume, setHasProfileResume] = useState(false);
  const [profileResumeUrl, setProfileResumeUrl] = useState('');

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
          
          // Check if user has resume in profile
          const resumeUrl = profileData.resume || profileData.resumeUrl;
          const hasResume = !!(resumeUrl && resumeUrl.trim());
          setHasProfileResume(hasResume);
          setProfileResumeUrl(resumeUrl || '');
          
          console.log('🔍 Resume check:', {
            hasProfileResume: hasResume,
            resumeUrl: resumeUrl,
            resumeRequired: !hasResume
          });
          
          console.log('🔍 Key fields extracted:', {
            location: profileData.location,
            currentLocation: profileData.currentLocation,
            experience: profileData.experience,
            yearsOfExperience: profileData.yearsOfExperience,
            linkedinUrl: profileData.linkedinUrl,
            portfolioUrl: profileData.portfolioUrl,
            primarySkills: profileData.primarySkills,
            hasResume: hasResume
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
      case 0:
        // Profile Review Step - Check required fields that aren't auto-filled
        const requiredFields = [];
        
        // Name fields - mandatory if not in profile
        if (!applicationData.firstName) requiredFields.push('First Name');
        if (!applicationData.lastName) requiredFields.push('Last Name');
        
        // Email - mandatory if not in profile
        if (!applicationData.email) requiredFields.push('Email');
        
        // Phone - mandatory if not in profile
        if (!applicationData.phone) requiredFields.push('Phone');
        
        // Location - mandatory if not in profile
        if (!applicationData.location) requiredFields.push('Current Location');
        
        // Experience - mandatory if not in profile
        if (!applicationData.experience && !applicationData.yearsOfExperience) {
          requiredFields.push('Years of Experience');
        }
        
        if (requiredFields.length > 0) {
          console.log('❌ Missing required fields:', requiredFields);
          return false;
        }
        
        return true;
        
      case 1:
        // Application Details Step
        const applicationRequiredFields = [];
        
        // Cover Letter - always mandatory
        if (!applicationData.coverLetter || applicationData.coverLetter.trim().length < 50) {
          applicationRequiredFields.push('Cover Letter (minimum 50 characters)');
        }
        
        // Resume - mandatory if not in profile
        if (!hasProfileResume && !applicationData.resumeFile) {
          applicationRequiredFields.push('Resume');
        }
        
        // Expected Salary - mandatory if not in profile
        if (!applicationData.expectedSalary) {
          applicationRequiredFields.push('Expected Salary');
        }
        
        if (applicationRequiredFields.length > 0) {
          console.log('❌ Missing required application fields:', applicationRequiredFields);
          return false;
        }
        
        return true;
        
      default:
        return true;
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
      
      // If no resume file uploaded but user has profile resume, include profile resume URL
      if (!applicationData.resumeFile && hasProfileResume && profileResumeUrl) {
        formData.append('resumeUrl', profileResumeUrl);
        console.log('📄 Using profile resume:', profileResumeUrl);
      }
      
      // Add job and user info (handle different field name formats)
      const jobId = job.id || job._id;
      const jobTitle = job.title || job.jobTitle;
      const companyName = job.company || job.companyName;
      const userId = user.id || user._id || user.userId;
      
      // Create comprehensive applicant snapshot from profile data
      const applicantSnapshot = {
        // Basic Information (from form + profile)
        fullName: `${applicationData.firstName || user.firstName || ''} ${applicationData.lastName || user.lastName || ''}`.trim(),
        full_name: `${applicationData.firstName || user.firstName || ''} ${applicationData.lastName || user.lastName || ''}`.trim(),
        firstName: applicationData.firstName || user.firstName || '',
        lastName: applicationData.lastName || user.lastName || '',
        email: applicationData.email || user.email || '',
        phone: applicationData.phone || user.phone || '',
        location: applicationData.currentLocation || user.location || user.current_location || '',
        
        // Professional Information (from form + profile)
        currentJobTitle: applicationData.currentJobTitle || user.current_job_title || '',
        currentCompany: applicationData.currentCompany || user.current_company || '',
        experience: applicationData.experience || user.experience || '',
        yearsOfExperience: applicationData.yearsOfExperience || user.experience_years || user.yearsOfExperience || 0,
        expectedSalary: applicationData.expectedSalary || user.expected_salary || '',
        
        // Profile Details (from user profile)
        bio: user.bio || '',
        qualification: user.qualification || user.highest_qualification || '',
        skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
        
        // Social Links (from user profile)
        linkedin_url: user.linkedin_url || '',
        linkedinUrl: user.linkedin_url || '',
        github_url: user.github_url || '',
        githubUrl: user.github_url || '',
        portfolio_url: user.portfolio_url || '',
        portfolioUrl: user.portfolio_url || '',
        
        // Resume Information
        resumeUrl: profileResumeUrl || user.resume_url || '',
        resume: profileResumeUrl || user.resume_url || '',
        
        // Additional Profile Data
        profilePicture: user.profile_picture || '',
        workExperience: user.workExperience || user.work_experience || [],
        education: user.education || user.education_history || [],
        
        // Application Specific Data
        coverLetter: applicationData.coverLetter || '',
        linkedinProfileUrl: applicationData.linkedinProfileUrl || user.linkedin_url || '',
        portfolioLinks: [
          ...(user.linkedin_url ? [{ type: 'LinkedIn', url: user.linkedin_url, label: 'LinkedIn Profile' }] : []),
          ...(user.github_url ? [{ type: 'GitHub', url: user.github_url, label: 'GitHub Repository' }] : []),
          ...(user.portfolio_url ? [{ type: 'Portfolio', url: user.portfolio_url, label: 'Personal Portfolio' }] : [])
        ],
        
        // Preferences
        noticePeriod: applicationData.noticePeriod || '',
        howDidYouHear: applicationData.howDidYouHear || '',
        willingToRelocate: applicationData.willingToRelocate || false,
        preferRemoteWork: applicationData.preferRemoteWork || false,
        additionalInformation: applicationData.additionalInformation || ''
      };
      
      console.log('🔍 Job application data being submitted:', {
        jobId,
        jobTitle,
        companyName,
        userId,
        applicantSnapshot,
        jobFields: Object.keys(job),
        userFields: Object.keys(user)
      });
      
      // Add all data to form
      formData.append('jobId', jobId);
      formData.append('jobTitle', jobTitle);
      formData.append('companyName', companyName);
      formData.append('userId', userId);
      
      // Add comprehensive applicant snapshot
      formData.append('applicantSnapshot', JSON.stringify(applicantSnapshot));
      
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
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    ✓ Your profile information has been automatically loaded from your dashboard. 
                    You can edit any field below if needed.
                  </Typography>
                </Alert>
                
                {/* Resume Status Alert */}
                {hasProfileResume ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      📄 Resume found in your profile! You can skip resume upload in the next step.
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      ⚠️ No resume found in your profile. You'll need to upload your resume in the next step.
                    </Typography>
                  </Alert>
                )}
              </>
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
                  {hasProfileResume ? (
                    // User has resume in profile - upload is optional
                    <>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        ✓ Resume found in your profile! Upload is optional.
                      </Alert>
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
                          Upload Different Resume (Optional)
                        </Button>
                      </label>
                      {applicationData.resumeFile && (
                        <Typography variant="body2" color="primary">
                          ✓ New resume: {applicationData.resumeFile.name}
                        </Typography>
                      )}
                      <Typography variant="caption" display="block" color="text.secondary">
                        We'll use your profile resume unless you upload a different one
                      </Typography>
                    </>
                  ) : (
                    // User has no resume in profile - upload is required
                    <>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        ⚠️ No resume found in your profile. Please upload your resume.
                      </Alert>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{ mb: 1 }}
                          color="primary"
                        >
                          Upload Resume (Required)
                        </Button>
                      </label>
                      {applicationData.resumeFile && (
                        <Typography variant="body2" color="primary">
                          ✓ {applicationData.resumeFile.name}
                        </Typography>
                      )}
                      <Typography variant="caption" display="block" color="text.secondary">
                        PDF, DOC, or DOCX (Max 5MB) - Required for application
                      </Typography>
                    </>
                  )}
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
                <Typography variant="body2"><strong>Position:</strong> {job?.jobTitle || job?.title || 'Not specified'}</Typography>
                <Typography variant="body2"><strong>Company:</strong> {job?.companyName || job?.company || 'Not specified'}</Typography>
                <Typography variant="body2"><strong>Location:</strong> {job?.location || 'Not specified'}</Typography>
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          maxWidth: { xs: '100%', sm: '500px', md: '600px', lg: '650px' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Apply for {job.jobTitle || job.title || 'this position'}</Typography>
            <Typography variant="body2" color="text.secondary">
              at {job.companyName || job.company || 'this company'}
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

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
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

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ minWidth: { xs: 'auto', sm: '64px' } }}
        >
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
            size="small"
            sx={{ minWidth: { xs: 'auto', sm: '64px' } }}
          >
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!validateStep(activeStep) || loading}
            size="small"
            sx={{ minWidth: { xs: 'auto', sm: '64px' } }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<Send />}
            size="small"
            sx={{ minWidth: { xs: 'auto', sm: '100px' } }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobApplicationModal;
