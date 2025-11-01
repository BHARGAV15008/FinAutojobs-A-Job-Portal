import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/IntegratedThemeContext';

const AdminLogin = () => {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'admin'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Redirect to admin dashboard
        setLocation('/admin/dashboard');
      } else {
        setError(result.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    <Box sx={{ 
      width: { xs: 'calc(100% - 16px)', sm: '400px', md: '500px', lg: '600px' }, 
      mx: 'auto', 
      px: { xs: 1, sm: 2, md: 3 }, 
      py: 8,
      maxWidth: '100vw'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <AdminPanelSettings 
                sx={{ 
                  fontSize: 60, 
                  color: 'primary.main',
                  mb: 2 
                }} 
              />
            </motion.div>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Admin Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              FinAutoJobs Administration Dashboard
            </Typography>
          </Box>

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

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Username"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="username"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
              startIcon={loading ? <CircularProgress size={20} /> : <AdminPanelSettings />}
            >
              {loading ? 'Signing In...' : 'Access Admin Portal'}
            </Button>
          </form>

          {/* Admin Credentials Info */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.dark">
              <strong>Admin Accounts Created:</strong><br/>
              • admin@finautojobs.com (admin123)<br/>
              • superadmin@finautojobs.com (superadmin123)<br/>
              • hr@finautojobs.com (hradmin123)<br/>
              • analytics@finautojobs.com (analytics123)
            </Typography>
          </Box>

          {/* Back to Main Site */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={() => setLocation('/')}
              sx={{ textTransform: 'none' }}
            >
              ← Back to Main Site
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AdminLogin;
