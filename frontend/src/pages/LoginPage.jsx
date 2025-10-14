import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/use-toast'
import OAuthButtons from '../components/auth/OAuthButtons'
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

const LoginPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')

  const { login } = useAuth()
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  }

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.username.trim()) {
      newErrors.username = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    // STRICT ROLE-BASED LOGIN: Role is now REQUIRED based on tab selection
    const requiredRole = activeTab === 0 ? 'applicant' : 'recruiter';
    
    const loginData = {
      identifier: formData.username, // Backend expects 'identifier' field for email/username/phone
      password: formData.password,
      role: requiredRole // Always include role based on selected tab
    };
    
    const result = await login(loginData);
    
    if (!result.success) {
      setLoginError(result.error || result.message || 'Login failed');
      toast({
        title: "Login Failed",
        description: result.error || result.message || 'Login failed',
        variant: "destructive"
      });
    } else {
      // Login successful - AuthContext will handle redirection
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default"
      });
    }

    setLoading(false);
  }


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleOAuthSuccess = (authResult) => {
    // Handle successful OAuth authentication
    console.log('OAuth success:', authResult)
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
    // The OAuthButton component already shows error toast
  }


  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding */}
      {!isMobile && (
        <BrandingSection sx={{ width: '50%', display: 'flex', alignItems: 'center', p: 6 }}>
          <Box sx={{ position: 'relative', zIndex: 1, width: 'auto' }}>
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Business sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                  FinAutoJobs
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Premium Career Platform
                </Typography>
              </Box>
            </Box>

            {/* Main Heading */}
            <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ mb: 3, color: 'white' }}>
              Connect with Top Finance & Automotive Companies
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 6, lineHeight: 1.6 }}>
              Join thousands of professionals who've found their dream careers in finance and automotive industries.
            </Typography>

            {/* Features Grid */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Calculate />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                      Finance Roles
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Investment Banking, Fintech, Trading
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <DirectionsCar />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                      Automotive Jobs
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Engineering, Design, Manufacturing
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                      Career Growth
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Premium opportunities
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Security />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                      Trusted Platform
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Verified companies only
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
            </Grid>

            {/* Stats */}
            <Grid container spacing={4}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    50K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Active Jobs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    25K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Companies
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    100K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Professionals
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              right: 80,
              width: 128,
              height: 128,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 80,
              left: 80,
              width: 96,
              height: 96,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(30px)',
            }}
          />
        </BrandingSection>
      )}

      {/* Right Side - Login Form */}
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
        <Box sx={{ width: '100%', maxWidth: '320px' }}>
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
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Welcome Back! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Sign in to access premium job opportunities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                Create one here
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

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                {/* Login Error Alert */}
                {loginError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {loginError}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  name="username"
                  label="Email Address"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color={errors.username ? "error" : "primary"} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color={errors.password ? "error" : "primary"} />
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


                {/* Role-based login info */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {activeTab === 0 ? '👤 Applicant Login' : '💼 Recruiter/HR Login'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {activeTab === 0 
                      ? 'Login with your applicant account credentials' 
                      : 'Login with your recruiter/HR account credentials'
                    }
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Remember me"
                  />
                  <Button
                    component={Link}
                    to="/forgot-password"
                    variant="text"
                    color="primary"
                    size="small"
                  >
                    Forgot password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2,
                    mb: 3,
                    color: 'white',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 3 }} />

                <OAuthButtons
                  role={activeTab === 0 ? 'applicant' : 'recruiter'}
                  onSuccess={handleOAuthSuccess}
                  onError={handleOAuthError}
                />
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </Box>

    </Box>
  )
}

export default LoginPage