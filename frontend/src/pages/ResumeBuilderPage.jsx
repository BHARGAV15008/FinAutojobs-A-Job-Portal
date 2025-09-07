import React, { useState } from 'react';
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
    CardMedia,
    CardActions,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Rating,
    LinearProgress,
    Alert,
    Tab,
    Tabs,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    Print as PrintIcon,
    Save as SaveIcon,
    Check as CheckIcon,
    AddCircle as AddCircleIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    Code as CodeIcon,
    Language as LanguageIcon,
    Star as StarIcon,
    Assessment as AssessmentIcon,
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    FormatListBulleted as FormatListBulletedIcon,
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

const resumeTemplates = [
    {
        id: 'modern',
        name: 'Modern Professional',
        description: 'Clean and contemporary design with a focus on readability',
        image: '/templates/template1.svg',
        color: '#2196f3',
    },
    {
        id: 'creative',
        name: 'Creative Design',
        description: 'Unique layout for creative professionals',
        image: '/templates/template2.svg',
        color: '#ff4081',
    },
    {
        id: 'minimal',
        name: 'Minimal Classic',
        description: 'Traditional format with a minimalist touch',
        image: '/templates/template3.svg',
        color: '#4caf50',
    },
    {
        id: 'executive',
        name: 'Executive Style',
        description: 'Professional template for senior positions',
        image: '/templates/template4.svg',
        color: '#9c27b0',
    },
];

const sections = [
    {
        id: 'personal',
        title: 'Personal Information',
        icon: EditIcon,
        fields: ['Full Name', 'Professional Title', 'Email', 'Phone', 'Location', 'LinkedIn'],
    },
    {
        id: 'experience',
        title: 'Work Experience',
        icon: WorkIcon,
        multiple: true,
        fields: ['Company Name', 'Position', 'Duration', 'Location', 'Description'],
    },
    {
        id: 'education',
        title: 'Education',
        icon: SchoolIcon,
        multiple: true,
        fields: ['Institution', 'Degree', 'Field of Study', 'Graduation Year', 'GPA'],
    },
    {
        id: 'skills',
        title: 'Skills',
        icon: CodeIcon,
        tags: true,
        fields: ['Technical Skills', 'Soft Skills', 'Tools & Technologies'],
    },
];

const ResumeBuilder = () => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [atsScore, setAtsScore] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        handleNext();
    };

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const analyzeATS = () => {
        // Mock ATS analysis
        setAtsScore({
            overall: 85,
            sections: {
                keywords: 90,
                formatting: 85,
                completeness: 80,
                relevance: 85,
            },
            suggestions: [
                'Add more industry-specific keywords',
                'Quantify achievements with metrics',
                'Include a brief professional summary',
            ],
            keywords: [
                { word: 'Project Management', count: 3, relevance: 'high' },
                { word: 'JavaScript', count: 2, relevance: 'high' },
                { word: 'Leadership', count: 2, relevance: 'medium' },
            ],
        });
    };

    const renderTemplateSelection = () => (
        <Grid container spacing={3}>
            {resumeTemplates.map((template) => (
                <Grid item xs={12} sm={6} key={template.id}>
                    <StyledCard>
                        <CardMedia
                            component="img"
                            height="200"
                            image={template.image}
                            alt={template.name}
                            sx={{ objectFit: 'contain', p: 2 }}
                        />
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {template.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {template.description}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => handleTemplateSelect(template)}
                                sx={{ bgcolor: template.color }}
                            >
                                Select Template
                            </Button>
                        </CardActions>
                    </StyledCard>
                </Grid>
            ))}
        </Grid>
    );

    const renderFormSection = (section) => (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                {section.title}
            </Typography>
            <Grid container spacing={2}>
                {section.fields.map((field) => (
                    <Grid item xs={12} sm={6} key={field}>
                        <TextField
                            fullWidth
                            label={field}
                            value={formData[section.id]?.[field] || ''}
                            onChange={(e) => handleInputChange(section.id, field, e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                ))}
            </Grid>
            {section.multiple && (
                <Button
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => {/* Handle adding multiple entries */ }}
                >
                    Add Another {section.title}
                </Button>
            )}
        </Paper>
    );

    const renderATSAnalysis = () => (
        <Box>
            {!atsScore ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={analyzeATS}
                        size="large"
                    >
                        Analyze Resume for ATS
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* Overall Score */}
                    <Grid item xs={12}>
                        <StyledCard>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            mr: 3,
                                        }}
                                    >
                                        <CircularProgress
                                            variant="determinate"
                                            value={atsScore.overall}
                                            size={80}
                                            thickness={4}
                                            color={atsScore.overall >= 80 ? 'success' : 'warning'}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="h6" component="div">
                                                {atsScore.overall}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            ATS Compatibility Score
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Your resume is well-optimized for ATS systems
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    {/* Section Scores */}
                    <Grid item xs={12} md={6}>
                        <StyledCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Section Analysis
                                </Typography>
                                {Object.entries(atsScore.sections).map(([section, score]) => (
                                    <Box key={section} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                {section}
                                            </Typography>
                                            <Typography variant="body2" color="primary">
                                                {score}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={score}
                                            color={score >= 80 ? 'success' : 'warning'}
                                            sx={{ height: 6, borderRadius: 4 }}
                                        />
                                    </Box>
                                ))}
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    {/* Keyword Analysis */}
                    <Grid item xs={12} md={6}>
                        <StyledCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Keyword Analysis
                                </Typography>
                                <List>
                                    {atsScore.keywords.map((keyword, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={keyword.word}
                                                secondary={`Found ${keyword.count} times • Relevance: ${keyword.relevance}`}
                                            />
                                            <Chip
                                                label={keyword.count}
                                                color={keyword.relevance === 'high' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    {/* Suggestions */}
                    <Grid item xs={12}>
                        <Alert severity="info">
                            <Typography variant="subtitle2" gutterBottom>
                                Improvement Suggestions
                            </Typography>
                            <List dense>
                                {atsScore.suggestions.map((suggestion, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <StarIcon color="primary" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={suggestion} />
                                    </ListItem>
                                ))}
                            </List>
                        </Alert>
                    </Grid>
                </Grid>
            )}
        </Box>
    );

    const renderContent = () => {
        switch (activeStep) {
            case 0:
                return renderTemplateSelection();
            case 1:
                return (
                    <Box>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            sx={{ mb: 3 }}
                        >
                            <Tab label="Resume Builder" />
                            <Tab label="ATS Analysis" />
                        </Tabs>
                        {activeTab === 0 ? (
                            <Box>
                                {sections.map((section) => renderFormSection(section))}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    <Button onClick={handleBack}>
                                        Back
                                    </Button>
                                    <Box>
                                        <Button
                                            variant="outlined"
                                            startIcon={<SaveIcon />}
                                            sx={{ mr: 1 }}
                                        >
                                            Save Draft
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            startIcon={<CheckIcon />}
                                        >
                                            Preview Resume
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            renderATSAnalysis()
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            {/* Resume Preview */}
                            <Typography variant="h6" gutterBottom>
                                Preview
                            </Typography>
                            {/* Render resume preview here */}
                        </Paper>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={handleBack}>
                                Back to Editor
                            </Button>
                            <Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    sx={{ mr: 1 }}
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<ShareIcon />}
                                    sx={{ mr: 1 }}
                                >
                                    Share
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                >
                                    Download PDF
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Resume Builder
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Create a professional resume with ATS-friendly templates
                </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                <Step>
                    <StepLabel>Choose Template</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Fill Details</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Preview & Download</StepLabel>
                </Step>
            </Stepper>

            {renderContent()}
        </Container>
    );
};

export default ResumeBuilder;
