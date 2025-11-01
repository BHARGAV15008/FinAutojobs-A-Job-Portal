import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLocation } from 'wouter';
import {
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
        role: 'admin' // Lowercase to match standardized database role
        // identifier is already in formData, no need to override
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

      <Box sx={{ 
        width: { xs: 'calc(100% - 16px)', sm: '400px', md: '500px', lg: '600px' }, 
        mx: 'auto', 
        px: { xs: 1, sm: 2, md: 3 }, 
        py: 6,
        maxWidth: '100vw'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
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
            
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Admin Portal
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              FinAutoJobs Administration
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Secure access for system administrators only
            </Typography>
          </Box>

          <StyledCard>
            <CardContent sx={{ p: 5 }}>
              {/* Security Notice */}
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: 2,
                  mb: 4,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Shield sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" color="warning.dark" fontWeight="500" sx={{ ml: 2 }}>
                    This is a restricted area. Unauthorized access is prohibited.
                  </Typography>
                </Box>
              </Paper>


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
                  sx={{ mb: 4 }}
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
                  sx={{ mb: 5 }}
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
                    py: 2.5,
                    mb: 4,
                    color: 'white',
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
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              © 2025 FinAutoJobs. All rights reserved.
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default AdminLoginPage;
