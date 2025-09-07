import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Divider,
} from '@mui/material';
import {
    CheckCircle,
    RadioButtonUnchecked,
    Person,
    Work,
    School,
    Description,
    Assignment,
} from '@mui/icons-material';

const ProfileCompletionCard = ({ profile }) => {
    const steps = [
        {
            id: 'basic_info',
            label: 'Basic Information',
            icon: Person,
            completed: !!profile?.basicInfo,
        },
        {
            id: 'experience',
            label: 'Work Experience',
            icon: Work,
            completed: !!profile?.experience?.length,
        },
        {
            id: 'education',
            label: 'Education',
            icon: School,
            completed: !!profile?.education?.length,
        },
        {
            id: 'resume',
            label: 'Resume Upload',
            icon: Description,
            completed: !!profile?.resume,
        },
        {
            id: 'skills',
            label: 'Skills & Expertise',
            icon: Assignment,
            completed: !!profile?.skills?.length,
        },
    ];

    const completedSteps = steps.filter(step => step.completed).length;
    const completionPercentage = (completedSteps / steps.length) * 100;

    return (
        <Card>
            <CardContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Profile Completion
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={completionPercentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {completionPercentage.toFixed(0)}%
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Complete your profile to increase your chances of getting hired
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List dense>
                    {steps.map((step) => (
                        <ListItem
                            key={step.id}
                            secondaryAction={
                                !step.completed && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        component="a"
                                        href={`/profile#${step.id}`}
                                    >
                                        Complete
                                    </Button>
                                )
                            }
                        >
                            <ListItemIcon>
                                {step.completed ? (
                                    <CheckCircle color="success" />
                                ) : (
                                    <RadioButtonUnchecked color="disabled" />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={step.label}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: step.completed ? 'text.primary' : 'text.secondary',
                                    },
                                }}
                            />
                        </ListItem>
                    ))}
                </List>

                {completionPercentage < 100 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            fullWidth
                            href="/profile"
                        >
                            Complete Your Profile
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileCompletionCard;
