import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

// Loading spinner component
export const LoadingSpinner = ({ 
  size = 40, 
  message = 'Loading...', 
  fullScreen = false,
  variant = 'circular' 
}) => {
  const content = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 2,
      ...(fullScreen && {
        minHeight: '50vh',
        justifyContent: 'center'
      })
    }}>
      {variant === 'circular' ? (
        <CircularProgress size={size} />
      ) : (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </Box>
      )}
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}>
        {content}
      </Box>
    );
  }

  return content;
};

// Skeleton loaders for different components
export const JobCardSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="60%" height={20} />
      </Box>
    </Box>
    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Skeleton variant="rounded" width={60} height={24} />
      <Skeleton variant="rounded" width={80} height={24} />
      <Skeleton variant="rounded" width={70} height={24} />
    </Box>
    <Skeleton variant="rectangular" height={36} />
  </Box>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            width={`${100 / columns}%`} 
            height={40} 
          />
        ))}
      </Box>
    ))}
  </Box>
);

export const ProfileSkeleton = () => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Skeleton variant="circular" width={120} height={120} sx={{ mr: 3 }} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" height={24} />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={100} height={24} />
        </Box>
      </Box>
    </Box>
    <Skeleton variant="rectangular" height={200} />
  </Box>
);

export default LoadingSpinner;