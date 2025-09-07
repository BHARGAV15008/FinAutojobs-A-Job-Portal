import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Slider,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    useTheme,
} from '@mui/material';
import {
    TrendingUp,
    LocationOn,
    Work,
    School,
    Business,
    Timeline,
    MonetizationOn,
    CompareArrows,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    },
}));

const SalaryCalculatorPage = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jobTitle: '',
        location: '',
        experience: '',
        education: '',
        industry: '',
        skills: [],
    });
    const [salaryData, setSalaryData] = useState(null);

    const locations = [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
        'Ahmedabad', 'Gurgaon', 'Noida',
    ];

    const industries = [
        'Information Technology', 'Banking & Finance', 'Healthcare', 'Manufacturing',
        'Automotive', 'E-commerce', 'Education', 'Real Estate', 'Consulting',
        'Telecommunications',
    ];

    const educationLevels = [
        "Bachelor's Degree", "Master's Degree", "PhD", "Diploma", "High School",
        "Professional Certification",
    ];

    const skillsList = [
        'JavaScript', 'Python', 'Java', 'React', 'Angular', 'Node.js', 'SQL',
        'Machine Learning', 'Data Analysis', 'Project Management', 'Digital Marketing',
        'Sales', 'Communication', 'Leadership',
    ];

    const handleCalculate = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock salary data
            setSalaryData({
                averageSalary: 1200000,
                salaryRange: {
                    min: 800000,
                    max: 1600000,
                },
                marketTrend: 'up',
                trendPercentage: 15,
                demandLevel: 'High',
                topCompanies: [
                    { name: 'TCS', avgSalary: 1300000 },
                    { name: 'Infosys', avgSalary: 1250000 },
                    { name: 'Wipro', avgSalary: 1150000 },
                ],
                skillPremiums: [
                    { skill: 'Python', premium: 20 },
                    { skill: 'React', premium: 25 },
                    { skill: 'AWS', premium: 30 },
                ],
            });
        } catch (error) {
            console.error('Error calculating salary:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSkillChange = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill],
        }));
    };

    const formatSalary = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3,
        }).format(amount);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Salary Calculator
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Get accurate salary estimates based on your profile and market data
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Calculator Form */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Enter Your Details
                        </Typography>

                        <Box component="form" sx={{ '& .MuiTextField-root': { my: 2 } }}>
                            <TextField
                                fullWidth
                                label="Job Title"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                            />

                            <TextField
                                fullWidth
                                select
                                label="Location"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            >
                                {locations.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                fullWidth
                                select
                                label="Industry"
                                value={formData.industry}
                                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                            >
                                {industries.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                fullWidth
                                type="number"
                                label="Years of Experience"
                                value={formData.experience}
                                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                            />

                            <TextField
                                fullWidth
                                select
                                label="Education Level"
                                value={formData.education}
                                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                            >
                                {educationLevels.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                                Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {skillsList.map((skill) => (
                                    <Chip
                                        key={skill}
                                        label={skill}
                                        onClick={() => handleSkillChange(skill)}
                                        color={formData.skills.includes(skill) ? 'primary' : 'default'}
                                        variant={formData.skills.includes(skill) ? 'filled' : 'outlined'}
                                    />
                                ))}
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleCalculate}
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Calculate Salary'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Results Section */}
                <Grid item xs={12} md={7}>
                    {salaryData ? (
                        <Box>
                            {/* Salary Overview */}
                            <StyledCard sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Estimated Salary Range
                                    </Typography>
                                    <Typography variant="h3" color="primary" gutterBottom>
                                        {formatSalary(salaryData.averageSalary)}/year
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Range: {formatSalary(salaryData.salaryRange.min)} - {formatSalary(salaryData.salaryRange.max)}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp color="success" />
                                        <Typography variant="body2" color="success.main">
                                            {salaryData.trendPercentage}% increase in the last year
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </StyledCard>

                            {/* Market Insights */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <StyledCard>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Top Paying Companies
                                            </Typography>
                                            {salaryData.topCompanies.map((company, index) => (
                                                <Box key={index} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body1">{company.name}</Typography>
                                                        <Typography variant="body1" color="primary">
                                                            {formatSalary(company.avgSalary)}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={(company.avgSalary / salaryData.salaryRange.max) * 100}
                                                        sx={{ height: 6, borderRadius: 1 }}
                                                    />
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </StyledCard>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <StyledCard>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Skill Premiums
                                            </Typography>
                                            {salaryData.skillPremiums.map((skill, index) => (
                                                <Box key={index} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body1">{skill.skill}</Typography>
                                                        <Typography variant="body1" color="success.main">
                                                            +{skill.premium}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={skill.premium}
                                                        color="success"
                                                        sx={{ height: 6, borderRadius: 1 }}
                                                    />
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </StyledCard>
                                </Grid>
                            </Grid>

                            {/* Additional Insights */}
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Market Insight
                                        </Typography>
                                        Based on current market trends and your profile, you have a strong position to negotiate within the estimated range. Consider upskilling in React and AWS to increase your market value by up to 30%.
                                    </Alert>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Paper
                            sx={{
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MonetizationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Enter your details to calculate salary
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                                Our AI-powered calculator will analyze market data to provide accurate salary estimates based on your profile.
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* Salary Insights */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom>
                    Salary Insights
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <StyledCard>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocationOn color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Location Impact</Typography>
                                </Box>
                                <Typography variant="body2" paragraph>
                                    Salary variations based on location can be significant. Metro cities typically offer 20-30% higher compensation.
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledCard>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Timeline color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Experience Premium</Typography>
                                </Box>
                                <Typography variant="body2" paragraph>
                                    Each year of relevant experience typically adds 8-12% to your base salary, with accelerated growth at senior levels.
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledCard>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <School color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Education Benefits</Typography>
                                </Box>
                                <Typography variant="body2" paragraph>
                                    Advanced degrees and certifications can increase your earning potential by 15-25% in specialized roles.
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default SalaryCalculatorPage;
