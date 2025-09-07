import React from 'react';
import { Grid } from '@mui/material';

const DashboardGrid = ({ children, spacing = 4, xs = 12, sm = 6, md = 4, lg, className = '' }) => {
  return (
    <Grid container spacing={spacing} className={className}>
      {React.Children.map(children, (child) => (
        <Grid item xs={xs} sm={sm} md={md} lg={lg || md}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardGrid;
