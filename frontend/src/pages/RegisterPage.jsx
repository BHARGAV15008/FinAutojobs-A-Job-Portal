import React, { useState, useEffect } from 'react'
// PropType fixes applied - all error props are boolean - Updated: 2025-09-23T22:36:26
import { Link, useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useToast } from '../components/ui/use-toast'
import OTPVerification from '../components/auth/OTPVerification'
import OAuthButtons from '../components/auth/OAuthButtons'
import { authAPI } from '../services/api'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  CheckCircle,
  Cancel,
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
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skills: [],
    qualification: '',
    companyName: '',
    position: '',
    role: 'applicant',
    emailVerified: false,
    phoneVerified: false
  })

  const [selectedSkill, setSelectedSkill] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  // OTP verification states
  const [showEmailOTP, setShowEmailOTP] = useState(false)
  const [showPhoneOTP, setShowPhoneOTP] = useState(false)
  const [emailOTPSent, setEmailOTPSent] = useState(false)
  const [phoneOTPSent, setPhoneOTPSent] = useState(false)
  
  // Validation states
  const [emailError, setEmailError] = useState(false)
  const [phoneError, setPhoneError] = useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = useState('')
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('')
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  const { register, sendEmailOTP, verifyEmailOTP, sendSMSOTP, verifySMSOTP } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  // Debounce email availability check
  useEffect(() => {
    if (formData.email && validateEmail(formData.email)) {
      const timeoutId = setTimeout(() => {
        checkEmailAvailability(formData.email)
      }, 1000) // 1 second delay

      return () => clearTimeout(timeoutId)
    }
  }, [formData.email, activeTab])

  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'PHP', 'C#', 'C++', 'SQL', 'MongoDB', 'AWS', 'Docker', 'DevOps',
    'UI/UX Design', 'Data Science', 'Machine Learning', 'Cybersecurity',
    'Mobile Development', 'Financial Analysis', 'Investment Banking',
    'Risk Management', 'Automotive Engineering', 'Mechanical Engineering',
    'Electrical Engineering'
  ]

  const qualificationOptions = [
    'High School',
    'Diploma', 
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Master\'s in Business Administration (MBA)',
    'PhD',
    'Professional Certification',
    'Trade School Certificate',
    'Other'
  ]

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhoneNumber = (phone) => {
    // Indian phone number validation: +91 followed by 10 digits or just 10 digits
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    return phoneRegex.test(phone.replace(/[\s\-]/g, ''))
  }

  // Debounced email availability check
  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) return
    
    try {
      const role = activeTab === 0 ? 'applicant' : 'recruiter'
      const response = await authAPI.checkAvailability('email', email, role)
      
      if (!response.data.available) {
        setEmailError(true)
        setEmailErrorMessage('This email is already registered. Try logging in instead.')
      } else {
        setEmailError(false)
        setEmailErrorMessage('')
      }
    } catch (error) {
      console.error('Email availability check failed:', error)
      // Don't show error for availability check failures
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Real-time validation
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError(true)
      } else {
        setEmailError(false)
        setEmailErrorMessage('') // Clear error message
        // Reset verification status if email changes
        if (emailVerified) {
          setEmailVerified(false)
          setEmailOTPSent(false)
        }
      }
    }

    if (name === 'phone') {
      if (value && !validatePhoneNumber(value)) {
        setPhoneError(true)
      } else {
        setPhoneError(false)
        setPhoneErrorMessage('') // Clear error message
        // Reset verification status if phone changes
        if (phoneVerified) {
          setPhoneVerified(false)
          setPhoneOTPSent(false)
        }
      }
    }

    // Check password strength when password changes
    if (name === 'password') {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[@$!%*?&]/.test(value),
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value)
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
        description: "Please fill in all required fields including phone number",
        variant: "destructive"
      })
      return
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }

    // Validate phone format
    if (!validatePhoneNumber(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid Indian phone number",
        variant: "destructive"
      })
      return
    }

    // Both email and phone verification are now optional
    // Users can register without verification and verify later

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
      phone: formData.phone,
      password: formData.password,
      role: activeTab === 0 ? 'applicant' : 'recruiter',
      emailVerified: emailVerified,
      phoneVerified: phoneVerified,
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
        
        // Handle field-specific errors
        if (result.field === 'email') {
          setEmailError(true)
          setEmailErrorMessage(result.error)
        } else if (result.field === 'phone') {
          setPhoneError(true)
          setPhoneErrorMessage(result.error)
        } else {
          // Check if it's a duplicate account error
          if (result.error && result.error.includes('already exists')) {
            toast({
              title: "Account Already Exists",
              description: `${result.error}. Please try logging in instead.`,
              variant: "destructive",
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/login')}
                >
                  Go to Login
                </Button>
              )
            })
          } else {
            // General error
            toast({
              title: "Registration Failed",
              description: result.error || "Failed to create account",
              variant: "destructive"
            })
          }
        }
      } else {
        // Registration successful
        console.log('Registration successful:', result)
        
        // Show success message with username if available
        const username = result.data?.user?.username
        const usernameInfo = result.data?.usernameGeneration
        
        let successMessage = "Account created successfully!"
        if (username) {
          successMessage += ` Your username is: ${username}`
          if (usernameInfo?.method === 'numbered') {
            successMessage += " (auto-generated)"
          }
        }
        
        toast({
          title: "Welcome to FinAutoJobs!",
          description: successMessage,
          variant: "default"
        })
        
        // The AuthContext will handle redirection based on role
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

  // OTP verification functions
  const handleSendEmailOTP = async () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('🔄 Sending OTP to:', formData.email)
      
      // Set loading state
      const result = await sendEmailOTP(formData.email)
      console.log('📧 OTP Result:', result)
      
      if (result.success || result.mockOTP) {
        console.log('✅ OTP Success - Setting states')
        setEmailOTPSent(true)
        setShowEmailOTP(true)
        console.log('✅ States set - emailOTPSent: true, showEmailOTP: true')
        
        // Force re-render
        setTimeout(() => {
          console.log('🔄 Force re-render check - showEmailOTP:', showEmailOTP)
        }, 100)
        
        toast({
          title: "Success",
          description: result.mockOTP ? "OTP generated for testing (check console)" : "OTP sent to your email address",
          variant: "default"
        })
      } else {
        console.log('❌ OTP Failed:', result.error)
        // For testing purposes, let's open the panel anyway with a test OTP
        console.log('🧪 Opening OTP panel for testing purposes')
        setEmailOTPSent(true)
        setShowEmailOTP(true)
        
        toast({
          title: "Testing Mode",
          description: "OTP panel opened for testing. Use OTP: 512589",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Email OTP error:', error)
      
      // For testing, open the panel anyway
      console.log('🧪 Error fallback - Opening OTP panel for testing')
      setEmailOTPSent(true)
      setShowEmailOTP(true)
      
      toast({
        title: "Testing Mode",
        description: "Failed to send OTP",
        variant: "destructive"
      })
    }
  }

  const handleSendPhoneOTP = async () => {
    if (!formData.phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      })
      return
    }

    if (!validatePhoneNumber(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid Indian phone number (e.g., +91 9876543210)",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await sendSMSOTP(formData.phone)
      if (result.success) {
        setPhoneOTPSent(true)
        setShowPhoneOTP(true)
        toast({
          title: "Success",
          description: "OTP sent to your phone number",
          variant: "default"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send SMS OTP",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Phone OTP error:', error)
      toast({
        title: "Error",
        description: "Failed to send SMS OTP",
        variant: "destructive"
      })
    }
  }

  const handleEmailOTPVerification = async (data) => {
    try {
      setEmailVerified(true)
      setShowEmailOTP(false)
      setFormData(prev => ({ ...prev, emailVerified: true }))
      toast({
        title: "Success",
        description: "Email verified successfully",
        variant: "default"
      })
    } catch (error) {
      console.error('Email OTP verification error:', error)
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive"
      })
    }
  }

  const handlePhoneOTPVerification = async (data) => {
    try {
      setPhoneVerified(true)
      setShowPhoneOTP(false)
      setFormData(prev => ({ ...prev, phoneVerified: true }))
      toast({
        title: "Success",
        description: "Phone number verified successfully",
        variant: "default"
      })
    } catch (error) {
      console.error('Phone OTP verification error:', error)
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive"
      })
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleOAuthSuccess = (authResult) => {
    // Handle successful OAuth authentication
    console.log('OAuth success:', authResult)
    toast({
      title: "Registration Successful",
      description: `Successfully registered with ${authResult.provider}!`,
      variant: "default"
    })
    
    // The OAuthButton component already shows success toast
    // Redirect based on user role
    const role = authResult.user.role || (activeTab === 0 ? 'applicant' : 'recruiter')
    if (role === 'recruiter' || role === 'employer') {
      setLocation('/recruiter-dashboard')
    } else {
      setLocation('/applicant-dashboard')
    }
  }

  const handleOAuthError = (error) => {
    // Handle OAuth authentication error
    console.error('OAuth error:', error)
    toast({
      title: "Registration Failed",
      description: error.message || "Failed to register with OAuth provider",
      variant: "destructive"
    })
  }

  const handleGenerateUsername = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Please enter your first and last name first",
        variant: "destructive"
      })
      return
    }

    try {
      const role = activeTab === 0 ? 'applicant' : 'recruiter'
      const response = await authAPI.generateUsername(
        formData.firstName,
        formData.lastName,
        role
      )

      const result = response.data

      if (result.success) {
        setFormData({
          ...formData,
          username: result.data.recommended
        })
        
        toast({
          title: "Username Generated",
          description: `Generated "${result.data.recommended}" using ${result.data.pattern} pattern`,
          variant: "default"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: result.message || "Failed to generate username",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Username generation error:', error)
      toast({
        title: "Error",
        description: "Failed to generate username. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <>
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

                {/* Username Field - Optional with Auto-Generation */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    name="username"
                    label="Username (Optional)"
                    value={formData.username}
                    onChange={handleChange}
                    helperText={formData.username ? "Username will be validated" : "Leave empty to auto-generate based on your name"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={handleGenerateUsername}
                            disabled={!formData.firstName || !formData.lastName}
                            sx={{ 
                              minWidth: 'auto',
                              px: 1,
                              fontSize: '0.75rem'
                            }}
                          >
                            Generate
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {formData.username && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      💡 Tip: Username will be auto-generated if left empty
                    </Typography>
                  )}
                </Box>

                  {/* Email Field with Verification */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email Address *"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        error={emailError}
                        helperText={emailErrorMessage || (emailError ? "Please enter a valid email address" : "Email is required • Verification is optional")}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: emailVerified ? (
                            <InputAdornment position="end">
                              <CheckCircle color="success" />
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="medium"
                        onClick={handleSendEmailOTP}
                        disabled={!formData.email || emailVerified || emailOTPSent || emailError}
                        startIcon={<Email />}
                        sx={{ 
                          minWidth: 140,
                          height: 56, // Match TextField height
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {emailVerified ? 'Verified' : emailOTPSent ? 'OTP Sent' : 'Verify (Optional)'}
                      </Button>
                      {!emailVerified && !emailOTPSent && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            toast({
                              title: "Email Verification Skipped",
                              description: "You can verify your email later in your profile settings",
                              variant: "default"
                            })
                          }}
                          sx={{ 
                            fontSize: '0.75rem',
                            minHeight: 'auto',
                            py: 0.5,
                            ml: 1
                          }}
                        >
                          Skip for now
                        </Button>
                      )}
                    </Box>
                    {emailVerified ? (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label="Email Verified"
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                        />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        📧 Email verification is optional but recommended for account recovery and notifications
                      </Typography>
                    )}
                  </Box>

                {/* Phone Number Field with Verification */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone Number *"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 9876543210"
                      error={phoneError}
                      helperText={phoneErrorMessage || (phoneError ? "Please enter a valid Indian phone number (e.g., +91 9876543210)" : "Phone number is required • Verification is optional")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: phoneVerified ? (
                          <InputAdornment position="end">
                            <CheckCircle color="success" />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="medium"
                        onClick={handleSendPhoneOTP}
                        disabled={!formData.phone || phoneVerified || phoneOTPSent || phoneError}
                        startIcon={<Phone />}
                        sx={{ 
                          minWidth: 140,
                          height: 56, // Match TextField height
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {phoneVerified ? 'Verified' : phoneOTPSent ? 'OTP Sent' : 'Verify (Optional)'}
                      </Button>
                      {!phoneVerified && !phoneOTPSent && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            toast({
                              title: "Phone Verification Skipped",
                              description: "You can verify your phone number later in your profile settings",
                              variant: "default"
                            })
                          }}
                          sx={{ 
                            fontSize: '0.75rem',
                            minHeight: 'auto',
                            py: 0.5
                          }}
                        >
                          Skip for now
                        </Button>
                      )}
                    </Box>
                  </Box>
                  {phoneVerified ? (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label="Phone Verified"
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      📱 Phone verification is optional but recommended for enhanced security and account recovery
                    </Typography>
                  )}
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
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 'medium' }}>
                          Password Requirements:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {passwordStrength.hasMinLength ? (
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                              <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" color={passwordStrength.hasMinLength ? 'success.main' : 'error.main'}>
                              At least 8 characters
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {passwordStrength.hasUppercase ? (
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                              <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" color={passwordStrength.hasUppercase ? 'success.main' : 'error.main'}>
                              One uppercase letter (A-Z)
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {passwordStrength.hasLowercase ? (
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                              <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" color={passwordStrength.hasLowercase ? 'success.main' : 'error.main'}>
                              One lowercase letter (a-z)
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {passwordStrength.hasNumber ? (
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                              <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" color={passwordStrength.hasNumber ? 'success.main' : 'error.main'}>
                              One number (0-9)
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {passwordStrength.hasSpecialChar ? (
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                              <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" color={passwordStrength.hasSpecialChar ? 'success.main' : 'error.main'}>
                              One special character (@$!%*?&)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
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
                      error={!!(formData.confirmPassword && formData.password && formData.password !== formData.confirmPassword)}
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
                                    ? "primary"
                                    : "secondary"
                                  : "primary"
                              }
                              sx={{
                                color: formData.confirmPassword && formData.password
                                  ? formData.password === formData.confirmPassword
                                    ? "success.main"
                                    : "error.main"
                                  : "primary.main"
                              }}
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

                {/* Already have account message */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      Sign in here
                    </Link>
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or sign up with
                  </Typography>
                </Divider>

                <OAuthButtons
                  role={activeTab === 0 ? 'applicant' : 'recruiter'}
                  onSuccess={handleOAuthSuccess}
                  onError={handleOAuthError}
                />
              </Box>
            </CardContent>
          </StyledCard>
        </Container>
      </Box>
      </Box>

      {/* Email OTP Verification Dialog */}
      {console.log('🔍 Rendering Dialog - showEmailOTP:', showEmailOTP)}
      <Dialog open={showEmailOTP} onClose={() => setShowEmailOTP(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="primary" />
            <Typography variant="h6">Verify Email Address</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We've sent a 6-digit verification code to <strong>{formData.email}</strong>
          </Typography>
          <OTPVerification
            identifier={formData.email}
            type="email"
            onVerified={handleEmailOTPVerification}
            onResend={handleSendEmailOTP}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmailOTP(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Phone OTP Verification Dialog */}
      <Dialog open={showPhoneOTP} onClose={() => setShowPhoneOTP(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone color="primary" />
            <Typography variant="h6">Verify Phone Number</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We've sent a 6-digit verification code to <strong>{formData.phone}</strong>
          </Typography>
          <OTPVerification
            identifier={formData.phone}
            type="sms"
            onVerified={handlePhoneOTPVerification}
            onResend={handleSendPhoneOTP}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPhoneOTP(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RegisterPage
