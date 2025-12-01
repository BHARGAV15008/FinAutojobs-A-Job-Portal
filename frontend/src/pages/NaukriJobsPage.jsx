import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";
import API_BASE_URL from "../services/apiConfig";
import JobApplicationModal from "../components/modals/JobApplicationModal";
import { applicationService } from "../services/applicationService";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Card,
  Avatar,
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  Skeleton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  LinearProgress,
  Tabs,
  Tab,
  InputAdornment,
  Drawer,
  useMediaQuery,
  useTheme,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Work,
  Business,
  Bookmark,
  BookmarkBorder,
  Share,
  ExpandMore,
  FilterList,
  Close,
  Verified,
  Timer,
  CurrencyRupee,
  TrendingUp,
  Star,
  FlashOn,
  Home,
  Person,
  School,
  Laptop,
  ChevronRight,
  KeyboardArrowDown,
  Tune,
  Sort,
  ViewList,
  ViewModule,
  ArrowForward,
  CheckCircle,
  AccessTime,
  Group,
  LocalFireDepartment,
  WorkOutline,
  BusinessCenter,
  Schedule,
  AttachMoney,
  Description,
  Apartment,
  NavigateNext,
  NavigateBefore,
  Clear,
  Done,
  MoreVert,
  Send,
  Refresh,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";

// ========== NAUKRI THEME COLORS ==========
const NAUKRI_COLORS = {
  blue: "#457EFF",
  blueDark: "#2557D6",
  blueLight: "#EBF3FF",
  teal: "#00C8AA",
  orange: "#FF6B35",
  purple: "#7B61FF",
  green: "#00C853",
  yellow: "#FFB800",
  red: "#FF4757",
  dark: "#1A202C",
  gray900: "#1F2937",
  gray800: "#374151",
  gray700: "#4B5563",
  gray600: "#6B7280",
  gray500: "#9CA3AF",
  gray400: "#D1D5DB",
  gray300: "#E5E7EB",
  gray200: "#F3F4F6",
  gray100: "#F9FAFB",
  white: "#FFFFFF",
};

// ========== ANIMATIONS ==========
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(69, 126, 255, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(69, 126, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(69, 126, 255, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ========== STYLED COMPONENTS ==========
const FilterSection = styled(Paper)(({ theme }) => ({
  padding: "24px",
  borderRadius: "16px",
  position: "sticky",
  top: 90,
  maxHeight: "calc(100vh - 110px)",
  overflowY: "auto",
  border: `1px solid ${NAUKRI_COLORS.gray200}`,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: NAUKRI_COLORS.gray100,
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: NAUKRI_COLORS.gray400,
    borderRadius: "3px",
    "&:hover": {
      background: NAUKRI_COLORS.gray500,
    },
  },
}));

const JobCard = styled(Card)(({ theme, featured }) => ({
  padding: "24px",
  borderRadius: "16px",
  border: featured
    ? `2px solid ${NAUKRI_COLORS.blue}`
    : `1px solid ${NAUKRI_COLORS.gray200}`,
  boxShadow: "none",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
  overflow: "visible",
  background: featured
    ? `linear-gradient(to right, ${NAUKRI_COLORS.blueLight}, ${NAUKRI_COLORS.white})`
    : NAUKRI_COLORS.white,
  animation: `${fadeIn} 0.4s ease-out`,
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "4px",
    background: `linear-gradient(180deg, ${NAUKRI_COLORS.blue}, ${NAUKRI_COLORS.teal})`,
    borderRadius: "16px 0 0 16px",
    transform: "scaleY(0)",
    transition: "transform 0.3s ease",
  },
  "&:hover": {
    boxShadow: `0 15px 50px rgba(69, 126, 255, 0.12)`,
    transform: "translateY(-6px)",
    borderColor: NAUKRI_COLORS.blue,
    "&::before": {
      transform: "scaleY(1)",
    },
    "& .company-logo": {
      transform: "scale(1.08)",
    },
    "& .apply-btn": {
      background: `linear-gradient(135deg, ${NAUKRI_COLORS.blueDark} 0%, ${NAUKRI_COLORS.blue} 100%)`,
    },
  },
}));

const FilterChip = styled(Chip)(({ theme, active }) => ({
  borderRadius: "20px",
  fontWeight: 600,
  fontSize: "13px",
  transition: "all 0.25s ease",
  cursor: "pointer",
  padding: "6px 4px",
  ...(active && {
    backgroundColor: NAUKRI_COLORS.blue,
    color: NAUKRI_COLORS.white,
    boxShadow: `0 4px 15px rgba(69, 126, 255, 0.3)`,
    "&:hover": {
      backgroundColor: NAUKRI_COLORS.blueDark,
    },
  }),
  ...(!active && {
    backgroundColor: NAUKRI_COLORS.gray100,
    color: NAUKRI_COLORS.gray700,
    border: `1px solid ${NAUKRI_COLORS.gray300}`,
    "&:hover": {
      backgroundColor: NAUKRI_COLORS.blueLight,
      borderColor: NAUKRI_COLORS.blue,
      color: NAUKRI_COLORS.blue,
      transform: "translateY(-2px)",
    },
  }),
}));

const SearchHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${NAUKRI_COLORS.blue} 0%, ${NAUKRI_COLORS.blueDark} 100%)`,
  padding: "32px 0",
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
      'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"%3E%3Cpath d="M0 20L20 0v20H0zm20 0L40 0v20H20zm0 0v20L0 20h20zm0 0h20L20 40V20z"/%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.5,
  },
}));

const FilterAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: "none",
  border: "none",
  "&:before": {
    display: "none",
  },
  "& .MuiAccordionSummary-root": {
    padding: 0,
    minHeight: 48,
    "&.Mui-expanded": {
      minHeight: 48,
    },
  },
  "& .MuiAccordionSummary-content": {
    margin: "12px 0",
    "&.Mui-expanded": {
      margin: "12px 0",
    },
  },
  "& .MuiAccordionDetails-root": {
    padding: "0 0 16px 0",
  },
}));

const HotBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: -10,
  right: 20,
  background: `linear-gradient(135deg, ${NAUKRI_COLORS.orange}, ${NAUKRI_COLORS.red})`,
  color: NAUKRI_COLORS.white,
  fontSize: "10px",
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  boxShadow: "0 4px 12px rgba(255, 107, 53, 0.4)",
  animation: `${pulse} 2s infinite`,
}));

const NaukriJobsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("relevance");
  const [applicationModal, setApplicationModal] = useState({
    open: false,
    job: null,
  });

  // Filters state
  const [filters, setFilters] = useState({
    experience: [],
    salary: [0, 50],
    jobType: [],
    workMode: [],
    postedDate: "",
    company: [],
    industry: [],
  });

  // Filter options
  const experienceOptions = [
    "Fresher",
    "0-1 years",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10+ years",
  ];

  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
  ];

  const workModeOptions = ["Work from Office", "Remote", "Hybrid"];

  const postedDateOptions = [
    { label: "Last 24 hours", value: "1" },
    { label: "Last 3 days", value: "3" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 15 days", value: "15" },
    { label: "Last 30 days", value: "30" },
  ];

  const topLocations = [
    "Bangalore",
    "Mumbai",
    "Delhi NCR",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Ahmedabad",
  ];

  const quickFilters = [
    { label: "Remote", icon: <Home fontSize="small" /> },
    { label: "Fresher", icon: <School fontSize="small" /> },
    { label: "MNC", icon: <Apartment fontSize="small" /> },
    { label: "Work from Home", icon: <Laptop fontSize="small" /> },
    { label: "Walk-in", icon: <Person fontSize="small" /> },
  ];

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (locationFilter) params.append("location", locationFilter);
        params.append("page", page);
        params.append("limit", 10);

        const response = await fetch(`${API_BASE_URL}/jobs?${params}`);
        const data = await response.json();

        if (data.jobs) {
          setJobs(data.jobs);
          setTotalPages(data.totalPages || 1);
          setTotalJobs(data.totalJobs || data.jobs.length);
        }
      } catch (err) {
        setError("Failed to load jobs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchQuery, locationFilter, page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleApply = (job) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setApplicationModal({ open: true, job });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[filterType])) {
        const newValues = prev[filterType].includes(value)
          ? prev[filterType].filter((v) => v !== value)
          : [...prev[filterType], value];
        return { ...prev, [filterType]: newValues };
      }
      return { ...prev, [filterType]: value };
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      experience: [],
      salary: [0, 50],
      jobType: [],
      workMode: [],
      postedDate: "",
      company: [],
      industry: [],
    });
    setSearchQuery("");
    setLocationFilter("");
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.experience.length) count += filters.experience.length;
    if (filters.jobType.length) count += filters.jobType.length;
    if (filters.workMode.length) count += filters.workMode.length;
    if (filters.postedDate) count += 1;
    if (searchQuery) count += 1;
    if (locationFilter) count += 1;
    return count;
  }, [filters, searchQuery, locationFilter]);

  // Sample jobs for demo
  const sampleJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Google",
      location: "Bangalore, Mumbai",
      experience: "5-8 years",
      salary: "25-40 LPA",
      skills: ["React", "Node.js", "Python", "AWS"],
      posted: "2 days ago",
      description:
        "We are looking for a Senior Software Engineer to join our team...",
      featured: true,
      verified: true,
      applicants: 245,
      rating: 4.5,
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Microsoft",
      location: "Hyderabad",
      experience: "4-6 years",
      salary: "20-35 LPA",
      skills: ["Product Strategy", "Agile", "Data Analysis"],
      posted: "1 day ago",
      description: "Join our product team to build innovative solutions...",
      featured: true,
      verified: true,
      applicants: 189,
      rating: 4.4,
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "Amazon",
      location: "Delhi NCR",
      experience: "3-5 years",
      salary: "18-30 LPA",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
      posted: "3 days ago",
      description: "Looking for talented Data Scientists...",
      verified: true,
      applicants: 312,
      rating: 4.2,
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "Flipkart",
      location: "Bangalore",
      experience: "2-4 years",
      salary: "12-20 LPA",
      skills: ["React", "JavaScript", "CSS", "TypeScript"],
      posted: "1 day ago",
      description: "Join our frontend team...",
      verified: true,
      applicants: 156,
      rating: 4.1,
    },
    {
      id: 5,
      title: "DevOps Engineer",
      company: "Netflix",
      location: "Mumbai",
      experience: "4-7 years",
      salary: "22-38 LPA",
      skills: ["Kubernetes", "Docker", "AWS", "Terraform"],
      posted: "5 days ago",
      description: "We need experienced DevOps engineers...",
      verified: true,
      applicants: 98,
      rating: 4.6,
    },
    {
      id: 6,
      title: "UI/UX Designer",
      company: "Swiggy",
      location: "Bangalore",
      experience: "2-5 years",
      salary: "10-18 LPA",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      posted: "2 days ago",
      description: "Design beautiful user experiences...",
      verified: true,
      applicants: 234,
      rating: 4.0,
    },
  ];

  const displayJobs = jobs.length > 0 ? jobs : sampleJobs;

  const FilterSidebar = () => (
    <FilterSection>
      {/* Filter Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} color={NAUKRI_COLORS.gray900}>
          All Filters
        </Typography>
        {activeFilterCount > 0 && (
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={clearAllFilters}
            sx={{
              color: NAUKRI_COLORS.blue,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Clear All ({activeFilterCount})
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Experience Filter */}
      <FilterAccordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={600} color={NAUKRI_COLORS.gray800}>
            Experience
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {experienceOptions.map((exp) => (
              <FormControlLabel
                key={exp}
                control={
                  <Checkbox
                    checked={filters.experience.includes(exp)}
                    onChange={() => handleFilterChange("experience", exp)}
                    sx={{
                      color: NAUKRI_COLORS.gray400,
                      "&.Mui-checked": {
                        color: NAUKRI_COLORS.blue,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    color={NAUKRI_COLORS.gray700}
                    fontWeight={500}
                  >
                    {exp}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </FilterAccordion>

      {/* Salary Filter */}
      <FilterAccordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={600} color={NAUKRI_COLORS.gray800}>
            Salary (LPA)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.salary}
              onChange={(e, newValue) =>
                setFilters((prev) => ({ ...prev, salary: newValue }))
              }
              valueLabelDisplay="auto"
              min={0}
              max={100}
              sx={{
                color: NAUKRI_COLORS.blue,
                "& .MuiSlider-thumb": {
                  width: 20,
                  height: 20,
                  "&:hover": {
                    boxShadow: `0 0 0 8px rgba(69, 126, 255, 0.16)`,
                  },
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Typography variant="caption" color={NAUKRI_COLORS.gray600}>
                ₹{filters.salary[0]} LPA
              </Typography>
              <Typography variant="caption" color={NAUKRI_COLORS.gray600}>
                ₹{filters.salary[1]} LPA+
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </FilterAccordion>

      {/* Job Type Filter */}
      <FilterAccordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={600} color={NAUKRI_COLORS.gray800}>
            Job Type
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {jobTypeOptions.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={filters.jobType.includes(type)}
                    onChange={() => handleFilterChange("jobType", type)}
                    sx={{
                      color: NAUKRI_COLORS.gray400,
                      "&.Mui-checked": {
                        color: NAUKRI_COLORS.blue,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    color={NAUKRI_COLORS.gray700}
                    fontWeight={500}
                  >
                    {type}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </FilterAccordion>

      {/* Work Mode Filter */}
      <FilterAccordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={600} color={NAUKRI_COLORS.gray800}>
            Work Mode
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {workModeOptions.map((mode) => (
              <FormControlLabel
                key={mode}
                control={
                  <Checkbox
                    checked={filters.workMode.includes(mode)}
                    onChange={() => handleFilterChange("workMode", mode)}
                    sx={{
                      color: NAUKRI_COLORS.gray400,
                      "&.Mui-checked": {
                        color: NAUKRI_COLORS.blue,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    color={NAUKRI_COLORS.gray700}
                    fontWeight={500}
                  >
                    {mode}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </FilterAccordion>

      {/* Posted Date Filter */}
      <FilterAccordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={600} color={NAUKRI_COLORS.gray800}>
            Posted Date
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {postedDateOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={filters.postedDate === option.value}
                    onChange={() =>
                      handleFilterChange("postedDate", option.value)
                    }
                    sx={{
                      color: NAUKRI_COLORS.gray400,
                      "&.Mui-checked": {
                        color: NAUKRI_COLORS.blue,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    color={NAUKRI_COLORS.gray700}
                    fontWeight={500}
                  >
                    {option.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </FilterAccordion>

      {/* Location Filter */}
      <FilterAccordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={600} color={NAUKRI_COLORS.gray800}>
            Location
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {topLocations.map((loc) => (
              <Chip
                key={loc}
                label={loc}
                size="small"
                onClick={() => setLocationFilter(loc)}
                sx={{
                  bgcolor:
                    locationFilter === loc
                      ? NAUKRI_COLORS.blue
                      : NAUKRI_COLORS.gray100,
                  color:
                    locationFilter === loc
                      ? NAUKRI_COLORS.white
                      : NAUKRI_COLORS.gray700,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor:
                      locationFilter === loc
                        ? NAUKRI_COLORS.blueDark
                        : NAUKRI_COLORS.blueLight,
                  },
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </FilterAccordion>
    </FilterSection>
  );

  return (
    <Box sx={{ bgcolor: NAUKRI_COLORS.gray100, minHeight: "100vh" }}>
      {/* ========== SEARCH HEADER ========== */}
      <SearchHeader>
        <Container maxWidth="lg">
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              position: "relative",
              zIndex: 1,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search jobs, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: NAUKRI_COLORS.gray500 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 2,
                "& .MuiOutlinedInput-root": {
                  bgcolor: NAUKRI_COLORS.white,
                  borderRadius: "12px",
                  fontSize: "15px",
                  "& fieldset": {
                    borderColor: "transparent",
                  },
                  "&:hover fieldset": {
                    borderColor: NAUKRI_COLORS.gray300,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: NAUKRI_COLORS.blue,
                    borderWidth: 2,
                  },
                },
              }}
            />
            <TextField
              fullWidth
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: NAUKRI_COLORS.gray500 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  bgcolor: NAUKRI_COLORS.white,
                  borderRadius: "12px",
                  fontSize: "15px",
                  "& fieldset": {
                    borderColor: "transparent",
                  },
                  "&:hover fieldset": {
                    borderColor: NAUKRI_COLORS.gray300,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: NAUKRI_COLORS.blue,
                    borderWidth: 2,
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth: { xs: "100%", md: 140 },
                borderRadius: "12px",
                py: 1.8,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                background: `linear-gradient(135deg, ${NAUKRI_COLORS.teal} 0%, #00A896 100%)`,
                boxShadow: `0 4px 15px rgba(0, 200, 170, 0.35)`,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: `linear-gradient(135deg, #00A896 0%, ${NAUKRI_COLORS.teal} 100%)`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 25px rgba(0, 200, 170, 0.45)`,
                },
              }}
            >
              Search
            </Button>
          </Box>

          {/* Quick Filters */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mt: 3,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {quickFilters.map((filter, index) => (
              <Chip
                key={index}
                icon={filter.icon}
                label={filter.label}
                onClick={() => setSearchQuery(filter.label)}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  color: NAUKRI_COLORS.white,
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "& .MuiChip-icon": {
                    color: NAUKRI_COLORS.white,
                  },
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.25)",
                    transform: "translateY(-2px)",
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </SearchHeader>

      {/* ========== MAIN CONTENT ========== */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Filter Sidebar - Desktop */}
          {!isMobile && (
            <Grid item md={3}>
              <FilterSidebar />
            </Grid>
          )}

          {/* Jobs List */}
          <Grid item xs={12} md={9}>
            {/* Results Header */}
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
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={NAUKRI_COLORS.gray900}
                >
                  {loading ? (
                    <Skeleton width={200} />
                  ) : (
                    `${totalJobs.toLocaleString()} Jobs Found`
                  )}
                </Typography>
                <Typography variant="body2" color={NAUKRI_COLORS.gray600}>
                  {searchQuery
                    ? `for "${searchQuery}"`
                    : "Based on your preferences"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={
                      <Badge badgeContent={activeFilterCount} color="primary">
                        <FilterList />
                      </Badge>
                    }
                    onClick={() => setFilterDrawerOpen(true)}
                    sx={{
                      borderColor: NAUKRI_COLORS.gray300,
                      color: NAUKRI_COLORS.gray700,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Filters
                  </Button>
                )}

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    displayEmpty
                    sx={{
                      bgcolor: NAUKRI_COLORS.white,
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: NAUKRI_COLORS.gray300,
                      },
                    }}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="date">Date Posted</MenuItem>
                    <MenuItem value="salary_high">Salary: High to Low</MenuItem>
                    <MenuItem value="salary_low">Salary: Low to High</MenuItem>
                  </Select>
                </FormControl>

                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    bgcolor: NAUKRI_COLORS.white,
                    borderRadius: "10px",
                    border: `1px solid ${NAUKRI_COLORS.gray300}`,
                    overflow: "hidden",
                  }}
                >
                  <IconButton
                    onClick={() => setViewMode("list")}
                    sx={{
                      borderRadius: 0,
                      bgcolor:
                        viewMode === "list"
                          ? NAUKRI_COLORS.blueLight
                          : "transparent",
                      color:
                        viewMode === "list"
                          ? NAUKRI_COLORS.blue
                          : NAUKRI_COLORS.gray500,
                    }}
                  >
                    <ViewList />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    sx={{
                      borderRadius: 0,
                      bgcolor:
                        viewMode === "grid"
                          ? NAUKRI_COLORS.blueLight
                          : "transparent",
                      color:
                        viewMode === "grid"
                          ? NAUKRI_COLORS.blue
                          : NAUKRI_COLORS.gray500,
                    }}
                  >
                    <ViewModule />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Jobs Grid/List */}
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={200}
                    sx={{ borderRadius: "16px" }}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {displayJobs.map((job, index) => (
                  <JobCard
                    key={job.id || index}
                    featured={job.featured}
                    sx={{
                      animationDelay: `${index * 0.08}s`,
                    }}
                  >
                    {job.featured && (
                      <HotBadge>
                        <LocalFireDepartment sx={{ fontSize: 12 }} />
                        Hot
                      </HotBadge>
                    )}

                    <Box sx={{ display: "flex", gap: 2.5 }}>
                      {/* Company Logo */}
                      <Avatar
                        className="company-logo"
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: NAUKRI_COLORS.blue,
                          borderRadius: "14px",
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          transition: "all 0.4s ease",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        }}
                        variant="rounded"
                      >
                        {job.company?.charAt(0) || "C"}
                      </Avatar>

                      {/* Job Content */}
                      <Box sx={{ flex: 1 }}>
                        {/* Title & Actions */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 1,
                          }}
                        >
                          <Box>
                            <Link href={`/job/${job.id}`}>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                  color: NAUKRI_COLORS.gray900,
                                  cursor: "pointer",
                                  transition: "color 0.2s ease",
                                  "&:hover": {
                                    color: NAUKRI_COLORS.blue,
                                  },
                                }}
                              >
                                {job.title}
                              </Typography>
                            </Link>
                            <Typography
                              variant="body2"
                              sx={{
                                color: NAUKRI_COLORS.gray600,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              {job.company}
                              {job.verified && (
                                <Verified
                                  sx={{
                                    fontSize: 16,
                                    color: NAUKRI_COLORS.teal,
                                  }}
                                />
                              )}
                              {job.rating && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    ml: 1,
                                  }}
                                >
                                  <Star
                                    sx={{
                                      fontSize: 14,
                                      color: NAUKRI_COLORS.yellow,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{ ml: 0.3 }}
                                  >
                                    {job.rating}
                                  </Typography>
                                </Box>
                              )}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Save Job">
                              <IconButton
                                onClick={() => toggleSaveJob(job.id)}
                                sx={{
                                  color: savedJobs.has(job.id)
                                    ? NAUKRI_COLORS.blue
                                    : NAUKRI_COLORS.gray400,
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    color: NAUKRI_COLORS.blue,
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                {savedJobs.has(job.id) ? (
                                  <Bookmark />
                                ) : (
                                  <BookmarkBorder />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Share">
                              <IconButton
                                sx={{
                                  color: NAUKRI_COLORS.gray400,
                                  "&:hover": {
                                    color: NAUKRI_COLORS.gray600,
                                  },
                                }}
                              >
                                <Share />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Job Details */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2.5,
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <BusinessCenter
                              sx={{
                                fontSize: 18,
                                color: NAUKRI_COLORS.gray400,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={NAUKRI_COLORS.gray600}
                            >
                              {job.experience}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CurrencyRupee
                              sx={{ fontSize: 18, color: NAUKRI_COLORS.green }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: NAUKRI_COLORS.green,
                                fontWeight: 600,
                              }}
                            >
                              {job.salary}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <LocationOn
                              sx={{
                                fontSize: 18,
                                color: NAUKRI_COLORS.gray400,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={NAUKRI_COLORS.gray600}
                            >
                              {job.location}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          color={NAUKRI_COLORS.gray600}
                          sx={{
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {job.description}
                        </Typography>

                        {/* Skills */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                            mb: 2.5,
                          }}
                        >
                          {job.skills?.slice(0, 5).map((skill, i) => (
                            <Chip
                              key={i}
                              label={skill}
                              size="small"
                              sx={{
                                bgcolor: NAUKRI_COLORS.gray100,
                                color: NAUKRI_COLORS.gray700,
                                fontSize: "12px",
                                fontWeight: 500,
                                height: 28,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: NAUKRI_COLORS.blueLight,
                                  color: NAUKRI_COLORS.blue,
                                },
                              }}
                            />
                          ))}
                        </Box>

                        {/* Footer */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTime
                                sx={{
                                  fontSize: 16,
                                  color: NAUKRI_COLORS.gray400,
                                }}
                              />
                              <Typography
                                variant="caption"
                                color={NAUKRI_COLORS.gray500}
                              >
                                {job.posted}
                              </Typography>
                            </Box>
                            {job.applicants && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Group
                                  sx={{
                                    fontSize: 16,
                                    color: NAUKRI_COLORS.gray400,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color={NAUKRI_COLORS.gray500}
                                >
                                  {job.applicants} applicants
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Button
                            className="apply-btn"
                            variant="contained"
                            size="small"
                            endIcon={<Send />}
                            onClick={() => handleApply(job)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: "10px",
                              background: `linear-gradient(135deg, ${NAUKRI_COLORS.blue} 0%, ${NAUKRI_COLORS.blueDark} 100%)`,
                              px: 3,
                              py: 1,
                              boxShadow: `0 4px 15px rgba(69, 126, 255, 0.3)`,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: `0 8px 25px rgba(69, 126, 255, 0.4)`,
                              },
                            }}
                          >
                            Apply Now
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </JobCard>
                ))}
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 5,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  size="large"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 600,
                      borderRadius: "10px",
                      "&.Mui-selected": {
                        bgcolor: NAUKRI_COLORS.blue,
                        color: NAUKRI_COLORS.white,
                        "&:hover": {
                          bgcolor: NAUKRI_COLORS.blueDark,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: "85%",
            maxWidth: 360,
            p: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <FilterSidebar />
      </Drawer>

      {/* Application Modal */}
      {applicationModal.job && (
        <JobApplicationModal
          open={applicationModal.open}
          onClose={() => setApplicationModal({ open: false, job: null })}
          job={applicationModal.job}
        />
      )}
    </Box>
  );
};

export default NaukriJobsPage;
