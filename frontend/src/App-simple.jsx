import React from 'react';
import { ThemeProvider, CssBaseline, Container, Typography, Box } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            FinAutoJobs
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Job Portal Dashboard System
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1">
              Application is loading successfully. Testing basic functionality...
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
