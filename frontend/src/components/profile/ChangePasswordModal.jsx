import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    IconButton,
    InputAdornment,
    LinearProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Lock as LockIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { useToast } from '../ui/use-toast';
import api from '../../utils/api';

const ChangePasswordModal = ({ open, onClose }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'New password must be at least 6 characters long';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'New password must be different from current password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: 'error' };
        
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        strength = Object.values(checks).filter(Boolean).length;

        const strengthMap = {
            0: { label: 'Very Weak', color: 'error' },
            1: { label: 'Weak', color: 'error' },
            2: { label: 'Fair', color: 'warning' },
            3: { label: 'Good', color: 'info' },
            4: { label: 'Strong', color: 'success' },
            5: { label: 'Very Strong', color: 'success' }
        };

        return { strength: (strength / 5) * 100, ...strengthMap[strength] };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Password changed successfully",
                    variant: "default"
                });
                handleClose();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to change password",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to change password",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setErrors({});
        setShowPasswords({
            current: false,
            new: false,
            confirm: false
        });
        onClose();
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <SecurityIcon color="primary" />
                    <Typography variant="h6">Change Password</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Update your account password for better security
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 2 }}>
                    <Box display="flex" flexDirection="column" gap={3}>
                        {/* Current Password */}
                        <TextField
                            fullWidth
                            label="Current Password"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                            error={!!errors.currentPassword}
                            helperText={errors.currentPassword}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('current')}
                                            edge="end"
                                        >
                                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* New Password */}
                        <Box>
                            <TextField
                                fullWidth
                                label="New Password"
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('new')}
                                                edge="end"
                                            >
                                                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            
                            {/* Password Strength Indicator */}
                            {formData.newPassword && (
                                <Box sx={{ mt: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            Password Strength
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            color={`${passwordStrength.color}.main`}
                                            fontWeight="medium"
                                        >
                                            {passwordStrength.label}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrength.strength}
                                        color={passwordStrength.color}
                                        sx={{ height: 4, borderRadius: 2 }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Confirm Password */}
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            edge="end"
                                        >
                                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* Security Tips */}
                        <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight="medium" gutterBottom>
                                Password Security Tips:
                            </Typography>
                            <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                                <li>Use at least 8 characters</li>
                                <li>Include uppercase and lowercase letters</li>
                                <li>Add numbers and special characters</li>
                                <li>Avoid common words or personal information</li>
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={handleClose}
                        disabled={loading}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? null : <SecurityIcon />}
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ChangePasswordModal;
