import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn,
  Work,
  AttachMoney,
  Schedule,
  Business,
  CheckCircle,
  ArrowBack,
  Share,
  Bookmark,
  BookmarkBorder,
  Favorite,
  FavoriteBorder,
  Visibility,
  People,
  Star,
  Verified,
  AccessTime,
  Phone,
  Email,
  Language,
  ExpandMore,
  Close,
  Send,
  Description,
  School,
  TrendingUp,
  Public,
  Home,
  AttachFile,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const CompanyAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  fontSize: '2rem',
  fontWeight: 'bold',
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[4],
}));

const JobDetailPage = () => {
  const [match, params] = useRoute('/job/:id');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState(0);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableStartDate: '',
    noticePeriod: '',
  });
  
  const { user, isAuthenticated, login, signup } = useAuth();
  const { toast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mock job data with enhanced features
  const mockJob = {
    id: params?.id || '1',
    title: "Senior Financial Analyst",
    company: "Goldman Sachs",
    companyLogo: "GS",
    location: "Mumbai, Maharashtra",
    department: "Finance",
    type: "Full-time",
    workMode: "Hybrid",
    salary: "₹15,00,000 - ₹25,00,000",
    salaryMin: 1500000,
    salaryMax: 2500000,
    posted: "2 days ago",
    experience: "3-5 years",
    experienceMin: 3,
    experienceMax: 5,
    description: "We are seeking a Senior Financial Analyst to join our dynamic team in Mumbai. You will be responsible for financial modeling, analysis, and reporting to support strategic business decisions.",
    skills: ["Excel", "Python", "SQL", "Financial Modeling", "Risk Analysis", "Power BI", "Tableau"],
    requirements: [
      "Bachelor's degree in Finance, Economics, or related field",
      "3-5 years of experience in financial analysis",
      "Strong proficiency in Excel and financial modeling",
      "Experience with Python and SQL is preferred",
      "Excellent analytical and communication skills",
      "CFA or FRM certification is a plus"
    ],
    responsibilities: [
      "Develop and maintain complex financial models",
      "Analyze financial data and prepare reports",
      "Support budgeting and forecasting processes",
      "Collaborate with cross-functional teams",
      "Present findings to senior management",
      "Monitor and analyze market trends",
      "Provide recommendations for investment decisions"
    ],
    benefits: [
      "Health Insurance",
      "Stock Options", 
      "Flexible Hours",
      "Learning Budget",
      "Performance Bonus",
      "Paid Time Off",
      "Retirement Plan",
      "Wellness Programs"
    ],
    companySize: "10,000+",
    industry: "Investment Banking",
    companyDescription: "Goldman Sachs is a leading global investment banking, securities and investment management firm that provides a wide range of financial services to a substantial and diversified client base.",
    companyWebsite: "www.goldmansachs.com",
    companyPhone: "+91-22-6678-9000",
    companyEmail: "careers.india@goldmansachs.com",
    education: "Bachelor's degree in Finance, Economics, or related field",
    qualifications: [
      "Strong analytical and quantitative skills",
      "Proficiency in financial modeling and valuation",
      "Experience with financial software and tools",
      "Excellent communication and presentation skills",
      "Ability to work in a fast-paced environment"
    ],
    applicants: 24,
    views: 1250,
    rating: 4.5,
    urgentHiring: false,
    featured: true,
    verified: true,
    remote: false,
    jobHighlights: [
      "Competitive salary and benefits package",
      "Opportunity to work with industry experts",
      "Career growth and development programs",
      "Collaborative and inclusive work environment"
    ],
    interviewProcess: [
      { step: 1, title: "Initial Screening", description: "HR interview to assess basic qualifications" },
      { step: 2, title: "Technical Assessment", description: "Financial modeling and analysis test" },
      { step: 3, title: "Manager Interview", description: "Interview with hiring manager" },
      { step: 4, title: "Final Round", description: "Meeting with senior leadership" }
    ],
    similarJobs: [
      {
        id: 2,
        title: "Investment Banking Associate",
        company: "ICICI Bank",
        location: "Mumbai",
        salary: "₹18,00,000 - ₹30,00,000",
        type: "Full-time"
      },
      {
        id: 3,
        title: "Risk Management Specialist",
        company: "HDFC Bank",
        location: "Mumbai",
        salary: "₹10,00,000 - ₹16,00,000",
        type: "Full-time"
      }
    ]
  };

  useEffect(() => {
    // Simulate API call to fetch job details
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        // In real implementation, this would be an API call
        setTimeout(() => {
          setJob(mockJob);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [params?.id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowApplyDialog(true);
  };

  const handleAuthSubmit = async (authData) => {
    try {
      let result;
      if (authMode === 'login') {
        result = await login(authData);
      } else {
        result = await signup(authData);
      }

      if (result.success) {
        setShowAuthDialog(false);
        setShowApplyDialog(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleApplicationSubmit = () => {
    // Handle job application submission
    toast({
      title: "🎉 Application Submitted!",
      description: "Your application has been submitted successfully.",
      variant: "default"
    });
    setShowApplyDialog(false);
    setApplicationData({
      coverLetter: '',
      expectedSalary: '',
      availableStartDate: '',
      noticePeriod: '',
    });
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? "💔 Job Removed from Saved" : "💾 Job Saved!",
      description: bookmarked ? "Job removed from your saved jobs" : "Job added to your saved jobs",
      variant: "default"
    });
  };

  const toggleFavorite = () => {
    setFavorited(!favorited);
    toast({
      title: favorited ? "💔 Removed from Favorites" : "❤️ Added to Favorites!",
      description: favorited ? "Job removed from favorites" : "Job added to favorites",
      variant: "default"
    });
  };

  const shareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "📋 Link Copied!",
        description: "Job link copied to clipboard",
        variant: "default"
      });
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>Loading job details...</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Job not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        component={Link}
        href="/jobs"
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Jobs
      </Button>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Job Header Card */}
          <StyledCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Job Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                <CompanyAvatar
                  bgcolor="primary.main"
                  color="white"
                >
                  {job.companyLogo}
                </CompanyAvatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {job.title}
                    </Typography>
                    {job.verified && (
                      <Tooltip title="Verified Company">
                        <Verified sx={{ color: 'success.main' }} />
                      </Tooltip>
                    )}
                    {job.featured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        icon={<Star />}
                      />
                    )}
                  </Box>
                  <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                    {job.company}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Chip icon={<LocationOn />} label={job.location} />
                    <Chip icon={<Work />} label={job.experience} />
                    <Chip icon={<Schedule />} label={job.type} />
                    <Chip 
                      icon={job.workMode === 'Remote' ? <Home /> : <Business />}
                      label={job.workMode}
                      color={job.workMode === 'Remote' ? 'success' : job.workMode === 'Hybrid' ? 'warning' : 'default'}
                    />
                  </Box>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {job.salary}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Tooltip title={bookmarked ? "Remove from saved jobs" : "Save job"}>
                    <IconButton onClick={toggleBookmark}>
                      {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={favorited ? "Remove from favorites" : "Add to favorites">
                    <IconButton onClick={toggleFavorite}>
                      {favorited ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share job">
                    <IconButton onClick={shareJob}>
                      <Share />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Job Stats */}
              <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.views} views
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.applicants} applicants
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Posted {job.posted}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.rating} rating
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleApply}
                  sx={{ px: 4 }}
                >
                  Apply Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Phone />}
                >
                  Contact HR
                </Button>
              </Box>
            </CardContent>
          </StyledCard>

          {/* Detailed Information Tabs */}
          <StyledCard>
            <Tabs
              value={activeTab}
              onChange={(event, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
            >
              <Tab label="Overview" />
              <Tab label="Requirements" />
              <Tab label="Company" />
              <Tab label="Benefits" />
              <Tab label="Interview Process" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              {/* Job Description */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {job.description}
                </Typography>
              </Box>

              {/* Key Responsibilities */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight
