import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MoreVert } from '@mui/icons-material';

const StyledCard = styled(MuiCard)(({ theme, variant, elevation }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  
  ...(variant === 'elevated' && {
    boxShadow: theme.shadows[4],
    '&:hover': {
      boxShadow: theme.shadows[8],
      transform: 'translateY(-2px)',
    },
  }),
  
  ...(variant === 'outlined' && {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: theme.shadows[2],
    },
  }),
  
  ...(variant === 'gradient' && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '& .MuiCardHeader-title': {
      color: 'white',
    },
    '& .MuiCardHeader-subheader': {
      color: 'rgba(255, 255, 255, 0.8)',
    },
  }),
}));

const Card = ({
  children,
  title,
  subtitle,
  variant = 'elevated',
  elevation = 1,
  actions,
  headerAction,
  className,
  onClick,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      elevation={elevation}
      className={className}
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            headerAction || (
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            )
          }
        />
      )}
      
      <CardContent>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default Card;
