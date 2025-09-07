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
    IconButton,
} from '@mui/material';
import {
    Edit as EditIcon,
    Work,
    School,
    LocationOn,
    Phone,
    Email,
    Save,
    Cancel,
    Upload as UploadIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import api from '../utils/api';

const ApplicantProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otpType, setOtpType] = useState(''); // 'email' or 'phone'
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        location: user?.location || '',
        skills: user?.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
        qualification: user?.qualification || '',
        experience_years: user?.experience_years || '',
        company_name: user?.company_name || '',
        position: user?.position || '',
        linkedin_url: user?.linkedin_url || '',
        github_url: user?.github_url || '',
        portfolio_url: user?.portfolio_url || '',
        resume_url: user?.resume_url || null,
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

    const handleResumeUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('resume', file);
                const response = await api.uploadResume(formData);
                if (response.success) {
                    setFormData(prev => ({ ...prev, resume: response.resumeUrl }));
                    toast({
                        title: 'Success',
                        description: 'Resume uploaded successfully',
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        }
    };

    const handleDeleteResume = async () => {
        try {
            const response = await api.deleteResume();
            if (response.success) {
                setFormData(prev => ({ ...prev, resume: null }));
                toast({
                    title: 'Success',
                    description: 'Resume deleted successfully',
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
                                            {user?.full_name || user?.username || 'User'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <Chip icon={<LocationOn />} label={user?.location || 'Location not set'} />
                                            <Chip icon={<Work />} label={user?.company_name || 'Not employed'} />
                                            <Chip icon={<School />} label={user?.qualification || 'Education not set'} />
                                        </Box>
                                        {user?.bio && (
                                            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                                {user.bio}
                                            </Typography>
                                        )}
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
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                value={formData.email}
                                                disabled
                                                margin="normal"
                                                helperText="Contact support to change email"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Experience (years)"
                                                type="number"
                                                value={formData.experience_years}
                                                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Highest Qualification"
                                                value={formData.qualification}
                                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Company Name"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Current Position"
                                                value={formData.position}
                                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Bio"
                                                multiline
                                                rows={3}
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                margin="normal"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="LinkedIn URL"
                                                value={formData.linkedin_url}
                                                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                                margin="normal"
                                                placeholder="https://linkedin.com/in/yourprofile"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="GitHub URL"
                                                value={formData.github_url}
                                                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                                margin="normal"
                                                placeholder="https://github.com/yourusername"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Skills (comma separated)"
                                                value={formData.skills.join(', ')}
                                                onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                                margin="normal"
                                                placeholder="JavaScript, React, Python, etc."
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<UploadIcon />}
                                                    component="label"
                                                >
                                                    Upload Resume
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={handleResumeUpload}
                                                    />
                                                </Button>
                                                {formData.resume && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={handleDeleteResume}
                                                    >
                                                        Delete Resume
                                                    </Button>
                                                )}
                                            </Box>
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
                                                {user?.email || 'Not provided'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Phone
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.phone || 'Not provided'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Location
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.location || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Experience
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.experience_years ? `${user.experience_years} years` : 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Bio
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.bio || 'No bio provided'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Skills
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {(() => {
                                                    const skills = user?.skills ?
                                                        (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) :
                                                        [];
                                                    return skills.length > 0 ? skills.map((skill) => (
                                                        <Chip
                                                            key={skill}
                                                            label={skill}
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )) : <Typography variant="body2" color="text.secondary">No skills added</Typography>
                                                })()}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Qualification
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.qualification || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Company
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.company_name || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Position
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.position || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                LinkedIn Profile
                                            </Typography>
                                            {user?.linkedin_url ? (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    href={user.linkedin_url}
                                                    target="_blank"
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    View LinkedIn
                                                </Button>
                                            ) : (
                                                <Typography variant="body1" color="text.secondary">
                                                    Not provided
                                                </Typography>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Resume
                                            </Typography>
                                            {user?.resume_url ? (
                                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                                    <Button
                                                        variant="outlined"
                                                        href={user.resume_url}
                                                        target="_blank"
                                                    >
                                                        View Resume
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Typography variant="body1" color="text.secondary">
                                                    No resume uploaded
                                                </Typography>
                                            )}
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

export default ApplicantProfilePage;
