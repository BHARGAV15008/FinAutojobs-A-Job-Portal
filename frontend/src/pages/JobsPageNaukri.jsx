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
  Slider,
  Collapse,
  Pagination,
  LinearProgress,
  Tooltip,
  Skeleton,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Divider,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from "@mui/material";
import {
  Work,
  Business,
  LocationOn,
  AccessTime,
  Bookmark,
  BookmarkBorder,
  FilterList,
  Close,
  AttachMoney,
  School,
  Timer,
  HomeWork,
  Verified,
  TrendingUp,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ViewList,
  ViewModule,
  Search,
  Clear,
  LocalFireDepartment,
  FlashOn,
  Star,
  CheckCircle,
  Schedule,
  People,
  WorkOutline,
  CurrencyRupee,
  Description,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import API_BASE_URL from "../services/apiConfig";
import colors, { fonts, fontSizes } from "../styles/uiColors";
import JobDetailsDrawer from "../components/drawers/JobDetailsDrawer";
import { mapBackendJobToFrontend } from "../utils/jobMapper";
import AuthModal from "../components/modals/AuthModal";
import JobApplicationModal from "../components/modals/JobApplicationModal";
import { useAuth } from "../contexts/AuthContext.jsx";
import { applicationService } from "../services/applicationService";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
  padding: "32px 0 48px",
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("md")]: {
    padding: "24px 0 40px",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "20px 0 36px",
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
    padding: "14px 16px",
  },
}));

const JobCard = styled(Card)(({ $viewMode, theme }) => ({
  borderRadius: "6px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid transparent",
  cursor: "pointer",
  animation: `${fadeIn} 0.5s ease`,
  display: $viewMode === "grid" ? "block" : "flex",
  [theme.breakpoints.down("sm")]: {
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(99, 102, 241, 0.15)",
    borderColor: colors.primary,
    "& .company-logo": { transform: "scale(1.1)" },
  },
  "&:active": {
    [theme.breakpoints.down("sm")]: {
      transform: "scale(0.98)",
    },
  },
}));

const QuickFilterChip = styled(Chip)(({ selected, theme }) => ({
  fontWeight: 500,
  borderRadius: "8px",
  transition: "all 0.2s",
  cursor: "pointer",
  backgroundColor: selected ? colors.primary : "#f3f4f6",
  color: selected ? "#fff" : "#374151",
  border: selected ? "none" : "1px solid transparent",
  whiteSpace: "nowrap",
  [theme.breakpoints.down("sm")]: {
    fontSize: "12px",
    height: "32px",
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

const ActiveFilterBadge = styled(Badge)(() => ({
  "& .MuiBadge-badge": {
    backgroundColor: colors.primary,
    color: "#fff",
    fontWeight: 600,
    fontSize: 10,
    minWidth: 16,
    height: 16,
  },
}));

const JobsPageNaukri = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInFilter, setSearchInFilter] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailOpen, setJobDetailOpen] = useState(false);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] =
    useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applicationLoading, setApplicationLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    experience: [],
    salary: [0, 100],
    location: [],
    workMode: [],
    jobType: [],
    department: [],
    role: [],
    education: [],
    industry: [],
    topCompanies: [],
    postedDate: "anytime",
    company: [],
    skills: [],
  });

  const [expandedSections, setExpandedSections] = useState({
    experience: true,
    salary: true,
    location: true,
    workMode: true,
    jobType: true,
    department: false,
    role: false,
    education: false,
    industry: false,
    topCompanies: false,
    postedDate: false,
    company: false,
    skills: false,
  });

  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search") || "";
  const locationQuery = urlParams.get("location") || "";

  useEffect(() => {
    fetchJobs();
  }, [page, filters, searchQuery, locationQuery]);

  // Fetch applied jobs and saved jobs
  useEffect(() => {
    const fetchUserStats = async () => {
      if (user && (user.id || user._id)) {
        try {
          const userId = user.id || user._id;

          // Fetch Applications
          const appsResponse = await applicationService.getUserApplications(
            50,
            1
          );
          if (appsResponse.success) {
            const appliedJobIds = new Set(
              appsResponse.data.applications.map(
                (app) => app.jobId?._id || app.jobId
              )
            );
            setAppliedJobs(appliedJobIds);
          }

          // Fetch Saved Jobs
          const savedResponse = await fetch(`${API_BASE_URL}/saved-jobs`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const savedData = await savedResponse.json();
          if (
            savedData.success &&
            savedData.data &&
            Array.isArray(savedData.data.jobs)
          ) {
            const savedIds = savedData.data.jobs.map(
              (job) => job.id || job._id
            );
            setSavedJobs(savedIds);
          }
        } catch (error) {
          console.error("Error fetching user stats:", error);
        }
      }
    };

    fetchUserStats();
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      if (searchQuery) params.append("search", searchQuery);
      if (locationQuery) params.append("location", locationQuery);

      // Append filters to API request
      if (filters.experience.length > 0) {
        const exp = filters.experience[0];
        if (exp === "Fresher") {
          params.append("experienceMax", "0");
        } else if (exp.includes("-")) {
          const parts = exp.split(" ")[0].split("-");
          params.append("experienceMin", parts[0]);
          params.append("experienceMax", parts[1]);
        } else if (exp.includes("+")) {
          params.append("experienceMin", exp.replace("+", "").split(" ")[0]);
        }
      }

      if (filters.location.length > 0) {
        params.append("location", filters.location.join(","));
      }

      if (filters.workMode.length > 0) {
        const modes = filters.workMode.map((m) =>
          m === "Work from Office" ? "On-site" : m
        );
        params.append("workArrangement", modes.join(","));
      }

      if (filters.jobType.length > 0) {
        params.append("jobType", filters.jobType.join(","));
      }

      if (filters.industry.length > 0) {
        params.append("industry", filters.industry.join(","));
      }

      if (filters.salary[0] > 0)
        params.append("salaryMin", filters.salary[0] * 100000);
      if (filters.salary[1] < 100)
        params.append("salaryMax", filters.salary[1] * 100000);

      const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const jobsData = result.data?.jobs || [];

        console.log("🔍 Raw jobs from API:", jobsData);

        // Transform backend data to frontend structure using centralized mapper
        const transformedJobs = jobsData.map(mapBackendJobToFrontend);

        console.log("🔍 Transformed jobs for UI:", transformedJobs);

        setJobs(transformedJobs);
        setTotalPages(
          result.data?.totalPages || Math.ceil((result.data?.total || 0) / 12)
        );
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = async (e, jobId) => {
    if (e) e.stopPropagation();

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const isSaved = savedJobs.includes(jobId);
    try {
      const method = isSaved ? "DELETE" : "POST";
      const url = isSaved
        ? `${API_BASE_URL}/saved-jobs/${jobId}`
        : `${API_BASE_URL}/saved-jobs`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: isSaved ? null : JSON.stringify({ jobId }),
      });

      if (response.ok) {
        setSavedJobs((prev) =>
          isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
        );
        // Dispatch event to refresh dashboards
        window.dispatchEvent(new CustomEvent("refreshDashboard"));
      }
    } catch (error) {
      console.error("Error toggling saved job:", error);
    }
  };

  const handleApply = (job) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (user.role === "recruiter") {
      alert(
        "Recruiters cannot apply to jobs. Please switch to an applicant account."
      );
      return;
    }

    const jobId = job.id || job._id;
    if (appliedJobs.has(jobId)) {
      alert("You have already applied to this job!");
      return;
    }

    setSelectedJobForApplication(job);
    setApplicationModalOpen(true);
  };

  const handleSubmitApplication = async (applicationData) => {
    try {
      setApplicationLoading(true);
      const response = await applicationService.submitApplication(
        applicationData
      );

      const jobId = applicationData.get("jobId");
      setAppliedJobs((prev) => new Set([...prev, jobId]));

      alert(
        `Application submitted successfully for ${
          selectedJobForApplication?.jobTitle ||
          selectedJobForApplication?.title
        }!`
      );

      // Dispatch event to refresh dashboards
      window.dispatchEvent(new CustomEvent("refreshDashboard"));

      setApplicationModalOpen(false);
      setSelectedJobForApplication(null);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    } finally {
      setApplicationLoading(false);
    }
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
      experience: [],
      salary: [0, 100],
      location: [],
      workMode: [],
      jobType: [],
      department: [],
      role: [],
      education: [],
      industry: [],
      topCompanies: [],
      postedDate: "anytime",
      company: [],
      skills: [],
    });
    setPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "salary") {
        // Only count salary if it differs from the default range [0, 100]
        if (value[0] > 0 || value[1] < 100) count += 1;
      } else if (key === "postedDate") {
        if (value !== "anytime") count += 1;
      } else if (Array.isArray(value) && value.length > 0) {
        count += value.length;
      }
    });
    return count;
  }, [filters]);

  // Quick Filter Options
  const quickFilters = [
    {
      label: "Remote",
      icon: <HomeWork sx={{ fontSize: 16 }} />,
      value: "remote",
    },
    {
      label: "Freshers",
      icon: <School sx={{ fontSize: 16 }} />,
      value: "fresher",
    },
    { label: "MNCs", icon: <Verified sx={{ fontSize: 16 }} />, value: "mnc" },
    {
      label: "Walk-in",
      icon: <People sx={{ fontSize: 16 }} />,
      value: "walkin",
    },
    {
      label: "Urgent",
      icon: <FlashOn sx={{ fontSize: 16 }} />,
      value: "urgent",
    },
  ];

  const experienceOptions = [
    "Fresher",
    "0-1 years",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10+ years",
  ];
  const locationOptions = [
    "Bangalore",
    "Mumbai",
    "Delhi NCR",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Remote",
  ];
  const workModeOptions = ["Work from Office", "Remote", "Hybrid"];
  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
  ];
  const postedDateOptions = [
    { label: "Anytime", value: "anytime" },
    { label: "Last 24 hours", value: "1day" },
    { label: "Last 3 days", value: "3days" },
    { label: "Last 7 days", value: "7days" },
    { label: "Last 15 days", value: "15days" },
    { label: "Last 30 days", value: "30days" },
  ];

  const departmentOptions = [
    "Engineering - Software & QA",
    "Product Management",
    "Data Science & Analytics",
    "Design",
    "Marketing & Communication",
    "Sales & Business Development",
  ];
  const roleOptions = [
    "Software Development",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "QA Engineer",
    "DevOps Engineer",
  ];
  const educationOptions = [
    "Any Graduate",
    "B.Tech/B.E.",
    "M.Tech",
    "MCA",
    "MBA/PGDM",
    "PhD/Doctorate",
  ];
  const industryOptions = [
    "IT Services & Consulting",
    "Software Product",
    "Fintech / Financial Services",
    "E-commerce",
    "Banking",
    "Automotive",
  ];
  const topCompaniesOptions = [
    "Google",
    "Amazon",
    "Microsoft",
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Flipkart",
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
          placeholder="Search filters..."
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

      {/* Experience Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("experience")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.experience ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Experience
          </Typography>
          {expandedSections.experience ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.experience}>
          <FormGroup>
            {experienceOptions.map((exp) => (
              <FormControlLabel
                key={exp}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.experience.includes(exp)}
                    onChange={() => handleFilterChange("experience", exp)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{exp}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Salary Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("salary")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.salary ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Salary (LPA)
          </Typography>
          {expandedSections.salary ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.salary}>
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.salary}
              onChange={(e, newValue) =>
                setFilters((prev) => ({ ...prev, salary: newValue }))
              }
              valueLabelDisplay="auto"
              min={0}
              max={100}
              valueLabelFormat={(value) => `₹${value}L`}
              sx={{
                color: colors.primary,
                "& .MuiSlider-thumb": { width: 20, height: 20 },
                "& .MuiSlider-valueLabel": { bgcolor: colors.primary },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                ₹{filters.salary[0]}L
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ₹{filters.salary[1]}L+
              </Typography>
            </Box>
          </Box>
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

      {/* Work Mode Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("workMode")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.workMode ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Work Mode
          </Typography>
          {expandedSections.workMode ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.workMode}>
          <FormGroup>
            {workModeOptions.map((mode) => (
              <FormControlLabel
                key={mode}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.workMode.includes(mode)}
                    onChange={() => handleFilterChange("workMode", mode)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{mode}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Job Type Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("jobType")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.jobType ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Job Type
          </Typography>
          {expandedSections.jobType ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.jobType}>
          <FormGroup>
            {jobTypeOptions.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.jobType.includes(type)}
                    onChange={() => handleFilterChange("jobType", type)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{type}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Posted Date Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("postedDate")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.postedDate ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Date Posted
          </Typography>
          {expandedSections.postedDate ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.postedDate}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.postedDate}
              onChange={(e) => handleFilterChange("postedDate", e.target.value)}
              sx={{ borderRadius: "6px", fontSize: "14px" }}
            >
              {postedDateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Collapse>
      </FilterSection>

      {/* Department Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("department")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.department ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Department
          </Typography>
          {expandedSections.department ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.department}>
          <FormGroup>
            {departmentOptions.map((dept) => (
              <FormControlLabel
                key={dept}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.department.includes(dept)}
                    onChange={() => handleFilterChange("department", dept)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{dept}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Role Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("role")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.role ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Role
          </Typography>
          {expandedSections.role ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.role}>
          <FormGroup>
            {roleOptions.map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.role.includes(role)}
                    onChange={() => handleFilterChange("role", role)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{role}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Education Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("education")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.education ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Education
          </Typography>
          {expandedSections.education ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.education}>
          <FormGroup>
            {educationOptions.map((edu) => (
              <FormControlLabel
                key={edu}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.education.includes(edu)}
                    onChange={() => handleFilterChange("education", edu)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{edu}</Typography>}
                sx={{ mb: 0.5 }}
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
                key={ind}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.industry.includes(ind)}
                    onChange={() => handleFilterChange("industry", ind)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{ind}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>

      {/* Top Companies Filter */}
      <FilterSection>
        <Box
          onClick={() => toggleSection("topCompanies")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: expandedSections.topCompanies ? 2 : 0,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Top Companies
          </Typography>
          {expandedSections.topCompanies ? (
            <KeyboardArrowUp sx={{ color: "#6b7280" }} />
          ) : (
            <KeyboardArrowDown sx={{ color: "#6b7280" }} />
          )}
        </Box>
        <Collapse in={expandedSections.topCompanies}>
          <FormGroup>
            {topCompaniesOptions.map((company) => (
              <FormControlLabel
                key={company}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.topCompanies.includes(company)}
                    onChange={() => handleFilterChange("topCompanies", company)}
                    sx={{
                      color: "#d1d5db",
                      "&.Mui-checked": { color: colors.primary },
                    }}
                  />
                }
                label={<Typography variant="body2">{company}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </Collapse>
      </FilterSection>
    </Box>
  );

  const renderJobCard = (job, index) => (
    <Grid
      item
      xs={12}
      sm={viewMode === "grid" ? 6 : 12}
      lg={viewMode === "grid" ? 4 : 12}
      key={job._id || index}
    >
      <JobCard
        $viewMode={viewMode}
        onClick={() => {
          setSelectedJob(job);
          setJobDetailOpen(true);
        }}
      >
        {index < 3 && (
          <Chip
            icon={
              <LocalFireDepartment
                sx={{ fontSize: 14, color: "#fff !important" }}
              />
            }
            label="Hot"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: colors.danger,
              color: "#fff",
              fontWeight: 600,
              fontSize: "11px",
            }}
          />
        )}
        {viewMode === "list" ? (
          // List View - Optimized Hybrid Design
          <Box
            sx={{
              display: "flex",
              width: "100%",
              p: 2.5,
              position: "relative",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
              {/* Header: Title & Company Info */}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    mb: 0.5,
                    color: "#111827",
                  }}
                >
                  {job.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", fontWeight: 500 }}
                  >
                    {job.company}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      pl: 1,
                      borderLeft: "1px solid #e5e7eb",
                    }}
                  >
                    <Star sx={{ fontSize: 14, color: "#fbbf24" }} />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#374151" }}
                    >
                      {job.rating || "4.2"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      (4841 Reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Meta Info Row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  mb: 2,
                  flexWrap: "wrap",
                  color: "#4b5563",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <WorkOutline sx={{ fontSize: 18, color: "#6b7280" }} />
                  <Typography variant="body2">{job.experience}</Typography>
                </Box>
                <Typography sx={{ color: "#d1d5db" }}>|</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CurrencyRupee sx={{ fontSize: 18, color: "#6b7280" }} />
                  <Typography variant="body2">{job.salary}</Typography>
                </Box>
                <Typography sx={{ color: "#d1d5db" }}>|</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 18, color: "#6b7280" }} />
                  <Typography variant="body2">{job.location}</Typography>
                </Box>
                <Typography sx={{ color: "#d1d5db" }}>|</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <People sx={{ fontSize: 18, color: "#6b7280" }} />
                  <Typography variant="body2">
                    {job.vacancy} Vacancies
                  </Typography>
                </Box>
              </Box>

              {/* Skills Text List */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Description sx={{ fontSize: 16, color: "#6b7280", mr: 0.5 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#4b5563", fontSize: "0.85rem" }}
                >
                  {(job.skills || []).join(" • ")}
                </Typography>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {job.postedAt}
                </Typography>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(job);
                  }}
                  variant={appliedJobs.has(job._id) ? "outlined" : "contained"}
                  disabled={appliedJobs.has(job._id)}
                  size="small"
                  sx={{
                    ml: 2,
                    textTransform: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                  }}
                >
                  {appliedJobs.has(job._id) ? "Applied" : "Apply"}
                </Button>

                <Button
                  onClick={(e) => toggleSaveJob(e, job._id)}
                  startIcon={
                    savedJobs.includes(job._id) ? (
                      <Bookmark />
                    ) : (
                      <BookmarkBorder />
                    )
                  }
                  size="small"
                  sx={{
                    color: savedJobs.includes(job._id)
                      ? colors.primary
                      : "#6b7280",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "transparent",
                      color: colors.primary,
                    },
                  }}
                >
                  Save
                </Button>
              </Box>
            </Box>

            {/* Company Logo - Right Side */}
            <Box>
              <Avatar
                variant="rounded"
                src={job.logo} // Assuming logo URL is in job object, fallback below
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "#fff",
                  border: "1px solid #e5e7eb",
                  color: colors.primary,
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                {(job.company || "C").charAt(0)}
              </Avatar>
            </Box>
          </Box>
        ) : (
          // Grid View
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Avatar
                className="company-logo"
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: colors.primary,
                  fontSize: "20px",
                  fontWeight: 700,
                  transition: "transform 0.3s",
                }}
              >
                {(job.company || "C").charAt(0)}
              </Avatar>
              <IconButton
                onClick={(e) => toggleSaveJob(e, job._id)}
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
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}
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
              <Typography variant="body2">{job.location}</Typography>
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
              <People sx={{ fontSize: 16 }} />
              <Typography variant="body2">{job.vacancy} Vacancies</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              {(job.skills || []).slice(0, 3).map((skill, i) => (
                <Chip
                  key={i}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "10px", height: 22 }}
                />
              ))}
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#22c55e", fontWeight: 600 }}
              >
                {job.salary}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {job.postedAt}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(job);
                }}
                disabled={appliedJobs.has(job._id)}
                variant={appliedJobs.has(job._id) ? "outlined" : "contained"}
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "6px",
                  color: appliedJobs.has(job._id) ? "success.main" : "white",
                  borderColor: appliedJobs.has(job._id)
                    ? "success.main"
                    : "transparent",
                }}
              >
                {appliedJobs.has(job._id) ? "Applied" : "Apply Now"}
              </Button>
            </Box>
          </CardContent>
        )}
      </JobCard>
    </Grid>
  );

  const displayJobs = useMemo(() => {
    return jobs;
  }, [jobs]);

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
              mb: 0.5,
              fontFamily: fonts.heading,
              fontSize: {
                xs: "1.25rem",
                sm: "1.5rem",
                md: "1.75rem",
                lg: "2rem",
              },
              letterSpacing: "-0.02em",
            }}
          >
            {searchQuery ? `${searchQuery} Jobs` : "All Jobs"}
            {locationQuery && ` in ${locationQuery}`}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: { xs: 1.5, md: 2 },
              fontFamily: fonts.body,
              fontSize: { xs: "0.875rem", sm: "0.95rem", md: "1rem" },
            }}
          >
            {displayJobs.length.toLocaleString()}+ jobs found
          </Typography>

          {/* Quick Filters */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: { xs: "nowrap", md: "wrap" },
              overflowX: { xs: "auto", md: "visible" },
              pb: { xs: 1, md: 0 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {quickFilters.map((filter) => {
              // Determine category and correct value based on filter type
              let category = "jobType";
              let value = filter.value;

              if (filter.value === "remote") {
                category = "workMode";
                value = "Remote";
              } else if (filter.value === "fresher") {
                category = "experience";
                value = "Fresher";
              } else if (filter.value === "mnc") {
                category = "company"; // Assuming we treat MNC as a company tag for now
              }

              const isSelected = Array.isArray(filters[category])
                ? filters[category].includes(value)
                : filters[category] === value;

              return (
                <QuickFilterChip
                  key={filter.value}
                  icon={filter.icon}
                  label={filter.label}
                  selected={isSelected}
                  onClick={() => handleFilterChange(category, value)}
                />
              );
            })}
          </Box>
        </Container>
      </PageHeader>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 3, md: 4 },
          mt: { xs: -4, sm: -5, md: -6 },
          px: { xs: 1.5, sm: 2, md: 4, lg: 6 },
        }}
      >
        <Grid container spacing={3}>
          {/* Filters - Desktop */}
          {!isMobile && (
            <Grid item md={3} lg={2.5}>
              <FilterCard>{renderFilters()}</FilterCard>
            </Grid>
          )}

          {/* Jobs List */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* Toolbar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: { xs: 2, md: 3 },
                flexWrap: "wrap",
                gap: { xs: 1.5, md: 2 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, md: 2 },
                }}
              >
                {isMobile && (
                  <Box sx={{ position: "relative" }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={() => setMobileFiltersOpen(true)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "8px",
                        fontSize: { xs: "14px", sm: "15px" },
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 1, sm: 1.25 },
                        borderColor: "#d1d5db",
                        color: "#374151",
                        bgcolor: "white",
                        "&:hover": {
                          borderColor: colors.primary,
                          bgcolor: "rgba(99, 102, 241, 0.04)",
                        },
                      }}
                    >
                      Filters
                    </Button>
                    {activeFiltersCount > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: colors.primary,
                          color: "#fff",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          border: "2px solid white",
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
                  sx={{ minWidth: { xs: 120, sm: 140 } }}
                >
                  <Select
                    defaultValue="relevance"
                    sx={{
                      borderRadius: "8px",
                      fontSize: { xs: "13px", sm: "14px" },
                      bgcolor: "#fff",
                      height: { xs: "40px", sm: "auto" },
                    }}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="date">Date Posted</MenuItem>
                    <MenuItem value="salary">Salary</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  bgcolor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  display: { xs: "none", sm: "flex" },
                  "& .MuiToggleButton-root": {
                    border: "none",
                    borderRadius: "6px",
                    mx: 0.5,
                    my: 0.5,
                    color: "#6b7280",
                    transition: "all 0.2s ease",
                    "& .MuiSvgIcon-root": {
                      fontSize: "26px !important",
                      width: "26px !important",
                      height: "26px !important",
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
                <ToggleButton value="list" sx={{ px: 2 }}>
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="grid" sx={{ px: 2 }}>
                  <ViewModule />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Jobs Grid */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid
                    item
                    xs={12}
                    sm={viewMode === "grid" ? 6 : 12}
                    lg={viewMode === "grid" ? 4 : 12}
                    key={i}
                  >
                    <Card sx={{ p: 3, borderRadius: "6px" }}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Skeleton variant="circular" width={60} height={60} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={28} />
                          <Skeleton variant="text" width="40%" height={20} />
                          <Skeleton
                            variant="text"
                            width="80%"
                            height={20}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <>
                <Grid container spacing={3}>
                  {displayJobs.map((job, index) => renderJobCard(job, index))}
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

      {/* Mobile Filters Drawer - Bottom Sheet */}
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
        <Box
          sx={{
            bgcolor: "white",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          {/* Handle bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 1.5,
              pb: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: "#d1d5db",
                borderRadius: 2,
              }}
            />
          </Box>

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
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "18px", color: "#111827" }}
            >
              Filter jobs
            </Typography>
            {activeFiltersCount > 0 && (
              <Button
                onClick={clearAllFilters}
                sx={{
                  textTransform: "none",
                  color: colors.primary,
                  fontWeight: 600,
                  fontSize: "14px",
                  p: 0,
                  minWidth: "auto",
                }}
              >
                Clear all
              </Button>
            )}
          </Box>
        </Box>

        {/* Filter Content */}
        <Box
          sx={{
            overflowY: "auto",
            maxHeight: "calc(85vh - 140px)",
            bgcolor: "white",
          }}
        >
          {renderFilters()}
        </Box>

        {/* Bottom Actions */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: "white",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setMobileFiltersOpen(false)}
            sx={{
              height: 48,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              fontSize: "15px",
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: "#f9fafb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setMobileFiltersOpen(false);
              fetchJobs();
            }}
            sx={{
              height: 48,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              fontSize: "15px",
              bgcolor: colors.primary,
              "&:hover": {
                bgcolor: colors.primaryDark,
              },
            }}
          >
            Apply
          </Button>
        </Box>
      </Drawer>

      <JobDetailsDrawer
        open={jobDetailOpen}
        onClose={() => setJobDetailOpen(false)}
        job={selectedJob}
        onApply={handleApply}
        onSave={() => toggleSaveJob(null, selectedJob?._id)}
        isSaved={selectedJob && savedJobs.includes(selectedJob._id)}
      />

      {/* Authentication Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      {/* Job Application Modal */}
      <JobApplicationModal
        open={applicationModalOpen}
        onClose={() => {
          setApplicationModalOpen(false);
          setSelectedJobForApplication(null);
        }}
        job={selectedJobForApplication}
        user={user}
        onSubmit={handleSubmitApplication}
        loading={applicationLoading}
      />
    </Box>
  );
};

export default JobsPageNaukri;
