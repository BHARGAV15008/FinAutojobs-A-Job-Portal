import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const SmoothLoader = ({ 
  loading = true, 
  message = "Loading...", 
  size = 40,
  color = "primary",
  fullScreen = false 
}) => {
  if (!loading) return null;

  const containerSx = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, rgba(227, 242, 253, 0.9) 0%, rgba(243, 229, 245, 0.9) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    flexDirection: 'column',
    gap: 3
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
    py: 4
  };

  return (
    <Fade in={loading} timeout={300}>
      <Box sx={containerSx}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={size} 
            color={color}
            sx={{
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: size * 0.6,
                height: size * 0.6,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    opacity: 0.8,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        </Box>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{
            fontWeight: 500,
            animation: 'fadeInOut 2s ease-in-out infinite',
            '@keyframes fadeInOut': {
              '0%, 100%': {
                opacity: 0.7,
              },
              '50%': {
                opacity: 1,
              },
            },
          }}
        >
          {message}
        </Typography>
        
        {fullScreen && (
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            mt: 1
          }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0)',
                    },
                    '40%': {
                      transform: 'scale(1)',
                    },
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default SmoothLoader;
