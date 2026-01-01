import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  LinearProgress,
  Rating,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Work,
  Business,
  LocationOn,
  TrendingUp,
  Bookmark,
  BookmarkBorder,
  ArrowForward,
  Person,
  School,
  Assessment,
  EmojiEvents,
  Verified,
  Star,
  LocalFireDepartment,
  FlashOn,
  HomeWork,
  Code,
  Analytics,
  DesignServices,
  AccountBalance,
  LocalShipping,
  HealthAndSafety,
  Engineering,
  SupportAgent,
  Campaign,
  AttachMoney,
  Timer,
  CheckCircle,
  Groups,
  KeyboardArrowRight,
  PlayArrow,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import API_BASE_URL from "../services/apiConfig";
import colors, { fonts, fontSizes } from "../styles/uiColors";
import { mapBackendJobToFrontend } from "../utils/jobMapper";

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components
const HeroSection = styled(Box)(() => ({
  position: "relative",
  minHeight: "85vh",
  background: `linear-gradient(135deg, ${colors.dark} 0%, #312e81 30%, #4338ca 60%, ${colors.primary} 100%)`,
  backgroundSize: "300% 300%",
  animation: `${gradientMove} 15s ease infinite`,
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: "none",
  },
}));

const FloatingCard = styled(Card)(() => ({
  position: "absolute",
  borderRadius: "6px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  animation: `${float} 4s ease-in-out infinite`,
  backdropFilter: "blur(10px)",
  backgroundColor: "rgba(255,255,255,0.95)",
}));

const StatsCard = styled(Box)(({ bgcolor }) => ({
  padding: "24px",
  borderRadius: "6px",
  background: bgcolor || "linear-gradient(135deg, #fff 0%, #f9fafb 100%)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
  },
}));

const CategoryCard = styled(Box)(({ gradient }) => ({
  padding: "28px",
  borderRadius: "6px",
  background: gradient || "#fff",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
      "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
    opacity: 0,
    transition: "opacity 0.3s",
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    "&::before": { opacity: 1 },
    "& .category-icon": { transform: "scale(1.1) rotate(5deg)" },
    "& .arrow-icon": { transform: "translateX(5px)", opacity: 1 },
  },
}));

const JobCard = styled(Card)(() => ({
  borderRadius: "6px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease",
  border: "1px solid transparent",
  position: "relative",
  overflow: "visible",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 20px 50px rgba(99, 102, 241, 0.15)",
    borderColor: colors.primary,
    "& .company-logo": {
      transform: "scale(1.1)",
    },
  },
}));

const CompanyCard = styled(Card)(() => ({
  borderRadius: "6px",
  padding: "24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease",
  cursor: "pointer",
  textAlign: "center",
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
  },
}));

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  color: "#fff",
  textTransform: "none",
  fontWeight: 600,
  padding: "14px 32px",
  borderRadius: "6px",
  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.secondary} 100%)`,
    transform: "translateY(-2px)",
    boxShadow: "0 8px 30px rgba(99, 102, 241, 0.5)",
  },
}));

const SectionTitle = styled(Box)(() => ({
  marginBottom: "48px",
  textAlign: "center",
}));

const HomePageNaukri = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchFeaturedJobs();
    fetchTopCompanies();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs?limit=8`);
      if (response.ok) {
        const result = await response.json();
        const jobsData = result.data?.jobs || [];
        setFeaturedJobs(jobsData.map(mapBackendJobToFrontend));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies?limit=6`);
      if (response.ok) {
        const result = await response.json();
        const companiesData = result.data?.companies || result.companies || [];
        setTopCompanies(companiesData);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const stats = [
    {
      icon: <Work sx={{ fontSize: 32 }} />,
      value: "Many",
      label: "Active Jobs",
      color: colors.primary,
      bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    },
    {
      icon: <Business sx={{ fontSize: 32 }} />,
      value: "Top",
      label: "Companies",
      color: "#8b5cf6",
      bgGradient: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)",
    },
    {
      icon: <Person sx={{ fontSize: 32 }} />,
      value: "Verified",
      label: "Job Seekers",
      color: "#06b6d4",
      bgGradient: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      value: "Leading",
      label: "Unicorns Hiring",
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    },
  ];

  const categories = [
    {
      icon: <Code />,
      title: "IT & Software",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    },
    {
      icon: <Analytics />,
      title: "Data Science",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    },
    {
      icon: <DesignServices />,
      title: "Design",
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    },
    {
      icon: <Campaign />,
      title: "Marketing",
      gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
    },
    {
      icon: <AccountBalance />,
      title: "Banking & Finance",
      gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    },
    {
      icon: <HealthAndSafety />,
      title: "Healthcare",
      gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    },
    {
      icon: <Engineering />,
      title: "Engineering",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      icon: <SupportAgent />,
      title: "Customer Support",
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    },
  ];


  const features = [
    {
      icon: <FlashOn />,
      title: "Instant Apply",
      description: "Apply to jobs with one click using your saved profile",
    },
    {
      icon: <Verified />,
      title: "Verified Companies",
      description: "All companies are verified for authentic job postings",
    },
    {
      icon: <Assessment />,
      title: "Skill Assessment",
      description: "Take tests to showcase your skills to recruiters",
    },
    {
      icon: <LocalFireDepartment />,
      title: "Hot Jobs Alert",
      description: "Get notified about trending jobs matching your profile",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero Section */}
      <HeroSection>
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            pt: { xs: 8, md: 12 },
            pb: { xs: 10, md: 16 },
            px: { xs: 2, sm: 4, md: 6 },
          }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ color: "#fff", maxWidth: 560 }}>
                <Chip
                  icon={
                    <LocalFireDepartment sx={{ color: "#fbbf24 !important" }} />
                  }
                  label="🔥 Specialized Jobs Available"
                  sx={{
                    mb: 4,
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontWeight: 600,
                    px: 2,
                    py: 2.5,
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "14px",
                    animation: `${pulse} 2s infinite`,
                  }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: fontSizes.heroTitle,
                    fontFamily: fonts.display,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    mb: 3,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                    textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  Find Your{" "}
                  <Box
                    component="span"
                    sx={{
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 900,
                    }}
                  >
                    Dream Job
                  </Box>
                  <br />
                  Today
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 5,
                    color: "rgba(255,255,255,0.95)",
                    fontFamily: fonts.body,
                    fontWeight: 400,
                    lineHeight: 1.9,
                    maxWidth: 580,
                    fontSize: fontSizes.heroSubtitle,
                    letterSpacing: "0.01em",
                  }}
                >
                  Connect with top employers and discover opportunities that
                  match your skills. Join millions of professionals who found
                  their perfect career here.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 6 }}>
                  <GradientButton
                    component={Link}
                    href="/jobs"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      background: "#fff",
                      color: colors.primary,
                      "&:hover": {
                        background: "#f3f4f6",
                        color: colors.primaryDark,
                      },
                    }}
                  >
                    Explore Jobs
                  </GradientButton>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: "6px",
                      "&:hover": {
                        borderColor: "#fff",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    How It Works
                  </Button>
                </Box>

                {/* Trust Indicators */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AvatarGroup max={4}>
                      {[1, 2, 3, 4].map((i) => (
                        <Avatar
                          key={i}
                          sx={{
                            width: 36,
                            height: 36,
                            border: "2px solid rgba(255,255,255,0.3)",
                          }}
                          src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        />
                      ))}
                    </AvatarGroup>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      Professionals trust us
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Star sx={{ color: "#fbbf24", fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      <strong>4.8</strong> App Store Rating
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Floating Cards - Desktop Only */}
            {!isMobile && (
              <Grid
                item
                xs={12}
                md={5}
                sx={{ position: "relative", minHeight: 400 }}
              >
                <FloatingCard
                  sx={{ top: 20, right: 40, p: 2, animationDelay: "0s" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#22c55e", width: 48, height: 48 }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Application Sent!
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Senior Developer at Google
                      </Typography>
                    </Box>
                  </Box>
                </FloatingCard>

                <FloatingCard
                  sx={{ top: 140, right: 120, p: 2, animationDelay: "0.5s" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: colors.primary }}>
                      <Groups />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        2.5K+
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hired this week
                      </Typography>
                    </Box>
                  </Box>
                </FloatingCard>

                <FloatingCard
                  sx={{ bottom: 80, right: 20, p: 2.5, animationDelay: "1s" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#f59e0b" }}>AM</Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Amazon
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Product Manager
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label="₹25-35 LPA"
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#16a34a",
                        fontWeight: 600,
                      }}
                    />
                    <Chip label="Remote" size="small" variant="outlined" />
                  </Box>
                </FloatingCard>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Wave Decoration */}
        <Box
          sx={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
            height: 120,
            background:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='%23f8fafc' d='M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z'%3E%3C/path%3E%3C/svg%3E\")",
            backgroundSize: "cover",
          }}
        />
      </HeroSection>

      {/* Stats Section */}
      <Container
        maxWidth="lg"
        sx={{
          mt: -6,
          position: "relative",
          zIndex: 10,
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <StatsCard bgcolor={stat.bgGradient}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "6px",
                      bgcolor: `${stat.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <TrendingUp sx={{ color: "#22c55e", fontSize: 20 }} />
                </Box>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, mt: 2, color: "#1f2937" }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", fontWeight: 500 }}
                >
                  {stat.label}
                </Typography>
              </StatsCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 10, px: { xs: 2, sm: 4, md: 6 } }}>
        <SectionTitle>
          <Chip
            label="EXPLORE"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "#ede9fe",
              color: colors.primary,
              fontWeight: 700,
              fontFamily: fonts.body,
              letterSpacing: "0.1em",
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontFamily: fonts.heading,
              fontSize: fontSizes.sectionTitle,
              color: "#1f2937",
              letterSpacing: "-0.02em",
            }}
          >
            Popular Job Categories
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#6b7280",
              fontWeight: 400,
              fontFamily: fonts.body,
              maxWidth: 600,
              mx: "auto",
              fontSize: "1.1rem",
              lineHeight: 1.7,
            }}
          >
            Browse through thousands of job openings across different industries
          </Typography>
        </SectionTitle>

        <Grid container spacing={3}>
          {categories.map((category, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Link
                href={`/jobs?category=${category.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <CategoryCard gradient={category.gradient}>
                  <Box
                    className="category-icon"
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "6px",
                      bgcolor: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      mb: 2,
                      transition: "transform 0.3s",
                    }}
                  >
                    {React.cloneElement(category.icon, {
                      sx: { fontSize: 28 },
                    })}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#fff", mb: 0.5 }}
                  >
                    {category.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <ArrowForward
                      className="arrow-icon"
                      sx={{
                        color: "#fff",
                        fontSize: 18,
                        opacity: 0.7,
                        transition: "all 0.3s",
                      }}
                    />
                  </Box>
                </CategoryCard>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Jobs Section */}
      <Box sx={{ bgcolor: "#fff", py: 10 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          <SectionTitle>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <LocalFireDepartment sx={{ color: "#ef4444" }} />
              <Chip
                label="TRENDING"
                size="small"
                sx={{ bgcolor: "#fee2e2", color: "#ef4444", fontWeight: 600 }}
              />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontFamily: fonts.heading,
                fontSize: fontSizes.sectionTitle,
                color: "#1f2937",
                letterSpacing: "-0.02em",
              }}
            >
              Featured Jobs
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#6b7280",
                fontWeight: 400,
                fontFamily: fonts.body,
                fontSize: "1.1rem",
              }}
            >
              Hand-picked opportunities from top companies
            </Typography>
          </SectionTitle>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <LinearProgress
                sx={{ maxWidth: 300, mx: "auto", borderRadius: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 2, color: "#6b7280" }}>
                Loading jobs...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredJobs
                .slice(0, 8)
                .map((job, index) => (
                  <Grid item xs={12} sm={6} lg={3} key={job._id || index}>
                    <JobCard>
                      {index < 2 && (
                        <Chip
                          label="HOT"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -10,
                            left: 16,
                            bgcolor: "#ef4444",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "10px",
                            animation: `${pulse} 2s infinite`,
                          }}
                        />
                      )}
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Avatar
                            className="company-logo"
                            sx={{
                              width: 52,
                              height: 52,
                              bgcolor: colors.primary,
                              fontWeight: 700,
                              fontSize: "18px",
                              transition: "transform 0.3s",
                            }}
                          >
                            {(job.company || "C").charAt(0)}
                          </Avatar>
                          <IconButton
                            onClick={() => toggleSaveJob(job._id)}
                            size="small"
                          >
                            {savedJobs.includes(job._id) ? (
                              <Bookmark sx={{ color: colors.primary }} />
                            ) : (
                              <BookmarkBorder sx={{ color: "#9ca3af" }} />
                            )}
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ color: "#6b7280", fontWeight: 500, mb: 0.5 }}
                        >
                          {job.company}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 1.5,
                            fontSize: "1rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {job.title}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 1,
                            color: "#6b7280",
                          }}
                        >
                          <LocationOn sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            {job.location}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            mb: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          {(job.skills || [])
                            .slice(0, 3)
                            .map((skill, i) => (
                              <Chip
                                key={i}
                                label={skill}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "11px", height: 24 }}
                              />
                            ))}
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: "#22c55e", fontWeight: 600 }}
                            >
                              {job.salary}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#9ca3af" }}
                            >
                              {job.type}
                            </Typography>
                          </Box>
                          <Button
                            component={Link}
                            href={`/jobs/${job._id}`}
                            size="small"
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              color: colors.primary,
                              "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
                            }}
                          >
                            Apply <KeyboardArrowRight sx={{ fontSize: 18 }} />
                          </Button>
                        </Box>
                      </CardContent>
                    </JobCard>
                  </Grid>
                ))}
            </Grid>
          )}

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <GradientButton
              component={Link}
              href="/jobs"
              size="large"
              endIcon={<ArrowForward />}
            >
              View All Jobs
            </GradientButton>
          </Box>
        </Container>
      </Box>

      {/* Top Companies Section */}
      {topCompanies.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10, px: { xs: 2, sm: 4, md: 6 } }}>
          <SectionTitle>
            <Chip
              label="TOP EMPLOYERS"
              size="small"
              sx={{
                mb: 2,
                bgcolor: "#dbeafe",
                color: "#2563eb",
                fontWeight: 700,
                fontFamily: fonts.body,
                letterSpacing: "0.1em",
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontFamily: fonts.heading,
                fontSize: fontSizes.sectionTitle,
                color: "#1f2937",
                letterSpacing: "-0.02em",
              }}
            >
              Dream Companies Hiring
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#6b7280",
                fontWeight: 400,
                fontFamily: fonts.body,
                fontSize: "1.1rem",
              }}
            >
              Get noticed by world's top employers
            </Typography>
          </SectionTitle>

          <Grid container spacing={3}>
            {topCompanies.map((company, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <CompanyCard>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: company.color || colors.primary,
                      fontSize: "28px",
                      fontWeight: 700,
                      mx: "auto",
                      mb: 2,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    {company.logo || (company.name || "C").charAt(0)}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {company.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <Rating
                      value={company.rating || 0}
                      precision={0.1}
                      size="small"
                      readOnly
                    />
                    {company.reviews && (
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        ({company.reviews})
                      </Typography>
                    )}
                  </Box>
                  {company.openings && (
                    <Chip
                      label={`${company.openings} Openings`}
                      size="small"
                      sx={{ bgcolor: "#f3f4f6", fontWeight: 500 }}
                    />
                  )}
                </CompanyCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              component={Link}
              href="/companies"
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: colors.primary,
                color: colors.primary,
                px: 4,
                py: 1.5,
                borderRadius: "6px",
                "&:hover": {
                  borderColor: colors.primaryDark,
                  bgcolor: "rgba(99,102,241,0.08)",
                },
              }}
            >
              View All Companies
            </Button>
          </Box>
        </Container>
      )}

      {/* Features Section */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          py: 10,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          <SectionTitle>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: "#fff",
                fontFamily: fonts.heading,
                fontSize: fontSizes.sectionTitle,
                letterSpacing: "-0.02em",
              }}
            >
              Why Choose FinAutoJobs?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 400,
                fontFamily: fonts.body,
                fontSize: "1.1rem",
              }}
            >
              We make job hunting simple and effective
            </Typography>
          </SectionTitle>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: "6px",
                    bgcolor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      bgcolor: "rgba(255,255,255,0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "6px",
                      bgcolor: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                    }}
                  >
                    {React.cloneElement(feature.icon, {
                      sx: { fontSize: 32, color: "#fff" },
                    })}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#fff", mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: "6px",
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#fff",
                mb: 2,
                position: "relative",
                fontFamily: fonts.heading,
                fontSize: fontSizes.sectionTitle,
                letterSpacing: "-0.02em",
              }}
            >
              Ready to Start Your Journey?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.95)",
                mb: 4,
                maxWidth: 500,
                mx: "auto",
                position: "relative",
                fontFamily: fonts.body,
                fontSize: "1.15rem",
                lineHeight: 1.7,
              }}
            >
              Create your profile and let recruiters find you
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              <Button
                component={Link}
                href="/register"
                variant="outlined"
                size="large"
                sx={{
                  bgcolor: "#fff",
                  color: "#0000",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: "6px",
                  "&:hover": { bgcolor: "#f3f4f6", color: "rgba(0,0,0,0.95)" },
                }}
              >
                Create Free Account
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: "6px",
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePageNaukri;
