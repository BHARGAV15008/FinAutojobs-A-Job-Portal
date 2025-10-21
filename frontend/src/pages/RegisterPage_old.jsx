import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/use-toast'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Avatar,
  Chip,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  DirectionsCar,
  Calculate,
  TrendingUp,
  Security,
  Group,
  Person,
  Work,
  Google,
  Microsoft,
  Apple,
  Phone,
  School,
  Add,
  Close,
  Verified,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}))

const BrandingSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.2)',
  },
}))

const FeatureCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
}))

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5),
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.primary.main,
  },
}))

const RegisterPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skills: [],
    qualification: '',
    companyName: '',
    position: '',
    role: 'jobseeker',
    emailVerified: false,
    phoneVerified: false
  })

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasSpecial: false,
    hasUpper: false,
    hasLower: false
  })
  const [selectedSkill, setSelectedSkill] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const { register } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'PHP', 'C#', 'C++', 'SQL', 'MongoDB', 'AWS', 'Docker', 'DevOps',
    'UI/UX Design', 'Data Science', 'Machine Learning', 'Cybersecurity',
    'Mobile Development', 'Financial Analysis', 'Investment Banking',
    'Risk Management', 'Automotive Engineering', 'Mechanical Engineering',
    'Electrical Engineering'
  ]

  const qualificationOptions = [
    'High School Diploma',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Bachelor\'s in Computer Science',
    'Bachelor\'s in Engineering',
    'Bachelor\'s in Business',
    'Master\'s Degree',
    'Master\'s in Computer Science',
    'Master\'s in Engineering',
    'Master\'s in Business Administration (MBA)',
    'PhD',
    'Professional Certification',
    'Diploma',
    'Trade School Certificate',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Check password strength when password changes
    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        hasUpper: /[A-Z]/.test(value),
        hasLower: /[a-z]/.test(value)
      })
    }
  }

  const handleSkillAdd = () => {
    if (selectedSkill && !formData.skills.includes(selectedSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, selectedSkill]
      })
      setSelectedSkill('')
    }
  }

  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (loading) {
      console.log('Registration already in progress, ignoring submission')
      return
    }

    // Validate all required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      })
      return
    }

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: activeTab === 0 ? 'applicant' : 'recruiter',
      // Role-specific fields for jobseekers
      ...(activeTab === 0 && {
        skills: formData.skills,
        qualification: formData.qualification
      }),
      // Role-specific fields for employers
      ...(activeTab === 1 && {
        companyName: formData.companyName,
        position: formData.position
      })
    }

    console.log('Starting registration with data:', { ...submitData, password: '[HIDDEN]' })
    setLoading(true)

    try {
      const result = await register(submitData)
      console.log('Registration result:', result)

      if (!result.success) {
        console.error('Registration failed:', result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to create account",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding */}
      {!isMobile && (
        <BrandingSection sx={{ width: '40%', display: 'flex', alignItems: 'center', p: 6 }}>
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
            {/* Logo and Title */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                🚀 FinAutoJobs
              </Typography>
              <Typography variant="h6" sx={{ color: 'primary.100', lineHeight: 1.6 }}>
                Join the premier platform connecting talent with opportunities in Finance & Automotive industries
              </Typography>
            </Box>

            {/* Features */}
            <Box sx={{ mb: 6 }}>
              <FeatureCard sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <Calculate />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    💼 Finance Roles
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Investment Banking, Financial Analysis, Risk Management
                  </Typography>
                </Box>
              </FeatureCard>

              <FeatureCard sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    🚗 Automotive Careers
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Engineering, Manufacturing, Sales & Marketing
                  </Typography>
                </Box>
              </FeatureCard>

              <FeatureCard>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    📈 Career Growth
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Premium opportunities with top-tier companies
                  </Typography>
                </Box>
              </FeatureCard>
            </Box>

            {/* Stats */}
            <Grid container spacing={4}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    50K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Active Jobs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    25K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Companies
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    100K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Professionals
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </BrandingSection>
      )}

      {/* Right Side - Registration Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Container maxWidth="md">
          {/* Mobile Logo */}
          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                }}
              >
                <Business sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          )}

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              🎉 Join Us!
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Create your account and start your career journey
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                Sign in here
              </Link>
            </Typography>
          </Box>

          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              {/* Role Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ mb: 4 }}
              >
                <Tab
                  icon={<Person />}
                  label="Applicant"
                  iconPosition="start"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
                <Tab
                  icon={<Work />}
                  label="Recruiter / HR"
                  iconPosition="start"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
              </Tabs>

              {/* Registration Form */}
              <Box component="form" onSubmit={handleSubmit}>
                {/* Name Fields */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Email Field */}
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Role-specific fields */}
                {activeTab === 0 ? (
                  <>
                    {/* Skills Field */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Autocomplete
                          fullWidth
                          options={skillOptions}
                          value={selectedSkill}
                          onChange={(event, newValue) => setSelectedSkill(newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Add Skills"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Work color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                        <Button
                          variant="contained"
                          onClick={handleSkillAdd}
                          disabled={!selectedSkill}
                          startIcon={<Add />}
                          sx={{ minWidth: 120 }}
                        >
                          Add
                        </Button>
                      </Box>

                      {/* Selected Skills Display */}
                      {formData.skills.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {formData.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              onDelete={() => handleSkillRemove(skill)}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* Qualification Field */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Highest Qualification</InputLabel>
                      <Select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        startAdornment={
                          <InputAdornment position="start">
                            <School color="primary" />
                          </InputAdornment>
                        }
                      >
                        {qualificationOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                ) : (
                  <>
                    {/* Company Name Field */}
                    <TextField
                      fullWidth
                      name="companyName"
                      label="Company Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Position Field */}
                    <TextField
                      fullWidth
                      name="position"
                      label="Your Position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      sx={{ mb: 3 }}
                      placeholder="e.g., HR Manager, Talent Acquisition"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}

                {/* Password Fields */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      error={formData.confirmPassword && formData.password && formData.password !== formData.confirmPassword}
                      helperText={
                        formData.confirmPassword && formData.password
                          ? formData.password === formData.confirmPassword
                            ? "✓ Passwords match"
                            : "✗ Passwords do not match"
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Security
                              color={
                                formData.confirmPassword && formData.password
                                  ? formData.password === formData.confirmPassword
                                    ? "success"
                                    : "error"
                                  : "primary"
                              }
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Terms and Conditions */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link to="/terms-of-service" style={{ color: theme.palette.primary.main }}>
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" style={{ color: theme.palette.primary.main }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    },
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or sign up with
                  </Typography>
                </Divider>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <SocialButton fullWidth variant="outlined">
                      <Google sx={{ color: '#4285F4' }} />
                    </SocialButton>
                  </Grid>
                  <Grid item xs={4}>
                    <SocialButton fullWidth variant="outlined">
                      <Microsoft sx={{ color: '#00BCF2' }} />
                    </SocialButton>
                  </Grid>
                  <Grid item xs={4}>
                    <SocialButton fullWidth variant="outlined">
                      <Apple sx={{ color: '#000' }} />
                    </SocialButton>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </StyledCard>
        </Container>
      </Box>
    </Box>
  )
}

export default RegisterPage
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'applicant' })}
                  className={`p-4 border-2 rounded-xl text-center transition-colors ${
                    formData.role === 'applicant'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <MdPerson className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Find a Job</div>
                  <div className="text-xs text-gray-500">Job Seeker</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                  className={`p-4 border-2 rounded-xl text-center transition-colors ${
                    formData.role === 'recruiter'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <MdBusiness className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Hire Talent</div>
                  <div className="text-xs text-gray-500">Recruiter</div>
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.firstName ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-error-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.lastName ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-error-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.email ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-error-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Company (for recruiters) */}
            {formData.role === 'recruiter' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <MdBusiness className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.company ? 'border-error-500' : 'border-gray-300'
                    }`}
                    placeholder="Your Company Name"
                  />
                </div>
                {errors.company && (
                  <p className="text-error-600 text-sm mt-1">{errors.company}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.password ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-error-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-error-600 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1 ${
                    errors.agreeToTerms ? 'border-error-500' : ''
                  }`}
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms">
                    <span className="text-primary-600 hover:text-primary-500 cursor-pointer">
                      Terms of Service
                    </span>
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy">
                    <span className="text-primary-600 hover:text-primary-500 cursor-pointer">
                      Privacy Policy
                    </span>
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-error-600 text-sm mt-1">{errors.agreeToTerms}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          {/* Social Registration */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialRegister('google')}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              <button
                onClick={() => handleSocialRegister('microsoft')}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
              </button>

              <button
                onClick={() => handleSocialRegister('apple')}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login">
                <span className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
                  Sign in here
                </span>
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;