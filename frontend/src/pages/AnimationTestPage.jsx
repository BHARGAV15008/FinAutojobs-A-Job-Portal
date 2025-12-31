import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Fade,
  Slide,
  Zoom,
} from "@mui/material";
import {
  PlayArrow,
  Favorite,
  Star,
  TrendingUp,
  Psychology,
  Rocket,
} from "@mui/icons-material";

const AnimationTestPage = () => {
  const [showCards, setShowCards] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const handleTestButton = () => {
    setShowCards(!showCards);
  };

  const modernButtons = [
    {
      label: "Primary Action",
      variant: "contained",
      color: "primary",
      icon: <PlayArrow />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      label: "Secondary Action",
      variant: "outlined",
      color: "primary",
      icon: <Favorite />,
      gradient: null,
    },
    {
      label: "Success Action",
      variant: "contained",
      color: "success",
      icon: <Star />,
      gradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
    },
    {
      label: "Trending Action",
      variant: "contained",
      color: "warning",
      icon: <TrendingUp />,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
  ];

  const animatedCards = [
    {
      title: "Modern Design",
      description: "Beautiful and responsive UI components",
      icon: <Psychology />,
      color: "#667eea",
    },
    {
      title: "Smooth Animations",
      description: "Engaging transitions and hover effects",
      icon: <Rocket />,
      color: "#764ba2",
    },
    {
      title: "Performance",
      description: "Optimized for speed and efficiency",
      icon: <TrendingUp />,
      color: "#4ade80",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        {/* Main Heading */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              letterSpacing: "-0.02em",
            }}
          >
            Animation Test Page
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              mb: 6,
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Testing scroll animations and hover effects
          </Typography>

          {/* Test Button */}
          <Button
            onClick={handleTestButton}
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: "6px",
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 12px 35px rgba(102, 126, 234, 0.6)",
                background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
              },
              "&:active": {
                transform: "translateY(-1px)",
              },
            }}
          >
            Test Button
          </Button>
        </Box>

        {/* Modern Buttons Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              color: "text.primary",
              mb: 4,
              fontSize: { xs: "1.8rem", md: "2.2rem" },
            }}
          >
            Modern Button Styles
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {modernButtons.map((button, index) => (
              <Grid item key={index}>
                <Button
                  variant={button.variant}
                  color={button.color}
                  startIcon={button.icon}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1.2,
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                    minWidth: "160px",
                    ...(button.gradient && {
                      background: button.gradient,
                      color: "white",
                    }),
                    ...(button.variant === "outlined" && {
                      border: "2px solid",
                      borderColor: "primary.main",
                    }),
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow:
                      button.variant === "contained"
                        ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                        : "none",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        button.variant === "contained"
                          ? "0 8px 25px rgba(102, 126, 234, 0.5)"
                          : "0 4px 15px rgba(25, 118, 210, 0.3)",
                      ...(button.gradient && {
                        background: button.gradient
                          .replace("667eea", "5a67d8")
                          .replace("764ba2", "6b46c1"),
                      }),
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                    },
                  }}
                >
                  {button.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Animated Cards Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 6,
              fontSize: { xs: "1.8rem", md: "2.2rem" },
            }}
          >
            Animated Cards
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {animatedCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in={showCards} timeout={1000 + index * 200}>
                <Card
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                  sx={{
                    height: "100%",
                    borderRadius: "6px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    transform:
                      activeCard === index
                        ? "translateY(-8px) scale(1.02)"
                        : "translateY(0) scale(1)",
                    boxShadow:
                      activeCard === index
                        ? `0 20px 40px rgba(${
                            card.color === "#667eea"
                              ? "102, 126, 234"
                              : card.color === "#764ba2"
                              ? "118, 75, 162"
                              : "74, 222, 128"
                          }, 0.3)`
                        : "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                        transition: "transform 0.3s ease",
                        transform:
                          activeCard === index
                            ? "scale(1.1) rotate(5deg)"
                            : "scale(1) rotate(0deg)",
                      }}
                    >
                      {React.cloneElement(card.icon, {
                        sx: { fontSize: 32, color: "white" },
                      })}
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mb: 2,
                        fontSize: "1.2rem",
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.6,
                        fontSize: "0.95rem",
                      }}
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Footer Note */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Modern UI components with smooth animations and hover effects
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AnimationTestPage;
