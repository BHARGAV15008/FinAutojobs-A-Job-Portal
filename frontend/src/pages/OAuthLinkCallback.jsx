import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from '@mui/material';
import {
  Google,
  Microsoft,
  Apple,
  LinkedIn,
  CheckCircle,
  Error as ErrorIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../services/apiConfig';

const OAuthLinkCallback = () => {
  const [, setLocation] = useLocation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const providerIcons = {
    google: <Google />,
    microsoft: <Microsoft />,
    apple: <Apple />,
    linkedin: <LinkedIn />
  };

  const providerColors = {
    google: '#4285f4',
    microsoft: '#00a1f1',
    apple: '#000000',
    linkedin: '#0077b5'
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    const provider = urlParams.get('provider');
    const error = urlParams.get('error');

    if (error) {
      setError(decodeURIComponent(error));
      setLoading(false);
      return;
    }

    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setOauthData({ ...parsedData, provider });
        setLoading(false);
      } catch (err) {
        setError('Invalid OAuth data received');
        setLoading(false);
      }
    } else {
      setError('No OAuth data received');
      setLoading(false);
    }
  }, []);

  const handleLinkAccount = async () => {
    if (!oauthData || !user) return;

    setConfirming(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/link-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(oauthData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Update user context if needed
        if (updateUser) {
          updateUser({ ...user, linkedAccounts: [...(user.linkedAccounts || []), data.linkedAccount] });
        }
        
        // Redirect to settings after a delay
        setTimeout(() => {
          setLocation('/settings?tab=security');
        }, 2000);
      } else {
        setError(data.message || 'Failed to link account');
      }
    } catch (err) {
      setError('Network error occurred while linking account');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setLocation('/settings?tab=security');
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processing OAuth Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your authentication...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (success) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Account Linked Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your {oauthData?.provider} account has been linked to your profile.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to settings...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Card sx={{ maxWidth: 500, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <LinkIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Link Social Account
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              icon={<ErrorIcon />}
            >
              {error}
            </Alert>
          )}

          {oauthData && (
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Do you want to link this social account to your profile?
              </Typography>

              <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                <Box display="flex" alignItems="center">
                  <Avatar 
                    sx={{ 
                      bgcolor: providerColors[oauthData.provider],
                      color: 'white',
                      mr: 2 
                    }}
                  >
                    {providerIcons[oauthData.provider]}
                  </Avatar>
                  
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {oauthData.provider.charAt(0).toUpperCase() + oauthData.provider.slice(1)}
                      </Typography>
                      <Chip 
                        label="Verified" 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {oauthData.email}
                    </Typography>
                    
                    {(oauthData.firstName || oauthData.lastName) && (
                      <Typography variant="body2" color="text.secondary">
                        {oauthData.firstName} {oauthData.lastName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Card>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Linking this account will allow you to sign in using {oauthData.provider} 
                  in addition to your current authentication methods.
                </Typography>
              </Alert>

              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={confirming}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleLinkAccount}
                  disabled={confirming}
                  startIcon={confirming ? <CircularProgress size={16} /> : <LinkIcon />}
                  sx={{ 
                    bgcolor: providerColors[oauthData.provider],
                    '&:hover': { 
                      bgcolor: providerColors[oauthData.provider],
                      opacity: 0.9 
                    }
                  }}
                >
                  {confirming ? 'Linking...' : 'Link Account'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OAuthLinkCallback;
