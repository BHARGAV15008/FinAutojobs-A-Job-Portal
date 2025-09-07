import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

const DashboardLoading = ({ type = 'overview', userRole = 'applicant' }) => {
  const theme = useTheme();

  // Loading skeleton components
  const StatsCardSkeleton = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={60} />
      </CardContent>
    </Card>
  );

  const JobCardSkeleton = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width={80} height={24} />
          <Skeleton variant="rectangular" width={80} height={24} />
          <Skeleton variant="rectangular" width={80} height={24} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={40} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="rectangular" width={100} height={32} />
        </Box>
      </CardContent>
    </Card>
  );

  const ApplicationCardSkeleton = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={24} />
        </Box>
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </CardContent>
    </Card>
  );

  const ChartSkeleton = () => (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </CardContent>
    </Card>
  );

  const TableSkeleton = ({ rows = 5 }) => (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
        {Array.from({ length: rows }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={14} />
            </Box>
            <Skeleton variant="rectangular" width={60} height={20} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  // Loading layouts based on type and user role
  const renderLoadingLayout = () => {
    switch (type) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ p: 3 }}>
              {/* Welcome section skeleton */}
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>

              {/* Stats cards skeleton */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} sm={6} lg={3} key={item}>
                    <StatsCardSkeleton />
                  </Grid>
                ))}
              </Grid>

              {/* Charts skeleton */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <ChartSkeleton />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <ChartSkeleton />
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        );

      case 'jobs':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ p: 3 }}>
              {/* Header skeleton */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Skeleton variant="text" width="30%" height={28} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
                <Skeleton variant="rectangular" width={120} height={36} />
              </Box>

              {/* Search and filters skeleton */}
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="rectangular" width="100%" height={56} />
              </Box>

              {/* Jobs grid skeleton */}
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item xs={12} md={6} lg={4} key={item}>
                    <JobCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        );

      case 'applications':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ p: 3 }}>
              {/* Stats cards skeleton */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item}>
                    <StatsCardSkeleton />
                  </Grid>
                ))}
              </Grid>

              {/* Applications list skeleton */}
              <Box>
                {[1, 2, 3, 4, 5].map((item) => (
                  <ApplicationCardSkeleton key={item} />
                ))}
              </Box>
            </Box>
          </motion.div>
        );

      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Profile picture and basic info */}
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
                      <Skeleton variant="text" width="60%" height={24} sx={{ mx: 'auto', mb: 1 }} />
                      <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto', mb: 2 }} />
                      <Skeleton variant="rectangular" width={120} height={36} sx={{ mx: 'auto' }} />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Profile details */}
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 3 }} />
                      <Grid container spacing={2}>
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <Grid item xs={12} sm={6} key={item}>
                            <Skeleton variant="rectangular" width="100%" height={56} />
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ p: 3 }}>
              {/* Header skeleton */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Skeleton variant="text" width="30%" height={28} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
                <Skeleton variant="rectangular" width={120} height={36} />
              </Box>

              {/* Stats cards skeleton */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} sm={6} lg={3} key={item}>
                    <StatsCardSkeleton />
                  </Grid>
                ))}
              </Grid>

              {/* Charts skeleton */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <ChartSkeleton />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <ChartSkeleton />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <ChartSkeleton />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <ChartSkeleton />
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ p: 3 }}>
              {/* Header skeleton */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Skeleton variant="text" width="30%" height={28} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
                <Skeleton variant="rectangular" width={120} height={36} />
              </Box>

              <Grid container spacing={3}>
                {/* Settings sections skeleton */}
                <Grid item xs={12} lg={8}>
                  {[1, 2, 3, 4].map((item) => (
                    <Card key={item} sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Skeleton variant="text" width="40%" height={24} sx={{ ml: 2 }} />
                        </Box>
                        <Grid container spacing={2}>
                          {[1, 2, 3, 4].map((subItem) => (
                            <Grid item xs={12} sm={6} key={subItem}>
                              <Skeleton variant="rectangular" width="100%" height={56} />
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>

                {/* Account actions skeleton */}
                <Grid item xs={12} lg={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
                      <List>
                        {[1, 2, 3].map((item) => (
                          <Box key={item} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                            <Skeleton variant="text" width="60%" height={16} />
                          </Box>
                        ))}
                      </List>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={48} height={48} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Skeleton variant="text" width="50%" height={20} />
                          <Skeleton variant="text" width="30%" height={16} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rectangular" width={80} height={24} />
                        <Skeleton variant="rectangular" width={80} height={24} />
                        <Skeleton variant="rectangular" width={80} height={24} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item xs={12} md={6} key={item}>
                    <Card>
                      <CardContent>
                        <Skeleton variant="rectangular" width="100%" height={200} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        );
    }
  };

  return renderLoadingLayout();
};

export default DashboardLoading;
