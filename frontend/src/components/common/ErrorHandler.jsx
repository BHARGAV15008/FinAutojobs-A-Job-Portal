import React from 'react';
import { Alert, AlertTitle, Box, Button, Collapse, Typography } from '@mui/material';
import { ExpandMore, ExpandLess, Refresh, Report } from '@mui/icons-material';

const ErrorHandler = ({ 
  error, 
  onRetry, 
  onReport,
  showDetails = false,
  variant = 'standard',
  severity = 'error'
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!error) return null;

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  const getErrorDetails = (error) => {
    if (typeof error === 'string') return null;
    return {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      stack: error?.stack,
      url: error?.config?.url,
      method: error?.config?.method,
    };
  };

  const errorMessage = getErrorMessage(error);
  const errorDetails = getErrorDetails(error);

  return (
    <Alert 
      severity={severity}
      variant={variant}
      action={
        <Box display="flex" gap={1}>
          {onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {onReport && (
            <Button
              color="inherit"
              size="small"
              startIcon={<Report />}
              onClick={() => onReport(error)}
            >
              Report
            </Button>
          )}
          {showDetails && errorDetails && (
            <Button
              color="inherit"
              size="small"
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setExpanded(!expanded)}
            >
              Details
            </Button>
          )}
        </Box>
      }
    >
      <AlertTitle>Error</AlertTitle>
      {errorMessage}
      
      {showDetails && errorDetails && (
        <Collapse in={expanded}>
          <Box mt={2} p={2} bgcolor="rgba(0,0,0,0.05)" borderRadius={1}>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
              {errorDetails.status && (
                <div>Status: {errorDetails.status} {errorDetails.statusText}</div>
              )}
              {errorDetails.method && errorDetails.url && (
                <div>Request: {errorDetails.method.toUpperCase()} {errorDetails.url}</div>
              )}
              {errorDetails.stack && (
                <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                  {errorDetails.stack}
                </div>
              )}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Alert>
  );
};

export default ErrorHandler;
