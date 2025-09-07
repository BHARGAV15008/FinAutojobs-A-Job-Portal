import React from 'react';
import { Grid, Box, useTheme, useMediaQuery } from '@mui/material';

const DashboardGrid = ({
  children,
  spacing = { xs: 2, sm: 2, md: 3 },
  columns = {
    xs: 1,    // Mobile
    sm: 2,    // Tablet
    md: 3,    // Desktop
    lg: 4,    // Large Desktop
  },
  padding = { xs: 2, sm: 3, md: 4 },
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Convert children to array
  const items = React.Children.toArray(children);

  // Calculate column widths based on breakpoints
  const getColumnWidth = (breakpoint) => {
    const cols = columns[breakpoint] || columns.xs;
    return 12 / cols;
  };

  return (
    <Box
      sx={{
        width: '100%',
        p: padding,
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <Grid
        container
        spacing={spacing}
        sx={{
          minHeight: '100%',
          width: '100%',
          margin: '0 auto'
        }}>
        {items.map((item, index) => (
          <Grid
            item
            key={index}
            xs={12}
            sm={getColumnWidth('sm')}
            md={getColumnWidth('md')}
            lg={getColumnWidth('lg')}
          >
            {item}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardGrid;
