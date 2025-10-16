import React from 'react';
import { Box, Fade, Slide, Grow } from '@mui/material';

const PageTransition = ({ 
  children, 
  type = 'fade', 
  direction = 'up', 
  timeout = 600,
  delay = 0 
}) => {
  const transitionProps = {
    in: true,
    timeout: timeout,
    style: { transitionDelay: `${delay}ms` }
  };

  const renderTransition = () => {
    switch (type) {
      case 'slide':
        return (
          <Slide {...transitionProps} direction={direction}>
            <Box>{children}</Box>
          </Slide>
        );
      case 'grow':
        return (
          <Grow {...transitionProps}>
            <Box>{children}</Box>
          </Grow>
        );
      case 'fade':
      default:
        return (
          <Fade {...transitionProps}>
            <Box>{children}</Box>
          </Fade>
        );
    }
  };

  return (
    <Box
      sx={{
        animation: 'pageEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes pageEnter': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {renderTransition()}
    </Box>
  );
};

export default PageTransition;
