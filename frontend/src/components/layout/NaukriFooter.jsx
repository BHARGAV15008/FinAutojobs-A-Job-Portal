import React from "react";
import { Link } from "wouter";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
  Apple,
  Android,
  Email,
  Phone,
  LocationOn,
  ArrowForward,
  KeyboardArrowUp,
  Favorite,
  Star,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

// Styled Components
const FooterWrapper = styled(Box)(({ theme }) => ({
  background: "linear-gradient(180deg, #1e1b4b 0%, #0f0a1e 100%)",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent, #6366f1, transparent)",
  },
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: "#94a3b8",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "block",
  marginBottom: "12px",
  "&:hover": {
    color: "#a5b4fc",
    transform: "translateX(5px)",
  },
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  color: "#fff",
  fontSize: "16px",
  fontWeight: 700,
  marginBottom: "24px",
  position: "relative",
  display: "inline-block",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-8px",
    left: 0,
    width: "40px",
    height: "3px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    borderRadius: "2px",
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: "#94a3b8",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "10px",
  transition: "all 0.3s ease",
  "&:hover": {
    color: "#fff",
    borderColor: "#6366f1",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    transform: "translateY(-3px)",
    boxShadow: "0 5px 15px rgba(99, 102, 241, 0.3)",
  },
}));

const AppButton = styled(Button)(({ theme }) => ({
  background: "#1e293b",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "12px",
  textTransform: "none",
  justifyContent: "flex-start",
  border: "1px solid #334155",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    borderColor: "transparent",
    transform: "translateY(-3px)",
    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
  },
}));

const ScrollToTopButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  bottom: 30,
  right: 30,
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  color: "#fff",
  width: 50,
  height: 50,
  borderRadius: "14px",
  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
  zIndex: 1000,
  animation: `${float} 3s ease-in-out infinite`,
  "&:hover": {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    transform: "scale(1.1)",
  },
}));

const NaukriFooter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    forJobSeekers: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Browse Companies", href: "/companies" },
      { label: "Job Alerts", href: "/job-alerts" },
      { label: "Career Advice", href: "/career-advice" },
      { label: "Resume Builder", href: "/resume-builder" },
      { label: "Salary Calculator", href: "/salary-calculator" },
    ],
    forEmployers: [
      { label: "Post a Job", href: "/recruiter/post-job" },
      { label: "Browse Candidates", href: "/recruiter/candidates" },
      { label: "Employer Dashboard", href: "/recruiter/dashboard" },
      { label: "Pricing Plans", href: "/pricing" },
      { label: "Recruitment Solutions", href: "/solutions" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers at FinAutoJobs", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Press", href: "/press" },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "FAQs", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  const popularSearches = [
    "IT Jobs",
    "Remote Jobs",
    "Fresher Jobs",
    "Work from Home",
    "Part Time Jobs",
    "MNC Jobs",
    "Startup Jobs",
    "Banking Jobs",
  ];

  return (
    <>
      <FooterWrapper>
        {/* Newsletter Section */}
        <Box
          sx={{
            py: 5,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  Get the Latest Job Alerts
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  Subscribe to our newsletter and never miss out on new
                  opportunities
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <TextField
                    placeholder="Enter your email"
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#fff",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                        "&:hover fieldset": {
                          borderColor: "rgba(255,255,255,0.3)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#94a3b8",
                        opacity: 1,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: "10px",
                      px: 4,
                      py: 1.25,
                      textTransform: "none",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      },
                    }}
                  >
                    Subscribe
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Main Footer Content */}
        <Container maxWidth="lg">
          <Box sx={{ py: 6 }}>
            <Grid container spacing={4}>
              {/* Brand Column */}
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 2,
                    }}
                  >
                    FinAutoJobs
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#94a3b8", lineHeight: 1.8, mb: 3 }}
                  >
                    India's leading job portal connecting talented professionals
                    with top employers. Find your dream job or hire the perfect
                    candidate with FinAutoJobs.
                  </Typography>
                </Box>

                {/* Contact Info */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Email sx={{ fontSize: 18, color: "#6366f1" }} />
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      support@finautojobs.com
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Phone sx={{ fontSize: 18, color: "#6366f1" }} />
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      +91 1800-XXX-XXXX
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LocationOn sx={{ fontSize: 18, color: "#6366f1" }} />
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      Mumbai, Maharashtra, India
                    </Typography>
                  </Box>
                </Box>

                {/* Social Links */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  {[Facebook, Twitter, LinkedIn, Instagram, YouTube].map(
                    (Icon, i) => (
                      <SocialButton key={i} size="small">
                        <Icon sx={{ fontSize: 20 }} />
                      </SocialButton>
                    )
                  )}
                </Box>
              </Grid>

              {/* Links Columns */}
              <Grid item xs={6} sm={3} md={2}>
                <FooterTitle>For Job Seekers</FooterTitle>
                {footerLinks.forJobSeekers.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                  >
                    <FooterLink>{link.label}</FooterLink>
                  </Link>
                ))}
              </Grid>

              <Grid item xs={6} sm={3} md={2}>
                <FooterTitle>For Employers</FooterTitle>
                {footerLinks.forEmployers.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                  >
                    <FooterLink>{link.label}</FooterLink>
                  </Link>
                ))}
              </Grid>

              <Grid item xs={6} sm={3} md={2}>
                <FooterTitle>Company</FooterTitle>
                {footerLinks.company.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                  >
                    <FooterLink>{link.label}</FooterLink>
                  </Link>
                ))}
              </Grid>

              <Grid item xs={6} sm={3} md={2}>
                <FooterTitle>Support</FooterTitle>
                {footerLinks.support.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                  >
                    <FooterLink>{link.label}</FooterLink>
                  </Link>
                ))}
              </Grid>
            </Grid>

            {/* App Download Section */}
            <Box
              sx={{
                mt: 5,
                pt: 4,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    Download the App
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                    Get real-time job alerts and apply on the go
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <AppButton startIcon={<Apple />}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.7, display: "block", lineHeight: 1 }}
                        >
                          Download on the
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          App Store
                        </Typography>
                      </Box>
                    </AppButton>
                    <AppButton startIcon={<Android />}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.7, display: "block", lineHeight: 1 }}
                        >
                          Get it on
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          Google Play
                        </Typography>
                      </Box>
                    </AppButton>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                    Popular Job Searches
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {popularSearches.map((search, i) => (
                      <Chip
                        key={i}
                        label={search}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.1)",
                          color: "#94a3b8",
                          borderRadius: "8px",
                          "&:hover": {
                            bgcolor: "rgba(99, 102, 241, 0.3)",
                            color: "#fff",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>

        {/* Bottom Bar */}
        <Box
          sx={{
            py: 3,
            bgcolor: "rgba(0,0,0,0.2)",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                © {new Date().getFullYear()} FinAutoJobs. All rights reserved.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Made with
                </Typography>
                <Favorite
                  sx={{
                    fontSize: 16,
                    color: "#ef4444",
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                  }}
                />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  in India
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 3 }}>
                <Link href="/privacy" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      "&:hover": { color: "#a5b4fc" },
                      cursor: "pointer",
                    }}
                  >
                    Privacy
                  </Typography>
                </Link>
                <Link href="/terms" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      "&:hover": { color: "#a5b4fc" },
                      cursor: "pointer",
                    }}
                  >
                    Terms
                  </Typography>
                </Link>
                <Link href="/sitemap" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      "&:hover": { color: "#a5b4fc" },
                      cursor: "pointer",
                    }}
                  >
                    Sitemap
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Container>
        </Box>
      </FooterWrapper>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop}>
          <KeyboardArrowUp />
        </ScrollToTopButton>
      )}
    </>
  );
};

export default NaukriFooter;
