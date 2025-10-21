import React, { useState, useEffect, useRef } from 'react';
// Fixed icon references - using Email, Phone, CheckCircle, Refresh
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Email, Phone, Refresh, CheckCircle } from '@mui/icons-material';
import { useToast } from '../ui/use-toast';
import { apiClient } from '../../api/apiClient';

const OTPVerification = ({ 
  identifier, 
  type = 'email', 
  onVerified, 
  onCancel,
  title = 'Verify OTP',
  subtitle = 'Enter the verification code sent to your email'
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newOtp.every(digit => digit !== '') && !loading) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    if (pastedData.length === 6) {
      handleVerifyOTP(pastedData);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/otp/verify', {
        email: identifier,
        otp: otpCode,
        purpose: 'registration'
      });

      const data = response.data;

      if (data.success) {
        setSuccess(true);
        toast({
          title: "Success",
          description: "OTP verified successfully!",
          variant: "default"
        });
        
        setTimeout(() => {
          onVerified?.(data.data);
        }, 1000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const endpoint = type === 'sms' ? 'send-otp-sms' : 'otp/send';
      const body = type === 'sms' ? { phone: identifier } : { email: identifier, purpose: 'registration', userData: { firstName: 'User' } };

      const response = await apiClient.post(`/${endpoint}`, body);

      const data = response.data;

      if (data.success) {
        setTimeLeft(300); // Reset timer
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        toast({
          title: "OTP Sent",
          description: `New verification code sent to your ${type}`,
          variant: "default"
        });
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400, mx: 'auto' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Verified Successfully!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your {type} has been verified. Redirecting...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {type === 'email' ? (
          <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        ) : (
          <Phone sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        )}
        
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>
        
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
          {identifier}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* OTP Input Fields */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
        {otp.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            inputProps={{
              maxLength: 1,
              style: { 
                textAlign: 'center', 
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }
            }}
            sx={{
              width: 48,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }
            }}
            disabled={loading}
          />
        ))}
      </Box>

      {/* Timer and Resend */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {timeLeft > 0 ? (
          <Typography variant="body2" color="text.secondary">
            Resend code in {formatTime(timeLeft)}
          </Typography>
        ) : (
          <Button
            variant="text"
            startIcon={resending ? <CircularProgress size={16} /> : <Refresh />}
            onClick={handleResendOTP}
            disabled={resending}
            sx={{ textTransform: 'none' }}
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </Button>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          fullWidth
          onClick={() => handleVerifyOTP()}
          disabled={loading || otp.some(digit => digit === '')}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        Didn't receive the code? Check your spam folder or try resending.
      </Typography>
    </Paper>
  );
};

export default OTPVerification;
