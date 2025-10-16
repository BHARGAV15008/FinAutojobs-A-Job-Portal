import React, { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Google, Microsoft, Apple, LinkedIn } from '@mui/icons-material';
import API_BASE_URL from '../../services/apiConfig';

const OAuthButtons = ({ role = 'applicant', onSuccess, onError }) => {
    const [loading, setLoading] = useState({});
    const [error, setError] = useState('');

    const handleOAuthLogin = (provider) => {
        setLoading(prev => ({ ...prev, [provider]: true }));
        setError('');

        try {
            // Use test OAuth for development when real credentials are not available
            const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
            
            let oauthUrl;
            if (isDevelopment) {
                // Use test OAuth simulation for development
                oauthUrl = `${API_BASE_URL}/test-oauth/simulate/${provider}?role=${role}&scenario=new_user`;
            } else {
                // Use real OAuth for production
                oauthUrl = `${API_BASE_URL}/oauth/${provider}?role=${role}`;
            }
            
            // Store the intended role for after OAuth callback
            sessionStorage.setItem('oauth_role', role);
            
            // Redirect to OAuth provider
            window.location.href = oauthUrl;
            
        } catch (err) {
            const errorMessage = err.message || `Failed to initiate ${provider} OAuth`;
            setError(errorMessage);
            setLoading(prev => ({ ...prev, [provider]: false }));
            if (onError) {
                onError(errorMessage);
            }
        }
    };

    const oauthProviders = [
        {
            name: 'google',
            label: 'Continue with Google',
            icon: <Google />,
            color: '#4285f4',
            bgColor: '#ffffff',
            textColor: '#757575'
        },
        {
            name: 'microsoft',
            label: 'Continue with Microsoft',
            icon: <Microsoft />,
            color: '#00a1f1',
            bgColor: '#ffffff',
            textColor: '#323130'
        },
        {
            name: 'apple',
            label: 'Continue with Apple',
            icon: <Apple />,
            color: '#000000',
            bgColor: '#000000',
            textColor: '#ffffff'
        },
        {
            name: 'linkedin',
            label: 'Continue with LinkedIn',
            icon: <LinkedIn />,
            color: '#0077b5',
            bgColor: '#ffffff',
            textColor: '#0077b5'
        }
    ];

    const handleTestScenario = (provider, scenario) => {
        setLoading(prev => ({ ...prev, [`${provider}_${scenario}`]: true }));
        setError('');

        try {
            const oauthUrl = `${API_BASE_URL}/test-oauth/simulate/${provider}?role=${role}&scenario=${scenario}`;
            sessionStorage.setItem('oauth_role', role);
            window.location.href = oauthUrl;
        } catch (err) {
            const errorMessage = err.message || `Failed to test ${scenario} scenario`;
            setError(errorMessage);
            setLoading(prev => ({ ...prev, [`${provider}_${scenario}`]: false }));
            if (onError) {
                onError(errorMessage);
            }
        }
    };

    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2
            }}>
                {/* First row - Google and Microsoft */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5,
                    flexDirection: { xs: 'column', sm: 'row' }
                }}>
                    {oauthProviders.slice(0, 2).map((provider) => (
                        <Button
                            key={provider.name}
                            variant="outlined"
                            fullWidth
                            startIcon={loading[provider.name] ? <CircularProgress size={20} /> : provider.icon}
                            onClick={() => handleOAuthLogin(provider.name)}
                            disabled={loading[provider.name]}
                            sx={{
                                py: 1.5,
                                borderRadius: '8px',
                                borderColor: provider.color,
                                color: provider.textColor,
                                backgroundColor: provider.bgColor,
                                fontWeight: 500,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: provider.bgColor,
                                    opacity: 0.9,
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                },
                                '&:disabled': {
                                    opacity: 0.6,
                                    transform: 'none',
                                }
                            }}
                        >
                            {loading[provider.name] ? 'Authenticating...' : provider.label}
                        </Button>
                    ))}
                </Box>
                
                {/* Second row - Apple and LinkedIn */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5,
                    flexDirection: { xs: 'column', sm: 'row' }
                }}>
                    {oauthProviders.slice(2, 4).map((provider) => (
                        <Button
                            key={provider.name}
                            variant="outlined"
                            fullWidth
                            startIcon={loading[provider.name] ? <CircularProgress size={20} /> : provider.icon}
                            onClick={() => handleOAuthLogin(provider.name)}
                            disabled={loading[provider.name]}
                            sx={{
                                py: 1.5,
                                borderRadius: '8px',
                                borderColor: provider.color,
                                color: provider.textColor,
                                backgroundColor: provider.bgColor,
                                fontWeight: 500,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: provider.bgColor,
                                    opacity: 0.9,
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                },
                                '&:disabled': {
                                    opacity: 0.6,
                                    transform: 'none',
                                }
                            }}
                        >
                            {loading[provider.name] ? 'Authenticating...' : provider.label}
                        </Button>
                    ))}
                </Box>
            </Box>

            {/* Development Test Buttons removed for production */}

            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
        </Box>
    );
};

export default OAuthButtons;
