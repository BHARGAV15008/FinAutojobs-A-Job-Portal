import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../components/ui/use-toast";
import OAuthButtons from "../components/auth/OAuthButtons";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Person,
  Work,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  AlternateEmail,
} from "@mui/icons-material";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}));

const BrandingSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  },
}));

const RegisterPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { register, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "applicant",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      role: activeTab === 0 ? "applicant" : "recruiter",
    }));
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError("");

    if (!validateForm()) {
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      };

      const result = await register(registrationData);

      if (result.success) {
        // Show success message
        toast({
          title: "Success!",
          description:
            result.message ||
            "Account created successfully. Welcome to FinAutoJobs!",
          variant: "default",
        });

        // Wait a moment for the user to see the success message
        setTimeout(() => {
          // Redirect based on role
          const role = result.user?.role || formData.role;
          if (role === "recruiter" || role === "employer") {
            setLocation("/recruiter-dashboard");
          } else if (role === "admin") {
            setLocation("/admin-dashboard");
          } else {
            setLocation("/applicant-dashboard");
          }
        }, 1500); // 1.5 second delay to show success message
      } else {
        // Handle registration failure
        const errorMessage =
          result.error || "Registration failed. Please try again.";
        setRegistrationError(errorMessage);

        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      setRegistrationError(errorMessage);

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOAuthSuccess = (userData) => {
    toast({
      title: "Success!",
      description: "Account created successfully with social login!",
      variant: "default",
    });

    // Wait a moment for the user to see the success message
    setTimeout(() => {
      // Redirect based on role
      const role = userData.role;
      if (role === "recruiter" || role === "employer") {
        setLocation("/recruiter-dashboard");
      } else if (role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/applicant-dashboard");
      }
    }, 1500); // 1.5 second delay to show success message
  };

  const handleOAuthError = (error) => {
    console.error("OAuth error:", error);
    toast({
      title: "Social Login Failed",
      description: error || "Please try again or use email registration.",
      variant: "destructive",
    });
  };

  const generateUsername = async () => {
    try {
      if (!formData.firstName || !formData.lastName) {
        toast({
          title: "Missing Information",
          description: "Please enter your first and last name first.",
          variant: "destructive",
        });
        return;
      }

      const baseUsername = `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`;
      const randomSuffix = Math.floor(Math.random() * 1000);
      const generatedUsername = `${baseUsername}${randomSuffix}`;

      setFormData((prev) => ({
        ...prev,
        username: generatedUsername,
      }));

      toast({
        title: "Username Generated",
        description: `Generated username: ${generatedUsername}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Username generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate username. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        minHeight: { xs: "auto", sm: "100vh" },
        alignItems: "center",
        p: { xs: 1, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: {
            xs: "calc(100% - 16px)",
            sm: "400px",
            md: "500px",
            lg: "600px",
          },
          px: { xs: 1, sm: 3, md: 4 },
          maxWidth: "100vw",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.75rem", sm: "2rem" } }}
          >
            Create Your Account 🚀
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Join thousands of professionals finding their dream jobs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>

        <StyledCard>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Role Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: { xs: 3, sm: 4 } }}
            >
              <Tab
                icon={<Person />}
                label="Job Seeker"
                iconPosition="start"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
              <Tab
                icon={<Work />}
                label="Recruiter / HR"
                iconPosition="start"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
            </Tabs>

            {/* Registration Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {/* Registration Error Alert */}
              {registrationError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {registrationError}
                </Alert>
              )}

              {/* Name Fields */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person
                            color={errors.firstName ? "error" : "primary"}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person
                            color={errors.lastName ? "error" : "primary"}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Username Field */}
              {/* <Box sx={{ mb: 3, mt: 2 }}>
                <TextField
                  fullWidth
                  name="username"
                  label="Username (Optional)"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={
                    errors.username ||
                    "Leave empty to auto-generate from your name"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AlternateEmail
                          color={errors.username ? "error" : "primary"}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: !formData.username && (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={generateUsername}
                          variant="outlined"
                          sx={{ minWidth: "auto", px: 2 }}
                        >
                          Generate
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                {!formData.username && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ mt: 1, display: "block" }}
                  >
                    💡 Tip: Username will be auto-generated if left empty
                  </Typography>
                )}
              </Box> */}

              {/* Email Field */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color={errors.email ? "error" : "primary"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Phone Field */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color={errors.phone ? "error" : "primary"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Password Fields */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color={errors.password ? "error" : "primary"} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock
                            color={errors.confirmPassword ? "error" : "primary"}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Terms and Conditions */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      style={{ color: theme.palette.primary.main }}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      style={{ color: theme.palette.primary.main }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mb: { xs: 3, sm: 3.5 } }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 2,
                  mb: 3,
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  textTransform: "none",
                  color: "white",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.6)",
                    background:
                      "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                  },
                  "&:active": {
                    transform: "translateY(0px)",
                  },
                  "&:disabled": {
                    background:
                      "linear-gradient(135deg, #a0a0a0 0%, #808080 100%)",
                    transform: "none",
                    boxShadow: "none",
                  },
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <Divider sx={{ my: 3 }} />

              <OAuthButtons
                role={activeTab === 0 ? "applicant" : "recruiter"}
                onSuccess={handleOAuthSuccess}
                onError={handleOAuthError}
              />
            </Box>
          </CardContent>
        </StyledCard>
      </Box>
    </Box>
  );
};

export default RegisterPage;
