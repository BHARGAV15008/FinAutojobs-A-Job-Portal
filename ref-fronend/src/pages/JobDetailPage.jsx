import { useState } from 'react';
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
} from '@mui/icons-material';

const JobDetailPage = () => {
  const [match, params] = useRoute('/job/:id');
  const [bookmarked, setBookmarked] = useState(false);
  
  // Mock job data
  const job = {
    id: params?.id || '1',
    title: "Senior Financial Analyst",
    company: "Goldman Sachs",
    companyLogo: "GS",
    location: "Mumbai, Maharashtra",
    department: "Finance",
    type: "Full-time",
    workMode: "Hybrid",
    salary: "₹15,00,000 - ₹25,00,000",
    posted: "2 days ago",
    experience: "3-5 years",
    description: "We are seeking a Senior Financial Analyst to join our dynamic team in Mumbai. You will be responsible for financial modeling, analysis, and reporting to support strategic business decisions.",
    skills: ["Excel", "Python", "SQL", "Financial Modeling", "Risk Analysis"],
    requirements: [
      "Bachelor's degree in Finance, Economics, or related field",
      "3-5 years of experience in financial analysis",
      "Strong proficiency in Excel and financial modeling",
      "Experience with Python and SQL is preferred",
      "Excellent analytical and communication skills"
    ],
    responsibilities: [
      "Develop and maintain complex financial models",
      "Analyze financial data and prepare reports",
      "Support budgeting and forecasting processes",
      "Collaborate with cross-functional teams",
      "Present findings to senior management"
    ],
    benefits: ["Health Insurance", "Stock Options", "Flexible Hours", "Learning Budget"],
    companySize: "10,000+",
    industry: "Investment Banking",
  };

  const handleApply = () => {
    // Handle job application
    console.log('Applying to job:', job.id);
  };

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
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Job Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {job.companyLogo}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {job.company}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip icon={<LocationOn />} label={job.location} />
                    <Chip icon={<Work />} label={job.experience} />
                    <Chip icon={<Schedule />} label={job.type} />
                  </Box>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {job.salary}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
                    onClick={() => setBookmarked(!bookmarked)}
                  >
                    {bookmarked ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outlined" startIcon={<Share />}>
                    Share
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Job Description */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {job.description}
                </Typography>
              </Box>

              {/* Requirements */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Requirements
                </Typography>
                <List>
                  {job.requirements.map((requirement, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={requirement} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Responsibilities */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Key Responsibilities
                </Typography>
                <List>
                  {job.responsibilities.map((responsibility, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={responsibility} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Skills */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {job.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Apply Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleApply}
                sx={{ mb: 2 }}
              >
                Apply Now
              </Button>
              <Typography variant="body2" color="text.secondary" align="center">
                Posted {job.posted}
              </Typography>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Job Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">{job.department}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Work Mode
                  </Typography>
                  <Typography variant="body1">{job.workMode}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Company Size
                  </Typography>
                  <Typography variant="body1">{job.companySize} employees</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Industry
                  </Typography>
                  <Typography variant="body1">{job.industry}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Benefits & Perks
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {job.benefits.map((benefit, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    <Typography variant="body2">{benefit}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobDetailPage;