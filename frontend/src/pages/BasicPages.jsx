import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Link } from 'wouter';
import { ArrowBack, Work, Person, Business, TrendingUp, School, Psychology, Info, Phone, Gavel, Shield, AttachMoney, Notifications, Assessment } from '@mui/icons-material';

// Basic page template
const BasicPage = ({ title, description, icon: Icon, backLink = "/" }) => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Button
      component={Link}
      href={backLink}
      startIcon={<ArrowBack />}
      sx={{ mb: 3 }}
    >
      Back
    </Button>

    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Icon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        {description}
      </Typography>
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            This page is under development. Please check back later for more features and functionality.
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="contained"
            sx={{ mt: 3 }}
          >
            Go Home
          </Button>
        </CardContent>
      </Card>
    </Box>
  </Container>
);

// Individual page components
export const ResumePage = () => (
  <BasicPage
    title="Resume Builder"
    description="Create and manage your professional resume"
    icon={Person}
    backLink="/"
  />
);

export const HRLoginPage = () => (
  <BasicPage
    title="HR Login"
    description="Access your HR dashboard"
    icon={Business}
    backLink="/login"
  />
);

export const JobPrepPage = () => (
  <BasicPage
    title="Interview Preparation"
    description="Prepare for your next job interview"
    icon={Psychology}
    backLink="/"
  />
);

export const ApplicationsPage = () => (
  <BasicPage
    title="Applications"
    description="Track your job applications"
    icon={Work}
    backLink="/"
  />
);

export const AdminDashboard = () => (
  <BasicPage
    title="Admin Dashboard"
    description="Administrative control panel"
    icon={Business}
    backLink="/"
  />
);

export const AboutPage = () => (
  <BasicPage
    title="About Us"
    description="Learn more about FinAutoJobs"
    icon={Info}
    backLink="/"
  />
);

export const ContactPage = () => (
  <BasicPage
    title="Contact Us"
    description="Get in touch with our team"
    icon={Phone}
    backLink="/"
  />
);

export const PrivacyPolicyPage = () => (
  <BasicPage
    title="Privacy Policy"
    description="Our commitment to your privacy"
    icon={Shield}
    backLink="/"
  />
);

export const TermsOfServicePage = () => (
  <BasicPage
    title="Terms of Service"
    description="Terms and conditions of use"
    icon={Gavel}
    backLink="/"
  />
);

export const PricingPage = () => (
  <BasicPage
    title="Pricing"
    description="Choose the right plan for you"
    icon={AttachMoney}
    backLink="/"
  />
);

export const CompaniesPage = () => (
  <BasicPage
    title="Companies"
    description="Explore top companies"
    icon={Business}
    backLink="/"
  />
);

export const CompanyDetailPage = () => (
  <BasicPage
    title="Company Details"
    description="Learn more about this company"
    icon={Business}
    backLink="/companies"
  />
);

export const SkillsAssessmentPage = () => (
  <BasicPage
    title="Skills Assessment"
    description="Test and improve your skills"
    icon={Assessment}
    backLink="/"
  />
);

export const SalaryInsightsPage = () => (
  <BasicPage
    title="Salary Insights"
    description="Explore salary trends and data"
    icon={TrendingUp}
    backLink="/"
  />
);

export const JobAlertsPage = () => (
  <BasicPage
    title="Job Alerts"
    description="Manage your job alert preferences"
    icon={Notifications}
    backLink="/"
  />
);