import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check } from '@mui/icons-material';
import { useState } from 'react';
import { Link } from 'wouter';

const StyledCard = styled(Card)(({ theme, featured }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    position: 'relative',
    transition: 'transform 0.3s ease-in-out',
    ...(featured && {
        border: `2px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.primary.light,
    }),
    '&:hover': {
        transform: 'translateY(-8px)',
    },
}));

const FeatureItem = styled(ListItem)({
    padding: '8px 0',
});

const plans = [
    {
        name: 'Free',
        price: {
            monthly: 0,
            annual: 0,
        },
        description: 'Perfect for job seekers',
        features: [
            'Up to 10 job applications per month',
            'Basic resume builder',
            'Job alerts',
            'Basic candidate profile',
        ],
        buttonText: 'Get Started',
        buttonVariant: 'outlined',
    },
    {
        name: 'Pro',
        price: {
            monthly: 29,
            annual: 299,
        },
        description: 'Best for active job seekers',
        features: [
            'Unlimited job applications',
            'Advanced resume builder',
            'Priority job alerts',
            'Featured candidate profile',
            'Interview preparation tools',
            'Direct messaging with recruiters',
        ],
        buttonText: 'Start Free Trial',
        buttonVariant: 'contained',
        featured: true,
    },
    {
        name: 'Enterprise',
        price: {
            monthly: 99,
            annual: 999,
        },
        description: 'For recruiters and companies',
        features: [
            'All Pro features',
            'Unlimited job postings',
            'Advanced candidate search',
            'Applicant tracking system',
            'Analytics and reporting',
            'API access',
            'Dedicated support',
        ],
        buttonText: 'Contact Sales',
        buttonVariant: 'outlined',
    },
];

const PricingPage = () => {
    const [annualBilling, setAnnualBilling] = useState(false);

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            {/* Header */}
            <Box textAlign="center" mb={8}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Simple, Transparent Pricing
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                    Choose the plan that's right for you
                </Typography>

                {/* Billing Toggle */}
                <Box sx={{ mt: 4 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={annualBilling}
                                onChange={() => setAnnualBilling(!annualBilling)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body1">
                                Bill Annually (Save 15%)
                            </Typography>
                        }
                    />
                </Box>
            </Box>

            {/* Pricing Cards */}
            <Grid container spacing={4} alignItems="stretch">
                {plans.map((plan) => (
                    <Grid item key={plan.name} xs={12} md={4}>
                        <StyledCard featured={plan.featured} elevation={plan.featured ? 8 : 1}>
                            {plan.featured && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: '0.875rem',
                                        fontWeight: 'medium',
                                    }}
                                >
                                    Most Popular
                                </Box>
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="h3"
                                    component="h2"
                                    gutterBottom
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    ₹{annualBilling ? plan.price.annual : plan.price.monthly}
                                    <Typography
                                        component="span"
                                        variant="h6"
                                        color="text.secondary"
                                        sx={{ ml: 1 }}
                                    >
                                        {plan.price.monthly === 0 ? '' : `/${annualBilling ? 'year' : 'month'}`}
                                    </Typography>
                                </Typography>
                                <Typography variant="h5" component="h3" gutterBottom color="primary">
                                    {plan.name}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" paragraph>
                                    {plan.description}
                                </Typography>

                                <List sx={{ mb: 4 }}>
                                    {plan.features.map((feature) => (
                                        <FeatureItem key={feature} disableGutters>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <Check color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary={feature} />
                                        </FeatureItem>
                                    ))}
                                </List>

                                <Button
                                    component={Link}
                                    href={plan.name === 'Enterprise' ? '/contact' : '/register'}
                                    fullWidth
                                    variant={plan.buttonVariant}
                                    color="primary"
                                    size="large"
                                    sx={{ mt: 'auto' }}
                                >
                                    {plan.buttonText}
                                </Button>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>

            {/* FAQ Section */}
            <Box sx={{ mt: 12 }}>
                <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
                    Frequently Asked Questions
                </Typography>
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom color="primary">
                            What forms of payment do you accept?
                        </Typography>
                        <Typography variant="body1" paragraph color="text.secondary">
                            We accept all major credit cards, debit cards, and UPI payments. For Enterprise plans,
                            we also accept bank transfers.
                        </Typography>

                        <Typography variant="h6" gutterBottom color="primary">
                            Can I cancel at any time?
                        </Typography>
                        <Typography variant="body1" paragraph color="text.secondary">
                            Yes, you can cancel your subscription at any time. If you cancel, you'll retain access
                            to your plan until the end of your current billing period.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom color="primary">
                            Do you offer refunds?
                        </Typography>
                        <Typography variant="body1" paragraph color="text.secondary">
                            Yes, we offer a 30-day money-back guarantee for our Pro plan. If you're not satisfied,
                            just let us know within 30 days of your purchase.
                        </Typography>

                        <Typography variant="h6" gutterBottom color="primary">
                            Do you offer discounts for startups?
                        </Typography>
                        <Typography variant="body1" paragraph color="text.secondary">
                            Yes, we offer special startup pricing for eligible companies. Please contact our sales
                            team to learn more.
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default PricingPage;
