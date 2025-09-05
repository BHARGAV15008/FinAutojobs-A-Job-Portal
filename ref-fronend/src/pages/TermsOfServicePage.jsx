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
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom align="center">
                Terms of Service
            </Typography>
            <Typography variant="subtitle1" paragraph align="center" color="text.secondary" sx={{ mb: 8 }}>
                Last updated: September 4, 2025
            </Typography>

            <StyledPaper elevation={3}>
                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        1. Agreement to Terms
                    </Typography>
                    <Typography variant="body1" paragraph>
                        By accessing or using FinAutoJobs, you agree to be bound by these Terms of Service and all applicable
                        laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
                        accessing this site.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        2. Use License
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Permission is granted to temporarily access the materials (information or software) on FinAutoJobs's website
                        for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title,
                        and under this license you may not:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            Modify or copy the materials
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Use the materials for any commercial purpose
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Attempt to decompile or reverse engineer any software
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Remove any copyright or proprietary notations
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Transfer the materials to another person or "mirror" the materials on any other server
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        3. User Accounts
                    </Typography>
                    <Typography variant="body1" paragraph>
                        When you create an account with us, you guarantee that:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            The information you provide is accurate, complete, and current
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            You are of legal age to form a binding contract
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            Your use of the service will not violate any applicable laws or regulations
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        4. Job Postings and Applications
                    </Typography>
                    <Typography variant="body1" paragraph>
                        FinAutoJobs does not guarantee:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1" paragraph>
                            The accuracy or completeness of job postings
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            That any application will result in interviews or job offers
                        </Typography>
                        <Typography component="li" variant="body1" paragraph>
                            That jobs posted will be filled by users of the platform
                        </Typography>
                    </ul>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        5. Disclaimer
                    </Typography>
                    <Typography variant="body1" paragraph>
                        The materials on FinAutoJobs's website are provided on an 'as is' basis. FinAutoJobs makes no
                        warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                        without limitation, implied warranties or conditions of merchantability, fitness for a particular
                        purpose, or non-infringement of intellectual property or other violation of rights.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        6. Limitations
                    </Typography>
                    <Typography variant="body1" paragraph>
                        In no event shall FinAutoJobs or its suppliers be liable for any damages (including, without limitation,
                        damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                        to use the materials on FinAutoJobs's website.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        7. Governing Law
                    </Typography>
                    <Typography variant="body1" paragraph>
                        These terms and conditions are governed by and construed in accordance with the laws of India and you
                        irrevocably submit to the exclusive jurisdiction of the courts in that location.
                    </Typography>
                </Section>

                <Divider sx={{ my: 4 }} />

                <Section>
                    <Typography variant="h5" gutterBottom color="primary">
                        8. Changes to Terms
                    </Typography>
                    <Typography variant="body1" paragraph>
                        FinAutoJobs reserves the right, at our sole discretion, to modify or replace these Terms at any time.
                        If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect.
                        What constitutes a material change will be determined at our sole discretion.
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

export default TermsOfServicePage;
