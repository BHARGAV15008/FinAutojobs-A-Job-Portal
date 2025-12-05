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
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import API_BASE_URL from "../services/apiConfig";

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

const JobCard = styled(Card)(({ viewMode }) => ({
  borderRadius: "16px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid transparent",
  cursor: "pointer",
  animation: `${fadeIn} 0.5s ease`,
  display: viewMode === "grid" ? "block" : "flex",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(99, 102, 241, 0.15)",
    borderColor: "#6366f1",
    "& .company-logo": { transform: "scale(1.1)" },
  },
}));

const QuickFilterChip = styled(Chip)(({ selected }) => ({
  fontWeight: 500,
  borderRadius: "10px",
  transition: "all 0.2s",
  cursor: "pointer",
  backgroundColor: selected ? "#6366f1" : "#f3f4f6",
  color: selected ? "#fff" : "#374151",
  border: selected ? "none" : "1px solid transparent",
  "&:hover": {
    backgroundColor: selected ? "#4f46e5" : "#e5e7eb",
    transform: "translateY(-2px)",
  },
}));

const ActiveFilterBadge = styled(Badge)(() => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#ef4444",
    color: "#fff",
    fontWeight: 700,
    fontSize: 10,
    minWidth: 18,
    height: 18,
  },
}));

const JobsPageNaukri = () => {
  const [location] = useLocation();
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

  // Filters State
  const [filters, setFilters] = useState({
    experience: [],
    salary: [0, 100],
    location: [],
    workMode: [],
    jobType: [],
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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      if (searchQuery) params.append("search", searchQuery);
      if (locationQuery) params.append("location", locationQuery);

      const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || data || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || 20) / 12));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
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
      experience: [],
      salary: [0, 100],
      location: [],
      workMode: [],
      jobType: [],
      postedDate: "anytime",
      company: [],
      skills: [],
    });
    setPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count += value.length;
      else if (key === "postedDate" && value !== "anytime") count += 1;
      else if (key === "salary" && (value[0] > 0 || value[1] < 100)) count += 1;
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
            sx: { borderRadius: "10px", fontSize: "14px" },
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
                      "&.Mui-checked": { color: "#6366f1" },
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
                color: "#6366f1",
                "& .MuiSlider-thumb": { width: 20, height: 20 },
                "& .MuiSlider-valueLabel": { bgcolor: "#6366f1" },
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
                      "&.Mui-checked": { color: "#6366f1" },
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
                      "&.Mui-checked": { color: "#6366f1" },
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
                      "&.Mui-checked": { color: "#6366f1" },
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
              sx={{ borderRadius: "10px", fontSize: "14px" }}
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
      <Link href={`/jobs/${job._id}`}>
        <JobCard viewMode={viewMode}>
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
                bgcolor: "#ef4444",
                color: "#fff",
                fontWeight: 600,
                fontSize: "11px",
              }}
            />
          )}
          {viewMode === "list" ? (
            // List View
            <Box sx={{ display: "flex", width: "100%", p: 2.5 }}>
              <Avatar
                className="company-logo"
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "#6366f1",
                  fontSize: "22px",
                  fontWeight: 700,
                  transition: "transform 0.3s",
                  mr: 2.5,
                }}
              >
                {(job.company || "C").charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.5 }}
                    >
                      {job.title || "Software Engineer"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", fontWeight: 500 }}
                      >
                        {job.company || "Tech Company"}
                      </Typography>
                      {job.verified && (
                        <Verified sx={{ fontSize: 16, color: "#22c55e" }} />
                      )}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Star sx={{ fontSize: 14, color: "#fbbf24" }} />
                        <Typography variant="caption" color="text.secondary">
                          {job.rating || "4.2"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={(e) => toggleSaveJob(e, job._id)}
                    size="small"
                  >
                    {savedJobs.includes(job._id) ? (
                      <Bookmark sx={{ color: "#6366f1" }} />
                    ) : (
                      <BookmarkBorder sx={{ color: "#9ca3af" }} />
                    )}
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    mb: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#6b7280",
                    }}
                  >
                    <WorkOutline sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {job.experience || "2-5 years"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#6b7280",
                    }}
                  >
                    <CurrencyRupee sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {job.salary || "Not disclosed"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#6b7280",
                    }}
                  >
                    <LocationOn sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {job.location || "Bangalore"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {(job.skills || ["React", "Node.js", "MongoDB"])
                    .slice(0, 5)
                    .map((skill, i) => (
                      <Chip
                        key={i}
                        label={skill}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "11px",
                          height: 24,
                          borderRadius: "6px",
                        }}
                      />
                    ))}
                  {(job.skills || []).length > 5 && (
                    <Chip
                      label={`+${job.skills.length - 5}`}
                      size="small"
                      sx={{ fontSize: "11px", height: 24, bgcolor: "#f3f4f6" }}
                    />
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Schedule sx={{ fontSize: 14, color: "#9ca3af" }} />
                      <Typography variant="caption" color="text.secondary">
                        {job.postedAt || "2 days ago"}
                      </Typography>
                    </Box>
                    {job.applicants && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <People sx={{ fontSize: 14, color: "#9ca3af" }} />
                        <Typography variant="caption" color="text.secondary">
                          {job.applicants} applicants
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      px: 3,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      },
                    }}
                  >
                    Apply Now
                  </Button>
                </Box>
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
                    bgcolor: "#6366f1",
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
                    <Bookmark sx={{ color: "#6366f1" }} />
                  ) : (
                    <BookmarkBorder sx={{ color: "#9ca3af" }} />
                  )}
                </IconButton>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", fontWeight: 500, mb: 0.5 }}
              >
                {job.company || "Company"}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}
              >
                {job.title || "Job Title"}
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
                  {job.location || "Location"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {(job.skills || ["React", "Node.js"])
                  .slice(0, 3)
                  .map((skill, i) => (
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
                  ₹{job.salary || "15-25 LPA"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {job.postedAt || "2d ago"}
                </Typography>
              </Box>
            </CardContent>
          )}
        </JobCard>
      </Link>
    </Grid>
  );

  // Generate mock jobs if API returns empty
  const displayJobs =
    jobs.length > 0
      ? jobs
      : Array.from({ length: 12 }, (_, i) => ({
          _id: `mock-${i}`,
          title: [
            "Senior Software Engineer",
            "Product Manager",
            "Data Scientist",
            "UX Designer",
            "DevOps Engineer",
            "Full Stack Developer",
          ][i % 6],
          company: [
            "Google",
            "Amazon",
            "Microsoft",
            "Meta",
            "Apple",
            "Netflix",
          ][i % 6],
          location: ["Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Remote"][
            i % 5
          ],
          salary: [
            "15-25 LPA",
            "20-30 LPA",
            "25-40 LPA",
            "18-28 LPA",
            "30-50 LPA",
          ][i % 5],
          experience: ["2-5 years", "3-7 years", "5-10 years", "0-2 years"][
            i % 4
          ],
          skills: [
            ["React", "Node.js", "TypeScript"],
            ["Strategy", "Analytics", "Leadership"],
            ["Python", "ML", "TensorFlow"],
            ["Figma", "UI/UX", "Research"],
          ][i % 4],
          postedAt: [
            "Just now",
            "1 day ago",
            "2 days ago",
            "3 days ago",
            "1 week ago",
          ][i % 5],
          verified: i % 2 === 0,
          rating: (4 + Math.random() * 0.5).toFixed(1),
          applicants: Math.floor(Math.random() * 200) + 50,
        }));

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <PageHeader>
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#fff", mb: 1 }}
          >
            {searchQuery ? `${searchQuery} Jobs` : "All Jobs"}
            {locationQuery && ` in ${locationQuery}`}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}
          >
            {displayJobs.length.toLocaleString()}+ jobs found
          </Typography>

          {/* Quick Filters */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {quickFilters.map((filter) => (
              <QuickFilterChip
                key={filter.value}
                icon={filter.icon}
                label={filter.label}
                selected={
                  filters.workMode.includes(filter.value) ||
                  filters.experience.includes(filter.value)
                }
                onClick={() => handleFilterChange("workMode", filter.value)}
              />
            ))}
          </Box>
        </Container>
      </PageHeader>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4, mt: -6 }}>
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
                      <ActiveFilterBadge badgeContent={activeFiltersCount}>
                        <FilterList />
                      </ActiveFilterBadge>
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
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    defaultValue="relevance"
                    sx={{
                      borderRadius: "10px",
                      fontSize: "14px",
                      bgcolor: "#fff",
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
                sx={{ bgcolor: "#fff", borderRadius: "10px" }}
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
                    <Card sx={{ p: 3, borderRadius: "16px" }}>
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
                          background:
                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
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
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default JobsPageNaukri;
