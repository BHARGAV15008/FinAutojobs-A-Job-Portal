import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
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
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Collapse,
  Pagination,
  LinearProgress,
  Skeleton,
  Drawer,
  useTheme,
  useMediaQuery,
  Divider,
  TextField,
  InputAdornment,
  Rating,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Business,
  LocationOn,
  Bookmark,
  BookmarkBorder,
  FilterList,
  Close,
  TrendingUp,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ViewList,
  ViewModule,
  Search,
  Clear,
  Star,
  Verified,
  People,
  Work,
  ArrowForward,
  EmojiEvents,
  LocalFireDepartment,
  CheckCircle,
  Language,
  AccessTime,
  AttachMoney,
  School,
  Apartment,
  Lightbulb,
  Handshake,
  Pool,
  FitnessCenter,
  Restaurant,
  LocalHospital,
  DirectionsCar,
  Laptop,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import API_BASE_URL from "../services/apiConfig";
import colors, { fonts, fontSizes } from "../styles/uiColors";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

// Styled Components
const PageHeader = styled(Box)(() => ({
  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
  padding: "48px 0 80px",
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
    pointerEvents: "none",
  },
}));

const FilterCard = styled(Card)(() => ({
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  position: "sticky",
  top: 100,
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#e5e7eb", borderRadius: 3 },
}));

const FilterSection = styled(Box)(() => ({
  padding: "16px 20px",
  borderBottom: "1px solid #f3f4f6",
}));

const CompanyCard = styled(Card)(() => ({
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid transparent",
  cursor: "pointer",
  overflow: "visible",
  animation: `${fadeIn} 0.5s ease`,
  position: "relative",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 50px rgba(99, 102, 241, 0.15)",
    borderColor: colors.primary,
    "& .company-logo": { transform: "scale(1.1)" },
  },
}));

const FeaturedCompanyCard = styled(Card)(() => ({
  borderRadius: "24px",
  background: "linear-gradient(135deg, #fff 0%, #fafafe 100%)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  overflow: "hidden",
  transition: "all 0.3s ease",
  animation: `${float} 4s ease-in-out infinite`,
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 20px 60px rgba(99, 102, 241, 0.2)",
  },
}));

const StatBox = styled(Box)(() => ({
  textAlign: "center",
  padding: "16px",
  borderRadius: "12px",
  background: "rgba(99, 102, 241, 0.08)",
  transition: "all 0.2s",
  "&:hover": {
    background: "rgba(99, 102, 241, 0.15)",
  },
}));

const BenefitChip = styled(Chip)(() => ({
  borderRadius: "10px",
  fontWeight: 500,
  fontSize: "12px",
  "& .MuiChip-icon": { fontSize: 16 },
}));

const QuickFilterChip = styled(Chip)(({ selected }) => ({
  fontWeight: 500,
  borderRadius: "10px",
  transition: "all 0.2s",
  cursor: "pointer",
  backgroundColor: selected ? colors.primary : "#f3f4f6",
  color: selected ? "#fff" : "#374151",
  "&:hover": {
    backgroundColor: selected ? colors.primaryDark : "#e5e7eb",
    transform: "translateY(-2px)",
  },
}));

const CompaniesPageNaukri = () => {
  const [location] = useLocation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [activeTab, setActiveTab] = useState(0);
  const [searchInFilter, setSearchInFilter] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Filters State
  const [filters, setFilters] = useState({
    companyType: [],
    industry: [],
    location: [],
    companySize: [],
    rating: 0,
  });

  const [expandedSections, setExpandedSections] = useState({
    companyType: true,
    industry: true,
    location: true,
    companySize: true,
    rating: false,
  });

  useEffect(() => {
    fetchCompanies();
  }, [page, filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Mock data since there's no companies endpoint
      setCompanies(mockCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveCompany = (e, companyId) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[filterType])) {
        const newArray = prev[filterType].includes(value)
          ? prev[filterType].filter((v) => v !== value)
          : [...prev[filterType], value];
        return { ...prev, [filterType]: newArray };
      }
      return { ...prev, [filterType]: value };
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      companyType: [],
      industry: [],
      location: [],
      companySize: [],
      rating: 0,
    });
    setPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count += value.length;
      else if (key === "rating" && value > 0) count += 1;
    });
    return count;
  }, [filters]);

  // Filter Options
  const companyTypeOptions = [
    { label: "MNCs", count: "2,100+", icon: <Verified /> },
    { label: "Startups", count: "755", icon: <Lightbulb /> },
    { label: "Unicorns", count: "91", icon: <EmojiEvents /> },
    { label: "Product Companies", count: "1,200+", icon: <Laptop /> },
    { label: "Service Based", count: "3,400+", icon: <Handshake /> },
  ];

  const industryOptions = [
    { label: "IT Services & Consulting", count: "2,432" },
    { label: "Software Product", count: "1,856" },
    { label: "Banking & Financial Services", count: "416" },
    { label: "Internet & E-commerce", count: "234" },
    { label: "Healthcare & Pharmaceuticals", count: "658" },
    { label: "Manufacturing", count: "892" },
    { label: "Retail", count: "345" },
    { label: "Education & Training", count: "287" },
  ];

  const locationOptions = [
    "Bangalore",
    "Mumbai",
    "Delhi NCR",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Remote",
  ];
  const companySizeOptions = [
    "1-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5000+",
  ];

  const quickFilters = [
    { label: "MNCs", icon: <Verified sx={{ fontSize: 16 }} />, value: "mnc" },
    {
      label: "Unicorns",
      icon: <EmojiEvents sx={{ fontSize: 16 }} />,
      value: "unicorn",
    },
    {
      label: "Startups",
      icon: <Lightbulb sx={{ fontSize: 16 }} />,
      value: "startup",
    },
    {
      label: "Actively Hiring",
      icon: <LocalFireDepartment sx={{ fontSize: 16 }} />,
      value: "hiring",
    },
  ];

  const tabOptions = [
    { label: "All Companies", count: "6,500+" },
    { label: "Top Rated", count: "1,200+" },
    { label: "Trending", count: "350+" },
    { label: "Newly Listed", count: "180+" },
  ];

  // Featured Companies
  const featuredCompanies = [
    {
      id: "f1",
      name: "Google",
      logo: "G",
      color: "#4285f4",
      tagline: "Organizing the world's information",
      rating: 4.5,
      reviews: "12.5K",
      openings: 234,
      industry: "Internet",
      size: "150,000+",
      founded: 1998,
    },
    {
      id: "f2",
      name: "Microsoft",
      logo: "M",
      color: "#00a4ef",
      tagline: "Empower every person and organization",
      rating: 4.4,
      reviews: "15.8K",
      openings: 345,
      industry: "Software",
      size: "180,000+",
      founded: 1975,
    },
    {
      id: "f3",
      name: "Amazon",
      logo: "A",
      color: "#ff9900",
      tagline: "Work hard. Have fun. Make history",
      rating: 4.2,
      reviews: "18.2K",
      openings: 567,
      industry: "E-commerce",
      size: "1,500,000+",
      founded: 1994,
    },
  ];

  // Mock Companies Data
  const mockCompanies = [
    {
      id: 1,
      name: "Infosys",
      logo: "I",
      color: "#0066b3",
      rating: 4.0,
      reviews: "45.2K",
      openings: 1234,
      industry: "IT Services",
      size: "300,000+",
      location: "Bangalore",
      type: "MNC",
      isHiring: true,
    },
    {
      id: 2,
      name: "TCS",
      logo: "T",
      color: "#0033a0",
      rating: 3.9,
      reviews: "52.1K",
      openings: 2345,
      industry: "IT Services",
      size: "550,000+",
      location: "Mumbai",
      type: "MNC",
      isHiring: true,
    },
    {
      id: 3,
      name: "Wipro",
      logo: "W",
      color: "#5e1ea8",
      rating: 3.8,
      reviews: "38.5K",
      openings: 987,
      industry: "IT Services",
      size: "240,000+",
      location: "Bangalore",
      type: "MNC",
      isHiring: true,
    },
    {
      id: 4,
      name: "Accenture",
      logo: "A",
      color: "#a100ff",
      rating: 4.1,
      reviews: "28.9K",
      openings: 1567,
      industry: "Consulting",
      size: "700,000+",
      location: "Mumbai",
      type: "MNC",
      isHiring: true,
    },
    {
      id: 5,
      name: "Flipkart",
      logo: "F",
      color: "#f7d716",
      rating: 4.2,
      reviews: "8.5K",
      openings: 345,
      industry: "E-commerce",
      size: "35,000+",
      location: "Bangalore",
      type: "Unicorn",
      isHiring: true,
    },
    {
      id: 6,
      name: "Swiggy",
      logo: "S",
      color: "#fc8019",
      rating: 4.0,
      reviews: "4.2K",
      openings: 234,
      industry: "Food Tech",
      size: "5,000+",
      location: "Bangalore",
      type: "Unicorn",
      isHiring: true,
    },
    {
      id: 7,
      name: "Razorpay",
      logo: "R",
      color: "#0066ff",
      rating: 4.3,
      reviews: "2.1K",
      openings: 156,
      industry: "Fintech",
      size: "3,000+",
      location: "Bangalore",
      type: "Unicorn",
      isHiring: true,
    },
    {
      id: 8,
      name: "CRED",
      logo: "C",
      color: "#000",
      rating: 4.4,
      reviews: "1.8K",
      openings: 89,
      industry: "Fintech",
      size: "1,500+",
      location: "Bangalore",
      type: "Startup",
      isHiring: true,
    },
    {
      id: 9,
      name: "Zomato",
      logo: "Z",
      color: "#e23744",
      rating: 4.0,
      reviews: "5.6K",
      openings: 278,
      industry: "Food Tech",
      size: "6,000+",
      location: "Gurugram",
      type: "Unicorn",
      isHiring: true,
    },
    {
      id: 10,
      name: "PhonePe",
      logo: "P",
      color: "#5f259f",
      rating: 4.1,
      reviews: "3.4K",
      openings: 189,
      industry: "Fintech",
      size: "4,000+",
      location: "Bangalore",
      type: "Unicorn",
      isHiring: true,
    },
    {
      id: 11,
      name: "Zerodha",
      logo: "Z",
      color: "#387ed1",
      rating: 4.5,
      reviews: "1.2K",
      openings: 45,
      industry: "Fintech",
      size: "1,200+",
      location: "Bangalore",
      type: "Startup",
      isHiring: false,
    },
    {
      id: 12,
      name: "Meesho",
      logo: "M",
      color: "#f43397",
      rating: 4.2,
      reviews: "2.8K",
      openings: 123,
      industry: "E-commerce",
      size: "2,500+",
      location: "Bangalore",
      type: "Unicorn",
      isHiring: true,
    },
  ];

  const benefits = [
    { icon: <Pool />, label: "Gym & Pool" },
    { icon: <Restaurant />, label: "Free Meals" },
    { icon: <LocalHospital />, label: "Health Insurance" },
    { icon: <DirectionsCar />, label: "Transport" },
    { icon: <Laptop />, label: "Work From Home" },
    { icon: <School />, label: "Learning" },
  ];

  const renderFilters = () => (
    <Box>
      {/* Filter Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Filters
        </Typography>
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            onClick={clearAllFilters}
            sx={{ textTransform: "none", color: "#ef4444", fontWeight: 600 }}
          >
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </Box>

      {/* Search within filters */}
      <Box sx={{ p: 2, borderBottom: "1px solid #f3f4f6" }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search companies..."
          value={searchInFilter}
          onChange={(e) => setSearchInFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: "#9ca3af" }} />
              </InputAdornment>
            ),
            endAdornment: searchInFilter && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchInFilter("")}>
                  <Clear sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: "10px", fontSize: "14px" },
          }}
        />
      </Box>

      {/* Company Type Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("companyType")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.companyType ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Company Type
          </Typography>
          {expandedSections.companyType ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.companyType}>
          <FormGroup>
            {companyTypeOptions.map((type) => (
              <FormControlLabel
                key={type.label}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.companyType.includes(type.label)}
                    onChange={() =>
                      handleFilterChange("companyType", type.label)
                    }
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography variant="body2">{type.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.count}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 0.5, width: "100%" }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Industry Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("industry")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.industry ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Industry
          </Typography>
          {expandedSections.industry ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.industry}>
          <FormGroup>
            {industryOptions.map((ind) => (
              <FormControlLabel
                key={ind.label}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.industry.includes(ind.label)}
                    onChange={() => handleFilterChange("industry", ind.label)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      {ind.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ind.count}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 0.5, width: "100%" }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Location Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("location")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.location ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Location
          </Typography>
          {expandedSections.location ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.location}>
          <FormGroup>
            {locationOptions.map((loc) => (
              <FormControlLabel
                key={loc}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.location.includes(loc)}
                    onChange={() => handleFilterChange("location", loc)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{loc}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Company Size Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("companySize")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.companySize ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Company Size
          </Typography>
          {expandedSections.companySize ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.companySize}>
          <FormGroup>
            {companySizeOptions.map((size) => (
              <FormControlLabel
                key={size}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.companySize.includes(size)}
                    onChange={() => handleFilterChange("companySize", size)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">{size} employees</Typography>
                }
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("rating")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.rating ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Minimum Rating
          </Typography>
          {expandedSections.rating ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.rating}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Rating
              value={filters.rating}
              onChange={(e, newValue) => handleFilterChange("rating", newValue)}
              precision={0.5}
              size="large"
            />
            <Typography variant="body2" color="text.secondary">
              {filters.rating > 0 ? `${filters.rating}+` : "Any"}
            </Typography>
          </Box>
        </Collapse>
      </FilterSection>
    </Box>
  );

  const renderCompanyCard = (company) => (
    <Grid
      item
      xs={12}
      sm={6}
      lg={viewMode === "grid" ? 4 : 12}
      key={company.id}
    >
      <Link href={`/companies/${company.id}`}>
        <CompanyCard>
          {company.isHiring && (
            <Chip
              icon={
                <LocalFireDepartment
                  sx={{ fontSize: 14, color: "#fff !important" }}
                />
              }
              label="Actively Hiring"
              size="small"
              sx={{
                position: "absolute",
                top: -10,
                right: 16,
                bgcolor: "#22c55e",
                color: "#fff",
                fontWeight: 600,
                fontSize: "11px",
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
                  width: 64,
                  height: 64,
                  bgcolor: company.color,
                  fontSize: "24px",
                  fontWeight: 700,
                  transition: "transform 0.3s",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                }}
              >
                {company.logo}
              </Avatar>
              <IconButton
                onClick={(e) => toggleSaveCompany(e, company.id)}
                size="small"
              >
                {savedCompanies.includes(company.id) ? (
                  <Bookmark sx={{ color: colors.primary }} />
                ) : (
                  <BookmarkBorder sx={{ color: "#9ca3af" }} />
                )}
              </IconButton>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {company.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Rating
                value={company.rating}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                {company.rating} ({company.reviews} reviews)
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 1,
                color: "#6b7280",
              }}
            >
              <Business sx={{ fontSize: 16 }} />
              <Typography variant="body2">{company.industry}</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 2,
                color: "#6b7280",
              }}
            >
              <LocationOn sx={{ fontSize: 16 }} />
              <Typography variant="body2">{company.location}</Typography>
              <Typography variant="body2" sx={{ mx: 0.5 }}>
                •
              </Typography>
              <People sx={{ fontSize: 16 }} />
              <Typography variant="body2">{company.size}</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip
                label={company.type}
                size="small"
                sx={{
                  bgcolor: "#ede9fe",
                  color: colors.primary,
                  fontWeight: 600,
                  fontSize: "11px",
                }}
              />
              {company.type === "Unicorn" && (
                <Chip
                  icon={
                    <EmojiEvents
                      sx={{ fontSize: 14, color: "#f59e0b !important" }}
                    />
                  }
                  label="Unicorn"
                  size="small"
                  sx={{
                    bgcolor: "#fef3c7",
                    color: "#d97706",
                    fontWeight: 600,
                    fontSize: "11px",
                  }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: colors.primary }}
                >
                  {company.openings}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Open Positions
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowForward />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.secondary} 100%)`,
                  },
                }}
              >
                View Jobs
              </Button>
            </Box>
          </CardContent>
        </CompanyCard>
      </Link>
    </Grid>
  );

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <PageHeader>
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 4, md: 6 } }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#fff",
              mb: 1,
              fontFamily: fonts.heading,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Companies Hiring in India
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 3,
              fontFamily: fonts.body,
              fontSize: "1.1rem",
            }}
          >
            Discover{" "}
            {companies.length > 0 ? companies.length.toLocaleString() : "6,500"}
            + companies actively hiring
          </Typography>

          {/* Quick Filters */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {quickFilters.map((filter) => (
              <QuickFilterChip
                key={filter.value}
                icon={filter.icon}
                label={filter.label}
                selected={filters.companyType.includes(filter.label)}
                onClick={() => handleFilterChange("companyType", filter.label)}
              />
            ))}
          </Box>
        </Container>
      </PageHeader>

      {/* Featured Companies */}
      <Container
        maxWidth="lg"
        sx={{
          mt: -6,
          position: "relative",
          zIndex: 10,
          mb: 6,
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Grid container spacing={3}>
          {featuredCompanies.map((company, index) => (
            <Grid item xs={12} md={4} key={company.id}>
              <FeaturedCompanyCard sx={{ animationDelay: `${index * 0.2}s` }}>
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${company.color}15 0%, ${company.color}05 100%)`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: company.color,
                        fontSize: "28px",
                        fontWeight: 700,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      }}
                    >
                      {company.logo}
                    </Avatar>
                    <Chip
                      icon={<Verified sx={{ color: "#22c55e !important" }} />}
                      label="Verified"
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#16a34a",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {company.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", mb: 2, fontStyle: "italic" }}
                  >
                    "{company.tagline}"
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <StatBox>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: colors.primary }}
                        >
                          {company.rating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rating
                        </Typography>
                      </StatBox>
                    </Grid>
                    <Grid item xs={4}>
                      <StatBox>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: colors.primary }}
                        >
                          {company.openings}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Jobs
                        </Typography>
                      </StatBox>
                    </Grid>
                    <Grid item xs={4}>
                      <StatBox>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: colors.primary }}
                        >
                          {company.reviews}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reviews
                        </Typography>
                      </StatBox>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                  >
                    {benefits.slice(0, 4).map((benefit, i) => (
                      <BenefitChip
                        key={i}
                        icon={benefit.icon}
                        label={benefit.label}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Button
                    component={Link}
                    href={`/companies/${company.id}`}
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: "12px",
                      background: `linear-gradient(135deg, ${company.color} 0%, ${company.color}cc 100%)`,
                    }}
                  >
                    View All {company.openings} Jobs
                  </Button>
                </Box>
              </FeaturedCompanyCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
        <Grid container spacing={3}>
          {/* Filters - Desktop */}
          {!isMobile && (
            <Grid item md={3} lg={2.5}>
              <FilterCard>{renderFilters()}</FilterCard>
            </Grid>
          )}

          {/* Companies List */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* Tabs */}
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: "16px",
                mb: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    minHeight: 56,
                  },
                  "& .Mui-selected": { color: colors.primary },
                  "& .MuiTabs-indicator": {
                    bgcolor: colors.primary,
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                }}
              >
                {tabOptions.map((tab, index) => (
                  <Tab
                    key={index}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {tab.label}
                        <Chip
                          label={tab.count}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "10px",
                            bgcolor:
                              activeTab === index ? "#ede9fe" : "#f3f4f6",
                          }}
                        />
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Toolbar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={
                      <Badge badgeContent={activeFiltersCount} color="error">
                        <FilterList />
                      </Badge>
                    }
                    onClick={() => setMobileFiltersOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "10px",
                    }}
                  >
                    Filters
                  </Button>
                )}
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    defaultValue="popularity"
                    sx={{
                      borderRadius: "10px",
                      fontSize: "14px",
                      bgcolor: "#fff",
                    }}
                  >
                    <MenuItem value="popularity">Popularity</MenuItem>
                    <MenuItem value="rating">Highest Rated</MenuItem>
                    <MenuItem value="openings">Most Openings</MenuItem>
                    <MenuItem value="reviews">Most Reviewed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{ bgcolor: "#fff", borderRadius: "10px" }}
              >
                <ToggleButton value="grid" sx={{ px: 2 }}>
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list" sx={{ px: 2 }}>
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Companies Grid */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid item xs={12} sm={6} lg={4} key={i}>
                    <Card sx={{ p: 3, borderRadius: "20px" }}>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={64} height={64} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={28} />
                          <Skeleton variant="text" width="40%" height={20} />
                        </Box>
                      </Box>
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="80%" />
                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Skeleton variant="rounded" width={60} height={24} />
                        <Skeleton variant="rounded" width={80} height={24} />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <>
                <Grid container spacing={3}>
                  {(companies.length > 0 ? companies : mockCompanies).map(
                    (company) => renderCompanyCard(company)
                  )}
                </Grid>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontWeight: 600,
                        borderRadius: "10px",
                        "&.Mui-selected": {
                          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                        },
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          sx: { width: "85%", maxWidth: 360, borderRadius: "0 20px 20px 0" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Filters
          </Typography>
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        {renderFilters()}
        <Box sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setMobileFiltersOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default CompaniesPageNaukri;
