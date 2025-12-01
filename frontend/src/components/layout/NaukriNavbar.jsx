import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  InputBase,
  Paper,
  Chip,
  Fade,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Work,
  Business,
  Person,
  Notifications,
  Menu as MenuIcon,
  Close,
  KeyboardArrowDown,
  TrendingUp,
  School,
  Description,
  Star,
  ArrowForward,
  Bookmark,
  Login,
  PersonAdd,
  Dashboard,
  Logout,
  Settings,
  Chat,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";

// Styled Components
const NavbarWrapper = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1100,
  backgroundColor: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}));

const TopBar = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #4a3f9f 0%, #6366f1 50%, #8b5cf6 100%)",
  padding: "6px 0",
}));

const MainNav = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderBottom: "1px solid #e8e8e8",
}));

const SearchWrapper = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  boxShadow: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#6366f1",
    boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.1)",
  },
  "&:focus-within": {
    borderColor: "#6366f1",
    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  padding: "8px 12px",
  fontSize: "14px",
  "& input::placeholder": {
    color: "#9ca3af",
  },
}));

const NavLink = styled(Button)(({ theme, active }) => ({
  textTransform: "none",
  fontWeight: active ? 600 : 500,
  fontSize: "14px",
  color: active ? "#6366f1" : "#374151",
  padding: "8px 16px",
  borderRadius: "6px",
  position: "relative",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    color: "#6366f1",
  },
  "&::after": active
    ? {
        content: '""',
        position: "absolute",
        bottom: "-12px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "3px",
        backgroundColor: "#6366f1",
        borderRadius: "2px 2px 0 0",
      }
    : {},
}));

const DropdownMenu = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  padding: "16px",
  minWidth: "280px",
  zIndex: 1200,
  opacity: 0,
  visibility: "hidden",
  transform: "translateY(10px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
}));

const MenuItemStyled = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    transform: "translateX(4px)",
    "& .menu-icon": {
      color: "#6366f1",
    },
    "& .menu-title": {
      color: "#6366f1",
    },
  },
}));

const FloatingBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "-8px",
  right: "-8px",
  backgroundColor: "#ef4444",
  color: "#fff",
  fontSize: "10px",
  fontWeight: 600,
  padding: "2px 6px",
  borderRadius: "10px",
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
}));

const NaukriNavbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Dropdown refs
  const jobsRef = useRef(null);
  const companiesRef = useRef(null);
  const servicesRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (searchLocation) params.append("location", searchLocation);
    window.location.href = `/jobs?${params.toString()}`;
  };

  const jobsMenuItems = [
    {
      icon: <Work />,
      title: "IT Jobs",
      subtitle: "50,000+ jobs",
      link: "/jobs?category=it",
    },
    {
      icon: <TrendingUp />,
      title: "Sales Jobs",
      subtitle: "25,000+ jobs",
      link: "/jobs?category=sales",
    },
    {
      icon: <Business />,
      title: "Marketing Jobs",
      subtitle: "15,000+ jobs",
      link: "/jobs?category=marketing",
    },
    {
      icon: <School />,
      title: "Data Science Jobs",
      subtitle: "10,000+ jobs",
      link: "/jobs?category=data-science",
    },
    {
      icon: <Person />,
      title: "HR Jobs",
      subtitle: "8,000+ jobs",
      link: "/jobs?category=hr",
    },
    {
      icon: <Star />,
      title: "Fresher Jobs",
      subtitle: "30,000+ jobs",
      link: "/jobs?category=fresher",
    },
    {
      icon: <Work />,
      title: "Remote Jobs",
      subtitle: "20,000+ jobs",
      link: "/jobs?category=remote",
    },
    {
      icon: <Work />,
      title: "Walk-in Jobs",
      subtitle: "5,000+ jobs",
      link: "/jobs?category=walkin",
    },
  ];

  const companiesMenuItems = [
    {
      icon: <Star />,
      title: "MNCs",
      subtitle: "725 Companies",
      link: "/companies?type=mnc",
      badge: "Popular",
    },
    {
      icon: <TrendingUp />,
      title: "Startups",
      subtitle: "202 Companies",
      link: "/companies?type=startup",
    },
    {
      icon: <Business />,
      title: "Unicorns",
      subtitle: "36 Companies",
      link: "/companies?type=unicorn",
      badge: "Hot",
    },
    {
      icon: <Work />,
      title: "Product Companies",
      subtitle: "392 Companies",
      link: "/companies?type=product",
    },
    {
      icon: <Business />,
      title: "Fortune 500",
      subtitle: "62 Companies",
      link: "/companies?type=fortune500",
    },
    {
      icon: <Star />,
      title: "Featured Companies",
      subtitle: "150+ Companies",
      link: "/companies?featured=true",
    },
  ];

  const servicesMenuItems = [
    {
      icon: <Description />,
      title: "Resume Writing",
      subtitle: "Professional resume services",
      link: "/services/resume",
    },
    {
      icon: <Star />,
      title: "Resume Display",
      subtitle: "Get noticed by recruiters",
      link: "/services/resume-display",
    },
    {
      icon: <TrendingUp />,
      title: "Priority Applicant",
      subtitle: "Stand out from crowd",
      link: "/services/priority",
    },
    {
      icon: <School />,
      title: "Skill Assessments",
      subtitle: "Showcase your skills",
      link: "/skills-assessment",
    },
    {
      icon: <Chat />,
      title: "Interview Prep",
      subtitle: "AI-powered practice",
      link: "/interview-preparation",
    },
  ];

  const renderDropdown = (items, type) => (
    <Box sx={{ display: "grid", gap: 1 }}>
      {items.map((item, index) => (
        <Link key={index} href={item.link}>
          <MenuItemStyled>
            <Box
              className="menu-icon"
              sx={{ color: "#6b7280", transition: "color 0.2s" }}
            >
              {item.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                className="menu-title"
                variant="body2"
                fontWeight={600}
                sx={{ color: "#1f2937", transition: "color 0.2s" }}
              >
                {item.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                {item.subtitle}
              </Typography>
            </Box>
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  bgcolor: item.badge === "Hot" ? "#fef2f2" : "#f0fdf4",
                  color: item.badge === "Hot" ? "#ef4444" : "#22c55e",
                  fontSize: "10px",
                  height: "20px",
                  fontWeight: 600,
                }}
              />
            )}
            <ArrowForward sx={{ fontSize: 16, color: "#d1d5db" }} />
          </MenuItemStyled>
        </Link>
      ))}
    </Box>
  );

  return (
    <NavbarWrapper>
      {/* Top Bar */}
      <TopBar>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  "&:hover": { color: "#fff" },
                }}
              >
                🔥 2M+ Active Jobs
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  "&:hover": { color: "#fff" },
                }}
              >
                ⭐ 50K+ Companies Hiring
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  display: { xs: "none", md: "block" },
                  "&:hover": { color: "#fff" },
                }}
              >
                📱 Download App
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  "&:hover": { color: "#fff" },
                }}
              >
                For Employers
              </Typography>
            </Box>
          </Box>
        </Container>
      </TopBar>

      {/* Main Navigation */}
      <MainNav>
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", alignItems: "center", py: 1.5, gap: 3 }}>
            {/* Logo */}
            <Link href="/">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  <Work sx={{ color: "#fff", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#1f2937",
                      lineHeight: 1.1,
                      fontSize: "1.1rem",
                    }}
                  >
                    FinAutoJobs
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6366f1", fontWeight: 500, fontSize: "10px" }}
                  >
                    Find Your Dream Job
                  </Typography>
                </Box>
              </Box>
            </Link>

            {/* Search Bar */}
            <SearchWrapper
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: { xs: "none", md: "flex" },
                flex: 1,
                maxWidth: 600,
                ml: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1.5,
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                <Search sx={{ color: "#9ca3af", fontSize: 20 }} />
              </Box>
              <SearchInput
                placeholder="Skills, Designations, Companies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1.5,
                  borderLeft: "1px solid #e5e7eb",
                }}
              >
                <LocationOn sx={{ color: "#9ca3af", fontSize: 20 }} />
              </Box>
              <SearchInput
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                sx={{ maxWidth: 150 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  m: 0.5,
                  px: 3,
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                  },
                }}
              >
                Search
              </Button>
            </SearchWrapper>

            {/* Navigation Links */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 0.5,
                ml: "auto",
              }}
            >
              {/* Jobs Dropdown */}
              <Box
                sx={{ position: "relative" }}
                onMouseEnter={() => setActiveDropdown("jobs")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <NavLink
                  active={location.startsWith("/jobs")}
                  endIcon={
                    <KeyboardArrowDown
                      sx={{
                        transition: "transform 0.2s",
                        transform:
                          activeDropdown === "jobs" ? "rotate(180deg)" : "none",
                      }}
                    />
                  }
                >
                  Jobs
                </NavLink>
                <Fade in={activeDropdown === "jobs"}>
                  <DropdownMenu
                    sx={{
                      opacity: activeDropdown === "jobs" ? 1 : 0,
                      visibility:
                        activeDropdown === "jobs" ? "visible" : "hidden",
                      transform:
                        activeDropdown === "jobs"
                          ? "translateY(0)"
                          : "translateY(10px)",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ px: 2, py: 1, color: "#6b7280", fontWeight: 600 }}
                    >
                      POPULAR CATEGORIES
                    </Typography>
                    {renderDropdown(jobsMenuItems, "jobs")}
                    <Divider sx={{ my: 2 }} />
                    <Link href="/jobs">
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{
                          textTransform: "none",
                          borderColor: "#6366f1",
                          color: "#6366f1",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#4f46e5",
                            bgcolor: "rgba(99, 102, 241, 0.08)",
                          },
                        }}
                      >
                        View All Jobs →
                      </Button>
                    </Link>
                  </DropdownMenu>
                </Fade>
              </Box>

              {/* Companies Dropdown */}
              <Box
                sx={{ position: "relative" }}
                onMouseEnter={() => setActiveDropdown("companies")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <NavLink
                  active={location.startsWith("/companies")}
                  endIcon={
                    <KeyboardArrowDown
                      sx={{
                        transition: "transform 0.2s",
                        transform:
                          activeDropdown === "companies"
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  }
                >
                  Companies
                </NavLink>
                <Fade in={activeDropdown === "companies"}>
                  <DropdownMenu
                    sx={{
                      opacity: activeDropdown === "companies" ? 1 : 0,
                      visibility:
                        activeDropdown === "companies" ? "visible" : "hidden",
                      transform:
                        activeDropdown === "companies"
                          ? "translateY(0)"
                          : "translateY(10px)",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ px: 2, py: 1, color: "#6b7280", fontWeight: 600 }}
                    >
                      EXPLORE COMPANIES
                    </Typography>
                    {renderDropdown(companiesMenuItems, "companies")}
                    <Divider sx={{ my: 2 }} />
                    <Link href="/companies">
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{
                          textTransform: "none",
                          borderColor: "#6366f1",
                          color: "#6366f1",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#4f46e5",
                            bgcolor: "rgba(99, 102, 241, 0.08)",
                          },
                        }}
                      >
                        View All Companies →
                      </Button>
                    </Link>
                  </DropdownMenu>
                </Fade>
              </Box>

              {/* Services Dropdown */}
              <Box
                sx={{ position: "relative" }}
                onMouseEnter={() => setActiveDropdown("services")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <NavLink
                  active={location.startsWith("/services")}
                  endIcon={
                    <KeyboardArrowDown
                      sx={{
                        transition: "transform 0.2s",
                        transform:
                          activeDropdown === "services"
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  }
                >
                  Services
                  <Box
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 0,
                      bgcolor: "#22c55e",
                      color: "#fff",
                      fontSize: "8px",
                      px: 0.5,
                      borderRadius: "4px",
                      fontWeight: 700,
                    }}
                  >
                    NEW
                  </Box>
                </NavLink>
                <Fade in={activeDropdown === "services"}>
                  <DropdownMenu
                    sx={{
                      opacity: activeDropdown === "services" ? 1 : 0,
                      visibility:
                        activeDropdown === "services" ? "visible" : "hidden",
                      transform:
                        activeDropdown === "services"
                          ? "translateY(0)"
                          : "translateY(10px)",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ px: 2, py: 1, color: "#6b7280", fontWeight: 600 }}
                    >
                      CAREER SERVICES
                    </Typography>
                    {renderDropdown(servicesMenuItems, "services")}
                  </DropdownMenu>
                </Fade>
              </Box>
            </Box>

            {/* Auth Buttons / User Menu */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                ml: { xs: "auto", lg: 2 },
              }}
            >
              {user ? (
                <>
                  {/* Notifications */}
                  <IconButton sx={{ position: "relative" }}>
                    <Badge badgeContent={3} color="error">
                      <Notifications sx={{ color: "#6b7280" }} />
                    </Badge>
                  </IconButton>

                  {/* Saved Jobs */}
                  <IconButton sx={{ display: { xs: "none", md: "flex" } }}>
                    <Bookmark sx={{ color: "#6b7280" }} />
                  </IconButton>

                  {/* Chat */}
                  <IconButton sx={{ display: { xs: "none", md: "flex" } }}>
                    <Chat sx={{ color: "#6b7280" }} />
                  </IconButton>

                  {/* User Profile */}
                  <Box
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      p: 1,
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: "rgba(99, 102, 241, 0.08)" },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {user.name?.charAt(0) || user.firstName?.charAt(0) || "U"}
                    </Avatar>
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: "#1f2937", lineHeight: 1.2 }}
                      >
                        {user.name ||
                          `${user.firstName} ${user.lastName}` ||
                          "User"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                      </Typography>
                    </Box>
                    <KeyboardArrowDown
                      sx={{ color: "#6b7280", fontSize: 18 }}
                    />
                  </Box>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        minWidth: 220,
                      },
                    }}
                  >
                    <Box
                      sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        {user.name || `${user.firstName} ${user.lastName}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <MenuItem
                      component={Link}
                      href={
                        user.role === "recruiter"
                          ? "/recruiter-dashboard"
                          : "/applicant-dashboard"
                      }
                      onClick={() => setAnchorEl(null)}
                    >
                      <ListItemIcon>
                        <Dashboard fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Dashboard</ListItemText>
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/profile"
                      onClick={() => setAnchorEl(null)}
                    >
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>My Profile</ListItemText>
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/applications"
                      onClick={() => setAnchorEl(null)}
                    >
                      <ListItemIcon>
                        <Description fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Applications</ListItemText>
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/settings"
                      onClick={() => setAnchorEl(null)}
                    >
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Settings</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        logout();
                      }}
                      sx={{ color: "error.main" }}
                    >
                      <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: "error.main" }} />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    href="/login"
                    variant="outlined"
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      px: 3,
                      borderRadius: "8px",
                      "&:hover": {
                        borderColor: "#4f46e5",
                        bgcolor: "rgba(99, 102, 241, 0.08)",
                      },
                    }}
                    startIcon={<Login />}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    href="/register"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                      },
                    }}
                    startIcon={<PersonAdd />}
                  >
                    Register
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              <IconButton
                sx={{ display: { lg: "none" } }}
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </MainNav>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: "85%",
            maxWidth: 360,
            borderRadius: "16px 0 0 16px",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {/* Mobile Search */}
          <SearchWrapper
            component="form"
            onSubmit={handleSearch}
            sx={{ mb: 3 }}
          >
            <Search sx={{ ml: 1.5, color: "#9ca3af" }} />
            <SearchInput
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </SearchWrapper>

          <List>
            <ListItem
              component={Link}
              href="/jobs"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                <Work sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText primary="Jobs" />
            </ListItem>
            <ListItem
              component={Link}
              href="/companies"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                <Business sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText primary="Companies" />
            </ListItem>
            <ListItem
              component={Link}
              href="/salary-insights"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                <TrendingUp sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText primary="Salary Insights" />
            </ListItem>
            <ListItem
              component={Link}
              href="/skills-assessment"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                <School sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText primary="Skills Assessment" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {user ? (
            <List>
              <ListItem
                component={Link}
                href={
                  user.role === "recruiter"
                    ? "/recruiter-dashboard"
                    : "/applicant-dashboard"
                }
                onClick={() => setMobileOpen(false)}
              >
                <ListItemIcon>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem
                component={Link}
                href="/profile"
                onClick={() => setMobileOpen(false)}
              >
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
              >
                <ListItemIcon>
                  <Logout sx={{ color: "error.main" }} />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: "error.main" }} />
              </ListItem>
            </List>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2 }}
            >
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "#6366f1",
                  color: "#6366f1",
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                fullWidth
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </NavbarWrapper>
  );
};

export default NaukriNavbar;
