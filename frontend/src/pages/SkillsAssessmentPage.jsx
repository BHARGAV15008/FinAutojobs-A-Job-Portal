import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Paper,
    Avatar,
    Stepper,
    Step,
    StepLabel,
    Alert,
    Divider,
} from '@mui/material';
import {
    Quiz,
    Timer,
    EmojiEvents,
    TrendingUp,
    Code,
    AccountBalance,
    DirectionsCar,
    Psychology,
    CheckCircle,
    Cancel,
    PlayArrow,
    Refresh,
    Share,
    Download,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const AssessmentCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[12],
    },
}));

const SkillsAssessmentPage = () => {
    const [assessments, setAssessments] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isAssessmentActive, setIsAssessmentActive] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [assessmentResult, setAssessmentResult] = useState(null);

    // Mock assessments data
    const mockAssessments = [
        {
            id: 1,
            title: 'Financial Analysis Fundamentals',
            category: 'Finance',
            icon: <AccountBalance />,
            difficulty: 'Intermediate',
            duration: 30,
            questions: 25,
            description: 'Test your knowledge of financial statements, ratios, and analysis techniques.',
            skills: ['Financial Modeling', 'Ratio Analysis', 'Cash Flow Analysis'],
            participants: 15420,
            averageScore: 72,
            badge: 'Finance Expert',
            color: 'primary',
            questions_data: [
                {
                    id: 1,
                    question: 'What is the current ratio formula?',
                    options: [
                        'Current Assets / Current Liabilities',
                        'Total Assets / Total Liabilities',
                        'Cash / Current Liabilities',
                        'Working Capital / Total Assets'
                    ],
                    correct: 0
                },
                {
                    id: 2,
                    question: 'Which financial statement shows a company\'s profitability over a period?',
                    options: [
                        'Balance Sheet',
                        'Income Statement',
                        'Cash Flow Statement',
                        'Statement of Equity'
                    ],
                    correct: 1
                },
                // Add more questions...
            ]
        },
        {
            id: 2,
            title: 'Automotive Engineering Basics',
            category: 'Automotive',
            icon: <DirectionsCar />,
            difficulty: 'Beginner',
            duration: 25,
            questions: 20,
            description: 'Assess your understanding of automotive systems, engines, and manufacturing.',
            skills: ['Engine Systems', 'Vehicle Dynamics', 'Manufacturing Processes'],
            participants: 8930,
            averageScore: 68,
            badge: 'Auto Engineer',
            color: 'secondary',
            questions_data: [
                {
                    id: 1,
                    question: 'What is the primary function of a catalytic converter?',
                    options: [
                        'Increase engine power',
                        'Reduce harmful emissions',
                        'Improve fuel efficiency',
                        'Cool the engine'
                    ],
                    correct: 1
                },
                // Add more questions...
            ]
        },
        {
            id: 3,
            title: 'Investment Banking Concepts',
            category: 'Finance',
            icon: <TrendingUp />,
            difficulty: 'Advanced',
            duration: 45,
            questions: 35,
            description: 'Advanced concepts in investment banking, M&A, and capital markets.',
            skills: ['M&A Analysis', 'Valuation', 'Capital Markets', 'Risk Assessment'],
            participants: 5670,
            averageScore: 65,
            badge: 'Investment Pro',
            color: 'success',
            questions_data: [
                {
                    id: 1,
                    question: 'What is the primary purpose of a DCF model?',
                    options: [
                        'Calculate current market value',
                        'Estimate intrinsic value based on future cash flows',
                        'Determine book value',
                        'Assess liquidity ratios'
                    ],
                    correct: 1
                },
                // Add more questions...
            ]
        },
        {
            id: 4,
            title: 'Electric Vehicle Technology',
            category: 'Automotive',
            icon: <Psychology />,
            difficulty: 'Intermediate',
            duration: 35,
            questions: 30,
            description: 'Test your knowledge of EV technology, batteries, and charging systems.',
            skills: ['Battery Technology', 'Electric Motors', 'Charging Infrastructure'],
            participants: 12340,
            averageScore: 70,
            badge: 'EV Specialist',
            color: 'warning',
            questions_data: [
                {
                    id: 1,
                    question: 'What type of battery is most commonly used in modern EVs?',
                    options: [
                        'Lead-acid',
                        'Nickel-metal hydride',
                        'Lithium-ion',
                        'Solid-state'
                    ],
                    correct: 2
                },
                // Add more questions...
            ]
        },
        {
            id: 5,
            title: 'Risk Management Fundamentals',
            category: 'Finance',
            icon: <Quiz />,
            difficulty: 'Intermediate',
            duration: 40,
            questions: 28,
            description: 'Comprehensive assessment of risk management principles and practices.',
            skills: ['Risk Assessment', 'Portfolio Management', 'Derivatives', 'Compliance'],
            participants: 9870,
            averageScore: 74,
            badge: 'Risk Manager',
            color: 'error',
            questions_data: [
                {
                    id: 1,
                    question: 'What is Value at Risk (VaR)?',
                    options: [
                        'Maximum expected loss over a specific time period',
                        'Average daily trading volume',
                        'Total portfolio value',
                        'Risk-free rate of return'
                    ],
                    correct: 0
                },
                // Add more questions...
            ]
        },
        {
            id: 6,
            title: 'Automotive Manufacturing',
            category: 'Automotive',
            icon: <Code />,
            difficulty: 'Advanced',
            duration: 50,
            questions: 40,
            description: 'Advanced manufacturing processes, quality control, and lean production.',
            skills: ['Lean Manufacturing', 'Quality Control', 'Supply Chain', 'Automation'],
            participants: 6540,
            averageScore: 69,
            badge: 'Manufacturing Expert',
            color: 'info',
            questions_data: [
                {
                    id: 1,
                    question: 'What is the main principle of Just-in-Time (JIT) manufacturing?',
                    options: [
                        'Maximize inventory levels',
                        'Produce only what is needed when needed',
                        'Focus on speed over quality',
                        'Centralize all operations'
                    ],
                    correct: 1
                },
                // Add more questions...
            ]
        },
    ];

    // Mock user results
    const mockUserResults = [
        {
            assessmentId: 1,
            score: 85,
            completedAt: '2024-01-15',
            rank: 'Top 15%',
            badge: 'Finance Expert',
            timeSpent: 28
        },
        {
            assessmentId: 4,
            score: 78,
            completedAt: '2024-01-10',
            rank: 'Top 25%',
            badge: 'EV Specialist',
            timeSpent: 32
        },
    ];

    useEffect(() => {
        setAssessments(mockAssessments);
        setUserResults(mockUserResults);
    }, []);

    useEffect(() => {
        let timer;
        if (isAssessmentActive && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && isAssessmentActive) {
            handleSubmitAssessment();
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isAssessmentActive]);

    const startAssessment = (assessment) => {
        setSelectedAssessment(assessment);
        setCurrentQuestion(0);
        setAnswers({});
        setTimeLeft(assessment.duration * 60);
        setIsAssessmentActive(true);
        setShowResults(false);
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const nextQuestion = () => {
        if (currentQuestion < selectedAssessment.questions_data.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitAssessment = () => {
        setIsAssessmentActive(false);
        
        // Calculate score
        let correctAnswers = 0;
        selectedAssessment.questions_data.forEach(question => {
            if (answers[question.id] === question.correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / selectedAssessment.questions_data.length) * 100);
        const timeSpent = selectedAssessment.duration - Math.floor(timeLeft / 60);
        
        const result = {
            assessmentId: selectedAssessment.id,
            score,
            correctAnswers,
            totalQuestions: selectedAssessment.questions_data.length,
            timeSpent,
            rank: score >= 90 ? 'Top 5%' : score >= 80 ? 'Top 15%' : score >= 70 ? 'Top 30%' : 'Top 50%',
            badge: selectedAssessment.badge,
            completedAt: new Date().toISOString().split('T')[0]
        };
        
        setAssessmentResult(result);
        setShowResults(true);
        
        // Add to user results
        setUserResults(prev => [...prev, result]);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'success';
            case 'Intermediate': return 'warning';
            case 'Advanced': return 'error';
            default: return 'primary';
        }
    };

    const AssessmentCardComponent = ({ assessment }) => {
        const hasCompleted = userResults.some(result => result.assessmentId === assessment.id);
        const userResult = userResults.find(result => result.assessmentId === assessment.id);

        return (
            <AssessmentCard>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: `${assessment.color}.main`, mr: 2 }}>
                            {assessment.icon}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {assessment.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {assessment.category}
                            </Typography>
                        </Box>
                        <Chip
                            label={assessment.difficulty}
                            color={getDifficultyColor(assessment.difficulty)}
                            size="small"
                        />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {assessment.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Skills Assessed:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {assessment.skills.map((skill, index) => (
                                <Chip
                                    key={index}
                                    label={skill}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {assessment.duration} min
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Quiz sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {assessment.questions} questions
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {assessment.participants.toLocaleString()} participants • Avg: {assessment.averageScore}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={assessment.averageScore}
                            sx={{ height: 6, borderRadius: 3 }}
                        />
                    </Box>

                    {hasCompleted && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                Completed: {userResult.score}% • {userResult.rank}
                            </Typography>
                        </Alert>
                    )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        fullWidth
                        variant={hasCompleted ? "outlined" : "contained"}
                        startIcon={hasCompleted ? <Refresh /> : <PlayArrow />}
                        onClick={() => startAssessment(assessment)}
                    >
                        {hasCompleted ? 'Retake Assessment' : 'Start Assessment'}
                    </Button>
                </CardActions>
            </AssessmentCard>
        );
    };

    const QuestionDialog = () => {
        if (!selectedAssessment || !isAssessmentActive) return null;

        const question = selectedAssessment.questions_data[currentQuestion];
        const progress = ((currentQuestion + 1) / selectedAssessment.questions_data.length) * 100;

        return (
            <Dialog
                open={isAssessmentActive}
                maxWidth="md"
                fullWidth
                disableEscapeKeyDown
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {selectedAssessment.title}
                        </Typography>
                        <Chip
                            label={formatTime(timeLeft)}
                            color={timeLeft < 300 ? 'error' : 'primary'}
                            icon={<Timer />}
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ mt: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Question {currentQuestion + 1} of {selectedAssessment.questions_data.length}
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        {question.question}
                    </Typography>

                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswerSelect(question.id, parseInt(e.target.value))}
                        >
                            {question.options.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    value={index}
                                    control={<Radio />}
                                    label={option}
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={previousQuestion}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    {currentQuestion === selectedAssessment.questions_data.length - 1 ? (
                        <Button
                            onClick={handleSubmitAssessment}
                            variant="contained"
                            color="success"
                        >
                            Submit Assessment
                        </Button>
                    ) : (
                        <Button
                            onClick={nextQuestion}
                            variant="contained"
                        >
                            Next
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        );
    };

    const ResultsDialog = () => {
        if (!showResults || !assessmentResult) return null;

        return (
            <Dialog
                open={showResults}
                maxWidth="sm"
                fullWidth
                onClose={() => setShowResults(false)}
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    <EmojiEvents sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                        Assessment Complete!
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" color="primary" fontWeight="bold" gutterBottom>
                        {assessmentResult.score}%
                    </Typography>
                    
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {assessmentResult.rank}
                    </Typography>

                    <Chip
                        label={assessmentResult.badge}
                        color="primary"
                        sx={{ mb: 3, fontWeight: 'bold' }}
                    />

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="primary">
                                    {assessmentResult.correctAnswers}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Correct Answers
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="primary">
                                    {assessmentResult.timeSpent}m
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Time Spent
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            This assessment result has been added to your profile and can be shared with employers.
                        </Typography>
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button
                        startIcon={<Share />}
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        Share Result
                    </Button>
                    <Button
                        startIcon={<Download />}
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        Download Certificate
                    </Button>
                    <Button
                        onClick={() => setShowResults(false)}
                        variant="contained"
                    >
                        Continue
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Skills Assessment
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Test your knowledge and showcase your expertise to employers
                </Typography>
            </Box>

            {/* User Progress Summary */}
            {userResults.length > 0 && (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Your Assessment Progress
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {userResults.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Completed
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {Math.round(userResults.reduce((sum, result) => sum + result.score, 0) / userResults.length)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Average Score
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {userResults.filter(r => r.score >= 80).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Expert Level
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {new Set(userResults.map(r => r.badge)).size}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Badges Earned
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Assessments Grid */}
            <Grid container spacing={3}>
                {assessments.map((assessment) => (
                    <Grid item xs={12} md={6} lg={4} key={assessment.id}>
                        <AssessmentCardComponent assessment={assessment} />
                    </Grid>
                ))}
            </Grid>

            {/* Question Dialog */}
            <QuestionDialog />

            {/* Results Dialog */}
            <ResultsDialog />
        </Container>
    );
};

export default SkillsAssessmentPage;