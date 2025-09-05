import { useState } from 'react';
import { Link } from 'wouter';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Avatar,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    Work,
    Person,
    Bookmark,
    TrendingUp,
    Notifications,
    CheckCircle,
    Schedule,
    Visibility,
} from '@mui/icons-material';

const ApplicantDashboard = () => {
    const [user] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: '',
        profileCompletion: 85,
    });

    const [applications] = useState([
        {
            id: 1,
            jobTitle: 'Senior Financial Analyst',
            company: 'Goldman Sachs',
            status: 'Under Review',
            appliedDate: '2024-01-15',
            statusColor: 'warning',
        },
        {
            id: 2,
            jobTitle: 'Investment Banking Associate',
            company: 'ICICI Bank',
            status: 'Interview Scheduled',
            appliedDate: '2024-01-12',
            statusColor: 'info',
        },
        {
            id: 3,
            jobTitle: 'Risk Management Specialist',
            company: 'HDFC Bank',
            status: 'Rejected',
            appliedDate: '2024-01-10',
            statusColor: 'error',
        },
    ]);

    const [savedJobs] = useState([
        {
            id: 1,
            title: 'Financial Analyst',
            company: 'JP Morgan',
            location: 'Mumbai',
            salary: '₹12-18L',
        },
        {
            id: 2,
            title: 'Automotive Engineer',
            company: 'Tata Motors',
            location: 'Pune',
            salary: '₹8-12L',
        },
    ]);

    const [stats] = useState({
        applicationsSubmitted: 15,
        interviewsScheduled: 3,
        jobsViewed: 45,
        profileViews: 28,
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Welcome back, {user.name}! 👋
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Track your job applications and discover new opportunities
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column */}
                <Grid item xs={12} md={8}>
                    {/* Quick Stats */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Work sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.applicationsSubmitted}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Applications
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.interviewsScheduled}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Interviews
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Visibility sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.jobsViewed}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Jobs Viewed
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.profileViews}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Profile Views
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Recent Applications */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Recent Applications
                                </Typography>
                                <Button component={Link} href="/applications" variant="outlined" size="small">
                                    View All
                                </Button>
                            </Box>
                            <List>
                                {applications.map((application, index) => (
                                    <Box key={application.id}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <Work />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {application.jobTitle}
                                                        </Typography>
                                                        <Chip
                                                            label={application.status}
                                                            color={application.statusColor}
                                                            size="small"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {application.company}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Applied on {new Date(application.appliedDate).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < applications.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    {/* Saved Jobs */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Saved Jobs
                                </Typography>
                                <Button component={Link} href="/jobs" variant="outlined" size="small">
                                    Browse Jobs
                                </Button>
                            </Box>
                            <List>
                                {savedJobs.map((job, index) => (
                                    <Box key={job.id}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <Bookmark color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {job.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {job.company} • {job.location}
                                                        </Typography>
                                                        <Typography variant="body2" color="primary" fontWeight="bold">
                                                            {job.salary}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <Button
                                                component={Link}
                                                href={`/job/${job.id}`}
                                                variant="outlined"
                                                size="small"
                                            >
                                                View
                                            </Button>
                                        </ListItem>
                                        {index < savedJobs.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={4}>
                    {/* Profile Card */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mx: 'auto',
                                    mb: 2,
                                    bgcolor: 'primary.main',
                                    fontSize: '2rem',
                                }}
                            >
                                {user.name.charAt(0)}
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {user.email}
                            </Typography>

                            <Box sx={{ mt: 3, mb: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    Profile Completion: {user.profileCompletion}%
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={user.profileCompletion}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>

                            <Button
                                component={Link}
                                href="/profile"
                                variant="contained"
                                fullWidth
                                startIcon={<Person />}
                            >
                                Complete Profile
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    component={Link}
                                    href="/jobs"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Work />}
                                >
                                    Browse Jobs
                                </Button>
                                <Button
                                    component={Link}
                                    href="/resume"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Person />}
                                >
                                    Update Resume
                                </Button>
                                <Button
                                    component={Link}
                                    href="/job-alerts"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Notifications />}
                                >
                                    Job Alerts
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Recent Activity
                            </Typography>
                            <List dense>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <CheckCircle color="success" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Profile updated"
                                        secondary="2 hours ago"
                                    />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <Work color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Applied to Goldman Sachs"
                                        secondary="1 day ago"
                                    />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <Bookmark color="info" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Saved 3 new jobs"
                                        secondary="2 days ago"
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ApplicantDashboard;