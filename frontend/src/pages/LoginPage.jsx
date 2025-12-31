import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../components/ui/use-toast";
import OAuthButtons from "../components/auth/OAuthButtons";
import {
  Container,
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
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Person,
  Work,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: theme.spacing(3),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}));

const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { login, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "applicant",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormData((prev) => ({
      ...prev,
      role: newValue === 0 ? "applicant" : "recruiter",
    }));
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

    if (!formData.username.trim()) {
      newErrors.username = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      newErrors.username = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) {
      return;
    }

    try {
      const loginData = {
        identifier: formData.username.trim(),
        password: formData.password,
        role: formData.role,
      };

      const result = await login(loginData);

      if (result.success) {
        // Show success message
        toast({
          title: "Welcome back!",
          description:
            result.message || "Successfully logged in to your account.",
          variant: "default",
        });

        // Wait a moment for the user to see the success message
        setTimeout(() => {
          // Redirect based on role
          const role = result.user?.role;
          if (role === "recruiter" || role === "employer") {
            setLocation("/recruiter-dashboard");
          } else if (role === "admin") {
            setLocation("/admin-dashboard");
          } else {
            setLocation("/applicant-dashboard");
          }
        }, 1000); // 1 second delay to show success message
      } else {
        // Handle login failure
        const errorMessage =
          result.error || "Login failed. Please check your credentials.";
        setLoginError(errorMessage);

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.message || "Login failed. Please check your credentials.";
      setLoginError(errorMessage);

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOAuthSuccess = (userData) => {
    toast({
      title: "Welcome!",
      description: "Successfully logged in with social authentication.",
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
    }, 1000); // 1 second delay to show success message
  };

  const handleOAuthError = (error) => {
    // Intentionally silent: OAuthButtons already handle toasts
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "100vw",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } }}
          >
            Welcome Back! 👋
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Sign in to access premium job opportunities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Create one here
            </Link>
          </Typography>
        </Box>

        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            {/* Role Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
            >
              <Tab
                icon={<Person />}
                label="Applicant"
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

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {/* Login Error Alert */}
              {loginError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {loginError}
                </Alert>
              )}

              <TextField
                fullWidth
                name="username"
                label="Email Address"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color={errors.username ? "error" : "primary"} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 3 }}
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

              {/* Role-based login info */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {activeTab === 0
                    ? "👤 Applicant Login"
                    : "💼 Recruiter/HR Login"}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {activeTab === 0
                    ? "Login with your applicant account credentials"
                    : "Login with your recruiter/HR account credentials"}
                </Typography>
              </Alert>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="text"
                  color="primary"
                  size="small"
                >
                  Forgot password?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  mb: { xs: 2, sm: 3 },
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <Divider sx={{ my: 3 }} />

              <OAuthButtons
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

export default LoginPage;
