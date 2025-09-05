import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    TextField,
    Switch,
    FormControlLabel,
    Chip,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Alert,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    NotificationsActive,
    Add,
    Edit,
    Delete,
    Email,
    Sms,
    LocationOn,
    Work,
    AttachMoney,
    Schedule,
    TrendingUp,
    CheckCircle,
    Cancel,
    Settings,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const AlertCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const JobAlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        keywords: '',
        location: '',
        experience: '',
        salaryMin: '',
        jobType: '',
        frequency: 'daily',
        emailEnabled: true,
        smsEnabled: false,
        active: true,
    });

    // Mock alerts data
    const mockAlerts = [
        {
            id: 1,
            title: 'Senior Financial Analyst',
            keywords: 'financial analyst, finance, banking',
            location: 'Mumbai',
            experience: '3-5 years',
            salaryMin: 800000,
            jobType: 'Full-time',
            frequency: 'daily',
            emailEnabled: true,
            smsEnabled: false,
            active: true,
            createdAt: '2024-01-15',
            matchingJobs: 23,
            lastNotified: '2024-01-20',
        },
        {
            id: 2,
            title: 'Automotive Engineer',
            keywords: 'automotive, engineer, mechanical',
            location: 'Pune',
            experience: '2-4 years',
            salaryMin: 600000,
            jobType: 'Full-time',
            frequency: 'weekly',
            emailEnabled: true,
            smsEnabled: true,
            active: true,
            createdAt: '2024-01-10',
            matchingJobs: 15,
            lastNotified: '2024-01-18',
        },
        {
            id: 3,
            title: 'Investment Banking Associate',
            keywords: 'investment banking, M&A, valuation',
            location: 'Mumbai',
            experience: '4-6 years',
            salaryMin: 1500000,
            jobType: 'Full-time',
            frequency: 'immediate',
            emailEnabled: true,
            smsEnabled: true,
            active: false,
            createdAt: '2024-01-05',
            matchingJobs: 8,
            lastNotified: '2024-01-12',
        },
    ];

    // Mock recent matching jobs
    const mockRecentJobs = [
        {
            id: 1,
            title: 'Senior Financial Analyst',
            company: 'HDFC Bank',
            location: 'Mumbai',
            salary: '₹12-18 LPA',
            postedDate: '2024-01-20',
            alertId: 1,
        },
        {
            id: 2,
            title: 'Financial Analyst - Risk Management',
            company: 'ICICI Bank',
            location: 'Mumbai',
            salary: '₹10-15 LPA',
            postedDate: '2024-01-19',
            alertId: 1,
        },
        {
            id: 3,
            title: 'Automotive Design Engineer',
            company: 'Tata Motors',
            location: 'Pune',
            salary: '₹8-12 LPA',
            postedDate: '2024-01-18',
            alertId: 2,
        },
    ];

    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
    const experienceLevels = ['0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years'];
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
    const frequencies = [
        { value: 'immediate', label: 'Immediate' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
    ];

    useEffect(() => {
        setAlerts(mockAlerts);
        setRecentJobs(mockRecentJobs);
    }, []);

    const handleCreateAlert = () => {
        setEditingAlert(null);
        setFormData({
            title: '',
            keywords: '',
            location: '',
            experience: '',
            salaryMin: '',
            jobType: '',
            frequency: 'daily',
            emailEnabled: true,
            smsEnabled: false,
            active: true,
        });
        setOpenDialog(true);
    };

    const handleEditAlert = (alert) => {
        setEditingAlert(alert);
        setFormData(alert);
        setOpenDialog(true);
    };

    const handleDeleteAlert = (alertId) => {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
    };

    const handleToggleAlert = (alertId) => {
        setAlerts(alerts.map(alert =>
            alert.id === alertId ? { ...alert, active: !alert.active } : alert
        ));
    };

    const handleSaveAlert = () => {
        if (editingAlert) {
            // Update existing alert
            setAlerts(alerts.map(alert =>
                alert.id === editingAlert.id ? { ...alert, ...formData } : alert
            ));
        } else {
            // Create new alert
            const newAlert = {
                ...formData,
                id: Date.now(),
                createdAt: new Date().toISOString().split('T')[0],
                matchingJobs: Math.floor(Math.random() * 50),
                lastNotified: new Date().toISOString().split('T')[0],
            };
            setAlerts([...alerts, newAlert]);
        }
        setOpenDialog(false);
    };

    const formatSalary = (amount) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else {
            return `₹${(amount / 1000).toFixed(0)}K`;
        }
    };

    const AlertCardComponent = ({ alert }) => (
        <AlertCard>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {alert.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                            checked={alert.active}
                            onChange={() => handleToggleAlert(alert.id)}
                            size="small"
                        />
                        <Chip
                            label={alert.active ? 'Active' : 'Paused'}
                            color={alert.active ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Keywords: {alert.keywords}
                </Typography>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {alert.location}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {alert.experience}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {alert.salaryMin ? `${formatSalary(alert.salaryMin)}+` : 'Any'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {alert.frequency}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {alert.emailEnabled && (
                        <Chip
                            icon={<Email />}
                            label="Email"
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {alert.smsEnabled && (
                        <Chip
                            icon={<Sms />}
                            label="SMS"
                            size="small"
                            color="secondary"
                            variant="outlined"
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                        {alert.matchingJobs} matching jobs
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Last: {alert.lastNotified}
                    </Typography>
                </Box>
            </CardContent>

            <CardActions>
                <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditAlert(alert)}
                >
                    Edit
                </Button>
                <Button
                    size="small"
                    startIcon={<Delete />}
                    color="error"
                    onClick={() => handleDeleteAlert(alert.id)}
                >
                    Delete
                </Button>
            </CardActions>
        </AlertCard>
    );

    const CreateEditDialog = () => (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
                {editingAlert ? 'Edit Job Alert' : 'Create New Job Alert'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Alert Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Senior Financial Analyst"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Keywords"
                            value={formData.keywords}
                            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            placeholder="e.g., financial analyst, finance, banking"
                            helperText="Separate multiple keywords with commas"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={locations}
                            value={formData.location}
                            onChange={(event, newValue) => setFormData({ ...formData, location: newValue })}
                            renderInput={(params) => (
                                <TextField {...params} label="Location" />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={experienceLevels}
                            value={formData.experience}
                            onChange={(event, newValue) => setFormData({ ...formData, experience: newValue })}
                            renderInput={(params) => (
                                <TextField {...params} label="Experience Level" />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Minimum Salary"
                            type="number"
                            value={formData.salaryMin}
                            onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                            placeholder="e.g., 800000"
                            helperText="Annual salary in INR"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Job Type</InputLabel>
                            <Select
                                value={formData.jobType}
                                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                label="Job Type"
                            >
                                {jobTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Notification Frequency</InputLabel>
                            <Select
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                label="Notification Frequency"
                            >
                                {frequencies.map((freq) => (
                                    <MenuItem key={freq.value} value={freq.value}>
                                        {freq.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.emailEnabled}
                                        onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
                                    />
                                }
                                label="Email Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.smsEnabled}
                                        onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
                                    />
                                }
                                label="SMS Notifications"
                            />
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveAlert} variant="contained">
                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                        Job Alerts
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Get notified when new jobs match your criteria
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateAlert}
                    size="large"
                >
                    Create Alert
                </Button>
            </Box>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <NotificationsActive sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            {alerts.filter(alert => alert.active).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Active Alerts
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                            {alerts.reduce((sum, alert) => sum + alert.matchingJobs, 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Matching Jobs
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Email sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                            {alerts.filter(alert => alert.emailEnabled).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email Alerts
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Sms sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {alerts.filter(alert => alert.smsEnabled).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            SMS Alerts
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Alerts Grid */}
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Your Job Alerts
            </Typography>
            {alerts.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <NotificationsActive sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No job alerts created yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Create your first job alert to get notified about relevant opportunities
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreateAlert}
                    >
                        Create Your First Alert
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {alerts.map((alert) => (
                        <Grid item xs={12} md={6} lg={4} key={alert.id}>
                            <AlertCardComponent alert={alert} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Recent Matching Jobs */}
            {recentJobs.length > 0 && (
                <Box sx={{ mt: 6 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                        Recent Matching Jobs
                    </Typography>
                    <Paper>
                        <List>
                            {recentJobs.map((job, index) => (
                                <React.Fragment key={job.id}>
                                    <ListItem>
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
                                        <ListItemSecondaryAction>
                                            <Typography variant="caption" color="text.secondary">
                                                {job.postedDate}
                                            </Typography>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < recentJobs.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Box>
            )}

            {/* Tips */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Tips for Effective Job Alerts
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Alert severity="info">
                            <Typography variant="subtitle2" gutterBottom>
                                Use Specific Keywords
                            </Typography>
                            <Typography variant="body2">
                                Include specific job titles, skills, and industry terms to get more relevant matches.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Alert severity="success">
                            <Typography variant="subtitle2" gutterBottom>
                                Set Realistic Criteria
                            </Typography>
                            <Typography variant="body2">
                                Balance specificity with flexibility to ensure you don't miss good opportunities.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Alert severity="warning">
                            <Typography variant="subtitle2" gutterBottom>
                                Review Regularly
                            </Typography>
                            <Typography variant="body2">
                                Update your alerts as your career goals and preferences change.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Alert severity="error">
                            <Typography variant="subtitle2" gutterBottom>
                                Act Quickly
                            </Typography>
                            <Typography variant="body2">
                                Good opportunities move fast. Apply promptly when you receive relevant alerts.
                            </Typography>
                        </Alert>
                    </Grid>
                </Grid>
            </Box>

            {/* Create/Edit Dialog */}
            <CreateEditDialog />
        </Container>
    );
};

export default JobAlertsPage;