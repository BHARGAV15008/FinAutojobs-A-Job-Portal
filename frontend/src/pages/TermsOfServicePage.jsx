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

const TermsOfServicePage = () => {
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 8 }}>
            <Box sx={{ 
                width: { xs: 'calc(100% - 32px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                px: { xs: 2, sm: 3, md: 4 } 
            }}>
            <Typography variant="h2" component="h1" gutterBottom align="center" color="text.primary">
                Terms of Service
            </Typography>
            <Typography variant="subtitle1" paragraph align="center" color="text.secondary" sx={{ mb: 8 }}>
                Last updated: January 15, 2025
            </Typography>

            <StyledPaper elevation={3}>
                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        1. Agreement to Terms
                    </Typography>
                    <Typography variant="body1" paragraph>
                        By accessing or using FinAutoJobs ("the Platform"), you agree to be bound by these Terms of Service and all applicable
                        laws and regulations. FinAutoJobs is a specialized job portal focused on Finance and Automotive industries in India.
                        If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        2. Use License
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Permission is granted to access FinAutoJobs platform for legitimate job searching, recruitment, and career development
                        purposes. This includes creating profiles, applying for jobs, posting job opportunities (for authorized recruiters),
                        and networking within the finance and automotive professional community. Under this license you may not:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            Use automated systems (bots, scrapers) to extract data from the platform
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Post false, misleading, or fraudulent job listings or profile information
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Attempt to circumvent our security measures or access unauthorized areas
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Use the platform for any illegal activities or spam communications
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Share your account credentials or create multiple accounts without authorization
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        3. User Accounts
                    </Typography>
                    <Typography variant="body1" paragraph>
                        When you create an account with FinAutoJobs, you guarantee that:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            All profile information, including work experience, education, and skills, is accurate and truthful
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            You are legally authorized to work in India (for job seekers) or recruit in India (for employers)
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            You will maintain the confidentiality of your account and notify us of any unauthorized access
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            You will not discriminate based on gender, religion, caste, or other protected characteristics
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        4. Job Postings and Applications
                    </Typography>
                    <Typography variant="body1" paragraph>
                        For Job Seekers: You may apply to multiple positions but must ensure each application is genuine and tailored.
                        For Employers: Job postings must be legitimate opportunities in finance or automotive sectors with accurate
                        job descriptions, salary ranges, and requirements.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        FinAutoJobs does not guarantee:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            That any job application will result in interviews, offers, or employment
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            The accuracy of salary information or job descriptions provided by employers
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            That posted positions will be filled or remain available
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            The conduct or legitimacy of any employer or job seeker on the platform
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        5. Disclaimer
                    </Typography>
                    <Typography variant="body1" paragraph>
                        FinAutoJobs platform is provided on an 'as is' basis. While we strive to maintain accurate and up-to-date
                        information, we make no warranties about the completeness, reliability, or accuracy of job listings,
                        company information, or user profiles. We do not guarantee uninterrupted service or that the platform
                        will be error-free. Users are responsible for verifying all information independently.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        6. Limitations
                    </Typography>
                    <Typography variant="body1" paragraph>
                        FinAutoJobs's liability is limited to the maximum extent permitted by Indian law. We are not liable for
                        any indirect, incidental, or consequential damages including but not limited to lost opportunities,
                        failed job applications, hiring decisions, or business interruptions. Our total liability shall not
                        exceed the fees paid by you (if any) in the 12 months preceding the claim.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        7. Governing Law
                    </Typography>
                    <Typography variant="body1" paragraph>
                        These terms are governed by the laws of India. Any disputes arising from the use of FinAutoJobs
                        shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra, India.
                        We encourage users to first contact our support team to resolve any issues amicably.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        8. Changes to Terms
                    </Typography>
                    <Typography variant="body1" paragraph>
                        FinAutoJobs reserves the right to modify these Terms at any time. For material changes affecting user
                        rights or obligations, we will provide 30 days' notice via email or platform notification.
                        Continued use of the platform after changes constitutes acceptance of the new terms.
                        We recommend reviewing these terms periodically.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        9. Contact Information
                    </Typography>
                    <Typography variant="body1" paragraph>
                        If you have any questions about these Terms, please contact us:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            By email: legal@finautojobs.com
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            By phone: +91 98765 43210
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            By mail: FinAutoJobs Pvt Ltd, 401 Business Hub, Andheri East, Mumbai, Maharashtra 400069
                        </Typography>
                    </ul>
                </Section>
            </StyledPaper>
            </Box>
        </Box>
    );
};

export default TermsOfServicePage;
