import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useLocation } from 'wouter';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = [], 
  fallback = null 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Authenticating...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Check role-based access
  const allowedRoles = requiredRoles.length > 0 ? requiredRoles : [requiredRole].filter(Boolean);
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return fallback || (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Lock sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required role: {allowedRoles.join(' or ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your role: {user?.role}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

// Higher-order component for route protection
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific role-based route components
export const ApplicantRoute = ({ children }) => (
  <ProtectedRoute requiredRole="jobseeker">
    {children}
  </ProtectedRoute>
);

export const RecruiterRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['recruiter', 'employer']}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
