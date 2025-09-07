import React, { useState } from 'react';
import { Link as WouterLink } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

// Material UI Components
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  IconButton,
  Rating,
} from '@mui/material';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CodeIcon from '@mui/icons-material/Code';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'featured'],
    queryFn: () => api.getJobs({ limit: 6 }).then((res) => res.json()),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies', 'featured'],
    queryFn: () => api.getCompanies({ limit: 6 }).then((res) => res.json()),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    window.location.href = `/jobs?${params.toString()}`;
  };

  const stats = [
    { icon: PeopleIcon, label: 'Active Users', value: '2M+' },
    { icon: BusinessIcon, label: 'Companies', value: '50K+' },
    { icon: WorkIcon, label: 'Jobs Posted', value: '100K+' },
    { icon: EmojiEventsIcon, label: 'Success Rate', value: '95%' },
  ];

  const popularSearches = [
    { title: 'Jobs for Freshers', trending: '#1', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Work from Home Jobs', trending: '#2', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Part-Time Jobs', trending: '#3', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Jobs for Women', trending: '#4', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Full-Time Jobs', trending: '#5', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
  ];

  const features = [
    { icon: FlashOnIcon, title: 'Fast Matching', description: 'Get matched with jobs in seconds using AI-powered recommendations.' },
    { icon: VerifiedUserIcon, title: 'Verified Jobs', description: 'All jobs are verified for authenticity and quality.' },
    { icon: RocketLaunchIcon, title: 'Career Growth', description: 'Access tools and resources to boost your career.' },
    { icon: CodeIcon, title: 'Tech-Driven', description: 'Cutting-edge technology for a seamless job search experience.' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      company: 'TechMahindra',
      quote: 'I found my dream job in just 2 weeks! The platform’s AI matching is incredible.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Rahul Verma',
      role: 'Marketing Manager',
      company: 'Flipkart',
      quote: 'The best job search experience I’ve ever had. Highly recommend to all job seekers!',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Ananya Gupta',
      role: 'Product Designer',
      company: 'Zomato',
      quote: 'From application to offer in record time. The process was smooth and efficient.',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6B46C1 0%, #3182CE 100%)',
          color: 'white',
          py: { xs: 12, md: 16 },
          px: { xs: 2, sm: 3, lg: 4 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h1" component="h1" sx={{ fontWeight: 800, mb: 3 }}>
            Find Your <Box component="span" sx={{ color: '#FFD700' }}>Dream Job</Box>
          </Typography>
          <Typography variant="h5" sx={{ mb: 6, color: 'rgba(255,255,255,0.8)' }}>
            India’s #1 job platform connecting millions of job seekers with top employers
          </Typography>

          {/* Search Form */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              boxShadow: 6,
              mx: 'auto',
              maxWidth: '800px',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Job title, keywords, or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  paddingLeft: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  paddingLeft: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                minWidth: { xs: '100%', md: '150px' },
                background: 'linear-gradient(45deg, #6B46C1 30%, #3182CE 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #553C9A 30%, #2C5282 90%)',
                  boxShadow: '0px 6px 12px rgba(0,0,0,0.15)',
                },
                borderRadius: 2,
              }}
            >
              Search Jobs
            </Button>
          </Paper>

          <Box sx={{ mt: 6 }}>
            <Chip
              label="🔥 Trending: AI Jobs, Remote Work, Startups"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.9rem',
                px: 2,
                py: 1,
                borderRadius: 4,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(255,255,255,0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(255,255,255,0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0)' },
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <stat.icon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Why Choose Us?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '700px', mx: 'auto' }}>
              Discover the benefits of using our platform for your job search
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.50', width: 64, height: 64 }}>
                        <feature.icon sx={{ fontSize: 36, color: 'primary.main' }} />
                      </Avatar>
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Jobs */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Featured Jobs
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Discover the latest opportunities from top companies
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {jobsData?.jobs?.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {job.logo ? (
                          <Avatar src={job.logo} alt={job.company} sx={{ width: 48, height: 48 }} />
                        ) : (
                          <Avatar sx={{ bgcolor: 'grey.200', width: 48, height: 48 }}>
                            <WorkIcon sx={{ color: 'grey.600' }} />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {job.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {job.company}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton aria-label="add to favorites">
                        <FavoriteBorderIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WorkIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.type} • {job.mode}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 600 }}>
                        ₹{job.salary}/month
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {job.skills?.slice(0, 3).map((skill, i) => (
                        <Chip key={i} label={skill} size="small" sx={{ bgcolor: 'primary.50', color: 'primary.main' }} />
                      ))}
                    </Box>

                    <WouterLink to={`/job/${job.id}`} style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={<ArrowForwardIcon />}
                        sx={{ mt: 'auto' }}
                      >
                        View Job
                      </Button>
                    </WouterLink>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 } }}>
            <WouterLink to="/jobs" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #6B46C1 30%, #3182CE 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #553C9A 30%, #2C5282 90%)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.15)',
                  },
                }}
              >
                View All Jobs
              </Button>
            </WouterLink>
          </Box>
        </Container>
      </Box>

      {/* Popular Searches */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Popular Searches
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Trending job categories this week
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {popularSearches.map((search, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}> {/* lg={2.4} for 5 items in a row */}
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={search.image}
                    alt={search.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 2,
                    }}
                  >
                    <Chip
                      label={search.trending}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'error.main',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="h6" component="h3" sx={{ color: 'white', fontWeight: 600 }}>
                      {search.title}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Companies */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Top Companies
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Work with the best companies in India
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {companiesData?.companies?.map((company) => (
              <Grid item xs={6} sm={4} md={2} key={company.id}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  {company.logo_url ? (
                    <Avatar src={company.logo_url} alt={company.name} sx={{ width: 64, height: 64, mb: 2 }} />
                  ) : (
                    <Avatar sx={{ bgcolor: 'grey.200', width: 64, height: 64, mb: 2 }}>
                      <BusinessIcon sx={{ fontSize: 36, color: 'grey.600' }} />
                    </Avatar>
                  )}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {company.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Success Stories
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Hear from people who found their dream jobs
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar src={testimonial.avatar} alt={testimonial.name} sx={{ width: 64, height: 64, mr: 2, border: '2px solid', borderColor: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2, color: 'text.primary' }}>
                      "{testimonial.quote}"
                    </Typography>
                    <Rating name="read-only" value={5} readOnly sx={{ color: 'warning.main' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6B46C1 0%, #3182CE 100%)',
          color: 'white',
          py: { xs: 10, md: 14 },
          px: { xs: 2, sm: 3, lg: 4 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
            Ready to Start Your Career?
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, color: 'rgba(255,255,255,0.8)', maxWidth: '700px', mx: 'auto' }}>
            Join millions of job seekers and find your perfect match today
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <WouterLink to="/register" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                }}
              >
                Create Account
              </Button>
            </WouterLink>
            <WouterLink to="/jobs" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<SearchIcon />}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                }}
              >
                Browse Jobs
              </Button>
            </WouterLink>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
