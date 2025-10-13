import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Google,
  Microsoft,
  Apple,
  LinkedIn,
  Link as LinkIcon,
  LinkOff,
  Security,
  Verified,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import API_BASE_URL from '../../services/apiConfig';

const SocialAccountManager = () => {
  const { user, updateUser } = useAuth();
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkingProvider, setLinkingProvider] = useState(null);
  const [unlinkDialog, setUnlinkDialog] = useState({ open: false, provider: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const socialProviders = [
    {
      name: 'google',
      label: 'Google',
      icon: <Google />,
      color: '#4285f4',
      description: 'Link your Google account for easy sign-in'
    },
    {
      name: 'microsoft',
      label: 'Microsoft',
      icon: <Microsoft />,
      color: '#00a1f1',
      description: 'Connect with Microsoft for seamless integration'
    },
    {
      name: 'apple',
      label: 'Apple',
      icon: <Apple />,
      color: '#000000',
      description: 'Sign in with Apple ID for enhanced security'
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      icon: <LinkedIn />,
      color: '#0077b5',
      description: 'Import professional profile from LinkedIn'
    }
  ];

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/linked-accounts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data.linkedAccounts || []);
      }
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      setError('Failed to load linked accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (provider) => {
    try {
      setLinkingProvider(provider);
      setError('');
      
      // Store current user token for account linking
      sessionStorage.setItem('linking_account', 'true');
      sessionStorage.setItem('current_user_token', localStorage.getItem('token'));
      
      // Redirect to OAuth provider for linking
      const linkUrl = `${API_BASE_URL}/api/oauth/${provider}?action=link&role=${user.role}`;
      window.location.href = linkUrl;
      
    } catch (error) {
      setError(`Failed to link ${provider} account`);
      setLinkingProvider(null);
    }
  };

  const handleUnlinkAccount = async (provider) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/unlink-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ provider })
      });

      if (response.ok) {
        setLinkedAccounts(prev => prev.filter(acc => acc.provider !== provider));
        setSuccess(`${provider} account unlinked successfully`);
      } else {
        const data = await response.json();
        setError(data.message || `Failed to unlink ${provider} account`);
      }
    } catch (error) {
      setError(`Failed to unlink ${provider} account`);
    } finally {
      setUnlinkDialog({ open: false, provider: null });
    }
  };

  const isAccountLinked = (provider) => {
    return linkedAccounts.some(acc => acc.provider === provider);
  };

  const getLinkedAccountInfo = (provider) => {
    return linkedAccounts.find(acc => acc.provider === provider);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Security color="primary" sx={{ mr: 2 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Social Account Connections
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Link your social accounts for easier sign-in and enhanced profile information
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <List>
          {socialProviders.map((provider, index) => {
            const isLinked = isAccountLinked(provider.name);
            const accountInfo = getLinkedAccountInfo(provider.name);
            
            return (
              <React.Fragment key={provider.name}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: provider.color, color: 'white' }}>
                      {provider.icon}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {provider.label}
                        </Typography>
                        {isLinked && (
                          <Chip
                            icon={<Verified />}
                            label="Connected"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {provider.description}
                        </Typography>
                        {isLinked && accountInfo && (
                          <Typography variant="caption" color="text.secondary">
                            Connected as: {accountInfo.email || accountInfo.name}
                            {accountInfo.linkedAt && (
                              <> • Linked {new Date(accountInfo.linkedAt).toLocaleDateString()}</>
                            )}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    {isLinked ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<LinkOff />}
                        onClick={() => setUnlinkDialog({ open: true, provider: provider.name })}
                      >
                        Unlink
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={linkingProvider === provider.name ? <CircularProgress size={16} /> : <LinkIcon />}
                        onClick={() => handleLinkAccount(provider.name)}
                        disabled={linkingProvider === provider.name}
                        sx={{ bgcolor: provider.color, '&:hover': { bgcolor: provider.color, opacity: 0.9 } }}
                      >
                        {linkingProvider === provider.name ? 'Linking...' : 'Link'}
                      </Button>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < socialProviders.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>

        <Box mt={3} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid" borderColor="divider">
          <Box display="flex" alignItems="center" mb={1}>
            <Warning color="warning" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight="medium">
              Security Notice
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Linking social accounts allows you to sign in using those providers. 
            You can unlink accounts at any time. Your primary email and password will remain unchanged.
          </Typography>
        </Box>
      </CardContent>

      {/* Unlink Confirmation Dialog */}
      <Dialog
        open={unlinkDialog.open}
        onClose={() => setUnlinkDialog({ open: false, provider: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Unlink {unlinkDialog.provider} Account
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unlink your {unlinkDialog.provider} account? 
            You will no longer be able to sign in using this provider.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlinkDialog({ open: false, provider: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleUnlinkAccount(unlinkDialog.provider)}
            color="error"
            variant="contained"
          >
            Unlink Account
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SocialAccountManager;
