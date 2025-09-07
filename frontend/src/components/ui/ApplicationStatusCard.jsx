import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Chip,
    Avatar,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    Message,
    Assessment,
    PersonSearch,
    CheckCircle,
    Schedule,
    BusinessCenter,
} from '@mui/icons-material';

const ApplicationStatusCard = ({ application }) => {
    const theme = useTheme();

    const steps = [
        {
            label: 'Application Submitted',
            description: 'Your application has been received',
            icon: BusinessCenter,
            date: application.submittedAt,
            completed: true,
        },
        {
            label: 'Under Review',
            description: 'Recruiters are reviewing your profile',
            icon: PersonSearch,
            date: application.reviewStartedAt,
            completed: application.status === 'review' || application.status === 'interview' || application.status === 'selected',
        },
        {
            label: 'Interview',
            description: application.interviewDetails || 'Scheduling in progress',
            icon: Assessment,
            date: application.interviewDate,
            completed: application.status === 'interview' || application.status === 'selected',
        },
        {
            label: 'Decision',
            description: application.decisionDetails || 'Pending final decision',
            icon: CheckCircle,
            date: application.decisionDate,
            completed: application.status === 'selected',
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted':
                return theme.palette.info.main;
            case 'review':
                return theme.palette.warning.main;
            case 'interview':
                return theme.palette.success.main;
            case 'selected':
                return theme.palette.success.main;
            case 'rejected':
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'submitted':
                return 'Application Submitted';
            case 'review':
                return 'Under Review';
            case 'interview':
                return 'Interview Stage';
            case 'selected':
                return 'Selected';
            case 'rejected':
                return 'Not Selected';
            default:
                return 'Processing';
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={application.companyLogo}
                        alt={application.companyName}
                        variant="rounded"
                        sx={{ width: 56, height: 56, mr: 2 }}
                    >
                        {application.companyName[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            {application.jobTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {application.companyName}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Chip
                            label={getStatusLabel(application.status)}
                            color={application.status === 'rejected' ? 'error' : 'primary'}
                            sx={{
                                backgroundColor: getStatusColor(application.status),
                                color: 'white',
                                mb: 1,
                            }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                            Applied on {new Date(application.submittedAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>

                <Stepper orientation="vertical">
                    {steps.map((step, index) => (
                        <Step
                            key={step.label}
                            active={application.status === step.label.toLowerCase()}
                            completed={step.completed}
                        >
                            <StepLabel
                                StepIconComponent={() => (
                                    <Avatar
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            bgcolor: step.completed
                                                ? 'success.main'
                                                : 'grey.300',
                                        }}
                                    >
                                        <step.icon sx={{ fontSize: 16 }} />
                                    </Avatar>
                                )}
                            >
                                <Box sx={{ ml: 1 }}>
                                    <Typography variant="subtitle2">
                                        {step.label}
                                    </Typography>
                                    {step.date && (
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(step.date).toLocaleDateString()}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                        {step.description}
                                    </Typography>
                                </Box>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {application.status === 'interview' && application.interviewDetails && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Interview Details
                        </Typography>
                        <Typography variant="body2">
                            {application.interviewDetails}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Schedule />}
                            >
                                Add to Calendar
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Message />}
                            >
                                Contact Recruiter
                            </Button>
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        startIcon={<Message />}
                        size="small"
                    >
                        Send Message
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                    >
                        Withdraw Application
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ApplicationStatusCard;
