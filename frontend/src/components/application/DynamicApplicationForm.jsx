import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CloudUpload,
  AttachFile,
  Delete,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Save,
  Send,
  ArrowBack,
  ArrowForward,
  Preview,
  Edit
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import * as applicationsAPI from '../../api/applications';

// Indian States and Countries for address dropdowns
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'UAE', 'Saudi Arabia', 'Qatar',
  'Japan', 'South Korea', 'China', 'Malaysia', 'Thailand', 'Netherlands',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Other'
];

/**
 * Dynamic Application Form Component
 * Implements comprehensive job application flow with validation and file uploads
 */
const DynamicApplicationForm = ({ 
  job, 
  isOpen, 
  onClose, 
  onSubmit,
  validationData = null 
}) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // Form state management
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information (pre-filled from profile)
    personalInfo: {
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || user?.location || '',
        state: user?.address?.state || '',
        country: user?.address?.country || '',
        zipCode: user?.address?.zipCode || ''
      }
    },
    
    // Professional Information
    professionalInfo: {
      currentJobTitle: user?.currentJobTitle || '',
      currentCompany: user?.companyInfo?.companyName || user?.company || '',
      totalExperience: user?.yearsOfExperience || 0,
      relevantExperience: 0,
      currentSalary: '',
      expectedSalary: '',
      noticePeriod: '30 days',
      availabilityDate: '',
      willingToRelocate: false,
      preferredLocation: []
    },
    
    // Job-specific answers
    jobSpecificAnswers: [],
    
    // Additional information
    additionalInfo: {
      coverLetter: '',
      whyInterested: '',
      careerGoals: '',
      additionalComments: '',
      referralSource: 'Job Portal',
      portfolioUrl: user?.portfolio_url || '',
      linkedinUrl: user?.linkedin_url || '',
      githubUrl: user?.github_url || ''
    }
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    resume: null,
    coverLetter: null,
    portfolio: [],
    additional: []
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState([]);

  // Form steps configuration
  const steps = [
    {
      label: 'Personal Information',
      description: 'Verify your personal details',
      required: true
    },
    {
      label: 'Professional Background',
      description: 'Share your work experience',
      required: true
    },
    {
      label: 'Job-Specific Questions',
      description: 'Answer role-specific questions',
      required: job?.customQuestions?.length > 0
    },
    {
      label: 'Documents Upload',
      description: 'Upload your resume and documents',
      required: true
    },
    {
      label: 'Additional Information',
      description: 'Cover letter and final details',
      required: false
    },
    {
      label: 'Review & Submit',
      description: 'Review your application',
      required: true
    }
  ];

  // Initialize form with validation data
  useEffect(() => {
    if (validationData?.warnings) {
      setValidationWarnings(validationData.warnings);
    }
  }, [validationData]);

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear field error when user starts typing
    if (formErrors[`${section}.${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: null
      }));
    }
  };

  // Handle nested input changes
  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  // File upload handler
  const handleFileUpload = async (fileType, files) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file
        const maxSize = fileType === 'resume' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for resume, 10MB for others
        if (file.size > maxSize) {
          throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        }

        const allowedTypes = {
          resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          coverLetter: ['application/pdf', 'text/plain'],
          portfolio: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
          additional: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
        };

        if (!allowedTypes[fileType].includes(file.type)) {
          throw new Error(`Invalid file type. Allowed: ${allowedTypes[fileType].join(', ')}`);
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);

        // Upload file (implement your file upload API)
        const response = await fetch('/upload/application-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('File upload failed');
        }

        const result = await response.json();
        return {
          filename: result.filename,
          originalName: file.name,
          fileUrl: result.fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date()
        };
      });

      const uploadedFileData = await Promise.all(uploadPromises);

      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: fileType === 'resume' || fileType === 'coverLetter' 
          ? uploadedFileData[0] 
          : [...(prev[fileType] || []), ...uploadedFileData]
      }));

    } catch (error) {
      console.error('File upload error:', error);
      setFormErrors(prev => ({
        ...prev,
        [`file_${fileType}`]: error.message
      }));
    }
  };

  // Form validation
  const validateStep = (stepIndex) => {
    const errors = {};
    
    switch (stepIndex) {
      case 0: // Personal Information
        if (!formData.personalInfo.fullName.trim()) {
          errors['personalInfo.fullName'] = 'Full name is required';
        }
        if (!formData.personalInfo.email.trim()) {
          errors['personalInfo.email'] = 'Email is required';
        }
        if (!formData.personalInfo.phone.trim()) {
          errors['personalInfo.phone'] = 'Phone number is required';
        }
        break;
        
      case 1: // Professional Information
        if (!formData.professionalInfo.totalExperience && formData.professionalInfo.totalExperience !== 0) {
          errors['professionalInfo.totalExperience'] = 'Total experience is required';
        }
        if (!formData.professionalInfo.expectedSalary) {
          errors['professionalInfo.expectedSalary'] = 'Expected salary is required';
        }
        break;
        
      case 3: // Documents
        if (!uploadedFiles.resume && !user?.resume_url) {
          errors['file_resume'] = 'Resume is required';
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      // Prepare application data
      const applicationData = {
        jobId: job._id,
        applicationData: {
          ...formData,
          submissionTimestamp: new Date(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            timestamp: new Date()
          }
        },
        documents: uploadedFiles
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSubmitProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Submit application
      const response = await applicationsAPI.createApplication(applicationData);
      
      setSubmitProgress(100);
      clearInterval(progressInterval);

      // Success handling
      setTimeout(() => {
        setIsSubmitting(false);
        onSubmit(response.data);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Application submission error:', error);
      setIsSubmitting(false);
      setFormErrors({
        submission: error.message || 'Failed to submit application'
      });
    }
  };

  // Render step content
  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <PersonalInfoStep 
            data={formData.personalInfo}
            onChange={(field, value) => handleInputChange('personalInfo', field, value)}
            onNestedChange={(subsection, field, value) => handleNestedInputChange('personalInfo', subsection, field, value)}
            errors={formErrors}
          />
        );
      
      case 1:
        return (
          <ProfessionalInfoStep 
            data={formData.professionalInfo}
            onChange={(field, value) => handleInputChange('professionalInfo', field, value)}
            errors={formErrors}
            job={job}
          />
        );
      
      case 2:
        return (
          <JobSpecificQuestionsStep 
            questions={job?.customQuestions || []}
            answers={formData.jobSpecificAnswers}
            onChange={(answers) => setFormData(prev => ({ ...prev, jobSpecificAnswers: answers }))}
            errors={formErrors}
          />
        );
      
      case 3:
        return (
          <DocumentsUploadStep 
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            errors={formErrors}
            user={user}
          />
        );
      
      case 4:
        return (
          <AdditionalInfoStep 
            data={formData.additionalInfo}
            onChange={(field, value) => handleInputChange('additionalInfo', field, value)}
            errors={formErrors}
            job={job}
          />
        );
      
      case 5:
        return (
          <ReviewStep 
            formData={formData}
            uploadedFiles={uploadedFiles}
            job={job}
            user={user}
            validationWarnings={validationWarnings}
          />
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          backgroundColor: darkMode ? 'grey.900' : 'background.paper'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="h2">
            Apply for {job?.jobTitle}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {job?.companyName}
          </Typography>
        </Box>
        
        {validationWarnings.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Please review the following before applying:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {validationWarnings.map((warning, index) => (
                <li key={index}>{warning.message}</li>
              ))}
            </ul>
          </Alert>
        )}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  optional={
                    !step.required && (
                      <Typography variant="caption">Optional</Typography>
                    )
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  
                  {renderStepContent(index)}
                  
                  <Box sx={{ mb: 2, mt: 3 }}>
                    <div>
                      {index === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          endIcon={<ArrowForward />}
                        >
                          Continue
                        </Button>
                      )}
                      
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                        startIcon={<ArrowBack />}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          
          {isSubmitting && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Submitting your application...
              </Typography>
              <LinearProgress variant="determinate" value={submitProgress} />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Step Components
const PersonalInfoStep = ({ data, onChange, onNestedChange, errors }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Full Name"
        value={data.fullName}
        onChange={(e) => onChange('fullName', e.target.value)}
        error={!!errors['personalInfo.fullName']}
        helperText={errors['personalInfo.fullName']}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => onChange('email', e.target.value)}
        error={!!errors['personalInfo.email']}
        helperText={errors['personalInfo.email']}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Phone"
        value={data.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        error={!!errors['personalInfo.phone']}
        helperText={errors['personalInfo.phone']}
        required
      />
    </Grid>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Address
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Street Address"
        value={data.address.street}
        onChange={(e) => onNestedChange('address', 'street', e.target.value)}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="City"
        value={data.address.city}
        onChange={(e) => onNestedChange('address', 'city', e.target.value)}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel>State</InputLabel>
        <Select
          value={data.address.state}
          onChange={(e) => onNestedChange('address', 'state', e.target.value)}
          label="State"
        >
          <MenuItem value="">
            <em>Select State</em>
          </MenuItem>
          {INDIAN_STATES.map((state) => (
            <MenuItem key={state} value={state}>
              {state}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel>Country</InputLabel>
        <Select
          value={data.address.country}
          onChange={(e) => onNestedChange('address', 'country', e.target.value)}
          label="Country"
        >
          <MenuItem value="">
            <em>Select Country</em>
          </MenuItem>
          {COUNTRIES.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="ZIP/Postal Code"
        value={data.address.zipCode}
        onChange={(e) => onNestedChange('address', 'zipCode', e.target.value)}
      />
    </Grid>
  </Grid>
);

const ProfessionalInfoStep = ({ data, onChange, errors, job }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Current Job Title"
        value={data.currentJobTitle}
        onChange={(e) => onChange('currentJobTitle', e.target.value)}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Current Company"
        value={data.currentCompany}
        onChange={(e) => onChange('currentCompany', e.target.value)}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Total Experience (Years)"
        type="number"
        value={data.totalExperience}
        onChange={(e) => onChange('totalExperience', parseInt(e.target.value) || 0)}
        error={!!errors['professionalInfo.totalExperience']}
        helperText={errors['professionalInfo.totalExperience']}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Relevant Experience (Years)"
        type="number"
        value={data.relevantExperience}
        onChange={(e) => onChange('relevantExperience', parseInt(e.target.value) || 0)}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Expected Salary (₹)"
        type="number"
        value={data.expectedSalary}
        onChange={(e) => onChange('expectedSalary', e.target.value)}
        error={!!errors['professionalInfo.expectedSalary']}
        helperText={errors['professionalInfo.expectedSalary']}
        required
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel>Notice Period</InputLabel>
        <Select
          value={data.noticePeriod}
          onChange={(e) => onChange('noticePeriod', e.target.value)}
        >
          <MenuItem value="Immediate">Immediate</MenuItem>
          <MenuItem value="15 days">15 days</MenuItem>
          <MenuItem value="30 days">30 days</MenuItem>
          <MenuItem value="60 days">60 days</MenuItem>
          <MenuItem value="90 days">90 days</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12}>
      <FormControlLabel
        control={
          <Checkbox
            checked={data.willingToRelocate}
            onChange={(e) => onChange('willingToRelocate', e.target.checked)}
          />
        }
        label="Willing to relocate"
      />
    </Grid>
  </Grid>
);

const JobSpecificQuestionsStep = ({ questions, answers, onChange, errors }) => {
  if (!questions || questions.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No additional questions for this position.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {questions.map((question, index) => (
        <Grid item xs={12} key={index}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={question.question}
            value={answers[index]?.answer || ''}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[index] = {
                questionId: question.id,
                question: question.question,
                answer: e.target.value,
                answerType: 'text'
              };
              onChange(newAnswers);
            }}
            required={question.required}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const DocumentsUploadStep = ({ uploadedFiles, onFileUpload, errors, user }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Resume
      </Typography>
      {user?.resume_url ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          We'll use your existing resume from your profile. You can upload a new one if needed.
        </Alert>
      ) : null}
      <input
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        id="resume-upload"
        type="file"
        onChange={(e) => onFileUpload('resume', e.target.files)}
      />
      <label htmlFor="resume-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUpload />}
          fullWidth
        >
          Upload Resume
        </Button>
      </label>
      {errors.file_resume && (
        <Typography color="error" variant="caption">
          {errors.file_resume}
        </Typography>
      )}
      {uploadedFiles.resume && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          ✓ {uploadedFiles.resume.originalName}
        </Typography>
      )}
    </Grid>
    
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        Cover Letter (Optional)
      </Typography>
      <input
        accept=".pdf,.txt"
        style={{ display: 'none' }}
        id="cover-letter-upload"
        type="file"
        onChange={(e) => onFileUpload('coverLetter', e.target.files)}
      />
      <label htmlFor="cover-letter-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<AttachFile />}
          fullWidth
        >
          Upload Cover Letter
        </Button>
      </label>
      {uploadedFiles.coverLetter && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          ✓ {uploadedFiles.coverLetter.originalName}
        </Typography>
      )}
    </Grid>
  </Grid>
);

const AdditionalInfoStep = ({ data, onChange, errors, job }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Cover Letter"
        placeholder="Tell us why you're interested in this position..."
        value={data.coverLetter}
        onChange={(e) => onChange('coverLetter', e.target.value)}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Why are you interested in this role?"
        value={data.whyInterested}
        onChange={(e) => onChange('whyInterested', e.target.value)}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Portfolio URL"
        value={data.portfolioUrl}
        onChange={(e) => onChange('portfolioUrl', e.target.value)}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="LinkedIn URL"
        value={data.linkedinUrl}
        onChange={(e) => onChange('linkedinUrl', e.target.value)}
      />
    </Grid>
  </Grid>
);

const ReviewStep = ({ formData, uploadedFiles, job, user, validationWarnings }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Application Summary
    </Typography>
    
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Personal Information
        </Typography>
        <Typography variant="body2">
          Name: {formData.personalInfo.fullName}
        </Typography>
        <Typography variant="body2">
          Email: {formData.personalInfo.email}
        </Typography>
        <Typography variant="body2">
          Phone: {formData.personalInfo.phone}
        </Typography>
      </CardContent>
    </Card>
    
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Professional Information
        </Typography>
        <Typography variant="body2">
          Experience: {formData.professionalInfo.totalExperience} years
        </Typography>
        <Typography variant="body2">
          Expected Salary: ₹{formData.professionalInfo.expectedSalary}
        </Typography>
        <Typography variant="body2">
          Notice Period: {formData.professionalInfo.noticePeriod}
        </Typography>
      </CardContent>
    </Card>
    
    {validationWarnings.length > 0 && (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Please note:
        </Typography>
        {validationWarnings.map((warning, index) => (
          <Typography key={index} variant="body2">
            • {warning.message}
          </Typography>
        ))}
      </Alert>
    )}
    
    <Alert severity="info">
      By submitting this application, you confirm that all information provided is accurate and complete.
    </Alert>
  </Box>
);

export default DynamicApplicationForm;
