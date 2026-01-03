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
const PageHeader = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
  padding: "32px 0 48px",
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    padding: "24px 0 40px",
  },
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
  borderRadius: "6px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  position: "sticky",
  top: 100,
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#e5e7eb", borderRadius: 3 },
}));

const FilterSection = styled(Box)(({ theme }) => ({
  padding: "16px 20px",
  borderBottom: "1px solid #f3f4f6",
  [theme.breakpoints.down("sm")]: {
    padding: "12px 16px",
  },
}));

const CompanyCard = styled(Card)(({ theme }) => ({
  borderRadius: "6px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid transparent",
  cursor: "pointer",
  overflow: "visible",
  animation: `${fadeIn} 0.5s ease`,
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    "&:active": {
      transform: "scale(0.98)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
  },
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 50px rgba(99, 102, 241, 0.15)",
    borderColor: colors.primary,
    "& .company-logo": { transform: "scale(1.1)" },
  },
}));

const FeaturedCompanyCard = styled(Card)(() => ({
  borderRadius: "6px",
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
  borderRadius: "6px",
  background: "rgba(99, 102, 241, 0.08)",
  transition: "all 0.2s",
  "&:hover": {
    background: "rgba(99, 102, 241, 0.15)",
  },
}));

const BenefitChip = styled(Chip)(() => ({
  borderRadius: "6px",
  fontWeight: 500,
  fontSize: "12px",
  "& .MuiChip-icon": {
    fontSize: 16,
    marginLeft: "5px",
    paddingTop: "4px",
    paddingBottom: "4px",
  },
  paddingTop: "4px",
  paddingBottom: "4px",
  height: "auto",
}));

const QuickFilterChip = styled(Chip)(({ selected, theme }) => ({
  fontWeight: 500,
  borderRadius: "6px",
  transition: "all 0.2s",
  cursor: "pointer",
  backgroundColor: selected ? colors.primary : "#f3f4f6",
  color: selected ? "#fff" : "#374151",
  paddingTop: "4px",
  paddingBottom: "4px",
  height: "auto",
  whiteSpace: "nowrap",
  [theme.breakpoints.down("sm")]: {
    fontSize: "12px",
    height: "32px",
  },
  "& .MuiChip-icon": {
    fontSize: 16,
    marginLeft: "5px",
    paddingTop: "4px",
    paddingBottom: "4px",
  },
  "&:hover": {
    backgroundColor: selected ? colors.primaryDark : "#e5e7eb",
    transform: "translateY(-2px)",
  },
  "&:active": {
    [theme.breakpoints.down("sm")]: {
      transform: "scale(0.95)",
    },
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
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [companyStats, setCompanyStats] = useState({
    total: 0,
    byType: {},
    byIndustry: {},
    byLocation: {},
  });
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

      // Build query parameters
      const params = new URLSearchParams();
      params.append("verified", "true"); // Only show verified companies
      params.append("page", page);
      params.append("limit", "12");

      // Add filters
      if (filters.industry.length > 0) {
        params.append("industry", filters.industry[0]); // Backend accepts single industry
      }
      if (filters.location.length > 0) {
        params.append("location", filters.location[0]);
      }
      if (filters.companySize.length > 0) {
        params.append("size", filters.companySize[0]);
      }

      const response = await fetch(
        `${API_BASE_URL}/companies?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();

        console.log("📊 Companies API response:", data);

        // Extract companies array from response
        let companiesData = data.companies || [];

        // Transform companies to match frontend expectations
        const transformedCompanies = companiesData.map((company) => {
          // Extract location from headquarters
          const location =
            company.headquarters?.city ||
            company.headquarters?.country ||
            "Not specified";

          return {
            id: company._id || company.id,
            name: company.name,
            logo: company.logo || "/default-company-logo.png",
            coverImage: company.coverImage,
            description: company.description || "",
            tagline: company.tagline || "",
            industry: company.industry || "Technology",
            location: location,
            fullAddress: company.headquarters
              ? `${company.headquarters.city}, ${company.headquarters.state}, ${company.headquarters.country}`
              : "Location not specified",
            size: company.size || "1-10",
            companyType: company.companyType || "Private",
            rating: company.stats?.averageRating || 4.0 + Math.random(),
            reviews:
              company.stats?.totalReviews ||
              Math.floor(Math.random() * 500) + 50,
            openings: company.stats?.totalJobsPosted || 0,
            isVerified: company.verificationStatus?.isVerified || false,
            website: company.website,
            email: company.email,
            foundedYear: company.foundedYear,
            totalEmployees: company.stats?.totalEmployees || 0,
            technologies: company.technologies || [],
            benefits: company.benefits || [],
            perks: company.perks || [],
            socialLinks: company.socialLinks || {},
            featured: company.featured || false,
            premium: company.premium || false,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          };
        });

        console.log("✅ Transformed companies:", transformedCompanies.length);
        console.log("Sample company:", transformedCompanies[0]);

        setCompanies(transformedCompanies);
        setTotalPages(data.totalPages || Math.ceil(data.total / 12) || 1);

        // Separate featured companies
        const featured = transformedCompanies.filter(
          (c) => c.featured || c.premium
        );
        setFeaturedCompanies(
          featured.length > 0 ? featured : transformedCompanies.slice(0, 3)
        );

        // Calculate dynamic stats
        const stats = {
          total: transformedCompanies.length,
          byType: {},
          byIndustry: {},
          byLocation: {},
        };

        transformedCompanies.forEach((company) => {
          // Count by type
          const type = company.companyType || "Other";
          stats.byType[type] = (stats.byType[type] || 0) + 1;

          // Count by industry
          const industry = company.industry || "Other";
          stats.byIndustry[industry] = (stats.byIndustry[industry] || 0) + 1;

          // Count by location
          const location = company.location || "Other";
          stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;
        });

        setCompanyStats(stats);
        console.log("📈 Company stats:", stats);
      } else {
        console.error("Failed to fetch companies:", response.status);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        setCompanies([]);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
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
      // Handle the 'postedDate' special case (single value, not array)
      if (filterType === "postedDate") {
        return { ...prev, [filterType]: value };
      }

      // Handle salary (array of 2 numbers)
      if (filterType === "salary") {
        return { ...prev, [filterType]: value };
      }

      // Handle standard array-based filters
      if (Array.isArray(prev[filterType])) {
        const newArray = prev[filterType].includes(value)
          ? prev[filterType].filter((v) => v !== value)
          : [...prev[filterType], value];
        return { ...prev, [filterType]: newArray };
      }

      // Fallback for any other single-value filters
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

  // Filter Options - Dynamic
  const companyTypeOptions = useMemo(
    () => [
      {
        label: "MNCs",
        count: companyStats.byType["MNC"] || companyStats.byType["mnc"] || 0,
        icon: <Verified />,
      },
      {
        label: "Startups",
        count:
          companyStats.byType["Startup"] || companyStats.byType["startup"] || 0,
        icon: <Lightbulb />,
      },
      {
        label: "Unicorns",
        count:
          companyStats.byType["Unicorn"] || companyStats.byType["unicorn"] || 0,
        icon: <EmojiEvents />,
      },
      {
        label: "Product Companies",
        count:
          companyStats.byType["Product"] || companyStats.byType["product"] || 0,
        icon: <Laptop />,
      },
      {
        label: "Service Based",
        count:
          companyStats.byType["Service"] || companyStats.byType["service"] || 0,
        icon: <Handshake />,
      },
    ],
    [companyStats]
  );

  const industryOptions = useMemo(() => {
    return Object.entries(companyStats.byIndustry)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Show top 8 industries
  }, [companyStats]);

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

  // Filter companies based on search and activeTab
  const filteredCompanies = useMemo(() => {
    let filtered = [...companies];

    // Filter by search term
    if (searchInFilter.trim()) {
      const searchLower = searchInFilter.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchLower) ||
          (company.description || "").toLowerCase().includes(searchLower) ||
          (company.industry || "").toLowerCase().includes(searchLower) ||
          (company.location || "").toLowerCase().includes(searchLower)
      );
    }

    // Filter by active tab
    if (activeTab === 1) {
      // Top Rated
      filtered = filtered.filter((c) => (c.rating || 0) >= 4.0);
    } else if (activeTab === 2) {
      // Trending
      filtered = filtered.filter((c) => c.isTrending || c.trending);
    } else if (activeTab === 3) {
      // Newly Listed - companies created in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((c) => {
        const createdDate = new Date(c.createdAt || c.created_at);
        return createdDate >= thirtyDaysAgo;
      });
    } else if (activeTab === 4) {
      // Featured
      filtered = filtered.filter((c) => c.featured || c.premium);
    }

    return filtered;
  }, [companies, searchInFilter, activeTab]);

  const tabOptions = useMemo(
    () => [
      { label: "All Companies", count: companyStats.total },
      {
        label: "Top Rated",
        count: companies.filter((c) => (c.rating || 0) >= 4.0).length,
      },
      {
        label: "Trending",
        count: companies.filter((c) => c.isTrending || c.trending).length,
      },
      {
        label: "Newly Listed",
        count: companies.filter((c) => {
          const createdDate = new Date(c.createdAt || c.created_at);
          const daysDiff = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
          return daysDiff <= 30;
        }).length,
      },
    ],
    [companyStats, companies]
  );

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
          placeholder="Search by company name, industry, location..."
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
            sx: { borderRadius: "6px", fontSize: "14px" },
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
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  bgcolor: company.color,
                  fontSize: { xs: "20px", sm: "24px" },
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

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              {company.name}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Rating
                value={company.rating}
                precision={0.1}
                size="small"
                readOnly
                sx={{
                  "& .MuiRating-icon": {
                    fontSize: { xs: "16px", sm: "18px" },
                  },
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "12px", sm: "14px" } }}
              >
                {parseFloat(company.rating || 0).toFixed(1)} (
                {company.reviews || 0} reviews)
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
              <Business sx={{ fontSize: { xs: 14, sm: 16 } }} />
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "12px", sm: "14px" } }}
              >
                {company.industry}
              </Typography>
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
                label={company.companyType || "Company"}
                size="small"
                sx={{
                  bgcolor: "#ede9fe",
                  color: colors.primary,
                  fontWeight: 600,
                  fontSize: "11px",
                }}
              />
              {company.companyType === "Unicorn" && (
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
              {company.isVerified && (
                <Chip
                  icon={
                    <Verified
                      sx={{ fontSize: 14, color: "#10b981 !important" }}
                    />
                  }
                  label="Verified"
                  size="small"
                  sx={{
                    bgcolor: "#d1fae5",
                    color: "#059669",
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
                  borderRadius: "6px",
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
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
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
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
          >
            Discover top companies actively hiring
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
      {featuredCompanies.length > 0 && (
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
              <Grid item xs={12} sm={6} md={4} key={company.id}>
                <FeaturedCompanyCard sx={{ animationDelay: `${index * 0.2}s` }}>
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
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
                          width: { xs: 60, sm: 72 },
                          height: { xs: 60, sm: 72 },
                          bgcolor: company.color,
                          fontSize: { xs: "24px", sm: "28px" },
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
                        borderRadius: "6px",
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
      )}

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
                borderRadius: "6px",
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
                    minHeight: { xs: 48, sm: 56 },
                    fontSize: { xs: "13px", sm: "14px" },
                    px: { xs: 1.5, sm: 2 },
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 0.5, sm: 1 },
                        }}
                      >
                        <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                          {tab.label}
                        </Box>
                        <Chip
                          label={tab.count}
                          size="small"
                          sx={{
                            height: { xs: 18, sm: 20 },
                            fontSize: { xs: "9px", sm: "10px" },
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
                  <Box sx={{ position: "relative", display: "inline-flex" }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={() => setMobileFiltersOpen(true)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "6px",
                        borderColor: "#e5e7eb",
                        color: "#374151",
                        bgcolor: "#fff",
                        "&:hover": {
                          borderColor: colors.primary,
                          bgcolor: "#f9fafb",
                        },
                      }}
                    >
                      Filters
                    </Button>
                    {activeFiltersCount > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          bgcolor: colors.primary,
                          color: "#fff",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        {activeFiltersCount}
                      </Box>
                    )}
                  </Box>
                )}
                <FormControl
                  size="small"
                  sx={{ minWidth: { xs: 120, sm: 160 } }}
                >
                  <Select
                    defaultValue="popularity"
                    sx={{
                      borderRadius: "6px",
                      fontSize: { xs: "13px", sm: "14px" },
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
              {!isMobile && (
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    "& .MuiToggleButton-root": {
                      border: "none",
                      borderRadius: "6px",
                      mx: 0.5,
                      my: 0.5,
                      color: "#6b7280",
                      transition: "all 0.2s ease",
                      "& .MuiSvgIcon-root": {
                        fontSize: "22px !important",
                        width: "22px !important",
                        height: "22px !important",
                        color: "#6b7280 !important",
                      },
                      "&.Mui-selected": {
                        bgcolor: `${colors.primary} !important`,
                        color: "#fff !important",
                        "& .MuiSvgIcon-root": {
                          color: "#fff !important",
                        },
                        "&:hover": {
                          bgcolor: `${colors.primaryDark} !important`,
                        },
                      },
                      "&:hover": {
                        bgcolor: "#f3f4f6",
                        "& .MuiSvgIcon-root": {
                          color: `${colors.primary} !important`,
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="grid" sx={{ px: 2 }}>
                    <ViewModule />
                  </ToggleButton>
                  <ToggleButton value="list" sx={{ px: 2 }}>
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            </Box>

            {/* Companies Grid */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid item xs={12} sm={6} lg={4} key={i}>
                    <Card sx={{ p: 3, borderRadius: "6px" }}>
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
            ) : filteredCompanies.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No companies found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {searchInFilter
                    ? `No results match "${searchInFilter}"`
                    : "Try adjusting your filters"}
                </Typography>
                {searchInFilter && (
                  <Button
                    variant="outlined"
                    onClick={() => setSearchInFilter("")}
                    sx={{ textTransform: "none" }}
                  >
                    Clear Search
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {filteredCompanies.map((company) =>
                    renderCompanyCard(company)
                  )}
                </Grid>

                {/* Pagination */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: { xs: 3, md: 5 },
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontWeight: 600,
                        borderRadius: "8px",
                        fontSize: { xs: "13px", sm: "14px" },
                        minWidth: { xs: "32px", sm: "36px" },
                        height: { xs: "32px", sm: "36px" },
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

      {/* Mobile Filters Bottom Sheet */}
      <Drawer
        anchor="bottom"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bgcolor: "#f9fafb",
          },
        }}
      >
        {/* Handle Bar */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: "#d1d5db",
            borderRadius: 2,
            mx: "auto",
            mt: 1.5,
            mb: 2,
          }}
        />

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "18px" }}>
            Filter companies
          </Typography>
          <Button
            onClick={() => {
              setFilters({
                companyType: [],
                industry: [],
                location: [],
                companySize: [],
                rating: 0,
              });
            }}
            sx={{
              textTransform: "none",
              color: colors.primary,
              fontWeight: 600,
              fontSize: "14px",
              minWidth: "auto",
              p: 0,
            }}
          >
            Clear all
          </Button>
        </Box>

        {/* Scrollable Filters */}
        <Box
          sx={{
            overflowY: "auto",
            maxHeight: "calc(85vh - 140px)",
            bgcolor: "#fff",
          }}
        >
          {renderFilters()}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setMobileFiltersOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
              borderRadius: "6px",
              borderColor: "#e5e7eb",
              color: "#374151",
              height: 48,
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setMobileFiltersOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
              borderRadius: "6px",
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              height: 48,
            }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default CompaniesPageNaukri;
