import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  RocketLaunch,
  Visibility,
  Edit,
  Person,
  Work,
  School,
  Link as LinkIcon,
  AttachFile,
  Send,
  CheckCircle,
  Warning,
  Info,
  Save,
  Cancel
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const SmartApplicationSystem = ({ job, onApplicationSubmit, onClose }) => {
  const { user } = useAuth();
  const [applicationMode, setApplicationMode] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock user profile data - replace with actual user data
  const userProfile = {
    personalInfo: {
      fullName: user?.firstName + ' ' + user?.lastName || 'John Doe',
      email: user?.email || 'john@example.com',
      phone: user?.phone || '+91-9876543210',
      location: user?.location || 'Bangalore, India'
    },
    professional: {
      currentTitle: user?.currentRole || 'Software Developer',
      experience: user?.experienceYears || '3 years',
      expectedSalary: user?.expectedSalary || '15-20 LPA',
      noticePeriod: user?.noticePeriod || '60 days',
      skills: user?.skills || ['React', 'Node.js', 'JavaScript', 'Python']
    },
    education: {
      degree: user?.education || 'B.Tech Computer Science',
      percentage: user?.percentage || '85%',
      institution: user?.institution || 'IIT Delhi'
    },
    socialLinks: {
      linkedin: user?.linkedinUrl || '',
      github: user?.githubUrl || '',
      portfolio: user?.portfolioUrl || ''
    },
    documents: {
      resume: user?.resumeUrl || null
    }
  };

  useEffect(() => {
    // Calculate profile completion
    const calculateCompletion = () => {
      let completed = 0;
      const total = 6;
      
      if (userProfile.personalInfo.fullName) completed++;
      if (userProfile.professional.currentTitle) completed++;
      if (userProfile.education.degree) completed++;
      if (userProfile.socialLinks.linkedin) completed++;
      if (userProfile.documents.resume) completed++;
      if (userProfile.professional.skills.length > 0) completed++;
      
      return Math.round((completed / total) * 100);
    };

    setProfileCompletion(calculateCompletion());
    
    // Pre-fill application data
    setApplicationData({
      ...userProfile,
      jobId: job.id,
      coverLetter: generateJobSpecificCoverLetter(),
      whyInterested: '',
      availableFrom: '',
      customAnswers: {}
    });
  }, [job.id]);

  const generateJobSpecificCoverLetter = () => {
    return `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. With ${userProfile.professional.experience} of experience in ${userProfile.professional.skills.slice(0, 3).join(', ')}, I believe I would be a valuable addition to your team.

My background in ${userProfile.education.degree} and hands-on experience with ${userProfile.professional.skills.slice(0, 2).join(' and ')} aligns well with the requirements mentioned in the job posting.

I am particularly excited about this opportunity because of ${job.company}'s reputation in the industry and the chance to work on innovative projects.

I am available to start with a ${userProfile.professional.noticePeriod} notice period and am expecting a salary in the range of ${userProfile.professional.expectedSalary}.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
${userProfile.personalInfo.fullName}`;
  };

  const handleQuickApply = async () => {
    if (profileCompletion < 70) {
      alert('Please complete your profile (minimum 70%) to use Quick Apply');
      return;
    }

    setIsSubmitting(true);
    try {
      const quickApplicationData = {
        jobId: job.id,
        applicantData: userProfile,
        applicationMethod: 'quick_apply',
        appliedAt: new Date().toISOString()
      };

      await onApplicationSubmit(quickApplicationData);
      setShowSuccessMessage(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Quick apply failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomApply = () => {
    setApplicationMode('custom');
    setShowApplicationForm(true);
  };

  const handleReviewApply = () => {
    setApplicationMode('review');
    setShowApplicationForm(true);
  };

  const handleFieldChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      const finalApplicationData = {
        jobId: job.id,
        applicantData: applicationData,
        applicationMethod: applicationMode,
        hasProfileChanges: hasChanges,
        appliedAt: new Date().toISOString()
      };

      await onApplicationSubmit(finalApplicationData);
      
      // Ask user if they want to update their profile
      if (hasChanges) {
        // Show profile update dialog
      }
      
      setShowSuccessMessage(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ApplicationModeSelector = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Apply for {job.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          at {job.company}
        </Typography>

        {/* Profile Completion Status */}
        <Card sx={{ mb: 3, bgcolor: profileCompletion >= 70 ? 'success.light' : 'warning.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Profile Completion</Typography>
              <Typography variant="h6">{profileCompletion}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={profileCompletion} 
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {profileCompletion >= 70 
                ? 'Your profile is ready for quick applications!' 
                : 'Complete your profile to enable quick apply'}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Quick Apply Option */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: profileCompletion >= 70 ? 'pointer' : 'not-allowed',
                opacity: profileCompletion >= 70 ? 1 : 0.6,
                '&:hover': profileCompletion >= 70 ? { boxShadow: 6 } : {}
              }}
              onClick={profileCompletion >= 70 ? handleQuickApply : undefined}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <RocketLaunch sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  🚀 Quick Apply
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Apply instantly with your saved profile information
                </Typography>
                <Chip 
                  label="< 30 seconds" 
                  color="success" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="caption" display="block">
                  Uses: {userProfile.personalInfo.fullName}, {userProfile.professional.experience}
                </Typography>
                {profileCompletion < 70 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Complete profile to enable
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Review & Apply Option */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={handleReviewApply}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Visibility sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  👀 Review & Apply
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Review and modify your details before applying
                </Typography>
                <Chip 
                  label="2-3 minutes" 
                  color="info" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="caption" display="block">
                  Pre-filled form with edit options
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Custom Apply Option */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={handleCustomApply}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Edit sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  ✏️ Custom Application
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Fill detailed application with job-specific answers
                </Typography>
                <Chip 
                  label="5-10 minutes" 
                  color="secondary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="caption" display="block">
                  Complete customization available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Profile Summary */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Your Profile Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText 
                      primary="Personal Info" 
                      secondary={userProfile.personalInfo.fullName}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Work /></ListItemIcon>
                    <ListItemText 
                      primary="Experience" 
                      secondary={`${userProfile.professional.currentTitle} - ${userProfile.professional.experience}`}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon><School /></ListItemIcon>
                    <ListItemText 
                      primary="Education" 
                      secondary={`${userProfile.education.degree} - ${userProfile.education.percentage}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AttachFile /></ListItemIcon>
                    <ListItemText 
                      primary="Documents" 
                      secondary={userProfile.documents.resume ? 'Resume uploaded' : 'No resume'}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );

  const ApplicationForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {applicationMode === 'review' ? 'Review Your Application' : 'Custom Application'}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={applicationData.personalInfo?.fullName || ''}
              onChange={(e) => handleFieldChange('personalInfo.fullName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={applicationData.personalInfo?.email || ''}
              onChange={(e) => handleFieldChange('personalInfo.email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={applicationData.personalInfo?.phone || ''}
              onChange={(e) => handleFieldChange('personalInfo.phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expected Salary"
              value={applicationData.professional?.expectedSalary || ''}
              onChange={(e) => handleFieldChange('professional.expectedSalary', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Cover Letter"
              value={applicationData.coverLetter || ''}
              onChange={(e) => handleFieldChange('coverLetter', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Why are you interested in this role?"
              value={applicationData.whyInterested || ''}
              onChange={(e) => handleFieldChange('whyInterested', e.target.value)}
            />
          </Grid>
        </Grid>

        {hasChanges && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <FormControlLabel
              control={<Checkbox />}
              label="Update my profile with these changes"
            />
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSubmitApplication}
            disabled={isSubmitting}
          >
            Submit Application
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => setShowApplicationForm(false)}
          >
            Back
          </Button>
        </Box>
      </Box>
    </motion.div>
  );

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <AnimatePresence mode="wait">
          {!showApplicationForm ? (
            <ApplicationModeSelector key="selector" />
          ) : (
            <ApplicationForm key="form" />
          )}
        </AnimatePresence>
      </DialogContent>

      {/* Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Application submitted successfully! 🎉
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default SmartApplicationSystem;
