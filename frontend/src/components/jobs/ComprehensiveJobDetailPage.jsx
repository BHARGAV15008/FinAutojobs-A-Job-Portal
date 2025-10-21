import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Rating,
  LinearProgress,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  LocationOn,
  Work,
  Schedule,
  Business,
  MonetizationOn,
  Star,
  Favorite,
  FavoriteBorder,
  Share,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  School,
  TrendingUp,
  Groups,
  ExpandMore,
  NavigateNext,
  RocketLaunch,
  Visibility,
  Send,
  Phone,
  Email,
  LinkedIn,
  Language,
  AccessTime,
  CalendarToday,
  Assignment,
  EmojiEvents
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SmartApplicationSystem from '../application/SmartApplicationSystem';

const ComprehensiveJobDetailPage = ({ jobId }) => {
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showApplicationSystem, setShowApplicationSystem] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  // Mock job data - replace with API call
  const mockJob = {
    id: jobId || 1,
    title: 'Senior Frontend Developer',
    company: 'Google India',
    companyLogo: 'https://logo.clearbit.com/google.com',
    location: 'Bangalore, Karnataka, India',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experience: '3-6 years',
    salary: {
      min: 2500000,
      max: 4000000,
      currency: 'INR'
    },
    postedDate: '2024-10-15',
    deadline: '2024-11-15',
    applicants: 234,
    views: 1250,
    status: 'active',
    urgentHiring: true,
    featured: true,
    description: `We are looking for a passionate Senior Frontend Developer to join our dynamic team in Bangalore. You will be responsible for building the next generation of user interfaces that serve millions of users worldwide.

As a Senior Frontend Developer at Google, you will work with cutting-edge technologies and collaborate with world-class engineers, designers, and product managers to create exceptional user experiences.`,
    
    responsibilities: [
      'Develop and maintain high-quality web applications using React.js and TypeScript',
      'Collaborate with cross-functional teams to define, design, and ship new features',
      'Optimize applications for maximum speed and scalability',
      'Ensure the technical feasibility of UI/UX designs',
      'Participate in code reviews and maintain code quality standards',
      'Mentor junior developers and contribute to team knowledge sharing',
      'Stay up-to-date with emerging technologies and industry trends'
    ],
    
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience in frontend development',
      'Strong proficiency in React.js, JavaScript (ES6+), HTML5, and CSS3',
      'Experience with TypeScript and modern build tools (Webpack, Vite)',
      'Knowledge of state management libraries (Redux, Zustand)',
      'Familiarity with testing frameworks (Jest, React Testing Library)',
      'Understanding of responsive design and cross-browser compatibility',
      'Experience with version control systems (Git)',
      'Strong problem-solving skills and attention to detail',
      'Excellent communication and teamwork abilities'
    ],
    
    preferredSkills: [
      'Experience with Next.js or other React frameworks',
      'Knowledge of GraphQL and Apollo Client',
      'Familiarity with cloud platforms (GCP, AWS)',
      'Experience with CI/CD pipelines',
      'Understanding of web performance optimization',
      'Knowledge of accessibility standards (WCAG)',
      'Experience with design systems and component libraries'
    ],
    
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health insurance for you and your family',
      'Flexible working hours and remote work options',
      'Professional development budget and learning opportunities',
      'Free meals and snacks',
      'Gym membership and wellness programs',
      'Parental leave and family support',
      'Stock options and performance bonuses',
      'Transportation allowance',
      'Annual team retreats and events'
    ],
    
    skills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Redux', 'Git', 'Jest', 'Webpack'],
    
    applicationProcess: [
      { step: 1, title: 'Application Review', duration: '2-3 days', description: 'Initial screening of your application and resume' },
      { step: 2, title: 'Technical Assessment', duration: '1 week', description: 'Online coding challenge and technical questions' },
      { step: 3, title: 'Technical Interview', duration: '1 hour', description: 'In-depth technical discussion with senior engineers' },
      { step: 4, title: 'Cultural Fit Interview', duration: '45 minutes', description: 'Discussion about values, teamwork, and culture fit' },
      { step: 5, title: 'Final Review', duration: '2-3 days', description: 'Final decision and offer preparation' }
    ],
    
    team: {
      size: 12,
      description: 'You\'ll be joining a diverse team of 12 engineers working on user-facing products that impact millions of users daily.',
      technologies: ['React', 'TypeScript', 'GraphQL', 'Node.js', 'Google Cloud Platform'],
      workingStyle: 'Agile with 2-week sprints, daily standups, and regular retrospectives'
    }
  };

  const mockCompany = {
    id: 1,
    name: 'Google India',
    logo: 'https://logo.clearbit.com/google.com',
    website: 'https://careers.google.com',
    industry: 'Technology',
    size: '10,000+ employees',
    founded: 1998,
    headquarters: 'Mountain View, CA',
    description: 'Google\'s mission is to organize the world\'s information and make it universally accessible and useful.',
    rating: 4.4,
    reviewCount: 15420,
    culture: 'Innovation-driven, collaborative, and inclusive workplace',
    benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Learning Budget'],
    locations: ['Bangalore', 'Hyderabad', 'Mumbai', 'Gurgaon'],
    openJobs: 45,
    socialLinks: {
      linkedin: 'https://linkedin.com/company/google',
      twitter: 'https://twitter.com/google',
      facebook: 'https://facebook.com/google'
    }
  };

  const mockSimilarJobs = [
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Microsoft',
      location: 'Hyderabad',
      salary: '₹20-30L',
      experience: '2-5 years',
      postedDate: '2024-10-18'
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'Amazon',
      location: 'Bangalore',
      salary: '₹25-35L',
      experience: '3-6 years',
      postedDate: '2024-10-20'
    },
    {
      id: 4,
      title: 'Senior UI Developer',
      company: 'Flipkart',
      location: 'Bangalore',
      salary: '₹22-32L',
      experience: '4-7 years',
      postedDate: '2024-10-19'
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setJob(mockJob);
    setCompany(mockCompany);
    setSimilarJobs(mockSimilarJobs);
  }, [jobId]);

  const formatSalary = (min, max, currency = 'INR') => {
    const formatAmount = (amount) => {
      if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `${(amount / 100000).toFixed(0)}L`;
      return `${(amount / 1000).toFixed(0)}K`;
    };
    return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApply = () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    setShowApplicationSystem(true);
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      console.log('Application submitted:', applicationData);
      // API call would go here
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Application submission failed:', error);
    }
  };

  if (!job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography>Loading job details...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link color="inherit" href="/jobs">Jobs</Link>
        <Link color="inherit" href={`/companies/${company?.id}`}>{company?.name}</Link>
        <Typography color="text.primary">{job.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Job Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Avatar
                      src={company?.logo}
                      sx={{ width: 80, height: 80 }}
                    >
                      {company?.name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {job.title}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {company?.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <Chip icon={<LocationOn />} label={job.location} />
                        <Chip icon={<Work />} label={job.jobType} />
                        <Chip icon={<Schedule />} label={job.workMode} />
                        <Chip icon={<TrendingUp />} label={job.experience} />
                      </Box>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        {formatSalary(job.salary.min, job.salary.max)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <IconButton onClick={() => setIsFavorited(!isFavorited)}>
                      {isFavorited ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                    <IconButton onClick={() => setIsBookmarked(!isBookmarked)}>
                      {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                    </IconButton>
                    <IconButton>
                      <Share />
                    </IconButton>
                  </Box>
                </Box>

                {/* Job Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{job.applicants}</Typography>
                      <Typography variant="caption" color="text.secondary">Applicants</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{job.views}</Typography>
                      <Typography variant="caption" color="text.secondary">Views</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{formatDate(job.postedDate)}</Typography>
                      <Typography variant="caption" color="text.secondary">Posted</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{formatDate(job.deadline)}</Typography>
                      <Typography variant="caption" color="text.secondary">Deadline</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Apply Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<RocketLaunch />}
                  onClick={handleApply}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                    }
                  }}
                >
                  Apply Now
                </Button>

                {job.urgentHiring && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    🚨 Urgent Hiring - Applications closing soon!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Details Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Overview" />
                <Tab label="Requirements" />
                <Tab label="Benefits" />
                <Tab label="Application Process" />
                <Tab label="Team & Culture" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Overview Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Job Description</Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    {job.description}
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Key Responsibilities</Typography>
                  <List>
                    {job.responsibilities.map((responsibility, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={responsibility} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Required Skills</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {job.skills.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Requirements Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Required Qualifications</Typography>
                  <List>
                    {job.requirements.map((requirement, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <School color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={requirement} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Preferred Qualifications</Typography>
                  <List>
                    {job.preferredSkills.map((skill, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Star color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={skill} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Benefits Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>What We Offer</Typography>
                  <Grid container spacing={2}>
                    {job.benefits.map((benefit, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <EmojiEvents color="primary" />
                          <Typography>{benefit}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Application Process Tab */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Interview Process</Typography>
                  {job.applicationProcess.map((step, index) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {step.step}
                          </Avatar>
                          <Typography fontWeight="bold">{step.title}</Typography>
                          <Chip label={step.duration} size="small" />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{step.description}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {/* Team & Culture Tab */}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>About the Team</Typography>
                  <Typography paragraph>{job.team.description}</Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Team Size</Typography>
                        <Typography variant="h4" color="primary">{job.team.size}</Typography>
                        <Typography variant="body2" color="text.secondary">Engineers</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Working Style</Typography>
                        <Typography>{job.team.workingStyle}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Technologies We Use</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {job.team.technologies.map((tech, index) => (
                      <Chip key={index} label={tech} color="secondary" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Company Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>About {company?.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={company?.logo} sx={{ width: 56, height: 56 }}>
                  {company?.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">{company?.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={company?.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2">({company?.reviewCount})</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="body2" paragraph>{company?.description}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Industry</Typography>
                  <Typography variant="body2" fontWeight="bold">{company?.industry}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Company Size</Typography>
                  <Typography variant="body2" fontWeight="bold">{company?.size}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Founded</Typography>
                  <Typography variant="body2" fontWeight="bold">{company?.founded}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Open Jobs</Typography>
                  <Typography variant="body2" fontWeight="bold">{company?.openJobs}</Typography>
                </Grid>
              </Grid>

              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View Company Profile
              </Button>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Similar Jobs</Typography>
              {similarJobs.map((similarJob, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">{similarJob.title}</Typography>
                  <Typography variant="body2" color="primary">{similarJob.company}</Typography>
                  <Typography variant="body2" color="text.secondary">{similarJob.location}</Typography>
                  <Typography variant="body2" fontWeight="bold">{similarJob.salary}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Posted {formatDate(similarJob.postedDate)}
                  </Typography>
                </Box>
              ))}
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Similar Jobs
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Smart Application System */}
      {showApplicationSystem && (
        <SmartApplicationSystem
          job={job}
          onApplicationSubmit={handleApplicationSubmit}
          onClose={() => setShowApplicationSystem(false)}
        />
      )}
    </Container>
  );
};

export default ComprehensiveJobDetailPage;
