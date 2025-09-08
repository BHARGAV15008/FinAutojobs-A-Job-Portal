import React, { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Google, Microsoft, Apple } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const OAuthButtons = ({ onSuccess, onError }) => {
    const [loading, setLoading] = useState({});
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleOAuthLogin = async (provider) => {
        setLoading(prev => ({ ...prev, [provider]: true }));
        setError('');

        try {
            // Mock OAuth token for testing
            const mockToken = `mock-${provider}-token-${Date.now()}`;
            
            const response = await fetch(`http://localhost:5000/api/oauth/${provider}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: mockToken })
            });

            const data = await response.json();

            if (response.ok) {
                // Store the token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Update auth context
                if (login) {
                    login(data.user, data.token);
                }
                
                if (onSuccess) {
                    onSuccess(data);
                }
            } else {
                throw new Error(data.message || `${provider} OAuth failed`);
            }
        } catch (err) {
            const errorMessage = err.message || `Failed to authenticate with ${provider}`;
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setLoading(prev => ({ ...prev, [provider]: false }));
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
        }
    ];

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Or continue with
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {oauthProviders.map((provider) => (
                    <Button
                        key={provider.name}
                        variant="outlined"
                        fullWidth
                        startIcon={loading[provider.name] ? <CircularProgress size={20} /> : provider.icon}
                        onClick={() => handleOAuthLogin(provider.name)}
                        disabled={loading[provider.name]}
                        sx={{
                            py: 1.5,
                            borderColor: provider.color,
                            color: provider.textColor,
                            backgroundColor: provider.bgColor,
                            '&:hover': {
                                backgroundColor: provider.bgColor,
                                opacity: 0.9,
                            },
                            '&:disabled': {
                                opacity: 0.6,
                            }
                        }}
                    >
                        {loading[provider.name] ? 'Authenticating...' : provider.label}
                    </Button>
                ))}
            </Box>

            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
        </Box>
    );
};

export default OAuthButtons;
