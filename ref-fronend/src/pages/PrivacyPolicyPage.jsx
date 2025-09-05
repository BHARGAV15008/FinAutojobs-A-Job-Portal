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
                Last updated: September 4, 2025
            </Typography>

            <StyledPaper elevation={3}>
                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        1. Introduction
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to FinAutoJobs. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you about how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        2. Data We Collect
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We collect several different types of information for various purposes:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            Personal identification information (Name, email address, phone number, etc.)
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Professional information (Resume, work history, education, skills)
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Usage data (How you use our website)
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Technical data (IP address, browser type, device information)
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        3. How We Use Your Data
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We use your data for the following purposes:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            To provide and maintain our service
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            To notify you about changes to our service
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            To allow you to participate in interactive features
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            To provide customer support
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            To gather analysis or valuable information to improve our service
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        4. Data Security
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We have implemented appropriate security measures to prevent your personal data from being
                        accidentally lost, used, accessed, altered, or disclosed in an unauthorized way. We limit
                        access to your personal data to those employees, agents, contractors, and other third parties
                        who have a business need to know.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        5. Your Rights
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            Request access to your personal data
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Request correction of your personal data
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Request erasure of your personal data
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Object to processing of your personal data
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Request restriction of processing your personal data
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Request transfer of your personal data
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
                            By phone: +91 (800) 123-4567
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            By mail: 123 Tech Park, Bangalore, Karnataka, India 560001
                        </Typography>
                    </ul>
                </Section>
            </StyledPaper>
        </Container>
    );
};

export default PrivacyPolicyPage;
