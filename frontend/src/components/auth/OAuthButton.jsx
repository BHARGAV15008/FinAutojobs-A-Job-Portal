import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { Google, Microsoft, Apple } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import OAuthPopup from './OAuthPopup';
import { useToast } from '../ui/use-toast';

const StyledOAuthButton = styled(Button)(({ theme, provider }) => {
  const colors = {
    google: {
      main: '#4285F4',
      hover: '#357ae8',
      bg: '#ffffff',
      border: '#dadce0',
    },
    microsoft: {
      main: '#00BCF2',
      hover: '#0099cc',
      bg: '#ffffff',
      border: '#dadce0',
    },
    apple: {
      main: '#000000',
      hover: '#333333',
      bg: '#ffffff',
      border: '#dadce0',
    },
  };

  const color = colors[provider] || colors.google;

  return {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    backgroundColor: color.bg,
    border: `1px solid ${color.border}`,
    color: color.main,
    fontWeight: 600,
    textTransform: 'none',
    minHeight: '48px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: color.main,
      color: 'white',
      borderColor: color.main,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[4],
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };
});

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
  transition: 'transform 0.2s ease-in-out',
}));

const OAuthButton = ({ 
  provider, 
  fullWidth = false, 
  size = 'medium',
  mode = 'login', // 'login' or 'signup'
  userRole = 'applicant',
  onSuccess,
  onError,
  disabled = false,
  children,
  ...props 
}) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getProviderInfo = () => {
    const providers = {
      google: {
        name: 'Google',
        icon: Google,
        color: '#4285F4',
      },
      microsoft: {
        name: 'Microsoft',
        icon: Microsoft,
        color: '#00BCF2',
      },
      apple: {
        name: 'Apple',
        icon: Apple,
        color: '#000000',
      },
    };
    return providers[provider] || providers.google;
  };

  const handleClick = () => {
    if (disabled || loading) return;
    
    // For production OAuth, redirect to backend OAuth endpoint
    if (process.env.NODE_ENV === 'production' || 
        import.meta.env.VITE_USE_REAL_OAUTH === 'true' || 
        process.env.REACT_APP_USE_REAL_OAUTH === 'true') {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 
                        process.env.REACT_APP_BACKEND_URL || 
                        'http://localhost:5000';
      const oauthUrl = `${backendUrl}/api/oauth/${provider}?role=${userRole}`;
      console.log('🔍 OAuth redirect:', oauthUrl);
      window.location.href = oauthUrl;
      return;
    }
    
    // For development, use popup simulation
    setPopupOpen(true);
  };

  const handleSuccess = (authResult) => {
    setLoading(false);
    setPopupOpen(false);
    
    toast({
      title: "Success!",
      description: `Successfully ${mode === 'login' ? 'signed in' : 'signed up'} with ${getProviderInfo().name}`,
      variant: "default"
    });

    if (onSuccess) {
      onSuccess(authResult);
    }
  };

  const handleError = (error) => {
    setLoading(false);
    setPopupOpen(false);
    
    toast({
      title: "Authentication Failed",
      description: error.message || `Failed to ${mode === 'login' ? 'sign in' : 'sign up'} with ${getProviderInfo().name}`,
      variant: "destructive"
    });

    if (onError) {
      onError(error);
    }
  };

  const handleClose = () => {
    setPopupOpen(false);
    setLoading(false);
  };

  const providerInfo = getProviderInfo();
  const ProviderIcon = providerInfo.icon;

  const buttonText = children || (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconWrapper>
        {loading ? (
          <CircularProgress size={20} sx={{ color: 'inherit' }} />
        ) : (
          <ProviderIcon sx={{ fontSize: 20 }} />
        )}
      </IconWrapper>
      <Typography variant="button" fontWeight="inherit">
        {mode === 'login' ? 'Sign in' : 'Sign up'} with {providerInfo.name}
      </Typography>
    </Box>
  );

  return (
    <>
      <StyledOAuthButton
        provider={provider}
        fullWidth={fullWidth}
        size={size}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {buttonText}
      </StyledOAuthButton>

      <OAuthPopup
        open={popupOpen}
        onClose={handleClose}
        provider={provider}
        mode={mode}
        userRole={userRole}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </>
  );
};

export default OAuthButton;
