import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

// Basic loading spinner
export const LoadingSpinner = ({ size = 40, message, fullScreen = false }) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={3}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return content;
};

// Page loading skeleton
export const PageSkeleton = () => (
  <Box p={3}>
    <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
    <Box display="flex" gap={2} mb={2}>
      <Skeleton variant="rectangular" width="30%" height={120} />
      <Skeleton variant="rectangular" width="30%" height={120} />
      <Skeleton variant="rectangular" width="30%" height={120} />
    </Box>
    <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="60%" height={20} />
  </Box>
);

// Table loading skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} display="flex" gap={2} mb={1}>
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

// Card loading skeleton
export const CardSkeleton = ({ count = 3 }) => (
  <Box display="flex" flexWrap="wrap" gap={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} width={{ xs: '100%', sm: '48%', md: '30%' }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} />
      </Box>
    ))}
  </Box>
);

// Dashboard loading skeleton
export const DashboardSkeleton = () => (
  <Box p={3}>
    {/* Header */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Skeleton variant="text" width="30%" height={40} />
      <Skeleton variant="rectangular" width={120} height={36} />
    </Box>

    {/* Stats cards */}
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap={2} mb={3}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" width="100%" height={120} />
      ))}
    </Box>

    {/* Main content */}
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={3}>
      <Box>
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Box>
      <Box>
        <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box flex={1}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

// Animated loading dots
export const LoadingDots = ({ size = 8, color = 'primary' }) => {
  const dotVariants = {
    start: { y: 0 },
    end: { y: -10 },
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          initial="start"
          animate="end"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.2,
          }}
        >
          <Box
            width={size}
            height={size}
            borderRadius="50%"
            bgcolor={`${color}.main`}
          />
        </motion.div>
      ))}
    </Box>
  );
};

// Progress bar with percentage
export const ProgressLoader = ({ progress, message }) => (
  <Box width="100%" p={2}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
      <Typography variant="body2">{message}</Typography>
      <Typography variant="body2" color="text.secondary">
        {Math.round(progress)}%
      </Typography>
    </Box>
    <Box
      width="100%"
      height={8}
      bgcolor="grey.200"
      borderRadius={4}
      overflow="hidden"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
        style={{
          height: '100%',
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          borderRadius: 4,
        }}
      />
    </Box>
  </Box>
);

export default LoadingSpinner;
