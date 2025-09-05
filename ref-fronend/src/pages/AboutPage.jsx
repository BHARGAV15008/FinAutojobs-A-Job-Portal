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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
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
    { icon: Group, label: 'Active Users', value: '2M+', color: 'primary' },
    { icon: Business, label: 'Partner Companies', value: '50K+', color: 'secondary' },
    { icon: TrendingUp, label: 'Jobs Posted', value: '100K+', color: 'success' },
    { icon: Star, label: 'Success Rate', value: '95%', color: 'warning' },
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'CEO & Founder',
      image: 'https://i.pravatar.cc/150?img=1',
      bio: 'Former Goldman Sachs executive with 15+ years in finance and technology.',
      social: { linkedin: '#', twitter: '#', email: 'rajesh@finautojobs.com' },
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      image: 'https://i.pravatar.cc/150?img=2',
      bio: 'Ex-Google engineer specializing in AI and machine learning for recruitment.',
      social: { linkedin: '#', twitter: '#', email: 'priya@finautojobs.com' },
    },
    {
      name: 'Amit Patel',
      role: 'Head of Operations',
      image: 'https://i.pravatar.cc/150?img=3',
      bio: 'Operations expert from Tata Motors with deep automotive industry knowledge.',
      social: { linkedin: '#', twitter: '#', email: 'amit@finautojobs.com' },
    },
    {
      name: 'Sneha Reddy',
      role: 'Head of Marketing',
      image: 'https://i.pravatar.cc/150?img=4',
      bio: 'Marketing strategist with experience at top fintech and automotive companies.',
      social: { linkedin: '#', twitter: '#', email: 'sneha@finautojobs.com' },
    },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to revolutionize job matching and career development.',
      icon: '🚀',
    },
    {
      title: 'Trust',
      description: 'We maintain the highest standards of security and transparency in all our operations.',
      icon: '🔒',
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from user experience to customer service.',
      icon: '⭐',
    },
    {
      title: 'Diversity',
      description: 'We believe in creating opportunities for everyone, regardless of background or experience.',
      icon: '🌍',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            About FinAutoJobs
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            India's premier job platform connecting talent with opportunities in Finance and Automotive industries
          </Typography>
          <Button variant="contained" color="secondary" size="large">
            Join Our Mission
          </Button>
        </Container>
      </HeroSection>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 1 }}>
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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Our Mission
            </Typography>
            <Typography variant="h6" paragraph color="text.secondary">
              To bridge the gap between exceptional talent and leading companies in India's Finance and Automotive sectors.
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2020, FinAutoJobs has grown to become India's most trusted platform for specialized recruitment in finance and automotive industries. We understand the unique requirements of these sectors and provide tailored solutions for both job seekers and employers.
            </Typography>
            <Typography variant="body1" paragraph>
              Our AI-powered matching system, combined with industry expertise, ensures that the right talent meets the right opportunity at the right time.
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
        <Container maxWidth="lg">
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
        </Container>
      </Box>

      {/* Team Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
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
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Ready to Transform Your Career?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Join thousands of professionals who have found their dream jobs through FinAutoJobs
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