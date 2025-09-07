import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Card,
    CardContent,
    IconButton,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Rating,
    CircularProgress,
    useTheme,
    Tab,
    Tabs,
    InputAdornment,
} from '@mui/material';
import {
    Search,
    ExpandMore,
    BookmarkBorder,
    Bookmark,
    ThumbUp,
    ThumbDown,
    QuestionAnswer,
    Work,
    School,
    Psychology,
    Timer,
    Lightbulb,
    Build,
    CheckCircle,
    Assignment,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    },
}));

const DifficultyChip = styled(Chip)(({ theme, difficulty }) => ({
    backgroundColor:
        difficulty === 'Easy' ? theme.palette.success.light :
            difficulty === 'Medium' ? theme.palette.warning.light :
                theme.palette.error.light,
    color:
        difficulty === 'Easy' ? theme.palette.success.dark :
            difficulty === 'Medium' ? theme.palette.warning.dark :
                theme.palette.error.dark,
}));

const InterviewQuestionsPage = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
    const [expandedQuestion, setExpandedQuestion] = useState(false);

    const categories = [
        { label: 'All', icon: QuestionAnswer },
        { label: 'Technical', icon: Build },
        { label: 'Behavioral', icon: Psychology },
        { label: 'HR', icon: Work },
        { label: 'Problem Solving', icon: Lightbulb },
    ];

    // Mock interview questions data
    const questions = [
        {
            id: 1,
            category: 'Technical',
            question: 'Explain the differences between React and Angular',
            answer: "React and Angular have several key differences:\n\n" +
                "1. Architecture:\n" +
                "   - React is a library focused on UI components\n" +
                "   - Angular is a full-fledged MVC framework\n\n" +
                "2. Learning Curve:\n" +
                "   - React has a gentler learning curve\n" +
                "   - Angular requires learning TypeScript and more concepts\n\n" +
                "3. Performance:\n" +
                "   - React uses Virtual DOM\n" +
                "   - Angular uses Real DOM with Zone.js\n\n" +
                "4. Tooling:\n" +
                "   - React relies on community tools\n" +
                "   - Angular comes with built-in tools and capabilities",
            difficulty: 'Medium',
            likes: 245,
            dislikes: 12,
            tags: ['Frontend', 'React', 'Angular', 'JavaScript'],
            company: 'Multiple',
            experience: '2-5 years',
        },
        {
            id: 2,
            category: 'Behavioral',
            question: 'Tell me about a challenging project you worked on and how you handled it',
            answer: "A strong answer should include:\n\n" +
                "1. Project Context:\n" +
                "   - Brief description of the project\n" +
                "   - Your role and responsibilities\n\n" +
                "2. Challenge Description:\n" +
                "   - Specific obstacles faced\n" +
                "   - Impact on the project/team\n\n" +
                "3. Actions Taken:\n" +
                "   - Your approach to solving the problem\n" +
                "   - Steps implemented\n\n" +
                "4. Results:\n" +
                "   - Outcome of your actions\n" +
                "   - Lessons learned\n\n" +
                "Remember to use the STAR method: Situation, Task, Action, Result",
            difficulty: 'Medium',
            likes: 189,
            dislikes: 5,
            tags: ['Leadership', 'Project Management', 'Problem Solving'],
            company: 'General',
            experience: 'All levels',
        },
        {
            id: 3,
            category: 'Technical',
            question: 'What is the time complexity of QuickSort? Explain its working principle.',
            answer: "QuickSort Analysis:\n\n" +
                "1. Time Complexity:\n" +
                "   - Average case: O(n log n)\n" +
                "   - Worst case: O(n²)\n" +
                "   - Best case: O(n log n)\n\n" +
                "2. Working Principle:\n" +
                "   - Selects a 'pivot' element\n" +
                "   - Partitions array around pivot\n" +
                "   - Recursively sorts sub-arrays\n\n" +
                "3. Implementation Steps:\n" +
                "   - Choose pivot (usually last element)\n" +
                "   - Place smaller elements before pivot\n" +
                "   - Place larger elements after pivot\n" +
                "   - Recursively apply to partitions\n\n" +
                "4. Advantages:\n" +
                "   - In-place sorting\n" +
                "   - Cache friendly\n" +
                "   - Average case performance",
            difficulty: 'Hard',
            likes: 156,
            dislikes: 8,
            tags: ['Algorithms', 'Sorting', 'Data Structures'],
            company: 'Multiple',
            experience: '0-2 years',
        },
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategory(newValue);
    };

    const toggleBookmark = (questionId) => {
        setBookmarkedQuestions(prev => {
            const newBookmarks = new Set(prev);
            if (newBookmarks.has(questionId)) {
                newBookmarks.delete(questionId);
            } else {
                newBookmarks.add(questionId);
            }
            return newBookmarks;
        });
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 0 || q.category === categories[selectedCategory].label;
        return matchesSearch && matchesCategory;
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Interview Questions Database
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Prepare for your next interview with our comprehensive question bank
                </Typography>
            </Box>

            {/* Search and Filters */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            placeholder="Search questions by keyword or topic..."
                            value={searchQuery}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Tabs
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            {categories.map((category, index) => (
                                <Tab
                                    key={index}
                                    icon={<category.icon />}
                                    label={category.label}
                                    iconPosition="start"
                                />
                            ))}
                        </Tabs>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {/* Questions List */}
                    <Grid item xs={12} md={8}>
                        {filteredQuestions.map((q) => (
                            <Accordion
                                key={q.id}
                                expanded={expandedQuestion === q.id}
                                onChange={() => setExpandedQuestion(expandedQuestion === q.id ? false : q.id)}
                                sx={{ mb: 2 }}
                            >
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box sx={{ width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="h6" sx={{ flex: 1 }}>
                                                {q.question}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark(q.id);
                                                }}
                                            >
                                                {bookmarkedQuestions.has(q.id) ? (
                                                    <Bookmark color="primary" />
                                                ) : (
                                                    <BookmarkBorder />
                                                )}
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <DifficultyChip
                                                label={q.difficulty}
                                                difficulty={q.difficulty}
                                                size="small"
                                            />
                                            {q.tags.map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                                        {q.answer}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <IconButton size="small">
                                                    <ThumbUp />
                                                </IconButton>
                                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                                    {q.likes}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <IconButton size="small">
                                                    <ThumbDown />
                                                </IconButton>
                                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                                    {q.dislikes}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {q.company} • {q.experience}
                                        </Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Interview Tips */}
                        <StyledCard sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Interview Tips
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Timer color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Be punctual"
                                            secondary="Arrive 10-15 minutes early"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <School color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Research thoroughly"
                                            secondary="Know the company and role well"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Assignment color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Prepare examples"
                                            secondary="Use STAR method for behavioral questions"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Follow up"
                                            secondary="Send a thank-you note after interview"
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </StyledCard>

                        {/* Question Categories */}
                        <StyledCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Popular Topics
                                </Typography>
                                <List dense>
                                    {['Data Structures', 'System Design', 'JavaScript', 'SQL', 'Leadership'].map((topic, index) => (
                                        <ListItem key={index} button>
                                            <ListItemText
                                                primary={topic}
                                                secondary={Math.floor(Math.random() * 100 + 50) + " questions"}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default InterviewQuestionsPage;
