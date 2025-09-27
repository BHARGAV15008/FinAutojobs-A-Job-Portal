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
import { useAuth } from '../contexts/AuthContext.jsx';

const RecruiterProfilePage = () => {
    const { user, updateProfile } = useAuth();
    
    // Simple toast function
    const showToast = (message, type = 'info') => {
        alert(`${type.toUpperCase()}: ${message}`);
    };
    const [isEditing, setIsEditing] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otpType, setOtpType] = useState(''); // 'email' or 'phone'
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        companyInfo: {
            companyName: user?.companyInfo?.companyName || '',
            department: user?.companyInfo?.department || '',
            designation: user?.companyInfo?.designation || '',
        },
        specialization: user?.specialization || [],
        industryExpertise: user?.industryExpertise || [],
        yearsOfExperience: user?.yearsOfExperience || 0,
        professionalLinks: {
            linkedin: user?.professionalLinks?.linkedin || '',
            companyWebsite: user?.professionalLinks?.companyWebsite || '',
        },
        officeLocation: {
            city: user?.officeLocation?.city || '',
            state: user?.officeLocation?.state || '',
            country: user?.officeLocation?.country || '',
        }
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
                showToast(`Please check your ${type} for verification code`, 'success');
            }
        } catch (error) {
            showToast(error.message, 'error');
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
                showToast(`${otpType.charAt(0).toUpperCase() + otpType.slice(1)} updated successfully`, 'success');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleSave = async () => {
        try {
            console.log('🔍 Saving profile data:', formData);
            const result = await updateProfile(formData);
            console.log('✅ Profile update result:', result);
            
            if (result.success) {
                setIsEditing(false);
                showToast('Profile updated successfully', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            showToast(error.message, 'error');
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
                                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'R'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h4" gutterBottom fontWeight="bold">
                                            {user?.firstName} {user?.lastName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <Chip icon={<Business />} label={user?.companyInfo?.companyName || 'Company'} />
                                            <Chip icon={<Work />} label={user?.companyInfo?.designation || 'Role'} />
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
                                                label="First Name"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                                                label="Company Name"
                                                value={formData.companyInfo.companyName}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    companyInfo: { ...formData.companyInfo, companyName: e.target.value }
                                                })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Department"
                                                value={formData.companyInfo.department}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    companyInfo: { ...formData.companyInfo, department: e.target.value }
                                                })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Designation"
                                                value={formData.companyInfo.designation}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    companyInfo: { ...formData.companyInfo, designation: e.target.value }
                                                })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Years of Experience"
                                                type="number"
                                                value={formData.yearsOfExperience}
                                                onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Specialization (comma separated)"
                                                value={formData.specialization.join(', ')}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    specialization: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                })}
                                                margin="normal"
                                                placeholder="e.g., Technical Recruiting, Executive Search"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Industry Expertise (comma separated)"
                                                value={formData.industryExpertise.join(', ')}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    industryExpertise: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                })}
                                                margin="normal"
                                                placeholder="e.g., IT, Healthcare, Finance"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="LinkedIn Profile"
                                                value={formData.professionalLinks.linkedin}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    professionalLinks: { ...formData.professionalLinks, linkedin: e.target.value }
                                                })}
                                                margin="normal"
                                                placeholder="https://linkedin.com/in/yourprofile"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Company Website"
                                                value={formData.professionalLinks.companyWebsite}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    professionalLinks: { ...formData.professionalLinks, companyWebsite: e.target.value }
                                                })}
                                                margin="normal"
                                                placeholder="https://company.com"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                value={formData.officeLocation.city}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    officeLocation: { ...formData.officeLocation, city: e.target.value }
                                                })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="State"
                                                value={formData.officeLocation.state}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    officeLocation: { ...formData.officeLocation, state: e.target.value }
                                                })}
                                                margin="normal"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Country"
                                                value={formData.officeLocation.country}
                                                onChange={(e) => setFormData({ 
                                                    ...formData, 
                                                    officeLocation: { ...formData.officeLocation, country: e.target.value }
                                                })}
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
                                                {user?.companyInfo?.companyName || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Department
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.companyInfo?.department || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Designation
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.companyInfo?.designation || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Years of Experience
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.yearsOfExperience || 0} years
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Specialization
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {user?.specialization?.length > 0 ? user.specialization.map((spec) => (
                                                    <Chip
                                                        key={spec}
                                                        label={spec}
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                )) : <Typography variant="body2" color="text.secondary">Not specified</Typography>}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Industry Expertise
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {user?.industryExpertise?.length > 0 ? user.industryExpertise.map((industry) => (
                                                    <Chip
                                                        key={industry}
                                                        label={industry}
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
                                                )) : <Typography variant="body2" color="text.secondary">Not specified</Typography>}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                LinkedIn Profile
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {user?.professionalLinks?.linkedin || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Office Location
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {[user?.officeLocation?.city, user?.officeLocation?.state, user?.officeLocation?.country]
                                                    .filter(Boolean).join(', ') || 'Not specified'}
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
