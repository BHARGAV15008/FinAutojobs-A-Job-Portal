import React, { useState, useEffect } from "react";
import ViewCandidateModal from "./modals/ViewCandidateModal";
import ContactCandidateModal from "./modals/ContactCandidateModal";
import ScheduleInterviewModal from "./modals/ScheduleInterviewModal";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  School,
  Star,
  Download,
  Schedule,
  CheckCircle,
  Cancel,
  MoreVert,
  Search,
  FilterList,
  Visibility,
  Message,
  ThumbUp,
  ThumbDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  getCandidateDetails,
  sendEmailToCandidate,
  sendMessageToCandidate,
  scheduleInterview,
  updateInterview,
  deleteInterview,
  toggleCandidateShortlist,
  downloadCandidateResume,
} from "../../services/candidateService";

const RecruiterCandidatesTab = ({ data = {}, onDataUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management
  const [candidates, setCandidates] = useState(data.candidates || []);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPerPage] = useState(8);

  // Modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadCandidates();
  }, [data]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      // In a real application, you would fetch candidates from the API here
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Error loading candidates:", error);
      showNotification("Error loading candidates", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCandidateAction = async (action, candidate) => {
    try {
      switch (action) {
        case "view":
          setSelectedCandidate(candidate);
          setViewModalOpen(true);
          break;

        case "contact":
          setSelectedCandidate(candidate);
          setContactModalOpen(true);
          break;

        case "schedule":
          setSelectedCandidate(candidate);
          setScheduleModalOpen(true);
          break;

        case "shortlist":
          const result = await toggleCandidateShortlist(candidate.id);
          if (result.success) {
            setCandidates((prev) =>
              prev.map((c) =>
                c.id === candidate.id
                  ? { ...c, isShortlisted: !c.isShortlisted }
                  : c
              )
            );
            showNotification(
              `Candidate ${
                result.data.isShortlisted
                  ? "shortlisted"
                  : "removed from shortlist"
              }`
            );
          }
          break;

        case "download-resume":
          await downloadCandidateResume(candidate.id, candidate.name, candidate.username);
          showNotification("Resume downloaded successfully");
          break;

        default:
          break;
      }
    } catch (error) {
      showNotification(error.message, "error");
    }
    setAnchorEl(null);
  };

  const handleContactSubmit = async ({ type, data, candidateId }) => {
    try {
      if (type === "email") {
        await sendEmailToCandidate(candidateId, data);
      } else {
        await sendMessageToCandidate(candidateId, data);
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const handleScheduleInterview = async (candidateId, data) => {
    try {
      const result = await scheduleInterview(candidateId, data);
      return { success: true, data: result.data };
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateInterview = async (interviewId, data) => {
    try {
      const result = await updateInterview(interviewId, data);
      return { success: true, data: result.data };
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      await deleteInterview(interviewId);
      showNotification("Interview cancelled successfully");
    } catch (error) {
      showNotification("Failed to cancel interview", "error");
    }
  };

  // Filter and pagination logic
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus =
      filterStatus === "all" || candidate.status === filterStatus;
    const matchesJob = filterJob === "all" || candidate.jobTitle === filterJob;
    const matchesTab =
      activeTab === 0 ||
      (activeTab === 1 && candidate.status === "pending") ||
      (activeTab === 2 && candidate.status === "reviewed") ||
      (activeTab === 3 && candidate.status === "interview") ||
      (activeTab === 4 && candidate.status === "hired") ||
      (activeTab === 5 && candidate.status === "rejected");

    return matchesSearch && matchesStatus && matchesJob && matchesTab;
  });

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  // Component for individual candidate card
  const CandidateCard = ({ candidate }) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending Review" },
      reviewed: { color: "info", label: "Reviewed" },
      interview: { color: "primary", label: "Interview Scheduled" },
      hired: { color: "success", label: "Hired" },
      rejected: { color: "error", label: "Rejected" },
    }[candidate.status];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ height: "100%", position: "relative" }}>
          <CardContent>
            {candidate.isShortlisted && (
              <Chip
                label="Shortlisted"
                color="primary"
                size="small"
                sx={{ position: "absolute", top: 8, right: 8 }}
              />
            )}

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src={candidate.avatar}
                sx={{ width: 48, height: 48, mr: 2 }}
              >
                {candidate.name[0]}
              </Avatar>
              <Box>
                <Typography variant="h6">{candidate.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {candidate.jobTitle}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
              >
                <Work sx={{ fontSize: 16, mr: 1 }} />
                {candidate.experience} • {candidate.currentCompany}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
              >
                <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                {candidate.location}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <School sx={{ fontSize: 16, mr: 1 }} />
                {candidate.education}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {candidate.skills.slice(0, 3).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {candidate.skills.length > 3 && (
                  <Chip
                    label={`+${candidate.skills.length - 3}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Star sx={{ fontSize: 16, color: "warning.main", mr: 0.5 }} />
                <Typography variant="body2">{candidate.rating}/5</Typography>
              </Box>
              <Chip
                label={statusConfig.label}
                color={statusConfig.color}
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                size="small"
                startIcon={<Visibility />}
                onClick={() => handleCandidateAction("view", candidate)}
              >
                View
              </Button>
              <Button
                size="small"
                startIcon={<Email />}
                onClick={() => handleCandidateAction("contact", candidate)}
              >
                Contact
              </Button>
              <Button
                size="small"
                startIcon={<Schedule />}
                onClick={() => handleCandidateAction("schedule", candidate)}
              >
                Schedule
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header and filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Candidate Management
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="interview">Interview</MenuItem>
                  <MenuItem value="hired">Hired</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Job Position</InputLabel>
                <Select
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                  label="Job Position"
                >
                  <MenuItem value="all">All Positions</MenuItem>
                  {/* Add job positions dynamically */}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Candidates grid */}
      {loading ? (
        <Box sx={{ p: 3 }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : paginatedCandidates.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">No candidates found</Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedCandidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={candidate.id}>
                <CandidateCard candidate={candidate} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(filteredCandidates.length / candidatesPerPage)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Modals */}
      <ViewCandidateModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        candidate={selectedCandidate}
      />

      <ContactCandidateModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        candidate={selectedCandidate}
        onSend={handleContactSubmit}
      />

      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        candidate={selectedCandidate}
        interviews={selectedCandidate?.interviews || []}
        onSchedule={handleScheduleInterview}
        onUpdate={handleUpdateInterview}
        onDelete={handleDeleteInterview}
      />

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecruiterCandidatesTab;
