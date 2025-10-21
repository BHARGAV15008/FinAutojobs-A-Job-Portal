import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLocation } from 'wouter';
import { CircularProgress, Box, Paper, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Handle redirect in useEffect to avoid setState during render
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: 'background.default' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} />
        </motion.div>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Show loading while redirect is happening
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: 'background.default' }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Check role-based access
  const hasRequiredRole = () => {
    if (!requiredRole && !allowedRoles) return true;
    
    // User object should now be the direct user object from backend
    const userRole = user?.role;
    
    console.log('🔍 ProtectedRoute - User Object:', user);
    console.log('🔍 ProtectedRoute - User Role:', userRole);
    console.log('🔍 ProtectedRoute - Required:', requiredRole, 'Allowed:', allowedRoles);
    
    if (requiredRole && userRole === requiredRole) return true;
    if (allowedRoles && allowedRoles.includes(userRole)) return true;
    return false;
  };

  if (!hasRequiredRole()) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: 'background.default', p: 3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 400,
              borderRadius: 2
            }}
          >
            <Typography variant="h5" gutterBottom color="error">
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You don't have permission to access this page. 
              {requiredRole && ` This page requires ${requiredRole} role.`}
              {allowedRoles && ` This page requires one of: ${allowedRoles.join(', ')} roles.`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your current role: <strong>{user?.role}</strong>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  // Redirect to appropriate dashboard based on user role
                  const dashboardPath = user?.role === 'admin' 
                    ? '/admin-dashboard'
                    : user?.role === 'recruiter'
                    ? '/recruiter-dashboard'
                    : '/applicant-dashboard';
                  setLocation(dashboardPath);
                }}
              >
                Go to My Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => setLocation('/')}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
