import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

/**
 * Reusable error message component with retry functionality
 */
const ErrorMessage = ({ 
  error, 
  message, 
  onRetry, 
  severity = 'error',
  variant = 'filled',
  showIcon = true,
  dismissible = false,
  onDismiss,
  sx = {}
}) => {
  // Extract user-friendly message
  const errorMessage = message || error?.userMessage || error?.message || 'An error occurred';
  
  // Check if error has retry capability
  const canRetry = typeof onRetry === 'function';
  
  return (
    <Alert 
      severity={severity} 
      variant={variant}
      icon={showIcon ? <ErrorOutline /> : false}
      onClose={dismissible ? onDismiss : undefined}
      sx={{
        mb: 2,
        '& .MuiAlert-message': {
          width: '100%'
        },
        ...sx
      }}
    >
      <AlertTitle sx={{ fontWeight: 600 }}>
        {severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : 'Info'}
      </AlertTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          {errorMessage}
        </Box>
        {canRetry && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={onRetry}
            sx={{
              color: 'inherit',
              borderColor: 'currentColor',
              '&:hover': {
                borderColor: 'currentColor',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Retry
          </Button>
        )}
      </Box>
    </Alert>
  );
};

export default ErrorMessage;