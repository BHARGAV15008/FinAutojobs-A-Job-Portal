import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import API_BASE_URL from '../services/apiConfig';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Tab,
  Tabs,
  InputAdornment,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Business as BusinessIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/use-toast';
import OTPVerification from '../components/auth/OTPVerification';

const OTPSignupPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0); // 0 = email, 1 = phone
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'applicant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const steps = ['Enter Details', 'Verify Contact', 'Complete'];

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Send OTP for verification
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    console.log('🚀 OTP Signup - Send OTP clicked');
    console.log('📝 Form data:', formData);
    console.log('📱 Active tab:', activeTab);
    
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      console.log('❌ Validation failed: Missing name');
      setError('Please enter your first and last name');
      return;
    }

    const identifier = activeTab === 0 ? formData.email : formData.phone;
    console.log('🔍 Identifier:', identifier);
    
    if (!identifier.trim()) {
      console.log('❌ Validation failed: Missing identifier');
      setError(`Please enter your ${activeTab === 0 ? 'email' : 'phone number'}`);
      return;
    }

    setLoading(true);
    setError('');
    console.log('📤 Sending OTP request...');

    try {
      const isEmail = activeTab === 0;
      const endpoint = isEmail ? 'send-otp-email' : 'send-otp-sms';
      const body = isEmail ? { email: identifier } : { phone: identifier };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('📨 API Response:', data);

      if (data.success) {
        console.log('✅ OTP sent successfully');
        setActiveStep(1);
        
        // Show success message
        try {
          toast({
            title: "OTP Sent",
            description: `Verification code sent to your ${isEmail ? 'email' : 'phone'}`,
            variant: "default"
          });
        } catch (toastError) {
          console.log('Toast error, using alert:', toastError);
        }
        
        // Always show alert for debugging
        alert(`✅ OTP sent successfully to your ${isEmail ? 'email' : 'phone'}! Check the backend console for the OTP code.`);
      } else {
        console.log('❌ OTP send failed:', data.message);
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.');
        alert('❌ Request timeout. Please check your connection and try again.');
      } else {
        setError(`Network error: ${error.message}. Please try again.`);
        alert(`❌ Network error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerified = async (verificationData) => {
    setActiveStep(2);
    
    try {
      // Create user account after OTP verification
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || 'user@example.com', // Fallback for phone signup
        phone: formData.phone,
        password: 'OTP_VERIFIED_' + Date.now(), // Temporary password for OTP signup
        role: formData.role,
        verifiedContact: activeTab === 0 ? 'email' : 'phone'
      };

      const result = await register(signupData);
      
      if (result.success) {
        toast({
          title: "Account Created",
          description: "Welcome to FinAutoJobs! Redirecting to your dashboard...",
          variant: "default"
        });

        // Redirect based on role
        setTimeout(() => {
          const dashboardPath = formData.role === 'recruiter' ? '/recruiter-dashboard' : '/applicant-dashboard';
          setLocation(dashboardPath);
        }, 2000);
      } else {
        setError('Failed to create account. Please try again.');
        setActiveStep(0);
      }

    } catch (error) {
      console.error('Signup completion error:', error);
      setError('Failed to complete signup. Please try again.');
      setActiveStep(0);
    }
  };

  // Go back to step 1
  const handleBack = () => {
    setActiveStep(0);
    setError('');
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const getIdentifier = () => {
    return activeTab === 0 ? formData.email : formData.phone;
  };

  // Direct test function for debugging
  const testDirectOTP = async () => {
    console.log('🧪 Testing direct OTP call');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      
      console.log('📡 Direct test response status:', response.status);
      const data = await response.json();
      console.log('📨 Direct test response data:', data);
      
      alert(`Direct test result: ${data.success ? 'SUCCESS' : 'FAILED'} - ${data.message}`);
    } catch (error) {
      console.error('❌ Direct test error:', error);
      alert(`Direct test error: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Account with OTP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Secure signup with phone or email verification
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Enter Details */}
        {activeStep === 0 && (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* User Details Form */}
            <Box component="form" onSubmit={handleSendOTP}>
              {/* Name Fields */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Box>

              {/* Role Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>I am a</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="I am a"
                >
                  <MenuItem value="applicant">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      Job Seeker
                    </Box>
                  </MenuItem>
                  <MenuItem value="recruiter">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ mr: 1 }} />
                      Employer / Recruiter
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Contact Method Selection */}
              <Typography variant="subtitle1" gutterBottom>
                Verify your contact information:
              </Typography>
              
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                centered 
                sx={{ mb: 3 }}
              >
                <Tab 
                  icon={<EmailIcon />} 
                  label="Email" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<PhoneIcon />} 
                  label="Phone" 
                  iconPosition="start"
                />
              </Tabs>

              {/* Contact Input */}
              {activeTab === 0 ? (
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                  required
                />
              ) : (
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                  required
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>

              {/* Debug buttons */}
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => {
                  console.log('🔍 Debug - Current form state:', {
                    formData,
                    activeTab,
                    identifier: activeTab === 0 ? formData.email : formData.phone,
                    loading,
                    error
                  });
                }}
                sx={{ mb: 1 }}
              >
                Debug Form State
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={testDirectOTP}
                sx={{ mb: 2 }}
              >
                Test Direct OTP Call
              </Button>
            </Box>

            {/* Links */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Prefer password signup?{' '}
                <Link to="/signup" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Create account with password
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Step 2: OTP Verification */}
        {activeStep === 1 && (
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              Back
            </Button>
            
            <OTPVerification
              identifier={getIdentifier()}
              type={activeTab === 0 ? 'email' : 'sms'}
              onVerified={handleOTPVerified}
              onCancel={handleBack}
              title="Verify Your Contact"
              subtitle={`Enter the 6-digit code sent to your ${activeTab === 0 ? 'email' : 'phone'}`}
            />
          </Box>
        )}

        {/* Step 3: Success */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="success.main">
              Account Created Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Welcome to FinAutoJobs, {formData.firstName}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will be redirected to your dashboard shortly.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default OTPSignupPage;
