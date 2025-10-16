import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Paper,
  Button,
} from '@mui/material';
import {
  Business,
  TrendingUp,
  Group,
  Star,
  LinkedIn,
  Twitter,
  Email,
  WorkOutline,
  PeopleOutline,
  TrendingUpOutlined,
  SecurityOutlined,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)`,
  color: '#333333',
  padding: theme.spacing(12, 0),
  textAlign: 'center',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  height: '100%',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const TeamCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  height: '100%',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const AboutPage = () => {
  const stats = [
    { icon: PeopleOutline, label: 'Active Job Seekers', value: '150K+', color: 'primary' },
    { icon: Business, label: 'Registered Companies', value: '5K+', color: 'secondary' },
    { icon: WorkOutline, label: 'Jobs Posted Monthly', value: '25K+', color: 'success' },
    { icon: TrendingUpOutlined, label: 'Placement Success Rate', value: '87%', color: 'warning' },
  ];

  const team = [
    {
      name: 'Arjun Mehta',
      role: 'CEO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Former HDFC Bank executive with 12+ years in financial services and fintech innovation.',
      social: { linkedin: '#', twitter: '#', email: 'arjun@finautojobs.com' },
    },
    {
      name: 'Kavya Singh',
      role: 'CTO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'Ex-Microsoft engineer with expertise in AI-driven recruitment and scalable platforms.',
      social: { linkedin: '#', twitter: '#', email: 'kavya@finautojobs.com' },
    },
    {
      name: 'Rohit Sharma',
      role: 'VP of Business Development',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Former Mahindra Group executive specializing in automotive industry partnerships.',
      social: { linkedin: '#', twitter: '#', email: 'rohit@finautojobs.com' },
    },
    {
      name: 'Ananya Gupta',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Product strategist with experience at leading job portals and HR tech companies.',
      social: { linkedin: '#', twitter: '#', email: 'ananya@finautojobs.com' },
    },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We leverage AI and machine learning to create smarter job matching for finance and automotive sectors.',
      icon: '🚀',
    },
    {
      title: 'Trust & Security',
      description: 'We maintain bank-grade security and complete transparency in all recruitment processes.',
      icon: '🔒',
    },
    {
      title: 'Industry Expertise',
      description: 'Deep understanding of finance and automotive industries ensures relevant job opportunities.',
      icon: '⭐',
    },
    {
      title: 'Equal Opportunity',
      description: 'We promote diversity and inclusion, creating opportunities for professionals at all levels.',
      icon: '🌍',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
                width: { xs: 'calc(100% - 32px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                px: { xs: 2, sm: 3, md: 4 } 
            }}>
              <Typography variant="h2" gutterBottom fontWeight="bold" color="#333333">
                About FinAutoJobs
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto', color: '#555555' }}>
                India's leading specialized job portal connecting top talent with premier opportunities in Finance and Automotive sectors
              </Typography>
              <Button variant="contained" color="secondary" size="large">
                Join Our Mission
              </Button>
            </Box>
        </Box>
      </HeroSection>

      {/* Stats Section */}
      <Container maxWidth="md" sx={{ mt: -6, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <StatsCard>
                <stat.icon sx={{ fontSize: 48, color: `${stat.color}.main`, mb: 2 }} />
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.label}
                </Typography>
              </StatsCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mission Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Our Mission
            </Typography>
            <Typography variant="h6" paragraph color="text.secondary">
              To revolutionize recruitment in India's Finance and Automotive sectors by connecting exceptional talent with industry-leading companies.
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2023, FinAutoJobs emerged from the vision to create a specialized platform that understands the unique demands of finance and automotive industries. We recognized that generic job portals couldn't adequately serve these specialized sectors, leading us to build a platform tailored specifically for these industries.
            </Typography>
            <Typography variant="body1" paragraph>
              Our intelligent matching system combines industry expertise with advanced technology to ensure precise job-candidate alignment. We serve everyone from fresh graduates to C-level executives, providing opportunities across banking, insurance, fintech, automotive manufacturing, and emerging mobility sectors.
            </Typography>
            <Typography variant="body1" paragraph>
              With partnerships across India's leading financial institutions and automotive companies, we've successfully placed thousands of professionals in their dream careers while helping companies find the exact talent they need.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Team collaboration - Unsplash"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Values Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
                width: { xs: 'calc(100% - 32px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                px: { xs: 2, sm: 3, md: 4 } 
            }}>
          <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
            Our Values
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            The principles that guide everything we do
          </Typography>
          
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {value.icon}
                  </Typography>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
            </Box>
        </Box>
      </Box>

      {/* Team Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
          Meet Our Team
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          The passionate individuals behind FinAutoJobs
        </Typography>
        
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <TeamCard>
                <Avatar
                  src={member.image}
                  alt={member.name}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {member.name}
                </Typography>
                <Chip
                  label={member.role}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {member.bio}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button size="small" startIcon={<LinkedIn />}>
                    LinkedIn
                  </Button>
                  <Button size="small" startIcon={<Twitter />}>
                    Twitter
                  </Button>
                  <Button size="small" startIcon={<Email />}>
                    Email
                  </Button>
                </Stack>
              </TeamCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#e3f2fd', color: '#333333', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
            Ready to Accelerate Your Career?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Join over 150,000 professionals who trust FinAutoJobs for their career growth in finance and automotive industries
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" color="secondary" size="large">
              Find Jobs
            </Button>
            <Button variant="outlined" color="inherit" size="large">
              Post a Job
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;