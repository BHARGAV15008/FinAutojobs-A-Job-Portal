import React, { useState } from 'react';
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
    Avatar,
    Chip,
    Paper,
    Tab,
    Tabs,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    LinearProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    School,
    Work,
    TrendingUp,
    Psychology,
    MenuBook,
    Quiz,
    Timeline,
    Star,
    CheckCircle,
    PlayArrow,
    ExpandMore,
    Lightbulb,
    Group,
    Business,
    Assessment,
    EmojiEvents,
    AutoStories,
    VideoLibrary,
    Forum,
    Support,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GradientCard = styled(Card)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
    border: `1px solid ${theme.palette.primary.main}30`,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[12],
    },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const CareerGuidancePage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedTab, setSelectedTab] = useState(0);

    const careerPaths = [
        {
            title: 'Finance Career Path',
            icon: <TrendingUp />,
            color: 'primary',
            description: 'Build a successful career in finance and banking',
            levels: [
                { title: 'Financial Analyst', experience: '0-2 years', salary: '₹4-8L' },
                { title: 'Senior Financial Analyst', experience: '2-5 years', salary: '₹8-15L' },
                { title: 'Finance Manager', experience: '5-8 years', salary: '₹15-25L' },
                { title: 'Finance Director', experience: '8+ years', salary: '₹25L+' },
            ],
            skills: ['Excel', 'Financial Modeling', 'SQL', 'Python', 'Risk Analysis'],
            certifications: ['CFA', 'FRM', 'CPA', 'ACCA'],
        },
        {
            title: 'Automotive Career Path',
            icon: <Work />,
            color: 'secondary',
            description: 'Advance your career in automotive engineering',
            levels: [
                { title: 'Junior Engineer', experience: '0-2 years', salary: '₹3-6L' },
                { title: 'Design Engineer', experience: '2-5 years', salary: '₹6-12L' },
                { title: 'Senior Engineer', experience: '5-8 years', salary: '₹12-20L' },
                { title: 'Engineering Manager', experience: '8+ years', salary: '₹20L+' },
            ],
            skills: ['CAD', 'CATIA', 'SolidWorks', 'MATLAB', 'Testing'],
            certifications: ['ASE', 'SAE', 'Six Sigma', 'PMP'],
        },
    ];

    const learningResources = [
        {
            category: 'Online Courses',
            icon: <School />,
            resources: [
                { title: 'Financial Modeling Masterclass', provider: 'Coursera', rating: 4.8, students: '50K+' },
                { title: 'Automotive Engineering Fundamentals', provider: 'edX', rating: 4.6, students: '25K+' },
                { title: 'Data Analysis for Finance', provider: 'Udemy', rating: 4.7, students: '30K+' },
                { title: 'Electric Vehicle Technology', provider: 'FutureLearn', rating: 4.5, students: '15K+' },
            ]
        },
        {
            category: 'Certifications',
            icon: <EmojiEvents />,
            resources: [
                { title: 'Chartered Financial Analyst (CFA)', provider: 'CFA Institute', rating: 4.9, students: '200K+' },
                { title: 'Certified Automotive Engineer', provider: 'SAE International', rating: 4.7, students: '50K+' },
                { title: 'Financial Risk Manager (FRM)', provider: 'GARP', rating: 4.8, students: '100K+' },
                { title: 'Six Sigma Green Belt', provider: 'ASQ', rating: 4.6, students: '75K+' },
            ]
        },
        {
            category: 'Books & Guides',
            icon: <AutoStories />,
            resources: [
                { title: 'The Intelligent Investor', provider: 'Benjamin Graham', rating: 4.9, students: '1M+' },
                { title: 'Automotive Engineering Handbook', provider: 'SAE', rating: 4.7, students: '100K+' },
                { title: 'Financial Statement Analysis', provider: 'Martin Fridson', rating: 4.6, students: '200K+' },
                { title: 'Electric Vehicle Technology', provider: 'IEEE', rating: 4.5, students: '50K+' },
            ]
        },
    ];

    const mentorshipPrograms = [
        {
            title: 'Finance Mentorship Program',
            mentor: 'Rajesh Kumar',
            role: 'VP Finance at HDFC Bank',
            experience: '15+ years',
            rating: 4.9,
            sessions: 120,
            price: '₹5,000/month',
            topics: ['Career Planning', 'Skill Development', 'Interview Prep', 'Industry Insights'],
        },
        {
            title: 'Automotive Engineering Mentorship',
            mentor: 'Priya Sharma',
            role: 'Chief Engineer at Tata Motors',
            experience: '12+ years',
            rating: 4.8,
            sessions: 95,
            price: '₹4,500/month',
            topics: ['Technical Skills', 'Project Management', 'Leadership', 'Innovation'],
        },
        {
            title: 'Investment Banking Mentorship',
            mentor: 'Amit Patel',
            role: 'MD at Goldman Sachs',
            experience: '18+ years',
            rating: 5.0,
            sessions: 200,
            price: '₹8,000/month',
            topics: ['Financial Modeling', 'Deal Structuring', 'Client Management', 'Career Growth'],
        },
    ];

    const careerTips = [
        {
            category: 'Skill Development',
            tips: [
                'Focus on both technical and soft skills',
                'Stay updated with industry trends',
                'Practice continuous learning',
                'Build a strong professional network',
            ]
        },
        {
            category: 'Job Search',
            tips: [
                'Tailor your resume for each application',
                'Prepare thoroughly for interviews',
                'Leverage professional networks',
                'Follow up professionally',
            ]
        },
        {
            category: 'Career Growth',
            tips: [
                'Set clear career goals',
                'Seek feedback regularly',
                'Take on challenging projects',
                'Find a mentor in your field',
            ]
        },
    ];

    const CareerPathCard = ({ path }) => (
        <GradientCard>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${path.color}.main`, mr: 2 }}>
                        {path.icon}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {path.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {path.description}
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                    Career Progression:
                </Typography>
                {path.levels.map((level, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                                {level.title}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                                {level.salary}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {level.experience}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={(index + 1) * 25}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        />
                    </Box>
                ))}

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                    Key Skills:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {path.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" color={path.color} variant="outlined" />
                    ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                    Recommended Certifications:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {path.certifications.map((cert, index) => (
                        <Chip key={index} label={cert} size="small" />
                    ))}
                </Box>
            </CardContent>
            <CardActions>
                <Button variant="contained" color={path.color} fullWidth>
                    Start Your Journey
                </Button>
            </CardActions>
        </GradientCard>
    );

    const MentorCard = ({ mentor }) => (
        <FeatureCard>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                        {mentor.mentor.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {mentor.mentor}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {mentor.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {mentor.experience} experience
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="body2">{mentor.rating}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {mentor.sessions} sessions
                    </Typography>
                </Box>

                <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                    {mentor.price}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                    Topics Covered:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {mentor.topics.map((topic, index) => (
                        <Chip key={index} label={topic} size="small" variant="outlined" />
                    ))}
                </Box>
            </CardContent>
            <CardActions>
                <Button variant="contained" fullWidth>
                    Book Session
                </Button>
            </CardActions>
        </FeatureCard>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Career Guidance
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Navigate your career journey with expert guidance and resources
                </Typography>
            </Box>

            {/* Career Assessment CTA */}
            <Paper
                sx={{
                    p: 4,
                    mb: 6,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                <Psychology sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Discover Your Ideal Career Path
                </Typography>
                <Typography variant="h6" paragraph>
                    Take our comprehensive career assessment to find the perfect role for your skills and interests
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'grey.100' },
                    }}
                    startIcon={<PlayArrow />}
                >
                    Start Career Assessment
                </Button>
            </Paper>

            {/* Career Paths */}
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                Career Paths
            </Typography>
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {careerPaths.map((path, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <CareerPathCard path={path} />
                    </Grid>
                ))}
            </Grid>

            {/* Learning Resources */}
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                Learning Resources
            </Typography>
            <Box sx={{ mb: 6 }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons="auto"
                    centered={!isMobile}
                    sx={{ mb: 4 }}
                >
                    {learningResources.map((resource, index) => (
                        <Tab
                            key={index}
                            label={resource.category}
                            icon={resource.icon}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>

                <Grid container spacing={3}>
                    {learningResources[selectedTab].resources.map((resource, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <FeatureCard>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {resource.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        by {resource.provider}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                                            <Typography variant="body2">{resource.rating}</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {resource.students} students
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button variant="outlined" fullWidth>
                                        Learn More
                                    </Button>
                                </CardActions>
                            </FeatureCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Mentorship Programs */}
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                Mentorship Programs
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {mentorshipPrograms.map((mentor, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <MentorCard mentor={mentor} />
                    </Grid>
                ))}
            </Grid>

            {/* Career Tips */}
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                Career Tips & Advice
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {careerTips.map((tipCategory, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                {tipCategory.category}
                            </Typography>
                            <List>
                                {tipCategory.tips.map((tip, tipIndex) => (
                                    <ListItem key={tipIndex} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText primary={tip} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* FAQ Section */}
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                Frequently Asked Questions
            </Typography>
            <Box sx={{ mb: 6 }}>
                {[
                    {
                        question: 'How do I choose the right career path?',
                        answer: 'Consider your interests, skills, values, and market demand. Take career assessments, research different roles, and speak with professionals in fields that interest you.'
                    },
                    {
                        question: 'What skills are most important for finance careers?',
                        answer: 'Key skills include financial analysis, Excel proficiency, data analysis, communication, and increasingly, programming skills like Python and SQL.'
                    },
                    {
                        question: 'How can I transition into the automotive industry?',
                        answer: 'Start by understanding the industry landscape, develop relevant technical skills, consider additional certifications, and network with industry professionals.'
                    },
                    {
                        question: 'Is mentorship really worth the investment?',
                        answer: 'Yes, mentorship can significantly accelerate your career growth by providing personalized guidance, industry insights, and networking opportunities.'
                    },
                ].map((faq, index) => (
                    <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6">{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>{faq.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            {/* Call to Action */}
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.50' }}>
                <Lightbulb sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Ready to Take the Next Step?
                </Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                    Join thousands of professionals who have accelerated their careers with our guidance
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        component={Link}
                        href="/skills-assessment"
                        variant="contained"
                        size="large"
                        startIcon={<Assessment />}
                    >
                        Take Skills Assessment
                    </Button>
                    <Button
                        component={Link}
                        href="/jobs"
                        variant="outlined"
                        size="large"
                        startIcon={<Work />}
                    >
                        Browse Jobs
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default CareerGuidancePage;