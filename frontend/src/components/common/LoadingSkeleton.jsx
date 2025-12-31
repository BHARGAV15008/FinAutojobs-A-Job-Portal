import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

/**
 * Reusable loading skeleton components for different content types
 */

// Job card skeleton
export const JobCardSkeleton = () => (
  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="40%" height={24} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="70%" height={20} />
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      </Stack>
    </Stack>
  </Box>
);

// Application card skeleton
export const ApplicationCardSkeleton = () => (
  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="50%" height={24} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
      </Stack>
      <Skeleton variant="text" width="90%" height={20} />
      <Skeleton variant="text" width="70%" height={20} />
      <Skeleton variant="rectangular" width={100} height={28} sx={{ borderRadius: 1 }} />
    </Stack>
  </Box>
);

// Profile section skeleton
export const ProfileSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Skeleton variant="circular" width={120} height={120} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={36} />
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="50%" height={20} />
        </Box>
      </Stack>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      <Stack spacing={1}>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </Stack>
    </Stack>
  </Box>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Stack key={rowIndex} direction="row" spacing={2} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} height={24} />
        ))}
      </Stack>
    ))}
  </Box>
);

// List skeleton
export const ListSkeleton = ({ items = 3, Component = JobCardSkeleton }) => (
  <Stack spacing={2}>
    {Array.from({ length: items }).map((_, index) => (
      <Component key={index} />
    ))}
  </Stack>
);

export default {
  JobCardSkeleton,
  ApplicationCardSkeleton,
  ProfileSkeleton,
  TableSkeleton,
  ListSkeleton
};