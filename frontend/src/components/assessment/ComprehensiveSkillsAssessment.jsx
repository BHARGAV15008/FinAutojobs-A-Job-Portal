import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Quiz,
  Timer,
  EmojiEvents,
  CheckCircle,
  Cancel,
  PlayArrow,
  Refresh,
  Share,
  Download,
  Code,
  Psychology,
  Business,
  TrendingUp,
  Star,
  Speed,
  Assessment,
  School
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSkillsAssessments } from '../../hooks/useDataFetching';
import EmptyState from '../common/EmptyState';

const ComprehensiveSkillsAssessment = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Use real data fetching hook
  const { data: assessmentsData, loading, error, isEmpty, refetch } = useSkillsAssessments();

  // Handle loading and empty states
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading assessments...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading assessments: {error}
      </Alert>
    );
  }

  if (isEmpty || !assessmentsData) {
    return (
      <EmptyState
        type="skills"
        title="No Assessments Available"
        description="Skills assessments will be available soon. Check back later to test your skills and earn certificates."
        showRefresh={true}
        onRefresh={refetch}
      />
    );
  }

  // Use real data or fallback to default structure
  const assessments = assessmentsData || {
    technical: [
      {
        id: 'react-assessment',
        title: 'React.js Proficiency',
        description: 'Test your React knowledge including hooks, state management, and best practices',
        duration: 30,
        questionCount: 25,
        difficulty: 'Intermediate',
        category: 'Frontend',
        icon: <Code />,
        color: 'primary',
        skills: ['React', 'JavaScript', 'JSX', 'Hooks'],
        questions: [
          {
            id: 1,
            question: 'What is the correct way to update state in a functional component?',
            options: [
              'this.setState()',
              'useState hook',
              'updateState()',
              'setState()'
            ],
            correct: 1,
            explanation: 'useState hook is the correct way to manage state in functional components'
          },
          {
            id: 2,
            question: 'Which hook is used for side effects in React?',
            options: [
              'useEffect',
              'useState',
              'useContext',
              'useMemo'
            ],
            correct: 0,
            explanation: 'useEffect is used for handling side effects like API calls, subscriptions, etc.'
          },
          {
            id: 3,
            question: 'What is the purpose of React.memo()?',
            options: [
              'To memorize component state',
              'To prevent unnecessary re-renders',
              'To cache API responses',
              'To store component data'
            ],
            correct: 1,
            explanation: 'React.memo() is used to prevent unnecessary re-renders by memoizing the component'
          }
        ]
      },
      {
        id: 'javascript-assessment',
        title: 'JavaScript Fundamentals',
        description: 'Comprehensive test covering ES6+, async programming, and core concepts',
        duration: 45,
        questionCount: 30,
        difficulty: 'Beginner to Advanced',
        category: 'Programming',
        icon: <Code />,
        color: 'warning',
        skills: ['JavaScript', 'ES6+', 'Async/Await', 'Promises']
      },
      {
        id: 'python-assessment',
        title: 'Python Programming',
        description: 'Test your Python skills including data structures, OOP, and libraries',
        duration: 40,
        questionCount: 28,
        difficulty: 'Intermediate',
        category: 'Backend',
        icon: <Code />,
        color: 'success',
        skills: ['Python', 'OOP', 'Data Structures', 'Libraries']
      }
    ],
    soft: [
      {
        id: 'leadership-assessment',
        title: 'Leadership Skills',
        description: 'Evaluate your leadership potential and management capabilities',
        duration: 20,
        questionCount: 15,
        difficulty: 'All Levels',
        category: 'Management',
        icon: <Psychology />,
        color: 'secondary',
        skills: ['Leadership', 'Team Management', 'Decision Making', 'Communication']
      },
      {
        id: 'communication-assessment',
        title: 'Communication Skills',
        description: 'Assess your verbal and written communication effectiveness',
        duration: 25,
        questionCount: 20,
        difficulty: 'All Levels',
        category: 'Soft Skills',
        icon: <Psychology />,
        color: 'info',
        skills: ['Communication', 'Presentation', 'Writing', 'Listening']
      }
    ],
    domain: [
      {
        id: 'finance-assessment',
        title: 'Financial Analysis',
        description: 'Test your knowledge of financial concepts and analysis techniques',
        duration: 35,
        questionCount: 25,
        difficulty: 'Intermediate',
        category: 'Finance',
        icon: <Business />,
        color: 'primary',
        skills: ['Financial Analysis', 'Accounting', 'Investment', 'Risk Management']
      },
      {
        id: 'marketing-assessment',
        title: 'Digital Marketing',
        description: 'Evaluate your understanding of digital marketing strategies and tools',
        duration: 30,
        questionCount: 22,
        difficulty: 'Beginner to Intermediate',
        category: 'Marketing',
        icon: <Business />,
        color: 'error',
        skills: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics']
      }
    ]
  };

  const userAssessmentHistory = [
    {
      id: 'react-assessment',
      title: 'React.js Proficiency',
      score: 85,
      level: 'Advanced',
      completedAt: '2024-10-15',
      timeSpent: '28 min',
      badge: 'Expert'
    },
    {
      id: 'javascript-assessment',
      title: 'JavaScript Fundamentals',
      score: 78,
      level: 'Intermediate',
      completedAt: '2024-10-10',
      timeSpent: '42 min',
      badge: 'Proficient'
    }
  ];

  useEffect(() => {
    let timer;
    if (assessmentStarted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && assessmentStarted) {
      handleSubmitAssessment();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, assessmentStarted]);

  const startAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(assessment.duration * 60);
    setAssessmentStarted(true);
    setAssessmentCompleted(false);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedAssessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = () => {
    setAssessmentStarted(false);
    setAssessmentCompleted(true);
    
    // Calculate results
    const correctAnswers = selectedAssessment.questions.filter(
      (q, index) => answers[q.id] === q.correct
    ).length;
    
    const score = Math.round((correctAnswers / selectedAssessment.questions.length) * 100);
    const level = score >= 80 ? 'Expert' : score >= 60 ? 'Advanced' : score >= 40 ? 'Intermediate' : 'Beginner';
    
    setResults({
      score,
      level,
      correctAnswers,
      totalQuestions: selectedAssessment.questions.length,
      timeSpent: Math.round((selectedAssessment.duration * 60 - timeLeft) / 60),
      recommendations: generateRecommendations(score)
    });
    
    setShowResults(true);
  };

  const generateRecommendations = (score) => {
    if (score >= 80) {
      return [
        'Excellent performance! Consider taking advanced assessments',
        'You could mentor others in this skill area',
        'Look for senior-level positions requiring this skill'
      ];
    } else if (score >= 60) {
      return [
        'Good foundation! Focus on advanced concepts',
        'Practice with real-world projects',
        'Consider additional training in weak areas'
      ];
    } else {
      return [
        'Start with fundamentals and basic concepts',
        'Take online courses or tutorials',
        'Practice regularly with coding exercises'
      ];
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const AssessmentCard = ({ assessment, onStart }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${assessment.color}.main`, mr: 2 }}>
              {assessment.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {assessment.title}
              </Typography>
              <Chip 
                label={assessment.difficulty} 
                size="small" 
                color={assessment.color}
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {assessment.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {assessment.skills.map((skill, index) => (
              <Chip key={index} label={skill} size="small" variant="outlined" />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Timer sx={{ fontSize: 16 }} />
              <Typography variant="caption">{assessment.duration} min</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Quiz sx={{ fontSize: 16 }} />
              <Typography variant="caption">{assessment.questionCount || assessment.questions?.length || 0} questions</Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={() => onStart(assessment)}
            color={assessment.color}
          >
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const AssessmentInterface = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {selectedAssessment.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<Timer />} 
              label={formatTime(timeLeft)} 
              color={timeLeft < 300 ? 'error' : 'primary'}
            />
            <Typography variant="body2">
              Question {currentQuestion + 1} of {selectedAssessment.questions.length}
            </Typography>
          </Box>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={(currentQuestion / selectedAssessment.questions.length) * 100} 
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {selectedAssessment.questions[currentQuestion]?.question}
          </Typography>
          
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={answers[selectedAssessment.questions[currentQuestion]?.id] || ''}
              onChange={(e) => handleAnswerSelect(
                selectedAssessment.questions[currentQuestion].id, 
                parseInt(e.target.value)
              )}
            >
              {selectedAssessment.questions[currentQuestion]?.options.map((option, index) => (
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
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setAssessmentStarted(false)}
          >
            Exit Assessment
          </Button>
          <Button
            variant="contained"
            onClick={handleNextQuestion}
            disabled={!answers[selectedAssessment.questions[currentQuestion]?.id]}
          >
            {currentQuestion < selectedAssessment.questions.length - 1 ? 'Next Question' : 'Submit Assessment'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const ResultsDisplay = () => (
    <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEvents color="primary" />
          Assessment Results
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {results?.score}%
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {results?.level} Level
                </Typography>
                <Chip 
                  label={`${results?.correctAnswers}/${results?.totalQuestions} Correct`}
                  color="success"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Completed in {results?.timeSpent} minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💡 Recommendations
                </Typography>
                <List dense>
                  {results?.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Star color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="success">
              <Typography variant="subtitle1">
                🎉 Congratulations! You've completed the {selectedAssessment?.title} assessment.
              </Typography>
              <Typography variant="body2">
                Your results have been saved to your profile and will be visible to potential employers.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowResults(false)}>Close</Button>
        <Button startIcon={<Share />} variant="outlined">Share Results</Button>
        <Button startIcon={<Download />} variant="contained">Download Certificate</Button>
      </DialogActions>
    </Dialog>
  );

  const AssessmentHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        📊 Your Assessment History
      </Typography>
      <Grid container spacing={2}>
        {userAssessmentHistory.map((assessment, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">{assessment.title}</Typography>
                  <Chip 
                    label={assessment.badge} 
                    color={assessment.score >= 80 ? 'success' : 'primary'}
                    size="small"
                  />
                </Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {assessment.score}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {assessment.level} • {assessment.timeSpent} • {assessment.completedAt}
                </Typography>
                <Button size="small" sx={{ mt: 1 }}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box>

      {!assessmentStarted ? (
        <>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Technical Skills" />
            <Tab label="Soft Skills" />
            <Tab label="Domain Knowledge" />
            <Tab label="My Results" />
          </Tabs>

          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <Grid container spacing={3}>
                {assessments.technical.map((assessment, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <AssessmentCard assessment={assessment} onStart={startAssessment} />
                  </Grid>
                ))}
              </Grid>
            )}
            
            {activeTab === 1 && (
              <Grid container spacing={3}>
                {assessments.soft.map((assessment, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <AssessmentCard assessment={assessment} onStart={startAssessment} />
                  </Grid>
                ))}
              </Grid>
            )}
            
            {activeTab === 2 && (
              <Grid container spacing={3}>
                {assessments.domain.map((assessment, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <AssessmentCard assessment={assessment} onStart={startAssessment} />
                  </Grid>
                ))}
              </Grid>
            )}
            
            {activeTab === 3 && <AssessmentHistory />}
          </AnimatePresence>
        </>
      ) : (
        <AssessmentInterface />
      )}

      <ResultsDisplay />
    </Box>
  );
};

export default ComprehensiveSkillsAssessment;
