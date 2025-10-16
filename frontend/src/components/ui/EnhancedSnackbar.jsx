import React from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle, 
  Slide, 
  Grow,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { Close, CheckCircle, Error, Warning, Info } from '@mui/icons-material';

const SlideTransition = (props) => {
  return <Slide {...props} direction="up" />;
};

const GrowTransition = (props) => {
  return <Grow {...props} />;
};

const EnhancedSnackbar = ({
  open,
  onClose,
  message,
  severity = 'info',
  title,
  duration = 6000,
  position = { vertical: 'bottom', horizontal: 'right' },
  transition = 'slide',
  showIcon = true,
  persistent = false,
  action
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
      default:
        return <Info />;
    }
  };

  const TransitionComponent = transition === 'grow' ? GrowTransition : SlideTransition;

  return (
    <Snackbar
      open={open}
      autoHideDuration={persistent ? null : duration}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={TransitionComponent}
      sx={{
        '& .MuiSnackbarContent-root': {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        }
      }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        icon={showIcon ? getIcon() : false}
        sx={{
          minWidth: 300,
          maxWidth: 500,
          backdropFilter: 'blur(20px)',
          background: severity === 'success' 
            ? 'rgba(76, 175, 80, 0.9)'
            : severity === 'error'
            ? 'rgba(244, 67, 54, 0.9)'
            : severity === 'warning'
            ? 'rgba(255, 152, 0, 0.9)'
            : 'rgba(33, 150, 243, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          animation: 'slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          '@keyframes slideInBounce': {
            '0%': {
              opacity: 0,
              transform: 'translateY(100px) scale(0.8)',
            },
            '60%': {
              opacity: 1,
              transform: 'translateY(-10px) scale(1.05)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
            },
          },
          '& .MuiAlert-icon': {
            color: 'white',
            fontSize: '1.5rem',
          },
          '& .MuiAlert-message': {
            padding: 0,
          },
          '& .MuiAlert-action': {
            color: 'white',
          }
        }}
        action={
          action || (
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )
        }
      >
        <Box>
          {title && (
            <AlertTitle sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              marginBottom: title ? 1 : 0
            }}>
              {title}
            </AlertTitle>
          )}
          <Typography variant="body2" sx={{ color: 'white' }}>
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default EnhancedSnackbar;
