import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLocation } from 'wouter';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Alert,
  Avatar,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Security,
  Shield,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const AdminLoginPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Admin login attempt:', { ...formData, password: '***' });
      // Add admin role to login credentials
      const adminCredentials = {
        ...formData,
        role: 'admin',
        identifier: formData.email // Backend expects 'identifier' field
      };
      const result = await login(adminCredentials);
      
      console.log('Admin login result:', result);
      
      if (result.success) {
        console.log('Admin login successful, redirecting to dashboard');
        // Redirect to admin dashboard
        setLocation('/admin-dashboard');
      } else {
        setError(result.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Invalid admin credentials. Please try again.');
    }

    setLoading(false);
  };

  // Pre-filled admin credentials for easy testing
  const fillAdminCredentials = (adminType) => {
    const credentials = {
      main: {
        identifier: 'admin@finautojobs.com',
        password: 'admin123'
      },
      super: {
        identifier: 'superadmin@finautojobs.com',
        password: 'superadmin123'
      },
      hr: {
        identifier: 'hr@finautojobs.com',
        password: 'hradmin123'
      },
      analytics: {
        identifier: 'analytics@finautojobs.com',
        password: 'analytics123'
      }
    };

    setFormData(prev => ({
      ...prev,
      ...credentials[adminType]
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 200,
          height: 200,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 150,
          height: 150,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(30px)',
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
            </motion.div>
            
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
              Admin Portal
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
              FinAutoJobs Administration
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Secure access for system administrators only
            </Typography>
          </Box>

          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              {/* Security Notice */}
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" color="warning.dark" fontWeight="500">
                    This is a restricted area. Unauthorized access is prohibited.
                  </Typography>
                </Box>
              </Paper>

              {/* Quick Login Buttons */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Quick Login (Development):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillAdminCredentials('main')}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Main Admin
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillAdminCredentials('super')}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Super Admin
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillAdminCredentials('hr')}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    HR Admin
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fillAdminCredentials('analytics')}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Analytics Admin
                  </Button>
                </Box>
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="identifier"
                  label="Admin Email or Username"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Admin Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 4 }}
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2,
                    mb: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  {loading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>

                {/* Admin Credentials Info */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="info.dark">
                    <strong>Admin Accounts Available:</strong><br/>
                    • admin@finautojobs.com (admin123)<br/>
                    • superadmin@finautojobs.com (superadmin123)<br/>
                    • hr@finautojobs.com (hradmin123)<br/>
                    • analytics@finautojobs.com (analytics123)
                  </Typography>
                </Paper>

                {/* Back to Main Site */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="text"
                    onClick={() => setLocation('/')}
                    sx={{ color: 'text.secondary' }}
                  >
                    ← Back to Main Site
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              © 2025 FinAutoJobs. All rights reserved.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AdminLoginPage;
