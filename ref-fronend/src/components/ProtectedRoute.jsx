import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Alert,
  Button,
} from '@mui/material';
import { Lock } from '@mui/icons-material';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You need to be logged in to access this page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setLocation('/login')}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Insufficient Permissions
          </Typography>
          <Typography variant="body2">
            You don't have the required permissions to access this page.
            Required role: {requiredRole}, Your role: {user?.role}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;