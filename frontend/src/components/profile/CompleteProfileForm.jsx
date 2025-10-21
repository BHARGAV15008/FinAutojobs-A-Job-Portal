import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Chip,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person,
  School,
  Work,
  Link as LinkIcon,
  EmojiEvents,
  CloudUpload,
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  ExpandMore,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { completeProfileSchema, calculateProfileCompletion } from '../../utils/profileSchema';

const CompleteProfileForm = ({ initialData = {}, onSave, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(completeProfileSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        nationality: 'Indian',
        currentLocation: {
          city: '',
          state: '',
          country: 'India',
          pincode: ''
        },
        permanentAddress: {
          address: '',
          city: '',
          state: '',
          country: 'India',
          pincode: ''
        },
        willingToRelocate: false
      },
      education: [{
        level: '',
        degree: '',
        fieldOfStudy: '',
        institution: '',
        university: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrentlyStudying: false,
        gradingSystem: 'Percentage',
        score: '',
        maxScore: '',
        percentage: '',
        specialization: '',
        projects: [],
        achievements: [],
        relevantCoursework: []
      }],
      professional: {
        currentTitle: '',
        currentCompany: '',
        totalExperience: '0-1 years',
        currentSalary: '',
        expectedSalary: '',
        noticePeriod: '30 days',
        workMode: 'Hybrid',
        isExperienced: false,
        technicalSkills: [],
        softSkills: [],
        languages: [{ name: 'English', proficiency: 'Native' }],
        industries: [],
        jobTypes: ['Full-time'],
        preferredLocations: []
      },
      socialLinks: {
        linkedin: { url: '', username: '', isPublic: true },
        github: { url: '', username: '', repositories: 0, followers: 0, isPublic: true },
        portfolio: { url: '', title: '', isActive: true },
        personalWebsite: { url: '', title: '' },
        stackoverflow: { url: '', reputation: 0, username: '' },
        behance: { url: '', username: '' },
        dribbble: { url: '', username: '' },
        medium: { url: '', username: '', articles: 0 },
        devto: { url: '', username: '' },
        twitter: { url: '', username: '', isPublic: false }
      },
      certifications: [],
      documents: {
        resume: null,
        coverLetter: null,
        portfolio: null,
        certificates: []
      },
      preferences: {
        jobTypes: ['Full-time'],
        industries: [],
        preferredLocations: [],
        workSchedule: 'Full-time',
        travelWillingness: 'Occasionally'
      },
      isProfilePublic: true,
      isOpenToWork: true,
      ...initialData
    }
  });

  const watchedValues = watch();

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({
    control,
    name: 'education'
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({
    control,
    name: 'certifications'
  });

  // Update profile completion when form data changes
  useEffect(() => {
    const completion = calculateProfileCompletion(watchedValues);
    setProfileCompletion(completion);
  }, [watchedValues]);

  const steps = [
    {
      label: 'Personal Information',
      icon: <Person />,
      description: 'Basic personal details and contact information'
    },
    {
      label: 'Education',
      icon: <School />,
      description: 'Educational background with grades and achievements'
    },
    {
      label: 'Professional Details',
      icon: <Work />,
      description: 'Work experience, skills, and career preferences'
    },
    {
      label: 'Social Links',
      icon: <LinkIcon />,
      description: 'Professional profiles and portfolio links'
    },
    {
      label: 'Certifications',
      icon: <EmojiEvents />,
      description: 'Professional certifications and achievements'
    },
    {
      label: 'Documents & Preferences',
      icon: <CloudUpload />,
      description: 'Upload documents and set job preferences'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = (data) => {
    console.log('Profile Data:', data);
    onSave(data);
  };

  // Personal Information Step
  const PersonalInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="First Name *"
                error={!!errors.personalInfo?.firstName}
                helperText={errors.personalInfo?.firstName?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Last Name *"
                error={!!errors.personalInfo?.lastName}
                helperText={errors.personalInfo?.lastName?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address *"
                type="email"
                error={!!errors.personalInfo?.email}
                helperText={errors.personalInfo?.email?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number *"
                error={!!errors.personalInfo?.phone}
                helperText={errors.personalInfo?.phone?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.alternatePhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Alternate Phone"
                error={!!errors.personalInfo?.alternatePhone}
                helperText={errors.personalInfo?.alternatePhone?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.dateOfBirth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Date of Birth *"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.personalInfo?.dateOfBirth}
                helperText={errors.personalInfo?.dateOfBirth?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.gender"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.personalInfo?.gender}>
                <InputLabel>Gender *</InputLabel>
                <Select {...field} label="Gender *">
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.maritalStatus"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.personalInfo?.maritalStatus}>
                <InputLabel>Marital Status *</InputLabel>
                <Select {...field} label="Marital Status *">
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        
        {/* Current Location */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Current Location</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.currentLocation.city"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="City *"
                error={!!errors.personalInfo?.currentLocation?.city}
                helperText={errors.personalInfo?.currentLocation?.city?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="personalInfo.currentLocation.state"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="State *"
                error={!!errors.personalInfo?.currentLocation?.state}
                helperText={errors.personalInfo?.currentLocation?.state?.message}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Controller
            name="personalInfo.willingToRelocate"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Willing to Relocate"
              />
            )}
          />
        </Grid>
      </Grid>
    </motion.div>
  );

  // Education Step with Percentage
  const EducationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Education Details</Typography>
        <Button
          startIcon={<Add />}
          onClick={() => appendEducation({
            level: '',
            degree: '',
            fieldOfStudy: '',
            institution: '',
            gradingSystem: 'Percentage',
            score: '',
            maxScore: '',
            percentage: ''
          })}
        >
          Add Education
        </Button>
      </Box>

      {educationFields.map((field, index) => (
        <Card key={field.id} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Education #{index + 1}</Typography>
              {educationFields.length > 1 && (
                <IconButton onClick={() => removeEducation(index)} color="error">
                  <Delete />
                </IconButton>
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`education.${index}.level`}
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Education Level *</InputLabel>
                      <Select {...field} label="Education Level *">
                        <MenuItem value="Secondary">10th Grade</MenuItem>
                        <MenuItem value="Higher Secondary">12th Grade</MenuItem>
                        <MenuItem value="Diploma">Diploma</MenuItem>
                        <MenuItem value="Bachelor's">Bachelor's Degree</MenuItem>
                        <MenuItem value="Master's">Master's Degree</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`education.${index}.degree`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Degree/Course *"
                      placeholder="e.g., B.Tech, MBA, 12th Science"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`education.${index}.fieldOfStudy`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Field of Study *"
                      placeholder="e.g., Computer Science, Commerce"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`education.${index}.institution`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Institution/School *"
                      placeholder="e.g., IIT Delhi, Delhi Public School"
                    />
                  )}
                />
              </Grid>
              
              {/* Grading System and Scores */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Academic Performance</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`education.${index}.gradingSystem`}
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Grading System *</InputLabel>
                      <Select {...field} label="Grading System *">
                        <MenuItem value="Percentage">Percentage</MenuItem>
                        <MenuItem value="CGPA">CGPA</MenuItem>
                        <MenuItem value="GPA">GPA</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`education.${index}.score`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Your Score *"
                      type="number"
                      placeholder="e.g., 85, 8.5"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`education.${index}.percentage`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Percentage *"
                      type="number"
                      placeholder="e.g., 85.5"
                      InputProps={{
                        endAdornment: '%'
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );

  // Social Links Step
  const SocialLinksStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h6" gutterBottom>Professional Links & Social Media</Typography>
      <Grid container spacing={3}>
        {/* LinkedIn */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>LinkedIn Profile</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Controller
            name="socialLinks.linkedin.url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name="socialLinks.linkedin.isPublic"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Public Profile"
              />
            )}
          />
        </Grid>

        {/* GitHub */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>GitHub Profile</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Controller
            name="socialLinks.github.url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="GitHub URL"
                placeholder="https://github.com/yourusername"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name="socialLinks.github.isPublic"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Public Profile"
              />
            )}
          />
        </Grid>

        {/* Portfolio */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Portfolio Website</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="socialLinks.portfolio.url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Portfolio URL"
                placeholder="https://yourportfolio.com"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="socialLinks.portfolio.title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Portfolio Title"
                placeholder="My Portfolio"
              />
            )}
          />
        </Grid>

        {/* Additional Professional Links */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Additional Professional Links</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="socialLinks.stackoverflow.url"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Stack Overflow URL"
                        placeholder="https://stackoverflow.com/users/yourprofile"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="socialLinks.medium.url"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Medium Profile"
                        placeholder="https://medium.com/@yourusername"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="socialLinks.behance.url"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Behance Profile"
                        placeholder="https://behance.net/yourprofile"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="socialLinks.dribbble.url"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Dribbble Profile"
                        placeholder="https://dribbble.com/yourprofile"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </motion.div>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Profile Completion Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Profile Completion</Typography>
            <Typography variant="h6" color="primary">{profileCompletion}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={profileCompletion} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete your profile to get better job recommendations
          </Typography>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  optional={
                    <Typography variant="caption">{step.description}</Typography>
                  }
                  icon={step.icon}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {index === 0 && <PersonalInfoStep />}
                    {index === 1 && <EducationStep />}
                    {index === 2 && <div>Professional Details Step</div>}
                    {index === 3 && <SocialLinksStep />}
                    {index === 4 && <div>Certifications Step</div>}
                    {index === 5 && <div>Documents & Preferences Step</div>}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={index === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={isSubmitting}
                      >
                        {index === steps.length - 1 ? 'Save Profile' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                      {onCancel && (
                        <Button onClick={onCancel} sx={{ mt: 1 }}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompleteProfileForm;
