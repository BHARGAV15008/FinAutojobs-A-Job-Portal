import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs those errors and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('🚨 Error Boundary caught an error:', error);
        console.error('📋 Error Info:', errorInfo);
        
        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
        
        this.setState({
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        
        // Optionally reload the page
        if (this.props.resetOnError) {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                        p: 3
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            maxWidth: 600,
                            textAlign: 'center',
                            borderTop: '4px solid',
                            borderColor: 'error.main'
                        }}
                    >
                        <ErrorIcon
                            sx={{
                                fontSize: 64,
                                color: 'error.main',
                                mb: 2
                            }}
                        />
                        
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            Oops! Something went wrong
                        </Typography>
                        
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {this.props.errorMessage || 
                             'An unexpected error occurred. Please try refreshing the page.'}
                        </Typography>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Box
                                sx={{
                                    mt: 3,
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    borderRadius: 1,
                                    textAlign: 'left',
                                    overflow: 'auto',
                                    maxHeight: 200
                                }}
                            >
                                <Typography variant="caption" component="pre" sx={{ m: 0 }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </Button>
                            
                            {this.props.showReset && (
                                <Button
                                    variant="outlined"
                                    onClick={this.handleReset}
                                >
                                    Try Again
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.defaultProps = {
    showReset: true,
    resetOnError: false
};

export default ErrorBoundary;
