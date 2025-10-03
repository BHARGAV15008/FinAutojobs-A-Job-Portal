import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Container,
  Avatar
} from '@mui/material';
import {
  Google,
  Microsoft,
  Apple,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

const OAuthCallback = () => {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Processing authentication...');
  const [provider, setProvider] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const oauthProvider = urlParams.get('provider');
        const userRole = urlParams.get('role');
        const error = urlParams.get('error');
        const errorMessage = urlParams.get('message');

        setProvider(oauthProvider || '');
        setRole(userRole || '');

        if (error || errorMessage) {
          throw new Error(decodeURIComponent(errorMessage || error || 'OAuth authentication failed'));
        }

        if (!token) {
          throw new Error('No authentication token received');
        }

        // Store the token and authenticate user
        localStorage.setItem('token', token);
        
        // Verify token with backend and get user data
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to verify authentication token');
        }

        const userData = await response.json();
        
        if (!userData.success) {
          throw new Error(userData.message || 'Authentication verification failed');
        }

        // Update auth context
        const authResult = {
          success: true,
          data: {
            token,
            user: userData.data,
            provider: oauthProvider
          }
        };

        // Simulate login success
        await login(authResult, true); // true indicates OAuth login

        setStatus('success');
        setMessage(`Successfully authenticated with ${getProviderName(oauthProvider)}!`);

        // Show success toast
        toast({
          title: "Authentication Successful",
          description: `Welcome! You've been signed in with ${getProviderName(oauthProvider)}.`,
          variant: "default"
        });

        // Redirect to appropriate dashboard after 2 seconds
        setTimeout(() => {
          if (userRole === 'recruiter') {
            setLocation('/recruiter-dashboard');
          } else {
            setLocation('/applicant-dashboard');
          }
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');

        toast({
          title: "Authentication Failed",
          description: error.message || 'Failed to complete OAuth authentication',
          variant: "destructive"
        });
      }
    };

    handleOAuthCallback();
  }, [login, setLocation, toast]);

  const getProviderName = (provider) => {
    const names = {
      google: 'Google',
      microsoft: 'Microsoft',
      apple: 'Apple'
    };
    return names[provider] || provider;
  };

  const getProviderIcon = (provider) => {
    const icons = {
      google: Google,
      microsoft: Microsoft,
      apple: Apple
    };
    const IconComponent = icons[provider] || Google;
    return <IconComponent sx={{ fontSize: 40 }} />;
  };

  const getProviderColor = (provider) => {
    const colors = {
      google: '#4285F4',
      microsoft: '#00BCF2',
      apple: '#000000'
    };
    return colors[provider] || '#4285F4';
  };

  const handleRetry = () => {
    setLocation('/login');
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'background.paper',
            maxWidth: 400,
            width: '100%'
          }}
        >
          {/* Provider Icon */}
          {provider && (
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: getProviderColor(provider),
                mx: 'auto',
                mb: 3
              }}
            >
              {getProviderIcon(provider)}
            </Avatar>
          )}

          {/* Status Icon and Message */}
          {status === 'processing' && (
            <>
              <CircularProgress size={60} sx={{ mb: 3, color: getProviderColor(provider) }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Authenticating...
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 3 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom color="success.main">
                Authentication Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting to your dashboard...
              </Typography>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 3 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom color="error.main">
                Authentication Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {message}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleRetry}
                  color="primary"
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleGoHome}
                  color="inherit"
                >
                  Go Home
                </Button>
              </Box>
            </>
          )}

          {/* Additional Info */}
          {(status === 'processing' || status === 'success') && provider && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Provider: {getProviderName(provider)}
                {role && ` • Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default OAuthCallback;
