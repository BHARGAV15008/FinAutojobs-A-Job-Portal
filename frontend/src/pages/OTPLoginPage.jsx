import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import API_BASE_URL from '../services/apiConfig';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  Tabs, 
  Tab, 
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/use-toast';
import OTPVerification from '../components/auth/OTPVerification';

const OTPLoginPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0); // 0 = email, 1 = phone
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const steps = ['Enter Details', 'Verify OTP', 'Complete'];

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isEmail = activeTab === 0;
      const endpoint = isEmail ? 'otp/send' : 'send-otp-sms';
      const body = isEmail ? { email: identifier, purpose: 'login', userData: { firstName: 'User' } } : { phone: identifier };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        setActiveStep(1);
        toast({
          title: "OTP Sent",
          description: `Verification code sent to your ${isEmail ? 'email' : 'phone'}`,
          variant: "default"
        });
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      
      if (error.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerified = async (verificationData) => {
    setActiveStep(2);
    
    // For OTP login, we need to check if user exists and log them in
    // This is a simplified flow - in production, you might want to:
    // 1. Check if user exists with this email/phone
    // 2. Create a temporary session or JWT token
    // 3. Redirect to appropriate dashboard
    
    try {
      // For demo purposes, we'll simulate a successful login
      // In production, you'd have a separate endpoint for OTP-based login
      
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
        variant: "default"
      });

      // Simulate user data (in production, get this from your OTP login endpoint)
      const userData = {
        email: activeTab === 0 ? identifier : 'user@example.com',
        phone: activeTab === 1 ? identifier : null,
        firstName: 'User',
        lastName: 'Name',
        role: 'applicant' // Default role, should come from backend
      };

      // Redirect based on role (this would normally be handled by your auth context)
      setTimeout(() => {
        const dashboardPath = userData.role === 'recruiter' ? '/recruiter-dashboard' : '/applicant-dashboard';
        setLocation(dashboardPath);
      }, 2000);

    } catch (error) {
      console.error('Login completion error:', error);
      setError('Failed to complete login. Please try again.');
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
    setIdentifier('');
    setError('');
  };

  return (
    <Box sx={{ maxWidth: '320px', width: '100%', mx: 'auto', px: 2, py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            OTP Login
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Secure login with one-time password
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

        {/* Step 1: Enter Email/Phone */}
        {activeStep === 0 && (
          <Box>
            {/* Tab Selection */}
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

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Input Form */}
            <Box component="form" onSubmit={handleSendOTP}>
              <TextField
                fullWidth
                label={activeTab === 0 ? "Email Address" : "Phone Number"}
                type={activeTab === 0 ? "email" : "tel"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeTab === 0 ? "Enter your email" : "Enter your phone number"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {activeTab === 0 ? <EmailIcon /> : <PhoneIcon />}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </Box>

            {/* Links */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Prefer password login?{' '}
                <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Sign in with password
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Sign up here
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
              identifier={identifier}
              type={activeTab === 0 ? 'email' : 'sms'}
              onVerified={handleOTPVerified}
              onCancel={handleBack}
              title="Verify Your Identity"
              subtitle={`Enter the 6-digit code sent to your ${activeTab === 0 ? 'email' : 'phone'}`}
            />
          </Box>
        )}

        {/* Step 3: Success */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="success.main">
              Login Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! You will be redirected to your dashboard shortly.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OTPLoginPage;
