import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 4,
        background: 'rgba(0, 0, 0, 0.05)',
        zIndex: 9999,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${scrollProgress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
          transition: 'width 0.1s ease-out',
          boxShadow: '0 0 10px rgba(33, 150, 243, 0.3)',
        }
      }}
    />
  );
};

export default ScrollProgress;
