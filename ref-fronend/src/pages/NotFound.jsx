import { Link } from 'wouter';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import {
  Home,
  Search,
  ArrowBack,
  ErrorOutline,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const AnimatedBox = styled(Box)(({ theme }) => ({
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' },
    '100%': { transform: 'translateY(0px)' },
  },
}));

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <AnimatedBox sx={{ mb: 4 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '8rem', md: '12rem' },
              fontWeight: 'bold',
              color: 'primary.main',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            404
          </Typography>
        </AnimatedBox>

        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          <ErrorOutline
            sx={{
              fontSize: 64,
              color: 'warning.main',
              mb: 2,
            }}
          />
          
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Oops! Page Not Found
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
            Don't worry, let's get you back on track!
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              startIcon={<Home />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Go Home
            </Button>
            
            <Button
              component={Link}
              href="/jobs"
              variant="outlined"
              size="large"
              startIcon={<Search />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Browse Jobs
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="text"
              size="large"
              startIcon={<ArrowBack />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Go Back
            </Button>
          </Stack>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              If you believe this is an error, please{' '}
              <Link
                to="/contact"
                style={{
                  color: 'inherit',
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                }}
              >
                contact our support team
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Popular Links */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>
            Popular Pages
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
          >
            {[
              { label: 'Find Jobs', path: '/jobs' },
              { label: 'Companies', path: '/companies' },
              { label: 'Resume Builder', path: '/resume' },
              { label: 'Salary Insights', path: '/salary-insights' },
              { label: 'About Us', path: '/about' },
              { label: 'Contact', path: '/contact' },
            ].map((link) => (
              <Button
                key={link.path}
                component={Link}
                href={link.path}
                variant="text"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;