import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

const ResponsiveContainer = styled(Container)(({ theme }) => ({
  width: '100%',
  maxWidth: 'none !important',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: '1200px !important',
    margin: '0 auto',
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '1400px !important',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

const ResponsiveBox = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'visible',
  [theme.breakpoints.down('sm')]: {
    padding: 0,
  },
}));

const ResponsiveLayout = ({ 
  children, 
  maxWidth = 'lg', 
  disableGutters = false,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ResponsiveBox sx={sx} {...props}>
      <ResponsiveContainer
        maxWidth={maxWidth}
        disableGutters={disableGutters}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ...(isMobile && {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
          }),
          ...(isTablet && !isMobile && {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
          }),
        }}
      >
        {children}
      </ResponsiveContainer>
    </ResponsiveBox>
  );
};

// Responsive Grid wrapper
export const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  width: '100%',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
    gridTemplateColumns: '1fr',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  },
}));

// Responsive Card wrapper
export const ResponsiveCard = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
    '& .MuiCard-root': {
      borderRadius: theme.spacing(1.5),
      margin: theme.spacing(0.5, 0),
    },
  },
}));

// Responsive Stack wrapper
export const ResponsiveStack = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
}));

// Hook for responsive values
export const useResponsiveValue = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    spacing: isMobile ? 1 : isTablet ? 2 : 3,
    cardSpacing: isMobile ? 8 : 16,
    containerPadding: isMobile ? 8 : isTablet ? 16 : 24,
    buttonSize: isMobile ? 'small' : 'medium',
    avatarSize: isMobile ? 32 : 40,
    iconSize: isMobile ? 'small' : 'medium',
  };
};

export default ResponsiveLayout;
