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
  Tooltip,
  Collapse,
  useScrollTrigger,
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
  History,
  LocalFireDepartment,
  HomeWork,
  Assessment,
  EmojiEvents,
  Verified,
  FlashOn,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import colors from "../../styles/uiColors";

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const NavbarWrapper = styled(Box, {
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})(({ theme, $scrolled }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1100,
  backgroundColor: theme.palette.background.paper,
  boxShadow: $scrolled
    ? "0 4px 20px rgba(0,0,0,0.1)"
    : "0 2px 8px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease",
}));

const TopBar = styled(Box)(() => ({
  background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
  padding: "8px 0",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.5,
  },
}));

const MainNav = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SearchWrapper = styled(Paper, {
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})(({ theme, $focused }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: "6px",
  border: $focused
    ? `2px solid ${colors.primary}`
    : `1px solid ${theme.palette.divider}`,
  boxShadow: $focused ? `0 4px 20px ${colors.primary}33` : "none",
  transition: "all 0.3s ease",
  backgroundColor: $focused
    ? theme.palette.mode === "dark"
      ? theme.palette.action.hover
      : "#fafafe"
    : theme.palette.background.paper,
  "&:hover": {
    borderColor: colors.primary,
    boxShadow: `0 2px 12px ${colors.primary}26`,
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  padding: "8px 12px",
  fontSize: "13px",
  color: theme.palette.text.primary,
  "& input::placeholder": {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
}));

const SearchSuggestionsBox = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "8px",
  borderRadius: "6px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  overflow: "hidden",
  zIndex: 1300,
  maxHeight: "400px",
  overflowY: "auto",
  backgroundColor: theme.palette.background.paper,
}));

const NavLink = styled(Button, {
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})(({ theme, $active }) => ({
  textTransform: "none",
  fontWeight: $active ? 600 : 500,
  fontSize: "13px",
  color: $active ? colors.primary : theme.palette.text.primary,
  padding: "8px 14px",
  borderRadius: "6px",
  position: "relative",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: `rgba(79,70,229,0.08)`,
    color: colors.primaryDark,
    transform: "translateY(-1px)",
  },
  "&::after": $active
    ? {
        content: '""',
        position: "absolute",
        bottom: "-12px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "3px",
        backgroundColor: colors.primary,
        borderRadius: "2px 2px 0 0",
      }
    : {},
}));

const MegaMenuDropdown = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "calc(100% + 10px)",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "6px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  padding: "24px",
  minWidth: "600px",
  zIndex: 1200,
  opacity: 0,
  visibility: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-8px",
    left: "50%",
    width: "16px",
    height: "16px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "4px",
    transform: "translateX(-50%) rotate(45deg)",
    boxShadow: "-2px -2px 5px rgba(0,0,0,0.03)",
  },
}));

const MenuItemStyled = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    transform: "translateX(6px)",
    "& .menu-icon": {
      color: "#6366f1",
      transform: "scale(1.1)",
    },
    "& .menu-title": {
      color: "#6366f1",
    },
    "& .arrow-icon": {
      opacity: 1,
      transform: "translateX(4px)",
    },
  },
}));

const NotificationBadge = styled(Badge)(() => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#ef4444",
    color: "#fff",
    fontSize: "10px",
    fontWeight: 700,
    minWidth: "18px",
    height: "18px",
    animation: `${pulse} 2s infinite`,
  },
}));

const TopBarChip = styled(Chip)(() => ({
  backgroundColor: "rgba(255,255,255,0.15)",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.25)",
    transform: "translateY(-1px)",
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    "React Developer",
    "Full Stack",
    "Python",
  ]);
  const searchRef = useRef(null);

  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 50 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      const updatedSearches = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
    }
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (searchLocation) params.append("location", searchLocation);
    window.location.href = `/jobs?${params.toString()}`;
  };

  const trendingSearches = [
    "Software Engineer",
    "Data Analyst",
    "Product Manager",
    "DevOps",
    "UI/UX Designer",
  ];

  const jobsMenuItems = {
    popular: [
      {
        icon: <Work />,
        title: "IT Jobs",
        link: "/jobs?category=it",
        hot: true,
      },
      {
        icon: <TrendingUp />,
        title: "Sales Jobs",
        link: "/jobs?category=sales",
      },
      {
        icon: <Business />,
        title: "Marketing Jobs",
        link: "/jobs?category=marketing",
      },
      {
        icon: <School />,
        title: "Data Science Jobs",
        link: "/jobs?category=data-science",
        hot: true,
      },
    ],
    inDemand: [
      {
        icon: <Star />,
        title: "Fresher Jobs",
        link: "/jobs?category=fresher",
      },
      {
        icon: <HomeWork />,
        title: "Remote Jobs",
        link: "/jobs?category=remote",
        new: true,
      },
      {
        icon: <LocalFireDepartment />,
        title: "Walk-in Jobs",
        link: "/jobs?category=walkin",
      },
      {
        icon: <FlashOn />,
        title: "Part-time Jobs",
        link: "/jobs?category=part-time",
      },
    ],
    byLocation: [
      {
        title: "Bangalore",
        link: "/jobs?location=bangalore",
      },
      { title: "Mumbai", link: "/jobs?location=mumbai" },
      { title: "Delhi NCR", link: "/jobs?location=delhi" },
      {
        title: "Hyderabad",
        link: "/jobs?location=hyderabad",
      },
    ],
  };

  const companiesMenuItems = {
    byType: [
      {
        icon: <Verified />,
        title: "MNCs",
        link: "/companies?type=mnc",
        badge: "Popular",
      },
      {
        icon: <TrendingUp />,
        title: "Startups",
        link: "/companies?type=startup",
      },
      {
        icon: <EmojiEvents />,
        title: "Unicorns",
        link: "/companies?type=unicorn",
        badge: "Hot",
      },
      {
        icon: <Business />,
        title: "Product Companies",
        link: "/companies?type=product",
      },
    ],
    byIndustry: [
      { title: "IT Services", link: "/companies?industry=it" },
      {
        title: "Banking & Finance",
        link: "/companies?industry=finance",
      },
      {
        title: "E-commerce",
        link: "/companies?industry=ecommerce",
      },
      {
        title: "Healthcare",
        link: "/companies?industry=healthcare",
      },
    ],
    featured: [
      { name: "Google", logo: "G", color: "#4285f4" },
      { name: "Amazon", logo: "A", color: "#ff9900" },
      { name: "Microsoft", logo: "M", color: "#00a4ef" },
      { name: "Meta", logo: "M", color: "#0866ff" },
    ],
  };

  const renderJobsMenu = () => (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 200px", gap: 3 }}>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            mb: 2,
            textTransform: "uppercase",
            fontSize: "11px",
            letterSpacing: "0.5px",
          }}
        >
          Popular Categories
        </Typography>
        {jobsMenuItems.popular.map((item, index) => (
          <Link key={index} href={item.link}>
            <MenuItemStyled>
              <Box
                className="menu-icon"
                sx={{ color: "text.secondary", transition: "all 0.2s" }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    className="menu-title"
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "text.primary", transition: "color 0.2s" }}
                  >
                    {item.title}
                  </Typography>
                  {item.hot && (
                    <Chip
                      label="HOT"
                      size="small"
                      sx={{
                        bgcolor: "#fee2e2",
                        color: "#ef4444",
                        fontSize: "9px",
                        height: 16,
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
              </Box>
              <ArrowForward
                className="arrow-icon"
                sx={{
                  fontSize: 16,
                  color: "action.disabled",
                  opacity: 0,
                  transition: "all 0.2s",
                }}
              />
            </MenuItemStyled>
          </Link>
        ))}
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            mt: 3,
            mb: 2,
            textTransform: "uppercase",
            fontSize: "11px",
            letterSpacing: "0.5px",
          }}
        >
          Jobs in Demand
        </Typography>
        {jobsMenuItems.inDemand.map((item, index) => (
          <Link key={index} href={item.link}>
            <MenuItemStyled>
              <Box
                className="menu-icon"
                sx={{ color: "text.secondary", transition: "all 0.2s" }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    className="menu-title"
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "text.primary", transition: "color 0.2s" }}
                  >
                    {item.title}
                  </Typography>
                  {item.new && (
                    <Chip
                      label="NEW"
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#22c55e",
                        fontSize: "9px",
                        height: 16,
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </MenuItemStyled>
          </Link>
        ))}
      </Box>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            mb: 2,
            textTransform: "uppercase",
            fontSize: "11px",
            letterSpacing: "0.5px",
          }}
        >
          Jobs by Location
        </Typography>
        {jobsMenuItems.byLocation.map((item, index) => (
          <Link key={index} href={item.link}>
            <MenuItemStyled>
              <LocationOn
                className="menu-icon"
                sx={{ color: "text.secondary", fontSize: 20 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  className="menu-title"
                  variant="body2"
                  fontWeight={600}
                >
                  {item.title}
                </Typography>
              </Box>
            </MenuItemStyled>
          </Link>
        ))}
        <Divider sx={{ my: 2 }} />
        <Link href="/jobs">
          <Button
            fullWidth
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "6px",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            View All Jobs →
          </Button>
        </Link>
      </Box>
      <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: "6px" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          🔥 Trending Searches
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {trendingSearches.map((term, i) => (
            <Chip
              key={i}
              label={term}
              size="small"
              variant="outlined"
              onClick={() => {
                window.location.href = `/jobs?search=${term}`;
              }}
              sx={{
                justifyContent: "flex-start",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "rgba(99,102,241,0.1)",
                  borderColor: "#6366f1",
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderCompaniesMenu = () => (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 220px", gap: 3 }}>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            mb: 2,
            textTransform: "uppercase",
            fontSize: "11px",
            letterSpacing: "0.5px",
          }}
        >
          By Company Type
        </Typography>
        {companiesMenuItems.byType.map((item, index) => (
          <Link key={index} href={item.link}>
            <MenuItemStyled>
              <Box
                className="menu-icon"
                sx={{ color: "text.secondary", transition: "all 0.2s" }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    className="menu-title"
                    variant="body2"
                    fontWeight={600}
                  >
                    {item.title}
                  </Typography>
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        bgcolor: item.badge === "Hot" ? "#fee2e2" : "#dcfce7",
                        color: item.badge === "Hot" ? "#ef4444" : "#22c55e",
                        fontSize: "9px",
                        height: 16,
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </MenuItemStyled>
          </Link>
        ))}
      </Box>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            mb: 2,
            textTransform: "uppercase",
            fontSize: "11px",
            letterSpacing: "0.5px",
          }}
        >
          By Industry
        </Typography>
        {companiesMenuItems.byIndustry.map((item, index) => (
          <Link key={index} href={item.link}>
            <MenuItemStyled>
              <Business
                className="menu-icon"
                sx={{ color: "text.secondary", fontSize: 20 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  className="menu-title"
                  variant="body2"
                  fontWeight={600}
                >
                  {item.title}
                </Typography>
              </Box>
            </MenuItemStyled>
          </Link>
        ))}
        <Divider sx={{ my: 2 }} />
        <Link href="/companies">
          <Button
            fullWidth
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "6px",
            }}
          >
            View All Companies →
          </Button>
        </Link>
      </Box>
      <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: "6px" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          ⭐ Featured Companies
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {companiesMenuItems.featured.map((company, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "6px",
                "&:hover": { bgcolor: "background.paper" },
                cursor: "pointer",
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: company.color,
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {company.logo}
              </Avatar>
              <Typography variant="body2" fontWeight={600}>
                {company.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <NavbarWrapper $scrolled={trigger}>
      {/* Top Bar */}
      {/* <TopBar>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TopBarChip
                icon={<LocalFireDepartment sx={{ fontSize: 16 }} />}
                label="Active Jobs"
                size="small"
              />
              <TopBarChip
                icon={<Business sx={{ fontSize: 16 }} />}
                label="Top Companies"
                size="small"
                sx={{ display: { xs: "none", sm: "flex" } }}
              />
              <TopBarChip
                icon={<EmojiEvents sx={{ fontSize: 16 }} />}
                label="Unicorns Hiring"
                size="small"
                sx={{ display: { xs: "none", md: "flex" } }}
              />
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": { color: "#fff" },
                }}
              >
                📱 Download App
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
              />
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
      </TopBar> */}

      {/* Main Navigation */}
      <MainNav>
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", alignItems: "center", py: 1, gap: 2.5 }}>
            {/* Logo */}
            <Link href="/">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                  }}
                >
                  <Work sx={{ color: "#fff", fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "text.primary",
                      lineHeight: 1.1,
                      fontSize: "1rem",
                      background:
                        "linear-gradient(135deg, #4a3f9f 0%, #6366f1 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    FinAutoJobs
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6366f1", fontWeight: 500, fontSize: "9px" }}
                  >
                    Find Your Dream Job
                  </Typography>
                </Box>
              </Box>
            </Link>

            {/* Search Bar */}
            <Box
              ref={searchRef}
              sx={{
                position: "relative",
                display: { xs: "none", md: "flex" },
                flex: 1,
                maxWidth: 640,
                ml: 2,
              }}
            >
              <SearchWrapper
                component="form"
                onSubmit={handleSearch}
                $focused={searchFocused}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                  }}
                >
                  <Search
                    sx={{
                      color: searchFocused ? "primary.main" : "text.secondary",
                      fontSize: 20,
                      transition: "color 0.2s",
                    }}
                  />
                </Box>
                <SearchInput
                  placeholder="Skills, Designations, Companies"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setSearchFocused(false)}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                  }}
                >
                  <LocationOn sx={{ color: "text.secondary", fontSize: 18 }} />
                </Box>
                <SearchInput
                  placeholder="Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  sx={{ maxWidth: 140 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    m: 0.5,
                    px: 2.5,
                    py: 0.5,
                    borderRadius: "6px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "13px",
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

              {/* Search Suggestions */}
              <Collapse in={showSuggestions}>
                <SearchSuggestionsBox>
                  {recentSearches.length > 0 && (
                    <Box sx={{ p: 2, borderBottom: "1px solid #f3f4f6" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: "#6b7280",
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Recent Searches
                        </Typography>
                        <Button
                          size="small"
                          sx={{
                            fontSize: "11px",
                            textTransform: "none",
                            color: "#6366f1",
                          }}
                          onClick={() => setRecentSearches([])}
                        >
                          Clear All
                        </Button>
                      </Box>
                      {recentSearches.map((term, i) => (
                        <Box
                          key={i}
                          onClick={() => {
                            setSearchQuery(term);
                            setShowSuggestions(false);
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1,
                            borderRadius: "6px",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#f9fafb" },
                          }}
                        >
                          <History sx={{ fontSize: 18, color: "#9ca3af" }} />
                          <Typography variant="body2">{term}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "#6b7280",
                        mb: 1.5,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      🔥 Trending Now
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {trendingSearches.map((term, i) => (
                        <Chip
                          key={i}
                          label={term}
                          size="small"
                          onClick={() => {
                            setSearchQuery(term);
                            setShowSuggestions(false);
                          }}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "rgba(99,102,241,0.1)",
                              borderColor: "#6366f1",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </SearchSuggestionsBox>
              </Collapse>
            </Box>

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
                  $active={location.startsWith("/jobs")}
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
                  <MegaMenuDropdown
                    sx={{
                      opacity: activeDropdown === "jobs" ? 1 : 0,
                      visibility:
                        activeDropdown === "jobs" ? "visible" : "hidden",
                      transform: `translateX(-50%) ${
                        activeDropdown === "jobs"
                          ? "translateY(0)"
                          : "translateY(10px)"
                      }`,
                    }}
                  >
                    {renderJobsMenu()}
                  </MegaMenuDropdown>
                </Fade>
              </Box>

              {/* Companies Dropdown */}
              <Box
                sx={{ position: "relative" }}
                onMouseEnter={() => setActiveDropdown("companies")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <NavLink
                  $active={location.startsWith("/companies")}
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
                  <MegaMenuDropdown
                    sx={{
                      opacity: activeDropdown === "companies" ? 1 : 0,
                      visibility:
                        activeDropdown === "companies" ? "visible" : "hidden",
                      transform: `translateX(-50%) ${
                        activeDropdown === "companies"
                          ? "translateY(0)"
                          : "translateY(10px)"
                      }`,
                    }}
                  >
                    {renderCompaniesMenu()}
                  </MegaMenuDropdown>
                </Fade>
              </Box>

              {/* Salary Insights Link - Hidden */}
              {/* <Link href="/salary-insights">
                <NavLink $active={location.startsWith("/salary-insights")}>
                  Salary Insights
                </NavLink>
              </Link> */}

              {/* Skills Assessment Link - Hidden */}
              {/* <Link href="/skills-assessment">
                <NavLink $active={location.startsWith("/skills-assessment")}>
                  Skills Assessment
                </NavLink>
              </Link> */}
            </Box>

            {/* Auth Buttons */}
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
                  <Tooltip title="Notifications">
                    <IconButton>
                      <NotificationBadge badgeContent={5} max={99}>
                        <Notifications sx={{ color: "text.secondary" }} />
                      </NotificationBadge>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Saved Jobs">
                    <IconButton sx={{ display: { xs: "none", md: "flex" } }}>
                      <Bookmark sx={{ color: "text.secondary" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Messages">
                    <IconButton sx={{ display: { xs: "none", md: "flex" } }}>
                      <Badge badgeContent={2} color="primary">
                        <Chat sx={{ color: "text.secondary" }} />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  <Box
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      p: 0.75,
                      borderRadius: "6px",
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: "rgba(99, 102, 241, 0.08)" },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        fontSize: "14px",
                        fontWeight: 600,
                        boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                      }}
                    >
                      {user.name?.charAt(0) || user.firstName?.charAt(0) || "U"}
                    </Avatar>
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: "text.primary",
                          lineHeight: 1.2,
                          fontSize: "13px",
                        }}
                      >
                        {user.name ||
                          `${user.firstName} ${user.lastName}` ||
                          "User"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontSize: "11px" }}
                      >
                        {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                      </Typography>
                    </Box>
                    <KeyboardArrowDown
                      sx={{ color: "text.secondary", fontSize: 16 }}
                    />
                  </Box>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        borderRadius: "6px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        minWidth: 240,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom: 1,
                        borderColor: "divider",
                        background: (theme) =>
                          theme.palette.mode === "dark"
                            ? theme.palette.background.default
                            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700}>
                        {user.name || `${user.firstName} ${user.lastName}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Box sx={{ mt: 1.5 }}>
                        <Chip
                          size="small"
                          label={
                            user.role === "recruiter"
                              ? "Recruiter"
                              : "Job Seeker"
                          }
                          sx={{
                            fontSize: "10px",
                            bgcolor: "#6366f1",
                            color: "#fff",
                          }}
                        />
                      </Box>
                    </Box>
                    <MenuItem
                      component={Link}
                      href={
                        user.role === "recruiter"
                          ? "/recruiter-dashboard"
                          : "/applicant-dashboard"
                      }
                      onClick={() => setAnchorEl(null)}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        <Dashboard fontSize="small" sx={{ color: "#6366f1" }} />
                      </ListItemIcon>
                      <ListItemText primary="Dashboard" />
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/profile"
                      onClick={() => setAnchorEl(null)}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        <Person fontSize="small" sx={{ color: "#6366f1" }} />
                      </ListItemIcon>
                      <ListItemText primary="My Profile" />
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/applications"
                      onClick={() => setAnchorEl(null)}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        <Description
                          fontSize="small"
                          sx={{ color: "#6366f1" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Applications" />
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href="/settings"
                      onClick={() => setAnchorEl(null)}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        <Settings fontSize="small" sx={{ color: "#6366f1" }} />
                      </ListItemIcon>
                      <ListItemText primary="Settings" />
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        logout();
                      }}
                      sx={{ color: "error.main", py: 1.5 }}
                    >
                      <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: "error.main" }} />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
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
                      fontSize: "13px",
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      px: 2.5,
                      py: 0.75,
                      borderRadius: "6px",
                      "&:hover": {
                        borderColor: "#4f46e5",
                        bgcolor: "rgba(99, 102, 241, 0.08)",
                      },
                    }}
                    startIcon={<Login sx={{ fontSize: 18 }} />}
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
                      fontSize: "13px",
                      px: 2.5,
                      py: 0.75,
                      borderRadius: "6px",
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 20px rgba(99, 102, 241, 0.5)",
                      },
                    }}
                    startIcon={<PersonAdd sx={{ fontSize: 18 }} />}
                  >
                    Register
                  </Button>
                </>
              )}
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
            maxWidth: 380,
            borderRadius: "12px 0 0 12px",
            boxShadow: "-10px 0 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header with Gradient */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              p: 3,
              pb: 4,
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
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                opacity: 0.3,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <Work sx={{ color: "#fff", fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ color: "#fff", lineHeight: 1.2 }}
                  >
                    FinAutoJobs
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    Find Your Dream Job
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => setMobileOpen(false)}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Enhanced Search Box */}
          <Box sx={{ px: 3, mt: -2.5, mb: 3, position: "relative", zIndex: 2 }}>
            <SearchWrapper
              component="form"
              onSubmit={handleSearch}
              sx={{
                boxShadow: "0 4px 20px rgba(99,102,241,0.15)",
                border: "2px solid transparent",
                "&:hover": {
                  boxShadow: "0 6px 24px rgba(99,102,241,0.2)",
                  borderColor: "rgba(99,102,241,0.2)",
                },
              }}
            >
              <Search
                sx={{
                  ml: 2,
                  color: "#6366f1",
                  fontSize: 22,
                }}
              />
              <SearchInput
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  fontSize: "15px",
                  "& input::placeholder": {
                    fontWeight: 500,
                  },
                }}
              />
            </SearchWrapper>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ px: 2, flex: 1, overflowY: "auto" }}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 1,
                display: "block",
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "0.5px",
              }}
            >
              Main Menu
            </Typography>
            <List sx={{ pt: 0 }}>
              <ListItem
                component={Link}
                href="/jobs"
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: "8px",
                  mb: 0.5,
                  py: 1.5,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(99,102,241,0.08)",
                    transform: "translateX(4px)",
                    "& .MuiListItemIcon-root": {
                      color: "#6366f1",
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, transition: "all 0.2s" }}>
                  <Work sx={{ color: "#6366f1", fontSize: 22 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Jobs"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: "15px" }}
                />
              </ListItem>
              <ListItem
                component={Link}
                href="/companies"
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: "8px",
                  mb: 0.5,
                  py: 1.5,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(99,102,241,0.08)",
                    transform: "translateX(4px)",
                    "& .MuiListItemIcon-root": {
                      color: "#6366f1",
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, transition: "all 0.2s" }}>
                  <Business sx={{ color: "#6366f1", fontSize: 22 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Companies"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: "15px" }}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {user ? (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 1,
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                  }}
                >
                  My Account
                </Typography>
                <List sx={{ pt: 0 }}>
                  <ListItem
                    component={Link}
                    href={
                      user.role === "recruiter"
                        ? "/recruiter-dashboard"
                        : "/applicant-dashboard"
                    }
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      py: 1.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "rgba(99,102,241,0.08)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Dashboard sx={{ color: "#6366f1", fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dashboard"
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "15px",
                      }}
                    />
                  </ListItem>
                  <ListItem
                    component={Link}
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      py: 1.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "rgba(99,102,241,0.08)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Person sx={{ color: "#6366f1", fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Profile"
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "15px",
                      }}
                    />
                  </ListItem>
                  <ListItem
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    sx={{
                      borderRadius: "8px",
                      py: 1.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "rgba(239,68,68,0.08)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Logout sx={{ color: "error.main", fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "15px",
                        color: "error.main",
                      }}
                    />
                  </ListItem>
                </List>
              </>
            ) : null}
          </Box>
          {/* Auth Buttons (when not logged in) */}
          {!user && (
            <Box
              sx={{
                p: 3,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? theme.palette.background.paper
                    : "#fafafa",
              }}
            >
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                fullWidth
                startIcon={<Login />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "#6366f1",
                  color: "#6366f1",
                  py: 1.75,
                  borderRadius: "8px",
                  fontSize: "15px",
                  borderWidth: "2px",
                  mb: 1.5,
                  "&:hover": {
                    borderWidth: "2px",
                    borderColor: "#4f46e5",
                    bgcolor: "rgba(99,102,241,0.08)",
                  },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                fullWidth
                startIcon={<PersonAdd />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.75,
                  borderRadius: "8px",
                  fontSize: "15px",
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.5)",
                    transform: "translateY(-1px)",
                  },
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
