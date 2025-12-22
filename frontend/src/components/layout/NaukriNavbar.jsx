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
const NavbarWrapper = styled(Box)(({ scrolled }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1100,
  backgroundColor: "#fff",
  boxShadow: scrolled
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

const MainNav = styled(Box)(() => ({
  backgroundColor: "#fff",
  borderBottom: "1px solid #e8e8e8",
}));

const SearchWrapper = styled(Paper)(({ focused }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: "12px",
  border: focused ? `2px solid ${colors.primary}` : "1px solid #e0e0e0",
  boxShadow: focused ? `0 4px 20px ${colors.primary}33` : "none",
  transition: "all 0.3s ease",
  backgroundColor: focused ? "#fafafe" : "#fff",
  "&:hover": {
    borderColor: colors.primary,
    boxShadow: `0 2px 12px ${colors.primary}26`,
  },
}));

const SearchInput = styled(InputBase)(() => ({
  flex: 1,
  padding: "10px 14px",
  fontSize: "14px",
  "& input::placeholder": {
    color: "#9ca3af",
    opacity: 1,
  },
}));

const SearchSuggestionsBox = styled(Paper)(() => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "8px",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  overflow: "hidden",
  zIndex: 1300,
  maxHeight: "400px",
  overflowY: "auto",
}));

const NavLink = styled(Button)(({ active }) => ({
  textTransform: "none",
  fontWeight: active ? 600 : 500,
  fontSize: "14px",
  color: active ? colors.primary : colors.neutralText,
  padding: "10px 18px",
  borderRadius: "8px",
  position: "relative",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: `rgba(79,70,229,0.08)`,
    color: colors.primaryDark,
    transform: "translateY(-1px)",
  },
  "&::after": active
    ? {
        content: '""',
        position: "absolute",
        bottom: "-14px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "3px",
        backgroundColor: colors.primary,
        borderRadius: "2px 2px 0 0",
      }
    : {},
}));

const MegaMenuDropdown = styled(Box)(() => ({
  position: "absolute",
  top: "calc(100% + 10px)",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#fff",
  borderRadius: "16px",
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
    backgroundColor: "#fff",
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
  borderRadius: "10px",
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
        count: "50,000+",
        link: "/jobs?category=it",
        hot: true,
      },
      {
        icon: <TrendingUp />,
        title: "Sales Jobs",
        count: "25,000+",
        link: "/jobs?category=sales",
      },
      {
        icon: <Business />,
        title: "Marketing Jobs",
        count: "15,000+",
        link: "/jobs?category=marketing",
      },
      {
        icon: <School />,
        title: "Data Science Jobs",
        count: "10,000+",
        link: "/jobs?category=data-science",
        hot: true,
      },
    ],
    inDemand: [
      {
        icon: <Star />,
        title: "Fresher Jobs",
        count: "30,000+",
        link: "/jobs?category=fresher",
      },
      {
        icon: <HomeWork />,
        title: "Remote Jobs",
        count: "20,000+",
        link: "/jobs?category=remote",
        new: true,
      },
      {
        icon: <LocalFireDepartment />,
        title: "Walk-in Jobs",
        count: "5,000+",
        link: "/jobs?category=walkin",
      },
      {
        icon: <FlashOn />,
        title: "Part-time Jobs",
        count: "8,000+",
        link: "/jobs?category=part-time",
      },
    ],
    byLocation: [
      {
        title: "Bangalore",
        count: "45,000+",
        link: "/jobs?location=bangalore",
      },
      { title: "Mumbai", count: "38,000+", link: "/jobs?location=mumbai" },
      { title: "Delhi NCR", count: "42,000+", link: "/jobs?location=delhi" },
      {
        title: "Hyderabad",
        count: "28,000+",
        link: "/jobs?location=hyderabad",
      },
    ],
  };

  const companiesMenuItems = {
    byType: [
      {
        icon: <Verified />,
        title: "MNCs",
        count: "2,100+",
        link: "/companies?type=mnc",
        badge: "Popular",
      },
      {
        icon: <TrendingUp />,
        title: "Startups",
        count: "755",
        link: "/companies?type=startup",
      },
      {
        icon: <EmojiEvents />,
        title: "Unicorns",
        count: "91",
        link: "/companies?type=unicorn",
        badge: "Hot",
      },
      {
        icon: <Business />,
        title: "Product Companies",
        count: "1,200+",
        link: "/companies?type=product",
      },
    ],
    byIndustry: [
      { title: "IT Services", count: "2,432", link: "/companies?industry=it" },
      {
        title: "Banking & Finance",
        count: "416",
        link: "/companies?industry=finance",
      },
      {
        title: "E-commerce",
        count: "234",
        link: "/companies?industry=ecommerce",
      },
      {
        title: "Healthcare",
        count: "658",
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
            color: "#6b7280",
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
                sx={{ color: "#6b7280", transition: "all 0.2s" }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    className="menu-title"
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "#1f2937", transition: "color 0.2s" }}
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
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {item.count} jobs
                </Typography>
              </Box>
              <ArrowForward
                className="arrow-icon"
                sx={{
                  fontSize: 16,
                  color: "#d1d5db",
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
            color: "#6b7280",
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
                sx={{ color: "#6b7280", transition: "all 0.2s" }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    className="menu-title"
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "#1f2937", transition: "color 0.2s" }}
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
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {item.count} jobs
                </Typography>
              </Box>
            </MenuItemStyled>
          </Link>
        ))}
      </Box>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#6b7280",
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
                sx={{ color: "#6b7280", fontSize: 20 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  className="menu-title"
                  variant="body2"
                  fontWeight={600}
                >
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {item.count} jobs
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
              borderRadius: "10px",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
          >
            View All Jobs →
          </Button>
        </Link>
      </Box>
      <Box sx={{ bgcolor: "#f9fafb", p: 2, borderRadius: "12px" }}>
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
            color: "#6b7280",
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
                sx={{ color: "#6b7280", transition: "all 0.2s" }}
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
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {item.count} companies
                </Typography>
              </Box>
            </MenuItemStyled>
          </Link>
        ))}
      </Box>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#6b7280",
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
                sx={{ color: "#6b7280", fontSize: 20 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  className="menu-title"
                  variant="body2"
                  fontWeight={600}
                >
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {item.count} companies
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
              borderRadius: "10px",
            }}
          >
            View All Companies →
          </Button>
        </Link>
      </Box>
      <Box sx={{ bgcolor: "#f9fafb", p: 2, borderRadius: "12px" }}>
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
                borderRadius: "8px",
                "&:hover": { bgcolor: "#fff" },
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
    <NavbarWrapper scrolled={trigger}>
      {/* Top Bar */}
      <TopBar>
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
                label="2M+ Active Jobs"
                size="small"
              />
              <TopBarChip
                icon={<Business sx={{ fontSize: 16 }} />}
                label="50K+ Companies"
                size="small"
                sx={{ display: { xs: "none", sm: "flex" } }}
              />
              <TopBarChip
                icon={<EmojiEvents sx={{ fontSize: 16 }} />}
                label="91 Unicorns Hiring"
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
                  gap: 1.5,
                  cursor: "pointer",
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                  }}
                >
                  <Work sx={{ color: "#fff", fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#1f2937",
                      lineHeight: 1.1,
                      fontSize: "1.15rem",
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
                    sx={{ color: "#6366f1", fontWeight: 500, fontSize: "10px" }}
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
                focused={searchFocused}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    borderRight: "1px solid #e5e7eb",
                  }}
                >
                  <Search
                    sx={{
                      color: searchFocused ? "#6366f1" : "#9ca3af",
                      fontSize: 22,
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
                    borderLeft: "1px solid #e5e7eb",
                  }}
                >
                  <LocationOn sx={{ color: "#9ca3af", fontSize: 20 }} />
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
                    px: 3,
                    borderRadius: "8px",
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

              {/* Salary Insights Link */}
              <Link href="/salary-insights">
                <NavLink active={location.startsWith("/salary-insights")}>
                  Salary Insights
                </NavLink>
              </Link>

              {/* Skills Assessment Link */}
              <Link href="/skills-assessment">
                <NavLink active={location.startsWith("/skills-assessment")}>
                  Skills Assessment
                </NavLink>
              </Link>
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
                        <Notifications sx={{ color: "#6b7280" }} />
                      </NotificationBadge>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Saved Jobs">
                    <IconButton sx={{ display: { xs: "none", md: "flex" } }}>
                      <Bookmark sx={{ color: "#6b7280" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Messages">
                    <IconButton sx={{ display: { xs: "none", md: "flex" } }}>
                      <Badge badgeContent={2} color="primary">
                        <Chat sx={{ color: "#6b7280" }} />
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
                      p: 1,
                      borderRadius: "10px",
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: "rgba(99, 102, 241, 0.08)" },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        fontSize: "15px",
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
                        borderRadius: "14px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        minWidth: 240,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom: "1px solid #f3f4f6",
                        background:
                          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
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
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      px: 3,
                      borderRadius: "10px",
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
                      borderRadius: "10px",
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
                    startIcon={<PersonAdd />}
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
          sx: { width: "90%", maxWidth: 380, borderRadius: "20px 0 0 20px" },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                }}
              >
                <Work sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                FinAutoJobs
              </Typography>
            </Box>
            <IconButton
              onClick={() => setMobileOpen(false)}
              sx={{ bgcolor: "#f3f4f6" }}
            >
              <Close />
            </IconButton>
          </Box>

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
              sx={{
                borderRadius: "10px",
                mb: 1,
                "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
              }}
            >
              <ListItemIcon>
                <Work sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText
                primary="Jobs"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
            <ListItem
              component={Link}
              href="/companies"
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: "10px",
                mb: 1,
                "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
              }}
            >
              <ListItemIcon>
                <Business sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText
                primary="Companies"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
            <ListItem
              component={Link}
              href="/salary-insights"
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: "10px",
                mb: 1,
                "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
              }}
            >
              <ListItemIcon>
                <TrendingUp sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText
                primary="Salary Insights"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
            <ListItem
              component={Link}
              href="/skills-assessment"
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: "10px",
                mb: 1,
                "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
              }}
            >
              <ListItemIcon>
                <School sx={{ color: "#6366f1" }} />
              </ListItemIcon>
              <ListItemText
                primary="Skills Assessment"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
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
                sx={{ borderRadius: "10px", mb: 1 }}
              >
                <ListItemIcon>
                  <Dashboard sx={{ color: "#6366f1" }} />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem
                component={Link}
                href="/profile"
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: "10px", mb: 1 }}
              >
                <ListItemIcon>
                  <Person sx={{ color: "#6366f1" }} />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                sx={{ borderRadius: "10px", color: "error.main" }}
              >
                <ListItemIcon>
                  <Logout sx={{ color: "error.main" }} />
                </ListItemIcon>
                <ListItemText primary="Logout" />
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
                  py: 1.5,
                  borderRadius: "10px",
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
                  py: 1.5,
                  borderRadius: "10px",
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
