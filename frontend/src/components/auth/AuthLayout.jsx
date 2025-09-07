import React from 'react'
import { Link } from 'wouter'
import { useTheme, useMediaQuery, Box, Container, Avatar, Typography, Grid } from '@mui/material'
import { Business, AccountBalance, DirectionsCar, TrendingUp, Security } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const BrandingSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    minHeight: 'auto'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.2)',
  },
}))

const FeatureCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
}))

const AuthLayout = ({
  children,
  title,
  subtitle,
  linkText,
  linkTo,
  linkLabel,
  showBranding = true,
  brandingWidth = '50%'
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding */}
      {!isMobile && showBranding && (
        <BrandingSection sx={{ width: brandingWidth, display: 'flex', alignItems: 'center', p: 6 }}>
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Business sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  FinAutoJobs
                </Typography>
                <Typography variant="h6" sx={{ color: 'primary.100' }}>
                  Premium Career Platform
                </Typography>
              </Box>
            </Box>

            {/* Main Heading */}
            <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Connect with Top Finance & Automotive Companies
            </Typography>
            <Typography variant="h6" sx={{ color: 'primary.100', mb: 6, lineHeight: 1.6 }}>
              Join thousands of professionals who've found their dream careers in finance and automotive industries.
            </Typography>

            {/* Features Grid */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <AccountBalance />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Finance Roles
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.100' }}>
                      Investment Banking, Fintech, Trading
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <DirectionsCar />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Automotive Jobs
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.100' }}>
                      Engineering, Design, Manufacturing
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Career Growth
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.100' }}>
                      Premium opportunities
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
              <Grid item xs={6}>
                <FeatureCard>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Security />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Trusted Platform
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.100' }}>
                      Verified companies only
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
            </Grid>

            {/* Stats */}
            <Grid container spacing={4}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    50K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Active Jobs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    25K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Companies
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    100K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.100' }}>
                    Professionals
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              right: 80,
              width: 128,
              height: 128,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 80,
              left: 80,
              width: 96,
              height: 96,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(30px)',
            }}
          />
        </BrandingSection>
      )}

      {/* Right Side - Form Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Container maxWidth="sm">
          {/* Mobile Logo */}
          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                }}
              >
                <Business sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          )}

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              {subtitle}
            </Typography>
            {linkText && linkTo && linkLabel && (
              <Typography variant="body2" color="text.secondary">
                {linkText}{' '}
                <Link to={linkTo} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                  {linkLabel}
                </Link>
              </Typography>
            )}
          </Box>

          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default AuthLayout