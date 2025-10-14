import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Box,
  Typography,
  Alert,
  Button,
  Container,
  Avatar,
  Divider
} from '@mui/material';
import {
  Error as ErrorIcon,
  Home,
  Login,
  Refresh
} from '@mui/icons-material';

const OAuthError = () => {
  const [, setLocation] = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [provider, setProvider] = useState('');
  const [errorType, setErrorType] = useState('');
  const [existingRole, setExistingRole] = useState('');
  const [requestedRole, setRequestedRole] = useState('');

  useEffect(() => {
    // Get error details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const oauthProvider = urlParams.get('provider');
    const error = urlParams.get('error');
    const existing = urlParams.get('existingRole');
    const requested = urlParams.get('requestedRole');

    setErrorType(error || 'oauth_failed');
    setExistingRole(existing || '');
    setRequestedRole(requested || '');

    if (message) {
      setErrorMessage(decodeURIComponent(message));
    } else {
      setErrorMessage('An unknown error occurred during authentication');
    }

    if (oauthProvider) {
      setProvider(oauthProvider);
    }
  }, []);

  const handleRetryLogin = () => {
    setLocation('/login');
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  const handleTryAgain = () => {
    // Clear any stored auth data and retry
    localStorage.removeItem('token');
    sessionStorage.clear();
    setLocation('/login');
  };

  const handleLoginWithCorrectRole = () => {
    // Redirect to login page with the existing role
    if (existingRole === 'recruiter') {
      setLocation('/login?role=recruiter');
    } else {
      setLocation('/login?role=applicant');
    }
  };

  const handleRegisterWithDifferentEmail = () => {
    // Redirect to register page with the requested role
    if (requestedRole === 'recruiter') {
      setLocation('/register?role=recruiter');
    } else {
      setLocation('/register?role=applicant');
    }
  };

  const getProviderName = (provider) => {
    const names = {
      google: 'Google',
      microsoft: 'Microsoft',
      apple: 'Apple'
    };
    return names[provider] || 'OAuth Provider';
  };

  const getCommonSolutions = () => {
    return [
      'Make sure you have a stable internet connection',
      'Check if you have blocked pop-ups in your browser',
      'Ensure cookies are enabled for this site',
      'Try using a different browser or incognito mode',
      'Clear your browser cache and cookies',
      'Disable browser extensions that might interfere'
    ];
  };

  const getProviderSpecificSolutions = (provider) => {
    const solutions = {
      google: [
        'Make sure you\'re signed into your Google account',
        'Check if your Google account has 2-factor authentication enabled',
        'Verify that third-party app access is allowed in your Google account settings'
      ],
      microsoft: [
        'Ensure you\'re signed into your Microsoft account',
        'Check your Microsoft account security settings',
        'Verify that the app has permission to access your Microsoft account'
      ],
      apple: [
        'Make sure you\'re signed into your Apple ID',
        'Check if two-factor authentication is properly set up',
        'Verify that Sign in with Apple is enabled for third-party apps'
      ]
    };
    return solutions[provider] || [];
  };

  return (
    <Container maxWidth="md">
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
            maxWidth: 600,
            width: '100%'
          }}
        >
          {/* Error Icon */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'error.main',
              mx: 'auto',
              mb: 3
            }}
          >
            <ErrorIcon sx={{ fontSize: 40, color: 'white' }} />
          </Avatar>

          {/* Error Title */}
          <Typography variant="h4" fontWeight="bold" gutterBottom color="error.main">
            Authentication Failed
          </Typography>

          {/* Provider Info */}
          {provider && (
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Failed to sign in with {getProviderName(provider)}
            </Typography>
          )}

          {/* Error Message */}
          <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Error Details:
            </Typography>
            <Typography variant="body2">
              {errorMessage}
            </Typography>
          </Alert>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
            {errorType === 'email_role_conflict' ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<Login />}
                  onClick={handleLoginWithCorrectRole}
                  color="primary"
                  size="large"
                >
                  Login as {existingRole}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleRegisterWithDifferentEmail}
                  color="secondary"
                  size="large"
                >
                  Use Different Email
                </Button>
                <Button
                  variant="text"
                  startIcon={<Home />}
                  onClick={handleGoHome}
                  color="inherit"
                  size="large"
                >
                  Go Home
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleTryAgain}
                  color="primary"
                  size="large"
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Login />}
                  onClick={handleRetryLogin}
                  color="primary"
                  size="large"
                >
                  Back to Login
                </Button>
                <Button
                  variant="text"
                  startIcon={<Home />}
                  onClick={handleGoHome}
                  color="inherit"
                  size="large"
                >
                  Go Home
                </Button>
              </>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Troubleshooting Section */}
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Troubleshooting Tips
            </Typography>
            
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
              Common Solutions:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              {getCommonSolutions().map((solution, index) => (
                <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                  {solution}
                </Typography>
              ))}
            </Box>

            {provider && getProviderSpecificSolutions(provider).length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                  {getProviderName(provider)}-specific Solutions:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  {getProviderSpecificSolutions(provider).map((solution, index) => (
                    <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                      {solution}
                    </Typography>
                  ))}
                </Box>
              </>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Still having issues?</strong> You can also create an account using email and password, 
                or contact our support team for assistance.
              </Typography>
            </Alert>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default OAuthError;
