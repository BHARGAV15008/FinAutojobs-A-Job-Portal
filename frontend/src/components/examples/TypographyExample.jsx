import React from 'react';
import { Box, Card, CardContent, Button, Chip } from '@mui/material';
import { 
  HeroHeading, 
  SectionHeading, 
  JobTitle, 
  CompanyName, 
  SalaryText, 
  JobMeta,
  BodyRegular,
  DashboardMetric,
  DashboardLabel
} from '../ui/Typography';

/**
 * Example component demonstrating the new typography system
 * This shows how to integrate custom typography with Material-UI components
 */
const TypographyExample = () => {
  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {/* Hero Section Example */}
      <Box sx={{ textAlign: 'center', mb: 6, py: 8, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <HeroHeading style={{ color: 'white', marginBottom: '1rem' }}>
          Find Your Dream Job
        </HeroHeading>
        <BodyRegular style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
          India's #1 job platform connecting millions of job seekers with top employers
        </BodyRegular>
      </Box>

      {/* Section Heading Example */}
      <SectionHeading style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Featured Jobs
      </SectionHeading>

      {/* Job Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3, mb: 6 }}>
        {/* Job Card 1 */}
        <Card sx={{ p: 3, height: 'fit-content' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <JobTitle style={{ marginBottom: '0.5rem' }}>
                  Senior Frontend Developer
                </JobTitle>
                <CompanyName>Google India</CompanyName>
              </Box>
              <SalaryText>₹15-25L</SalaryText>
            </Box>
            
            <JobMeta style={{ display: 'block', marginBottom: '1rem' }}>
              Bangalore • Full-time • Remote
            </JobMeta>
            
            <BodyRegular style={{ marginBottom: '1rem', color: '#6b7280' }}>
              We're looking for an experienced frontend developer to join our team and work on cutting-edge web applications.
            </BodyRegular>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label="React" size="small" color="primary" />
              <Chip label="TypeScript" size="small" color="primary" />
              <Chip label="Next.js" size="small" color="primary" />
            </Box>
            
            <Button variant="contained" fullWidth>
              Apply Now
            </Button>
          </CardContent>
        </Card>

        {/* Job Card 2 */}
        <Card sx={{ p: 3, height: 'fit-content' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <JobTitle style={{ marginBottom: '0.5rem' }}>
                  Product Manager
                </JobTitle>
                <CompanyName>Microsoft</CompanyName>
              </Box>
              <SalaryText>₹20-35L</SalaryText>
            </Box>
            
            <JobMeta style={{ display: 'block', marginBottom: '1rem' }}>
              Hyderabad • Full-time • Hybrid
            </JobMeta>
            
            <BodyRegular style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Lead product strategy and development for our enterprise solutions. Work with cross-functional teams.
            </BodyRegular>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label="Strategy" size="small" color="secondary" />
              <Chip label="Analytics" size="small" color="secondary" />
              <Chip label="Leadership" size="small" color="secondary" />
            </Box>
            
            <Button variant="contained" fullWidth>
              Apply Now
            </Button>
          </CardContent>
        </Card>

        {/* Job Card 3 */}
        <Card sx={{ p: 3, height: 'fit-content' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <JobTitle style={{ marginBottom: '0.5rem' }}>
                  UX Designer
                </JobTitle>
                <CompanyName>Flipkart</CompanyName>
              </Box>
              <SalaryText>₹12-18L</SalaryText>
            </Box>
            
            <JobMeta style={{ display: 'block', marginBottom: '1rem' }}>
              Mumbai • Full-time • On-site
            </JobMeta>
            
            <BodyRegular style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Design intuitive user experiences for our e-commerce platform. Collaborate with product and engineering teams.
            </BodyRegular>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label="Figma" size="small" color="success" />
              <Chip label="User Research" size="small" color="success" />
              <Chip label="Prototyping" size="small" color="success" />
            </Box>
            
            <Button variant="contained" fullWidth>
              Apply Now
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Dashboard Metrics Example */}
      <SectionHeading style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Platform Statistics
      </SectionHeading>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 6 }}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <DashboardMetric>2M+</DashboardMetric>
          <DashboardLabel style={{ display: 'block', marginTop: '0.5rem' }}>
            Active Users
          </DashboardLabel>
        </Card>
        
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <DashboardMetric>50K+</DashboardMetric>
          <DashboardLabel style={{ display: 'block', marginTop: '0.5rem' }}>
            Companies
          </DashboardLabel>
        </Card>
        
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <DashboardMetric>100K+</DashboardMetric>
          <DashboardLabel style={{ display: 'block', marginTop: '0.5rem' }}>
            Jobs Posted
          </DashboardLabel>
        </Card>
        
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <DashboardMetric>95%</DashboardMetric>
          <DashboardLabel style={{ display: 'block', marginTop: '0.5rem' }}>
            Success Rate
          </DashboardLabel>
        </Card>
      </Box>

      {/* Typography Showcase */}
      <Card sx={{ p: 4, mb: 4 }}>
        <SectionHeading style={{ marginBottom: '2rem' }}>
          Typography Showcase
        </SectionHeading>
        
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box>
            <strong>Font Families:</strong>
            <Box sx={{ mt: 1 }}>
              <div className="font-heading font-bold text-xl">Work Sans Heading Font</div>
              <div className="font-sans font-normal text-base">Inter Body Font</div>
            </Box>
          </Box>
          
          <Box>
            <strong>Font Weights:</strong>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <span className="font-light">Light (300)</span>
              <span className="font-normal">Normal (400)</span>
              <span className="font-medium">Medium (500)</span>
              <span className="font-semibold">Semi-bold (600)</span>
              <span className="font-bold">Bold (700)</span>
              <span className="font-extrabold">Extra-bold (800)</span>
            </Box>
          </Box>
          
          <Box>
            <strong>Responsive Sizes:</strong>
            <Box sx={{ mt: 1 }}>
              <HeroHeading style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
                Responsive Hero
              </HeroHeading>
              <SectionHeading>Section Heading</SectionHeading>
              <JobTitle>Job Title</JobTitle>
              <BodyRegular>Regular body text</BodyRegular>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default TypographyExample;
