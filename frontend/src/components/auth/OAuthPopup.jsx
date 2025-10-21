import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Google,
  Microsoft,
  Apple,
  Close,
  AccountCircle,
  Email,
  Business,
  CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    minWidth: '400px',
    maxWidth: '500px',
  },
}));

const ProviderButton = styled(Button)(({ theme, provider }) => {
  const colors = {
    google: {
      main: '#4285F4',
      hover: '#357ae8',
      bg: '#f8f9ff',
    },
    microsoft: {
      main: '#00BCF2',
      hover: '#0099cc',
      bg: '#f0f9ff',
    },
    apple: {
      main: '#000000',
      hover: '#333333',
      bg: '#f5f5f5',
    },
  };

  const color = colors[provider] || colors.google;

  return {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1.5, 3),
    backgroundColor: color.bg,
    border: `2px solid ${color.main}`,
    color: color.main,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: color.main,
      color: 'white',
      borderColor: color.hover,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };
});

const AccountCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const OAuthPopup = ({ 
  open, 
  onClose, 
  provider, 
  onSuccess, 
  onError,
  mode = 'login', // 'login' or 'signup'
  userRole = 'applicant'
}) => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [step, setStep] = useState('provider'); // 'provider', 'accounts', 'processing'
  const [error, setError] = useState(null);

  // Mock accounts data - in real implementation, this would come from OAuth provider
  const mockAccounts = {
    google: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        verified: true,
      },
      {
        id: '2',
        name: 'John Work',
        email: 'john.doe@company.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        verified: true,
      },
    ],
    microsoft: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@outlook.com',
        avatar: 'https://graph.microsoft.com/v1.0/me/photo/$value',
        verified: true,
        organization: 'Microsoft Corp',
      },
      {
        id: '2',
        name: 'John Doe',
        email: 'john.doe@company.com',
        avatar: 'https://graph.microsoft.com/v1.0/me/photo/$value',
        verified: true,
        organization: 'Company Inc',
      },
    ],
    apple: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@icloud.com',
        avatar: null,
        verified: true,
      },
    ],
  };

  useEffect(() => {
    if (open && provider) {
      setStep('provider');
      setError(null);
      setSelectedAccount(null);
      // Simulate loading accounts
      setTimeout(() => {
        setAccounts(mockAccounts[provider] || []);
        if (mockAccounts[provider]?.length > 0) {
          setStep('accounts');
        }
      }, 1000);
    }
  }, [open, provider]);

  const getProviderInfo = () => {
    const providers = {
      google: {
        name: 'Google',
        icon: Google,
        color: '#4285F4',
        description: 'Sign in with your Google account',
      },
      microsoft: {
        name: 'Microsoft',
        icon: Microsoft,
        color: '#00BCF2',
        description: 'Sign in with your Microsoft account',
      },
      apple: {
        name: 'Apple',
        icon: Apple,
        color: '#000000',
        description: 'Sign in with your Apple ID',
      },
    };
    return providers[provider] || providers.google;
  };

  const handleAccountSelect = async (account) => {
    setSelectedAccount(account);
    setStep('processing');
    setLoading(true);
    setError(null);

    try {
      // Simulate OAuth authentication process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful authentication
      const authResult = {
        provider,
        account,
        token: 'mock-oauth-token',
        user: {
          id: account.id,
          name: account.name,
          email: account.email,
          avatar: account.avatar,
          role: userRole,
          provider,
          verified: account.verified,
        },
      };

      onSuccess(authResult);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setStep('accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep('provider');
  };

  const renderProviderStep = () => {
    const providerInfo = getProviderInfo();
    const ProviderIcon = providerInfo.icon;

    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: providerInfo.color,
            mx: 'auto',
            mb: 2,
          }}
        >
          <ProviderIcon sx={{ fontSize: 40, color: 'white' }} />
        </Avatar>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {mode === 'login' ? 'Sign in' : 'Sign up'} with {providerInfo.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {providerInfo.description}
        </Typography>
        <CircularProgress size={40} sx={{ color: providerInfo.color }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading your accounts...
        </Typography>
      </Box>
    );
  };

  const renderAccountsStep = () => {
    const providerInfo = getProviderInfo();

    return (
      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Choose an account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the account you want to use for {mode === 'login' ? 'signing in' : 'signing up'}
        </Typography>

        <List sx={{ p: 0 }}>
          {accounts.map((account, index) => (
            <React.Fragment key={account.id}>
              <ListItem sx={{ p: 0 }}>
                <AccountCard
                  sx={{ width: '100%' }}
                  onClick={() => handleAccountSelect(account)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={account.avatar}
                      sx={{ width: 48, height: 48 }}
                    >
                      <AccountCircle />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {account.name}
                        </Typography>
                        {account.verified && (
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {account.email}
                      </Typography>
                      {account.organization && (
                        <Chip
                          size="small"
                          label={account.organization}
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>
                </AccountCard>
              </ListItem>
              {index < accounts.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  };

  const renderProcessingStep = () => {
    const providerInfo = getProviderInfo();

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: providerInfo.color,
            mx: 'auto',
            mb: 2,
          }}
        >
          <Avatar
            src={selectedAccount?.avatar}
            sx={{ width: 48, height: 48 }}
          >
            <AccountCircle />
          </Avatar>
        </Avatar>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {mode === 'login' ? 'Signing you in...' : 'Creating your account...'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please wait while we authenticate with {providerInfo.name}
        </Typography>
        <CircularProgress size={40} sx={{ color: providerInfo.color }} />
      </Box>
    );
  };

  const providerInfo = getProviderInfo();

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: providerInfo.color }}>
            <providerInfo.icon sx={{ fontSize: 20, color: 'white' }} />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {providerInfo.name} Authentication
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 300 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'provider' && renderProviderStep()}
        {step === 'accounts' && renderAccountsStep()}
        {step === 'processing' && renderProcessingStep()}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {step === 'accounts' && (
          <>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleRetry} variant="outlined">
              Refresh Accounts
            </Button>
          </>
        )}
        {error && step !== 'processing' && (
          <Button onClick={handleRetry} variant="contained" color="primary">
            Try Again
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default OAuthPopup;
