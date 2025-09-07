import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    CardActions,
    Stepper,
    Step,
    StepLabel,
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,
    FormLabel,
    CircularProgress,
    LinearProgress,
    Rating,
    Alert,
    useTheme,
    Chip,
} from '@mui/material';
import {
    Psychology,
    Computer,
    Business,
    Engineering,
    Science,
    BarChart,
    Assignment,
    Group,
    Timer,
    CheckCircle,
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

const assessmentTypes = [
    {
        id: 'personality',
        title: 'Personality Assessment',
        description: 'Discover your work style and ideal career paths based on your personality traits',
        icon: Psychology,
        duration: '20 mins',
        questions: 40,
    },
    {
        id: 'technical',
        title: 'Technical Skills Assessment',
        description: 'Evaluate your technical knowledge and identify areas for improvement',
        icon: Computer,
        duration: '45 mins',
        questions: 30,
    },
    {
        id: 'aptitude',
        title: 'Aptitude Test',
        description: 'Assess your logical reasoning, numerical and verbal abilities',
        icon: BarChart,
        duration: '30 mins',
        questions: 50,
    },
    {
        id: 'leadership',
        title: 'Leadership Potential',
        description: 'Evaluate your leadership capabilities and management style',
        icon: Group,
        duration: '25 mins',
        questions: 35,
    },
];

const mockQuestions = {
    personality: [
        {
            id: 1,
            question: 'When working on a project, I prefer to:',
            options: [
                'Plan everything in detail before starting',
                'Start immediately and adjust as needed',
                'Combine planning with flexibility',
                'Get input from others before deciding',
            ],
        },
        {
            id: 2,
            question: 'In a team setting, I am most comfortable:',
            options: [
                'Leading the discussion',
                'Contributing ideas when asked',
                'Working independently on assigned tasks',
                'Facilitating collaboration between team members',
            ],
        },
        // Add more questions as needed
    ],
};

const CareerAssessmentPage = () => {
    const theme = useTheme();
    const [activeAssessment, setActiveAssessment] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleStartAssessment = (assessmentId) => {
        setActiveAssessment(assessmentId);
        setActiveStep(0);
        setAnswers({});
        setResult(null);
    };

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNext = () => {
        if (activeStep < mockQuestions[activeAssessment].length - 1) {
            setActiveStep(prevStep => prevStep + 1);
        } else {
            // Submit assessment
            setLoading(true);
            setTimeout(() => {
                // Mock result
                setResult({
                    traits: {
                        leadership: 85,
                        teamwork: 78,
                        innovation: 92,
                        communication: 88,
                    },
                    recommendedRoles: [
                        'Project Manager',
                        'Product Owner',
                        'Team Lead',
                        'Business Analyst',
                    ],
                    skillGaps: [
                        'Strategic Planning',
                        'Risk Management',
                        'Stakeholder Management',
                    ],
                    strengths: [
                        'Problem Solving',
                        'Creative Thinking',
                        'Team Collaboration',
                    ],
                });
                setLoading(false);
            }, 2000);
        }
    };

    const handleBack = () => {
        setActiveStep(prevStep => prevStep - 1);
    };

    const renderAssessment = () => {
        if (loading) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ mt: 2 }}>Analyzing your responses...</Typography>
                </Box>
            );
        }

        if (result) {
            return (
                <Box>
                    <Alert severity="success" sx={{ mb: 4 }}>
                        Assessment completed successfully! Here are your results.
                    </Alert>

                    <Grid container spacing={4}>
                        {/* Personality Traits */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Your Key Traits
                                    </Typography>
                                    {Object.entries(result.traits).map(([trait, score]) => (
                                        <Box key={trait} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {trait}
                                                </Typography>
                                                <Typography variant="body2" color="primary">
                                                    {score}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={score}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>
                                    ))}
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Recommended Roles */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Recommended Career Paths
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {result.recommendedRoles.map((role) => (
                                            <Grid item key={role}>
                                                <Chip
                                                    label={role}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Strengths */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Your Strengths
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {result.strengths.map((strength) => (
                                            <Grid item key={strength}>
                                                <Chip
                                                    label={strength}
                                                    color="success"
                                                    icon={<CheckCircle />}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        {/* Skill Gaps */}
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Areas for Development
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {result.skillGaps.map((skill) => (
                                            <Grid item key={skill}>
                                                <Chip
                                                    label={skill}
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={() => setActiveAssessment(null)}
                            sx={{ mr: 2 }}
                        >
                            Take Another Assessment
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => window.print()}
                        >
                            Download Report
                        </Button>
                    </Box>
                </Box>
            );
        }

        const currentQuestion = mockQuestions[activeAssessment][activeStep];

        return (
            <Box>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {mockQuestions[activeAssessment].map((_, index) => (
                        <Step key={index}>
                            <StepLabel />
                        </Step>
                    ))}
                </Stepper>

                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        {currentQuestion.question}
                    </Typography>

                    <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                        <RadioGroup
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        >
                            {currentQuestion.options.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!answers[currentQuestion.id]}
                        >
                            {activeStep === mockQuestions[activeAssessment].length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Career Assessment Tests
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Discover your strengths and ideal career path through our comprehensive assessments
                </Typography>
            </Box>

            {!activeAssessment ? (
                <Grid container spacing={3}>
                    {assessmentTypes.map((assessment) => (
                        <Grid item xs={12} md={6} key={assessment.id}>
                            <StyledCard>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box
                                            sx={{
                                                backgroundColor: 'primary.light',
                                                borderRadius: '50%',
                                                p: 1,
                                                mr: 2,
                                            }}
                                        >
                                            <assessment.icon color="primary" />
                                        </Box>
                                        <Typography variant="h6">
                                            {assessment.title}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {assessment.description}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Chip
                                            icon={<Timer />}
                                            label={assessment.duration}
                                            variant="outlined"
                                            size="small"
                                        />
                                        <Chip
                                            icon={<Assignment />}
                                            label={`${assessment.questions} questions`}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => handleStartAssessment(assessment.id)}
                                    >
                                        Start Assessment
                                    </Button>
                                </CardActions>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                renderAssessment()
            )}
        </Container>
    );
};

export default CareerAssessmentPage;
