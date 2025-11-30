import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Avatar,
    Button,
    TextField,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Divider,
    Chip,
    FormControlLabel,
    Checkbox,
    Accordion,
    AccordionSummary,
    AccordionDetails,
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
    Security as SecurityIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    ExpandMore as ExpandMoreIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/use-toast';
import api from '../utils/api';
import { filesAPI } from '../services/api';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';

const ApplicantProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [otpType, setOtpType] = useState(''); // 'email' or 'phone'
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        location: user?.location || '',
        skills: (() => {
            try {
                if (user?.skills) {
                    if (typeof user.skills === 'string') {
                        return JSON.parse(user.skills);
                    } else if (Array.isArray(user.skills)) {
                        return user.skills;
                    } else if (user.skills.primary) {
                        return user.skills.primary;
                    }
                }
                return [];
            } catch (e) {
                console.error('Error parsing skills:', e);
                return [];
            }
        })(),
        qualification: user?.qualification || '',
        experience_years: user?.experience_years || '',
        company_name: user?.company_name || '',
        position: user?.position || '',
        linkedin_url: user?.linkedin_url || '',
        github_url: user?.github_url || '',
        portfolio_url: user?.portfolio_url || '',
        resume_url: user?.resume_url || null,
        education: user?.education || [],
        workExperience: user?.workExperience || [],
    });

    // Update form data when user data changes
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user?.full_name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                bio: user?.bio || '',
                location: user?.location || '',
                skills: (() => {
                    try {
                        if (user?.skills) {
                            if (typeof user.skills === 'string') {
                                return JSON.parse(user.skills);
                            } else if (Array.isArray(user.skills)) {
                                return user.skills;
                            } else if (user.skills.primary) {
                                return user.skills.primary;
                            }
                        }
                        return [];
                    } catch (e) {
                        console.error('Error parsing skills:', e);
                        return [];
                    }
                })(),
                qualification: user?.qualification || '',
                experience_years: user?.experience_years || '',
                company_name: user?.company_name || '',
                position: user?.position || '',
                linkedin_url: user?.linkedin_url || '',
                github_url: user?.github_url || '',
                portfolio_url: user?.portfolio_url || '',
                resume_url: user?.resume_url || null,
                education: user?.education || [],
                workExperience: user?.workExperience || [],
            });
        }
    }, [user]);

    // Add new education entry
    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, {
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                grade: '',
                isCurrentlyStudying: false
            }]
        });
    };

    // Remove education entry
    const removeEducation = (index) => {
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEducation });
    };

    // Update education entry
    const updateEducation = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index] = { ...newEducation[index], [field]: value };
        setFormData({ ...formData, education: newEducation });
    };

    // Add new work experience entry
    const addWorkExperience = () => {
        setFormData({
            ...formData,
            workExperience: [...formData.workExperience, {
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrentlyWorking: false,
                description: '',
                achievements: []
            }]
        });
    };

    // Remove work experience entry
    const removeWorkExperience = (index) => {
        const newWorkExperience = formData.workExperience.filter((_, i) => i !== index);
        setFormData({ ...formData, workExperience: newWorkExperience });
    };

    // Update work experience entry
    const updateWorkExperience = (index, field, value) => {
        const newWorkExperience = [...formData.workExperience];
        newWorkExperience[index] = { ...newWorkExperience[index], [field]: value };
        setFormData({ ...formData, workExperience: newWorkExperience });
    };

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
                const response = await filesAPI.uploadResume(file);
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
            // Prepare form data with proper serialization for complex fields
            const profileData = {
                ...formData,
                // Ensure education and workExperience are properly serialized
                education: JSON.stringify(formData.education),
                workExperience: JSON.stringify(formData.workExperience),
                skills: JSON.stringify(formData.skills)
            };
            
            const result = await updateProfile(profileData);
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
        <Container maxWidth="md" sx={{ py: 4 }}>
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
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<SecurityIcon />}
                                            onClick={() => setShowChangePasswordModal(true)}
                                            color="secondary"
                                        >
                                            Change Password
                                        </Button>
                                    </Box>
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
                                                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                                                onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                                margin="normal"
                                                placeholder="JavaScript, React, Python, etc."
                                            />
                                        </Grid>
                                        
                                        {/* TEST - Can you see this? */}
                                        <Grid item xs={12}>
                                            <Box sx={{ backgroundColor: 'red', p: 3, textAlign: 'center' }}>
                                                <Typography variant="h3" color="white">
                                                    ⚠️ TEST: IF YOU CAN SEE THIS RED BOX, THE FORM IS WORKING! ⚠️
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        {/* Education Section */}
                                        <Grid item xs={12}>
                                            <Box sx={{ backgroundColor: 'yellow', p: 2, mb: 2 }}>
                                                <Typography variant="h4" color="red">🎓 EDUCATION SECTION IS HERE!</Typography>
                                            </Box>
                                            <Divider sx={{ my: 3 }} />
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <School color="primary" />
                                                    Education
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={addEducation}
                                                >
                                                    Add Education
                                                </Button>
                                            </Box>
                                            {formData.education.map((edu, index) => (
                                                <Card key={index} sx={{ mb: 2, p: 2 }}>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Institution"
                                                                value={edu.institution}
                                                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Degree"
                                                                value={edu.degree}
                                                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Field of Study"
                                                                value={edu.fieldOfStudy}
                                                                onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Grade/GPA"
                                                                value={edu.grade}
                                                                onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Start Date"
                                                                type="date"
                                                                value={edu.startDate}
                                                                onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                                                InputLabelProps={{ shrink: true }}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="End Date"
                                                                type="date"
                                                                value={edu.endDate}
                                                                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                                                InputLabelProps={{ shrink: true }}
                                                                disabled={edu.isCurrentlyStudying}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={edu.isCurrentlyStudying}
                                                                            onChange={(e) => updateEducation(index, 'isCurrentlyStudying', e.target.checked)}
                                                                        />
                                                                    }
                                                                    label="Currently studying here"
                                                                />
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    size="small"
                                                                    startIcon={<RemoveIcon />}
                                                                    onClick={() => removeEducation(index)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Card>
                                            ))}
                                        </Grid>

                                        {/* Work Experience Section */}
                                        <Grid item xs={12}>
                                            <Box sx={{ backgroundColor: 'lightblue', p: 2, mb: 2 }}>
                                                <Typography variant="h4" color="blue">💼 WORK EXPERIENCE SECTION IS HERE!</Typography>
                                            </Box>
                                            <Divider sx={{ my: 3 }} />
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <BusinessIcon color="primary" />
                                                    Work Experience
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={addWorkExperience}
                                                >
                                                    Add Experience
                                                </Button>
                                            </Box>
                                            {formData.workExperience.map((exp, index) => (
                                                <Card key={index} sx={{ mb: 2, p: 2 }}>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Company"
                                                                value={exp.company}
                                                                onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Position/Role"
                                                                value={exp.position}
                                                                onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Location"
                                                                value={exp.location}
                                                                onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Start Date"
                                                                type="date"
                                                                value={exp.startDate}
                                                                onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                                                                InputLabelProps={{ shrink: true }}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="End Date"
                                                                type="date"
                                                                value={exp.endDate}
                                                                onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                                                                InputLabelProps={{ shrink: true }}
                                                                disabled={exp.isCurrentlyWorking}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                fullWidth
                                                                label="Job Description"
                                                                multiline
                                                                rows={3}
                                                                value={exp.description}
                                                                onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                                                                placeholder="Describe your responsibilities and achievements..."
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={exp.isCurrentlyWorking}
                                                                            onChange={(e) => updateWorkExperience(index, 'isCurrentlyWorking', e.target.checked)}
                                                                        />
                                                                    }
                                                                    label="Currently working here"
                                                                />
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    size="small"
                                                                    startIcon={<RemoveIcon />}
                                                                    onClick={() => removeWorkExperience(index)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Card>
                                            ))}
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 3 }} />
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
                                        {/* Education View */}
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 3 }} />
                                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <School color="primary" />
                                                Education
                                            </Typography>
                                            {(() => {
                                                console.log('🔍 User education data:', user?.education);
                                                console.log('🔍 Form education data:', formData.education);
                                                return user?.education && user.education.length > 0;
                                            })() ? (
                                                user.education.map((edu, index) => (
                                                    <Card key={index} sx={{ mb: 2, p: 2 }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                                        </Typography>
                                                        <Typography variant="subtitle1" color="primary" gutterBottom>
                                                            {edu.institution}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                                                            {edu.startDate && (
                                                                <Chip
                                                                    icon={<CalendarIcon />}
                                                                    label={`${edu.startDate} - ${edu.isCurrentlyStudying ? 'Present' : edu.endDate || 'N/A'}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            {edu.grade && (
                                                                <Chip
                                                                    label={`Grade: ${edu.grade}`}
                                                                    size="small"
                                                                    color="success"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Card>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No education information added
                                                </Typography>
                                            )}
                                        </Grid>

                                        {/* Work Experience View */}
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 3 }} />
                                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <BusinessIcon color="primary" />
                                                Work Experience
                                            </Typography>
                                            {(() => {
                                                console.log('🔍 User work experience data:', user?.workExperience);
                                                console.log('🔍 Form work experience data:', formData.workExperience);
                                                return user?.workExperience && user.workExperience.length > 0;
                                            })() ? (
                                                user.workExperience.map((exp, index) => (
                                                    <Card key={index} sx={{ mb: 2, p: 2 }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            {exp.position}
                                                        </Typography>
                                                        <Typography variant="subtitle1" color="primary" gutterBottom>
                                                            {exp.company} {exp.location && `• ${exp.location}`}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                                            {exp.startDate && (
                                                                <Chip
                                                                    icon={<CalendarIcon />}
                                                                    label={`${exp.startDate} - ${exp.isCurrentlyWorking ? 'Present' : exp.endDate || 'N/A'}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            {exp.isCurrentlyWorking && (
                                                                <Chip
                                                                    label="Current Position"
                                                                    size="small"
                                                                    color="success"
                                                                />
                                                            )}
                                                        </Box>
                                                        {exp.description && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {exp.description}
                                                            </Typography>
                                                        )}
                                                    </Card>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No work experience added
                                                </Typography>
                                            )}
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 3 }} />
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
            <Dialog open={showOtpDialog} onClose={() => setShowOtpDialog(false)} PaperProps={{ sx: { maxWidth: { xs: '95vw', sm: '400px', md: '460px' }, borderRadius: '6px' } }}>
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

            {/* Change Password Modal */}
            <ChangePasswordModal
                open={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />
        </Container>
    );
};

export default ApplicantProfilePage;
