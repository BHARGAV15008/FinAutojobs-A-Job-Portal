import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';

const SimpleOTPTest = () => {
  const [email, setEmail] = useState('test@example.com');
  const [phone, setPhone] = useState('+1234567890');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testEmailOTP = async () => {
    console.log('🚀 Testing Email OTP');
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📨 Response data:', data);

      if (data.success) {
        setResult(`✅ Email OTP sent successfully! Check backend console for OTP.`);
      } else {
        setError(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSMSOTP = async () => {
    console.log('🚀 Testing SMS OTP');
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📨 Response data:', data);

      if (data.success) {
        setResult(`✅ SMS OTP sent successfully! Check backend console for OTP.`);
      } else {
        setError(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Simple OTP Test
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Test OTP functionality without complex forms
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {result}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Email OTP
        </Typography>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={testEmailOTP}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Email OTP'}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test SMS OTP
        </Typography>
        <TextField
          fullWidth
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={testSMSOTP}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send SMS OTP'}
        </Button>
      </Box>
    </Container>
  );
};

export default SimpleOTPTest;
