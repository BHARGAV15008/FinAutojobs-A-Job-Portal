import { useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Avatar,
    Button,
    TextField,
    Chip,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Edit as EditIcon,
    Work,
    Business,
    Phone,
    Email,
    Save,
    Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import api from '../utils/api';

const RecruiterProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otpType, setOtpType] = useState(''); // 'email' or 'phone'
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        company: user?.company || '',
        role: user?.role || '',
        skills: user?.skills || [],
        currentCompany: user?.currentCompany || '',
        previousCompany: user?.previousCompany || '',
        isCurrentlyEmployed: user?.isCurrentlyEmployed || false,
    });

    const handleUpdateContact = async (type) => {
        try {
            const response = await api.sendOtp({
                type,
                [type]: formData[type]
            });
            if (response.success) {
                setOtpType(type);
                setShowOtpDialog(true);
                toast({
                    title: 'OTP Sent',
                    description: `Please check your ${type} for verification code`,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await api.verifyOtp({
                type: otpType,
                otp,
                [otpType]: formData[otpType]
            });
            if (response.success) {
                setShowOtpDialog(false);
                setOtp('');
                toast({
                    title: 'Success',
                    description: `${otpType.charAt(0).toUpperCase() + otpType.slice(1)} updated successfully`,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleSave = async () => {
        try {
            const result = await updateProfile(formData);
            if (result.success) {
                setIsEditing(false);
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Profile Header */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, position: 'relative' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                            <Avatar
                                src={user?.avatar}
                                sx={{ width: 120, height: 120, bgcolor: 'primary.main' }}
                            >
                                {user?.name?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h4" gutterBottom fontWeight="bold">
                                            {user?.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <Chip icon={<Business />} label={user?.company || 'Company'} />
                                            <Chip icon={<Work />} label={user?.role || 'Role'} />
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={3}>
                                {isEditing ? (
                                    // Edit Form
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Full Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    margin="normal"
                                                />
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleUpdateContact('email')}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Verify
                                                </Button>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                <TextField
                                                    fullWidth
                                                    label="Phone"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    margin="normal"
                                                />
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleUpdateContact('phone')}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Verify
                                                </Button>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Company"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Role"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Skills (comma separated)"
                                                value={formData.skills.join(', ')}
                                                onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Previous Company"
                                                value={formData.previousCompany}
                                                onChange={(e) => setFormData({ ...formData, previousCompany: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<Cancel />}
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Save />}
                                                    onClick={handleSave}
                                                >
                                                    Save Changes
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </>
                                ) : (
                                    // View Mode
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.email}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Phone
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.phone}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Company
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.company}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Role
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.role}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Skills
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {user?.skills?.map((skill) => (
                                                    <Chip
                                                        key={skill}
                                                        label={skill}
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Previous Company
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.previousCompany || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* OTP Verification Dialog */}
            <Dialog open={showOtpDialog} onClose={() => setShowOtpDialog(false)}>
                <DialogTitle>
                    Verify {otpType === 'email' ? 'Email' : 'Phone'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Enter OTP"
                        fullWidth
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowOtpDialog(false)}>Cancel</Button>
                    <Button onClick={handleVerifyOtp} variant="contained">
                        Verify
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RecruiterProfilePage;
