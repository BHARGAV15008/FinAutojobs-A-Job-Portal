import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Verified, Refresh } from '@mui/icons-material';

const OTPVerification = ({
  open,
  onClose,
  onVerify,
  onResend,
  title,
  description,
  loading = false,
}) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [open, countdown]);

  useEffect(() => {
    if (open) {
      setOtp('');
      setError('');
      setCountdown(30);
      setCanResend(false);
    }
  }, [open]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await onVerify(otp);
      setError('');
    } catch (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      await onResend();
      setCountdown(30);
      setCanResend(false);
      setError('');
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Verified sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          {title || 'Verify OTP'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          {description || 'Please enter the 6-digit verification code sent to you.'}
        </Typography>

        <TextField
          fullWidth
          value={otp}
          onChange={handleOtpChange}
          placeholder="Enter 6-digit OTP"
          variant="outlined"
          sx={{
            mb: 2,
            '& input': {
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5rem',
            },
          }}
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Didn't receive the code?
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={handleResend}
            disabled={!canResend}
            startIcon={canResend ? <Refresh /> : undefined}
          >
            {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Cancel
        </Button>
        <Button
          onClick={handleVerify}
          variant="contained"
          fullWidth
          disabled={loading || otp.length !== 6}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OTPVerification;