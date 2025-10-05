import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton
} from '@mui/material';
import {
  Phone,
  Sms,
  CheckCircle,
  Close,
  Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useToast } from '../ui/use-toast';

// Firebase imports (will be added when Firebase is configured)
// import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
// import { auth } from '../../config/firebase';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    minWidth: '400px',
    maxWidth: '500px',
    padding: theme.spacing(1),
  },
}));

const StepContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const PhoneInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    fontSize: '1.1rem',
    padding: theme.spacing(0.5),
  },
}));

const OTPInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    fontSize: '1.5rem',
    textAlign: 'center',
    letterSpacing: '0.5em',
    fontWeight: 'bold',
  },
  '& input': {
    textAlign: 'center',
  },
}));

const PhoneVerification = ({ 
  open, 
  onClose, 
  onSuccess, 
  onError,
  userRole = 'applicant',
  isRegistration = false 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const steps = [
    'Enter Phone Number', 
    'Verify OTP', 
    isRegistration ? 'Account Created' : 'Login Complete'
  ];

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Setup reCAPTCHA (placeholder for when Firebase is configured)
  const setupRecaptcha = () => {
    // This will be implemented when Firebase is configured
    console.log('Setting up reCAPTCHA...');
    // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    //   size: 'invisible',
    //   callback: (response) => {
    //     console.log('reCAPTCHA solved');
    //   }
    // }, auth);
  };

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format phone number to E.164 format
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber.replace(/^0+/, '')}`;

      // For testing, use demo mode
      if (process.env.NODE_ENV === 'development') {
        // Simulate OTP sending
        setTimeout(() => {
          setActiveStep(1);
          setCountdown(60);
          setLoading(false);
          toast({
            title: "OTP Sent!",
            description: `Verification code sent to ${formattedPhone}. Use 123456 for testing.`,
            variant: "default"
          });
        }, 2000);
        return;
      }

      // Real Firebase implementation (when configured)
      // setupRecaptcha();
      // const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      // setConfirmationResult(result);
      
      setActiveStep(1);
      setCountdown(60);
      
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${formattedPhone}`,
        variant: "default"
      });

    } catch (error) {
      console.error('OTP send failed:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
      
      toast({
        title: "Failed to Send OTP",
        description: error.message || 'Please check your phone number and try again.',
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For testing, accept 123456 as valid OTP
      if (process.env.NODE_ENV === 'development' && otpCode === '123456') {
        // Simulate successful verification
        const mockUser = {
          phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`,
          role: userRole,
          verified: true
        };

        setActiveStep(2);
        
        setTimeout(() => {
          onSuccess({
            user: mockUser,
            token: 'mock-jwt-token-for-development'
          });
          handleClose();
        }, 1500);

        toast({
          title: isRegistration ? "Account Created!" : "Phone Verified!",
          description: isRegistration 
            ? "Your account has been created and phone number verified." 
            : "Your phone number has been successfully verified.",
          variant: "default"
        });
        
        return;
      }

      // Real Firebase implementation (when configured)
      // const credential = await confirmationResult.confirm(otpCode);
      // const idToken = await credential.user.getIdToken();

      // Send to backend for verification
      const response = await fetch('/api/phone-auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: 'mock-token', // Replace with real idToken
          role: userRole,
          isRegistration: isRegistration
        })
      });

      const data = await response.json();

      if (data.success) {
        setActiveStep(2);
        
        setTimeout(() => {
          onSuccess(data);
          handleClose();
        }, 1500);

        toast({
          title: isRegistration ? "Registration Complete!" : "Login Successful!",
          description: isRegistration 
            ? "Your account has been created successfully with phone verification." 
            : "You have been logged in successfully.",
          variant: "default"
        });
      } else {
        throw new Error(data.message || 'Verification failed');
      }

    } catch (error) {
      console.error('OTP verification failed:', error);
      setError('Invalid OTP. Please check and try again.');
      
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please check the code and try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const resendOTP = () => {
    if (countdown > 0) return;
    
    setOtpCode('');
    setError('');
    sendOTP();
  };

  const handleClose = () => {
    setActiveStep(0);
    setPhoneNumber('');
    setOtpCode('');
    setError('');
    setCountdown(0);
    setConfirmationResult(null);
    onClose();
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9+]/g, '');
    setPhoneNumber(value);
    setError('');
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(value);
    setError('');
  };

  return (
    <>
      <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              {isRegistration ? 'Phone Registration' : 'Phone Verification'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Step 1: Enter Phone Number */}
          {activeStep === 0 && (
            <StepContent>
              <Phone sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Enter Your Phone Number
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {isRegistration 
                  ? "We'll create your account and send a verification code via SMS"
                  : "We'll send you a verification code via SMS"
                }
              </Typography>
              
              <PhoneInput
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+91 9876543210"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="caption" color="text.secondary">
                For testing, use any 10-digit number
              </Typography>
            </StepContent>
          )}

          {/* Step 2: Enter OTP */}
          {activeStep === 1 && (
            <StepContent>
              <Sms sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Enter Verification Code
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the 6-digit code sent to {phoneNumber}
              </Typography>
              
              <OTPInput
                fullWidth
                label="Enter OTP"
                value={otpCode}
                onChange={handleOTPChange}
                placeholder="123456"
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2 }}
              />
              
              <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  Didn't receive code?
                </Typography>
                <Button
                  size="small"
                  onClick={resendOTP}
                  disabled={countdown > 0 || loading}
                  startIcon={<Refresh />}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                </Button>
              </Box>
              
              {process.env.NODE_ENV === 'development' && (
                <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                  For testing, use: 123456
                </Typography>
              )}
            </StepContent>
          )}

          {/* Step 3: Success */}
          {activeStep === 2 && (
            <StepContent>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="success.main">
                Phone Verified Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your phone number has been verified. Redirecting...
              </Typography>
            </StepContent>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          {activeStep === 0 && (
            <>
              <Button onClick={handleClose} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={sendOTP}
                variant="contained"
                disabled={loading || !phoneNumber}
                startIcon={loading ? <CircularProgress size={20} /> : <Sms />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          )}

          {activeStep === 1 && (
            <>
              <Button onClick={() => setActiveStep(0)} color="inherit">
                Back
              </Button>
              <Button
                onClick={verifyOTP}
                variant="contained"
                disabled={loading || otpCode.length !== 6}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </>
          )}
        </DialogActions>
      </StyledDialog>

      {/* reCAPTCHA container (hidden) */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </>
  );
};

export default PhoneVerification;
