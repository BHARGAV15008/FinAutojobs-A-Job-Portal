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
import OTPVerification from '../components/OTPVerification'

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
  const [showEmailOTP, setShowEmailOTP] = useState(false)
  const [showPhoneOTP, setShowPhoneOTP] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  const { signup, sendEmailOTP, verifyEmailOTP, sendSMSOTP, verifySMSOTP } = useAuth()
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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
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

    if (!emailVerified) {
      toast({
        title: "Error",
        description: "Please verify your email address",
        variant: "destructive"
      })
      return
    }

    if (!phoneVerified) {
      toast({
        title: "Error",
        description: "Please verify your phone number",
        variant: "destructive"
      })
      return
    }

    // Additional role-specific validations
    if (activeTab === 0 && formData.skills.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one skill",
        variant: "destructive"
      })
      return
    }

    if (activeTab === 1 && (!formData.companyName || !formData.position)) {
      toast({
        title: "Error",
        description: "Please fill in all company details",
        variant: "destructive"
      })
      return
    }

    const submitData = {
      username: `${formData.firstName}${formData.lastName}`.toLowerCase().replace(/\s+/g, ''),
      email: formData.email,
      password: formData.password,
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      role: activeTab === 0 ? 'jobseeker' : 'employer',
      // Role-specific fields for jobseekers
      ...(activeTab === 0 && {
        skills: JSON.stringify(formData.skills),
        qualification: formData.qualification
      }),
      // Role-specific fields for employers
      ...(activeTab === 1 && {
        company_name: formData.companyName,
        position: formData.position
      })
    }

    console.log('Starting registration with data:', { ...submitData, password: '[HIDDEN]' })
    setLoading(true)

    try {
      const result = await signup(submitData)
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

  const handleVerifyEmail = async () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await sendEmailOTP(formData.email)
      if (result.success) {
        setShowEmailOTP(true)
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send email OTP",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email OTP",
        variant: "destructive"
      })
    }
  }

  const handleVerifyPhone = async () => {
    if (!formData.phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number first",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await sendSMSOTP(formData.phone)
      if (result.success) {
        setShowPhoneOTP(true)
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send SMS OTP",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send SMS OTP",
        variant: "destructive"
      })
    }
  }

  const handleEmailOTPVerify = async (otp) => {
    setOtpLoading(true)
    try {
      const result = await verifyEmailOTP(formData.email, otp)
      if (result.success) {
        setEmailVerified(true)
        setShowEmailOTP(false)
        setFormData(prev => ({ ...prev, emailVerified: true }))
        toast({
          title: "Success",
          description: "Email verified successfully!",
        })
      } else {
        throw new Error(result.error || "Invalid OTP")
      }
    } catch (error) {
      throw error
    } finally {
      setOtpLoading(false)
    }
  }

  const handlePhoneOTPVerify = async (otp) => {
    setOtpLoading(true)
    try {
      const result = await verifySMSOTP(formData.phone, otp)
      if (result.success) {
        setPhoneVerified(true)
        setShowPhoneOTP(false)
        setFormData(prev => ({ ...prev, phoneVerified: true }))
        toast({
          title: "Success",
          description: "Phone number verified successfully!",
        })
      } else {
        throw new Error(result.error || "Invalid OTP")
      }
    } catch (error) {
      throw error
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendEmailOTP = async () => {
    return await sendEmailOTP(formData.email)
  }

  const handleResendPhoneOTP = async () => {
    return await sendSMSOTP(formData.phone)
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
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant={emailVerified ? "contained" : "outlined"}
                    color={emailVerified ? "success" : "primary"}
                    onClick={handleVerifyEmail}
                    startIcon={emailVerified ? <Verified /> : <Email />}
                    sx={{ minWidth: 120 }}
                  >
                    {emailVerified ? 'Verified' : 'Verify'}
                  </Button>
                </Box>

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
                        required
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

                {/* Phone Field */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant={phoneVerified ? "contained" : "outlined"}
                    color={phoneVerified ? "success" : "primary"}
                    onClick={handleVerifyPhone}
                    startIcon={phoneVerified ? <Verified /> : <Phone />}
                    sx={{ minWidth: 120 }}
                  >
                    {phoneVerified ? 'Verified' : 'Verify'}
                  </Button>
                </Box>

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
                      sx={{
                        '& .MuiFormHelperText-root': {
                          color: formData.confirmPassword && formData.password
                            ? formData.password === formData.confirmPassword
                              ? 'success.main'
                              : 'error.main'
                            : 'text.secondary'
                        }
                      }}
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

      {/* OTP Verification Dialogs */}
      <OTPVerification
        open={showEmailOTP}
        onClose={() => setShowEmailOTP(false)}
        type="email"
        contact={formData.email}
        onVerify={handleEmailOTPVerify}
        onResend={handleResendEmailOTP}
        loading={otpLoading}
      />

      <OTPVerification
        open={showPhoneOTP}
        onClose={() => setShowPhoneOTP(false)}
        type="sms"
        contact={formData.phone}
        onVerify={handlePhoneOTPVerify}
        onResend={handleResendPhoneOTP}
        loading={otpLoading}
      />
    </Box>
  )
}

export default RegisterPage