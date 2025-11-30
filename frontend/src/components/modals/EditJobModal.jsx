import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  FormHelperText,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const EditJobModal = ({ open, onClose, job, onUpdate }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    jobTitle: '',
    companyName: '',
    location: '',
    industry: '',
    jobCategory: '',
    jobType: '',
    workArrangement: '',
    applicationDeadline: '',
    
    // Experience & Skills
    experienceMin: '',
    experienceMax: '',
    requiredSkills: [],
    
    // Salary & Compensation
    salaryType: 'Range',
    salaryMin: '',
    salaryMax: '',
    salaryPeriod: 'Yearly',
    
    // AI Enhancement
    aiKeywords: [],
    
    // Job Description & Details
    jobDescription: '',
    keyResponsibilities: [],
    requirements: [],
    
    // Contact Information
    contactEmail: '',
    jobUrgency: 'Normal Priority'
  });

  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [errors, setErrors] = useState({});

  // Industry options
  const industries = ['Finance & Banking', 'Automobile & Manufacturing'];
  
  // Job categories based on industry
  const jobCategories = {
    'Finance & Banking': [
      'Banking & Financial Services', 'Investment Banking', 'Insurance', 
      'Mutual Funds', 'Credit & Lending', 'Financial Planning', 'Risk Management',
      'Compliance', 'Fintech', 'Accounting & Auditing', 'Tax Advisory', 'Treasury Management'
    ],
    'Automobile & Manufacturing': [
      'Automotive Engineering', 'Manufacturing Operations', 'Quality Control',
      'Supply Chain Management', 'Production Planning', 'R&D', 'Sales & Marketing'
    ]
  };

  // Skills based on industry
  const skillsByIndustry = {
    'Finance & Banking': [
      'Financial Analysis', 'Risk Assessment', 'Regulatory Compliance', 'Financial Modeling',
      'Investment Analysis', 'Credit Analysis', 'Portfolio Management', 'Financial Reporting',
      'KYC/AML', 'IFRS/GAAP', 'Excel Advanced', 'Bloomberg Terminal', 'SAP Finance',
      'Tally', 'QuickBooks', 'Python for Finance', 'SQL', 'Tableau', 'Power BI'
    ],
    'Automobile & Manufacturing': [
      'CAD Design', 'Manufacturing Processes', 'Quality Control', 'Lean Manufacturing',
      'Six Sigma', 'Project Management', 'Supply Chain', 'Automotive Electronics',
      'Engine Technology', 'Safety Standards', 'ISO/TS 16949', 'APQP', 'FMEA', 'SPC', 'Kaizen'
    ]
  };

  // Populate form when job data is available
  useEffect(() => {
    if (job && open) {
      console.log('🔍 EditJobModal received job data:', job);
      
      setFormData({
        // Basic Information
        jobTitle: job.jobTitle || job.title || '',
        companyName: job.companyName || job.company || '',
        location: job.location || '',
        industry: job.industry || '',
        jobCategory: job.jobCategory || job.category || '',
        jobType: job.jobType || job.type || '',
        workArrangement: job.workArrangement || job.workMode || '',
        applicationDeadline: job.applicationDeadline ? 
          new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        
        // Experience & Skills
        experienceMin: job.experience?.minimum?.toString() || job.experience?.min?.toString() || '',
        experienceMax: job.experience?.maximum?.toString() || job.experience?.max?.toString() || '',
        requiredSkills: job.requiredSkills || job.skills || [],
        
        // Salary & Compensation
        salaryType: job.salaryRange?.min && job.salaryRange?.max ? 'Range' : 
                   job.salaryRange?.min ? 'Fixed' : 'Negotiable',
        salaryMin: job.salaryRange?.min ? (job.salaryRange.min / 100000).toString() : '',
        salaryMax: job.salaryRange?.max ? (job.salaryRange.max / 100000).toString() : '',
        salaryPeriod: job.salaryRange?.period || 'Yearly',
        
        // AI Enhancement
        aiKeywords: job.aiKeywords || [],
        
        // Job Description & Details
        jobDescription: job.jobDescription || job.description || '',
        keyResponsibilities: job.keyResponsibilities || job.responsibilities || [],
        requirements: job.requirements || [],
        
        // Contact Information
        contactEmail: job.contactEmail || '',
        jobUrgency: job.jobUrgency || job.urgency || 'Normal Priority'
      });
    }
  }, [job, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(value) ? value : value.split('\n').filter(item => item.trim())
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.jobCategory) newErrors.jobCategory = 'Job category is required';
    if (!formData.jobType) newErrors.jobType = 'Job type is required';
    if (!formData.workArrangement) newErrors.workArrangement = 'Work arrangement is required';
    if (!formData.jobDescription.trim()) newErrors.jobDescription = 'Job description is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    
    // Email validation
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    // Experience validation
    if (formData.experienceMin && formData.experienceMax) {
      if (parseInt(formData.experienceMin) > parseInt(formData.experienceMax)) {
        newErrors.experienceMax = 'Maximum experience must be greater than minimum';
      }
    }
    
    // Salary validation
    if (formData.salaryType === 'Range') {
      if (!formData.salaryMin) newErrors.salaryMin = 'Minimum salary is required for range';
      if (!formData.salaryMax) newErrors.salaryMax = 'Maximum salary is required for range';
      if (formData.salaryMin && formData.salaryMax && 
          parseFloat(formData.salaryMin) > parseFloat(formData.salaryMax)) {
        newErrors.salaryMax = 'Maximum salary must be greater than minimum';
      }
    } else if (formData.salaryType === 'Fixed') {
      if (!formData.salaryMin) newErrors.salaryMin = 'Salary amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEnhanceWithAI = async () => {
    if (!formData.jobDescription.trim()) {
      toast.error('Please enter a job description first');
      return;
    }
    
    setEnhancing(true);
    try {
      // Simulate AI enhancement (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enhanced description based on industry templates
      const industryTemplates = {
        'Finance & Banking': {
          description: `We are seeking a skilled ${formData.jobTitle} to join our dynamic finance team. This role offers an excellent opportunity to work with cutting-edge financial technologies and contribute to strategic decision-making processes. The successful candidate will be responsible for analyzing complex financial data, ensuring regulatory compliance, and driving business growth through innovative financial solutions.`,
          responsibilities: [
            'Conduct comprehensive financial analysis and modeling',
            'Ensure compliance with regulatory requirements and industry standards',
            'Prepare detailed financial reports and presentations for stakeholders',
            'Collaborate with cross-functional teams to optimize financial processes',
            'Monitor market trends and provide strategic recommendations'
          ],
          requirements: [
            'Strong analytical and problem-solving skills',
            'Proficiency in financial modeling and analysis tools',
            'Knowledge of regulatory compliance requirements',
            'Excellent communication and presentation skills',
            'Ability to work in a fast-paced, dynamic environment'
          ]
        }
      };
      
      const template = industryTemplates[formData.industry];
      if (template) {
        setFormData(prev => ({
          ...prev,
          jobDescription: template.description,
          keyResponsibilities: template.responsibilities,
          requirements: template.requirements
        }));
        toast.success('Job description enhanced with AI!');
      }
    } catch (error) {
      toast.error('Failed to enhance description');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    try {
      // Transform form data to match backend schema
      const updateData = {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        location: formData.location,
        industry: formData.industry,
        jobCategory: formData.jobCategory,
        jobType: formData.jobType,
        workArrangement: formData.workArrangement,
        applicationDeadline: formData.applicationDeadline || null,
        
        experience: {
          minimum: formData.experienceMin ? parseInt(formData.experienceMin) : 0,
          maximum: formData.experienceMax ? parseInt(formData.experienceMax) : 0
        },
        
        requiredSkills: formData.requiredSkills,
        
        salaryRange: formData.salaryType === 'Negotiable' ? null : {
          min: formData.salaryMin ? parseFloat(formData.salaryMin) * 100000 : null,
          max: formData.salaryMax ? parseFloat(formData.salaryMax) * 100000 : null,
          period: formData.salaryPeriod,
          currency: 'INR'
        },
        
        aiKeywords: formData.aiKeywords,
        jobDescription: formData.jobDescription,
        keyResponsibilities: formData.keyResponsibilities,
        requirements: formData.requirements,
        contactEmail: formData.contactEmail,
        jobUrgency: formData.jobUrgency,
        
        // Keep existing fields
        status: job.status,
        postedBy: job.postedBy,
        createdAt: job.createdAt
      };
      
      console.log('🔍 Updating job with data:', updateData);
      
      // Call the update function passed from parent
      await onUpdate(job._id || job.id, updateData);
      
      toast.success('Job updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={typeof window !== 'undefined' && window.innerWidth < 600}
      PaperProps={{
        sx: { 
          maxWidth: { xs: '100%', sm: '480px', md: '500px', lg: '510px' },
          minHeight: { xs: '100vh', sm: '80vh' },
          maxHeight: { xs: '100vh', sm: '95vh' },
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="bold">
            Edit Job Post
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: 2 }}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    error={!!errors.jobTitle}
                    helperText={errors.jobTitle}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    helperText="Company name is automatically fetched from your profile"
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    error={!!errors.location}
                    helperText={errors.location}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.industry}>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      label="Industry"
                    >
                      {industries.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.industry && <FormHelperText>{errors.industry}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.jobCategory}>
                    <InputLabel>Job Category</InputLabel>
                    <Select
                      value={formData.jobCategory}
                      onChange={(e) => handleInputChange('jobCategory', e.target.value)}
                      label="Job Category"
                      disabled={!formData.industry}
                    >
                      {formData.industry && jobCategories[formData.industry]?.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.jobCategory && <FormHelperText>{errors.jobCategory}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.jobType}>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={formData.jobType}
                      onChange={(e) => handleInputChange('jobType', e.target.value)}
                      label="Job Type"
                    >
                      <MenuItem value="Full Time">Full Time</MenuItem>
                      <MenuItem value="Part Time">Part Time</MenuItem>
                      <MenuItem value="Internship">Internship</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Freelance">Freelance</MenuItem>
                    </Select>
                    {errors.jobType && <FormHelperText>{errors.jobType}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.workArrangement}>
                    <InputLabel>Work Arrangement</InputLabel>
                    <Select
                      value={formData.workArrangement}
                      onChange={(e) => handleInputChange('workArrangement', e.target.value)}
                      label="Work Arrangement"
                    >
                      <MenuItem value="On-site">On-site</MenuItem>
                      <MenuItem value="Remote">Remote</MenuItem>
                      <MenuItem value="Hybrid">Hybrid</MenuItem>
                    </Select>
                    {errors.workArrangement && <FormHelperText>{errors.workArrangement}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Application Deadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Experience & Skills */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Experience & Skills
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minimum Experience (Years)"
                    type="number"
                    value={formData.experienceMin}
                    onChange={(e) => handleInputChange('experienceMin', e.target.value)}
                    inputProps={{ min: 0, max: 50 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum Experience (Years)"
                    type="number"
                    value={formData.experienceMax}
                    onChange={(e) => handleInputChange('experienceMax', e.target.value)}
                    error={!!errors.experienceMax}
                    helperText={errors.experienceMax}
                    inputProps={{ min: 0, max: 50 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={formData.industry ? skillsByIndustry[formData.industry] || [] : []}
                    value={formData.requiredSkills}
                    onChange={(e, value) => handleInputChange('requiredSkills', value)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Required Skills"
                        placeholder="Select skills from your industry"
                        helperText={`Select skills from ${formData.industry || 'your industry'}`}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Salary & Compensation */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Salary & Compensation
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Salary Type</InputLabel>
                    <Select
                      value={formData.salaryType}
                      onChange={(e) => handleInputChange('salaryType', e.target.value)}
                      label="Salary Type"
                    >
                      <MenuItem value="Range">Range</MenuItem>
                      <MenuItem value="Fixed">Fixed</MenuItem>
                      <MenuItem value="Negotiable">Negotiable</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {formData.salaryType !== 'Negotiable' && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={formData.salaryType === 'Range' ? 'Minimum Salary (Lakhs)' : 'Salary (Lakhs)'}
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                        error={!!errors.salaryMin}
                        helperText={errors.salaryMin}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    {formData.salaryType === 'Range' && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Maximum Salary (Lakhs)"
                          type="number"
                          value={formData.salaryMax}
                          onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                          error={!!errors.salaryMax}
                          helperText={errors.salaryMax}
                          inputProps={{ min: 0, step: 0.1 }}
                        />
                      </Grid>
                    )}
                  </>
                )}
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={formData.salaryPeriod}
                      onChange={(e) => handleInputChange('salaryPeriod', e.target.value)}
                      label="Period"
                    >
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* AI Description Enhancer */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                AI Description Enhancer
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formData.aiKeywords}
                    onChange={(e, value) => handleInputChange('aiKeywords', value)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Keywords for AI Enhancement"
                        placeholder="Add keywords to enhance job description"
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={enhancing ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                    onClick={handleEnhanceWithAI}
                    disabled={enhancing || !formData.jobDescription.trim()}
                    sx={{ mb: 2 }}
                  >
                    {enhancing ? 'Enhancing...' : 'Enhance with AI'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Job Description & Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Job Description & Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Description"
                    required
                    multiline
                    rows={6}
                    value={formData.jobDescription}
                    onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                    error={!!errors.jobDescription}
                    helperText={errors.jobDescription}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Key Responsibilities"
                    multiline
                    rows={4}
                    value={Array.isArray(formData.keyResponsibilities) ? 
                      formData.keyResponsibilities.join('\n') : formData.keyResponsibilities}
                    onChange={(e) => handleArrayFieldChange('keyResponsibilities', e.target.value)}
                    helperText="Enter each responsibility on a new line"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Requirements"
                    multiline
                    rows={4}
                    value={Array.isArray(formData.requirements) ? 
                      formData.requirements.join('\n') : formData.requirements}
                    onChange={(e) => handleArrayFieldChange('requirements', e.target.value)}
                    helperText="Enter each requirement on a new line"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Contact Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    required
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Job Urgency</InputLabel>
                    <Select
                      value={formData.jobUrgency}
                      onChange={(e) => handleInputChange('jobUrgency', e.target.value)}
                      label="Job Urgency"
                    >
                      <MenuItem value="Normal Priority">Normal Priority</MenuItem>
                      <MenuItem value="High Priority">High Priority</MenuItem>
                      <MenuItem value="Urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button
          onClick={handleClose}
          startIcon={<CancelIcon />}
          disabled={loading}
          size="small"
          sx={{ minWidth: { xs: 'auto', sm: '100px' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
          size="small"
          sx={{ minWidth: { xs: 'auto', sm: '120px' } }}
        >
          {loading ? 'Updating...' : 'Update Job'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditJobModal;
