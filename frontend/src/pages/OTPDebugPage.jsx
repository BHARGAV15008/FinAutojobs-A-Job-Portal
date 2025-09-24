import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';

const OTPDebugPage = () => {
  const [email, setEmail] = useState('test@example.com');
  const [phone, setPhone] = useState('+1234567890');
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const sendEmailOTP = async () => {
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

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Email OTP sent successfully to ${email}. Check the backend console for the OTP code.`);
      } else {
        setError(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      setError(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendSMSOTP = async () => {
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

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ SMS OTP sent successfully to ${phone}. Check the backend console for the OTP code.`);
      } else {
        setError(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      setError(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier, 
          otp,
          type: identifier.includes('@') ? 'email' : 'sms'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ OTP verified successfully for ${identifier}!`);
      } else {
        setError(`❌ Verification failed: ${data.message}`);
      }
    } catch (error) {
      setError(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          🔧 OTP System Debug Tool
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Test the OTP functionality and see real-time results
        </Typography>

        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            📋 How to use:
          </Typography>
          <Typography variant="body2">
            1. Send an OTP using the buttons below<br/>
            2. Check the <strong>backend console</strong> for the OTP code (e.g., "📧 Email OTP for test@example.com: 123456")<br/>
            3. Copy the 6-digit code and verify it using the verification section
          </Typography>
        </Alert>

        {/* Results/Errors */}
        {result && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {result}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Send Email OTP */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📧 Send Email OTP
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                fullWidth
              />
              <Button
                variant="contained"
                onClick={sendEmailOTP}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Send SMS OTP */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📱 Send SMS OTP
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                fullWidth
                placeholder="+1234567890"
              />
              <Button
                variant="contained"
                onClick={sendSMSOTP}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Verify OTP */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✅ Verify OTP
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Email/Phone (Identifier)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                fullWidth
                placeholder="test@example.com or +1234567890"
              />
              <TextField
                label="OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 6 }}
                placeholder="123456"
                sx={{ minWidth: 120 }}
              />
            </Box>
            <Button
              variant="contained"
              color="success"
              onClick={verifyOTP}
              disabled={loading || !otp || otp.length !== 6}
              fullWidth
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </CardContent>
        </Card>

        {/* Backend Status */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            🔗 Backend Status:
          </Typography>
          <Typography variant="body2">
            Backend URL: http://localhost:5000<br/>
            OTP Endpoints: /api/auth/send-otp-email, /api/auth/send-otp-sms, /api/auth/verify-otp<br/>
            Console: Check backend terminal for OTP codes
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OTPDebugPage;
