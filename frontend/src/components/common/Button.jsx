import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant, size }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  minHeight: size === 'small' ? 32 : size === 'large' ? 48 : 40,
  padding: size === 'small' ? '4px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
  
  ...(variant === 'primary' && {
    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(45deg, #1565c0, #1976d2)',
      boxShadow: theme.shadows[4],
    },
  }),
  
  ...(variant === 'secondary' && {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.grey[300]}`,
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
      borderColor: theme.palette.grey[400],
    },
  }),
  
  ...(variant === 'danger' && {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
  
  ...(variant === 'success' && {
    backgroundColor: theme.palette.success.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  }),
}));

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'contained'}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={!loading ? endIcon : null}
      onClick={onClick}
      type={type}
      className={className}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
