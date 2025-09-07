import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Refresh,
  BugReport,
  Home,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true,
    });

    // Log error to analytics or error tracking service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  handleRefresh = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    
    // Trigger a page reload
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback } = this.props;
    const theme = useTheme();

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback({
          error,
          errorInfo,
          refresh: this.handleRefresh,
          goHome: this.handleGoHome,
        });
      }

      // Default error UI
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              bgcolor: 'background.default',
            }}
          >
            <Card sx={{ maxWidth: 600, width: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'error.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <BugReport sx={{ fontSize: 32, color: 'error.main' }} />
                </Box>

                <Typography variant="h4" gutterBottom sx={{ color: 'error.main' }}>
                  Oops! Something went wrong
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We're sorry, but something unexpected happened in the dashboard. 
                  Our team has been notified and we're working to fix it.
                </Typography>

                <Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle>Error Details</AlertTitle>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {error?.message || 'Unknown error occurred'}
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={this.handleRefresh}
                    fullWidth
                    size="large"
                  >
                    Refresh Dashboard
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Home />}
                    onClick={this.handleGoHome}
                    fullWidth
                  >
                    Go to Homepage
                  </Button>
                </Box>

                <Box sx={{ textAlign: 'left' }}>
                  <Button
                    onClick={this.toggleDetails}
                    endIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
                    size="small"
                  >
                    Technical Details
                  </Button>
                  
                  <Collapse in={showDetails}>
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Error Stack:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {error?.stack}
                      </Typography>
                      
                      {errorInfo && (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
                            Component Stack:
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {errorInfo.componentStack}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Collapse>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
                  If this problem persists, please contact our support team with the error details above.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </motion.div>
      );
    }

    return children;
  }
}

// Higher-order component for error boundary
export const withDashboardErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <DashboardErrorBoundary>
        <Component {...props} />
      </DashboardErrorBoundary>
    );
  };
};

export default DashboardErrorBoundary;
