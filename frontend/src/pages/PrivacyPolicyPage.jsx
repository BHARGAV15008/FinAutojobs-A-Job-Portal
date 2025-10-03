import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const Section = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

const PrivacyPolicyPage = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom align="center">
                Privacy Policy
            </Typography>
            <Typography variant="subtitle1" paragraph align="center" color="text.secondary" sx={{ mb: 8 }}>
                Last updated: January 15, 2025
            </Typography>

            <StyledPaper elevation={3}>
                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        1. Introduction
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to FinAutoJobs, India's specialized job portal for Finance and Automotive industries. We respect your privacy
                        and are committed to protecting your personal and professional data. This privacy policy explains how we collect,
                        use, store, and protect your information when you use our platform, and outlines your privacy rights under
                        Indian data protection laws.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        2. Data We Collect
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We collect information necessary to provide our specialized recruitment services:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Personal Information:</strong> Name, email, phone number, location, date of birth, and profile photos
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Professional Information:</strong> Resume/CV, work experience, education, certifications, skills, salary expectations, and career preferences
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Company Information:</strong> For recruiters - company name, designation, department, and recruiting authority verification
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Application Data:</strong> Job applications, interview schedules, communication history, and hiring decisions
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Technical Data:</strong> IP address, browser type, device information, and platform usage analytics
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        3. How We Use Your Data
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We use your data to provide specialized recruitment services in finance and automotive sectors:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Job Matching:</strong> Match your profile with relevant opportunities using our AI-powered recommendation system
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Profile Visibility:</strong> Display your profile to relevant recruiters in finance and automotive companies
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Communication:</strong> Facilitate communication between job seekers and recruiters, including interview scheduling
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Analytics:</strong> Provide insights on job market trends, salary benchmarks, and career progression paths
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Verification:</strong> Verify credentials and employment history to maintain platform integrity
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Notifications:</strong> Send relevant job alerts, application updates, and platform announcements
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        4. Data Security
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We implement bank-grade security measures to protect your professional and personal data:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Access Control:</strong> Strict role-based access controls ensure only authorized personnel can access your data
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Data Backup:</strong> Secure, encrypted backups ensure data recovery in case of system failures
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        5. Your Rights
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Under Indian data protection laws and our commitment to transparency, you have the following rights:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Access:</strong> Request a copy of all personal data we hold about you
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Correction:</strong> Update or correct any inaccurate information in your profile
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Deletion:</strong> Request deletion of your account and associated data (subject to legal requirements)
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Portability:</strong> Download your profile data in a standard format
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Opt-out:</strong> Unsubscribe from marketing communications while maintaining essential service notifications
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            <strong>Visibility Control:</strong> Control who can view your profile and contact you
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        6. Contact Us
                    </Typography>
                    <Typography variant="body1" paragraph>
                        If you have any questions about this Privacy Policy, please contact us:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            By email: privacy@finautojobs.com
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            By phone: +91 98765 43210
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            By mail: Data Protection Officer, FinAutoJobs Pvt Ltd, 401 Business Hub, Andheri East, Mumbai, Maharashtra 400069
                        </Typography>
                    </ul>
                </Section>
            </StyledPaper>
        </Container>
    );
};

export default PrivacyPolicyPage;
