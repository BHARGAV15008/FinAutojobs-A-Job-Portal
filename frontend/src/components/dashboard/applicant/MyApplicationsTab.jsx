import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Work,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  Star,
  Business,
  LocationOn,
  CalendarToday,
  TrendingUp,
  Assessment,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { applicationService } from "../../../services/applicationService";
import { useAuth } from "../../../contexts/AuthContext";

const MyApplicationsTab = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    shortlisted: 0,
    interviewed: 0,
    accepted: 0,
    rejected: 0,
  });

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(
          "🔍 Fetching applications for applicant:",
          user?.userId || user?._id
        );

        const response = await applicationService.getUserApplications(50, 1);
        console.log("✅ Applications fetched:", response);
        console.log("📊 Response structure:", {
          success: response?.success,
          dataKeys: response?.data ? Object.keys(response.data) : "no data",
          applicationsArray:
            response?.data?.applications || "no applications array",
        });

        if (response && response.success) {
          // Handle multiple possible data structures
          let apps = [];

          if (
            response.data?.applications &&
            Array.isArray(response.data.applications)
          ) {
            apps = response.data.applications;
          } else if (Array.isArray(response.data)) {
            apps = response.data;
          } else if (
            response.applications &&
            Array.isArray(response.applications)
          ) {
            apps = response.applications;
          }

          console.log("📝 Processed applications array:", apps);
          console.log("📝 Applications count:", apps.length);

          setApplications(apps);

          // Calculate stats with better status handling
          const newStats = {
            total: apps.length,
            pending: apps.filter((app) => app.status === "pending").length,
            underReview: apps.filter(
              (app) =>
                app.status === "reviewing" || app.status === "under_review"
            ).length,
            shortlisted: apps.filter((app) => app.status === "shortlisted")
              .length,
            interviewed: apps.filter((app) => app.status === "interviewed")
              .length,
            accepted: apps.filter(
              (app) => app.status === "selected" || app.status === "accepted"
            ).length,
            rejected: apps.filter((app) => app.status === "rejected").length,
          };

          console.log("📊 Calculated stats:", newStats);
          setStats(newStats);
        } else {
          console.log("❌ No applications found or invalid response structure");
          setApplications([]);
          setError("No applications found");
        }
      } catch (error) {
        console.error("❌ Error fetching applications:", error);
        setError("Error loading applications: " + error.message);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId || user?._id) {
      fetchApplications();
    }
  }, [user?.userId, user?._id]); // More specific dependencies

  // Withdraw application
  const handleWithdrawApplication = async () => {
    if (!selectedApplication) return;

    if (
      !window.confirm(
        "Are you sure you want to withdraw this application? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setWithdrawing(true);
      // Update application status to withdrawn
      await applicationService.withdrawApplication(selectedApplication._id);

      // Refresh applications list
      const response = await applicationService.getUserApplications(50, 1);
      if (response.success) {
        const apps = response.data?.applications || [];
        setApplications(apps);

        // Recalculate stats
        const newStats = {
          total: apps.length,
          pending: apps.filter((app) => app.status === "pending").length,
          underReview: apps.filter((app) => app.status === "reviewing").length,
          shortlisted: apps.filter((app) => app.status === "shortlisted")
            .length,
          interviewed: apps.filter((app) => app.status === "interviewed")
            .length,
          accepted: apps.filter((app) => app.status === "selected").length,
          rejected: apps.filter((app) => app.status === "rejected").length,
        };
        setStats(newStats);
      }

      setViewDetailsModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error("❌ Error withdrawing application:", error);
      alert("Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      reviewing: "info",
      under_review: "info", // Legacy support
      shortlisted: "primary",
      interviewed: "secondary",
      selected: "success",
      accepted: "success", // Legacy support
      rejected: "error",
      withdrawn: "default",
    };
    return colors[status] || "default";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: <Schedule />,
      reviewing: <Visibility />,
      under_review: <Visibility />, // Legacy support
      shortlisted: <Star />,
      interviewed: <Assessment />,
      selected: <CheckCircle />,
      accepted: <CheckCircle />, // Legacy support
      rejected: <Cancel />,
      withdrawn: <Cancel />,
    };
    return icons[status] || <Schedule />;
  };
  // console.log("Current applications:", applications);
  // // console.log("Current applicantSnapshot:", applications.map(app => app.applicantSnapshot));

  // console.log(
  //   "Current applicantSnapshot:",
  //   applications.applicantSnapshot
  // );
  // Get application progress percentage
  const getProgressPercentage = (status) => {
    const progressMap = {
      pending: 20,
      reviewing: 40,
      under_review: 40, // Legacy support
      shortlisted: 60,
      interviewed: 80,
      selected: 100,
      accepted: 100, // Legacy support
      rejected: 0,
      withdrawn: 0,
    };
    return progressMap[status] || 0;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading your applications...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  console.log("🎨 Rendering MyApplicationsTab - Component State Check:");
  console.log("🎨 Loading:", loading);
  console.log("🎨 Error:", error);
  console.log("🎨 Applications array:", applications);
  console.log("🎨 Applications length:", applications?.length);
  console.log(
    "🎨 Applications type:",
    typeof applications,
    Array.isArray(applications)
  );
  console.log("🎨 Stats:", stats);
  console.log("🎨 First application object:", applications?.[0]);
  console.log("🎨 First application status:", applications?.[0]?.status);
  console.log(
    "🎨 First application jobSnapshot:",
    applications?.[0]?.jobSnapshot
  );
  console.log("🎨 User:", user);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the status of your job applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Work color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Applications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.pending + stats.underReview}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.accepted}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.total > 0
                      ? Math.round(
                          ((stats.shortlisted +
                            stats.interviewed +
                            stats.accepted) /
                            stats.total) *
                            100
                        )
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications List */}
      {!applications ||
      !Array.isArray(applications) ||
      applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Work sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {!applications || !Array.isArray(applications)
              ? "Loading applications..."
              : "No applications yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!applications || !Array.isArray(applications)
              ? "Please wait while we load your applications."
              : "Start applying to jobs to see your applications here."}
          </Typography>
          {applications && Array.isArray(applications) && (
            <Button variant="contained" sx={{ mt: 2 }} href="/jobs">
              Browse Jobs
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application, index) => (
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={application._id || application.id || index}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  sx={{ height: "100%", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedApplication(application);
                    setViewDetailsModal(true);
                  }}
                >
                  <CardContent>
                    {/* Job Title and Company */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {application?.jobSnapshot?.title ||
                          application?.job?.title ||
                          application?.jobId?.title ||
                          "Unknown Position"}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <Business
                          sx={{
                            fontSize: 16,
                            mr: 1,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {application?.jobSnapshot?.company ||
                            application?.job?.company ||
                            application?.jobId?.company ||
                            "Unknown Company"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <CalendarToday
                          sx={{
                            fontSize: 16,
                            mr: 1,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Applied{" "}
                          {application?.appliedAt
                            ? new Date(
                                application.appliedAt
                              ).toLocaleDateString()
                            : application?.createdAt
                            ? new Date(
                                application.createdAt
                              ).toLocaleDateString()
                            : "Date not available"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={getStatusIcon(application?.status || "pending")}
                        label={(application?.status || "pending")
                          ?.replace("_", " ")
                          .toUpperCase()}
                        color={getStatusColor(application?.status || "pending")}
                        size="small"
                        sx={{ mb: 1 }}
                      />

                      {/* Progress Bar */}
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Application Progress
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressPercentage(
                            application?.status || "pending"
                          )}
                          color={getStatusColor(
                            application?.status || "pending"
                          )}
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>

                    {/* Application Details */}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Experience:</strong>{" "}
                        {(() => {
                          // Debug: Log the application structure
                          if (window.location.hostname === "localhost") {
                            console.log(
                              "🔍 Application structure for experience:",
                              {
                                applicationInfo: application.applicationInfo,
                                applicantSnapshot:
                                  application.applicantSnapshot,
                                applicationData: application.applicationData,
                                experience: application.experience,
                                workExperience: application.workExperience,
                              }
                            );
                          }

                          // Try multiple data sources in priority order
                          let experienceText = null;

                          // Method 1: applicationInfo with detailed structure
                          if (application.applicationInfo?.experience) {
                            const exp = application.applicationInfo.experience;
                            if (exp.rawExperienceText)
                              experienceText = exp.rawExperienceText;
                            else if (exp.totalYears)
                              experienceText = `${exp.totalYears} years`;
                            else if (exp.yearsOfExperience)
                              experienceText = `${exp.yearsOfExperience} years`;
                          }

                          // Method 2: Direct experience field
                          if (!experienceText && application.experience) {
                            experienceText = application.experience;
                          }

                          // Method 3: Applicant snapshot
                          if (
                            !experienceText &&
                            application.applicantSnapshot?.experience
                          ) {
                            experienceText =
                              application.applicantSnapshot.experience;
                          }

                          // Method 4: Application data
                          if (
                            !experienceText &&
                            application.applicationData?.experience
                          ) {
                            experienceText =
                              application.applicationData.experience;
                          }

                          // Method 5: Check for workExperience array and calculate
                          if (
                            !experienceText &&
                            application.workExperience &&
                            Array.isArray(application.workExperience)
                          ) {
                            const totalExp = application.workExperience.length;
                            if (totalExp > 0)
                              experienceText = `${totalExp}+ years`;
                          }

                          // Method 6: Check applicationInfo workExperience
                          if (
                            !experienceText &&
                            application.applicationInfo?.workExperience &&
                            Array.isArray(
                              application.applicationInfo.workExperience
                            )
                          ) {
                            const totalExp =
                              application.applicationInfo.workExperience.length;
                            if (totalExp > 0)
                              experienceText = `${totalExp}+ years`;
                          }

                          return experienceText || "Not specified";
                        })()}
                      </Typography>
                      {(() => {
                        // Enhanced current job title extraction
                        let currentJob = null;

                        // Method 1: applicationInfo nested structure
                        if (
                          application.applicationInfo?.experience?.currentJob
                            ?.jobTitle
                        ) {
                          currentJob =
                            application.applicationInfo.experience.currentJob
                              .jobTitle;
                        }

                        // Method 2: applicationInfo direct field
                        if (
                          !currentJob &&
                          application.applicationInfo?.currentJobTitle
                        ) {
                          currentJob =
                            application.applicationInfo.currentJobTitle;
                        }

                        // Method 3: Direct field on application
                        if (!currentJob && application.currentJobTitle) {
                          currentJob = application.currentJobTitle;
                        }

                        // Method 4: Applicant snapshot
                        if (
                          !currentJob &&
                          application.applicantSnapshot?.currentJobTitle
                        ) {
                          currentJob =
                            application.applicantSnapshot.currentJobTitle;
                        }

                        // Method 5: Application data
                        if (
                          !currentJob &&
                          application.applicationData?.currentJobTitle
                        ) {
                          currentJob =
                            application.applicationData.currentJobTitle;
                        }

                        // Method 6: Get from latest work experience
                        if (
                          !currentJob &&
                          application.workExperience &&
                          Array.isArray(application.workExperience) &&
                          application.workExperience.length > 0
                        ) {
                          const latestJob = application.workExperience[0]; // Assuming first is latest
                          currentJob =
                            latestJob.jobTitle ||
                            latestJob.position ||
                            latestJob.role;
                        }

                        // Method 7: Get from applicationInfo workExperience
                        if (
                          !currentJob &&
                          application.applicationInfo?.workExperience &&
                          Array.isArray(
                            application.applicationInfo.workExperience
                          ) &&
                          application.applicationInfo.workExperience.length > 0
                        ) {
                          const latestJob =
                            application.applicationInfo.workExperience[0];
                          currentJob =
                            latestJob.jobTitle ||
                            latestJob.position ||
                            latestJob.role;
                        }

                        return currentJob &&
                          currentJob !== "NA" &&
                          currentJob !== "" ? (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Current Role:</strong> {currentJob}
                          </Typography>
                        ) : null;
                      })()}
                    </Box>

                    {/* Recruiter Notes */}
                    {application.recruiterNotes && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Recruiter Notes:
                        </Typography>
                        <Typography variant="body2">
                          {application.recruiterNotes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}{" "}
        </Grid>
      )}

      {/* Application Details Modal */}
      <Dialog
        open={viewDetailsModal}
        onClose={() => setViewDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              {/* Job Information */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      <strong>Position:</strong>{" "}
                      {selectedApplication.jobSnapshot?.title}
                    </Typography>
                    <Typography>
                      <strong>Company:</strong>{" "}
                      {selectedApplication.jobSnapshot?.company}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      <strong>Applied:</strong>{" "}
                      {new Date(
                        selectedApplication.appliedAt
                      ).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Typography>
                        <strong>Status:</strong>
                      </Typography>
                      <Chip
                        icon={getStatusIcon(selectedApplication.status)}
                        label={selectedApplication.status
                          ?.replace("_", " ")
                          .toUpperCase()}
                        color={getStatusColor(selectedApplication.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Application Timeline */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Application Timeline
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {/* Application Submitted */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        mr: 2,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <Work sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        Application Submitted
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(
                          selectedApplication.appliedAt
                        ).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Current Status */}
                  {selectedApplication.status !== "pending" && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${getStatusColor(
                            selectedApplication.status
                          )}.main`,
                          mr: 2,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {React.cloneElement(
                          getStatusIcon(selectedApplication.status),
                          { sx: { fontSize: 16 } }
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          Status:{" "}
                          {selectedApplication.status
                            ?.replace("_", " ")
                            .toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(
                            selectedApplication.updatedAt
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Your Application Data */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Your Application
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      <strong>Experience:</strong>{" "}
                      {(() => {
                        // Debug logging for modal
                        if (window.location.hostname === "localhost") {
                          console.log(
                            "🔍 Modal - Full application object:",
                            selectedApplication
                          );
                          console.log(
                            "🔍 Modal - ApplicationInfo:",
                            selectedApplication.applicationInfo
                          );
                          console.log(
                            "🔍 Modal - ApplicantSnapshot:",
                            selectedApplication.applicantSnapshot
                          );
                          console.log(
                            "🔍 Modal - Experience field:",
                            selectedApplication.experience
                          );
                        }

                        let experienceText = null;

                        // Try applicationInfo first (most detailed)
                        if (selectedApplication.applicationInfo?.experience) {
                          const exp =
                            selectedApplication.applicationInfo.experience;
                          if (exp.rawExperienceText)
                            experienceText = exp.rawExperienceText;
                          else if (exp.totalYears)
                            experienceText = `${exp.totalYears} years`;
                          else if (exp.yearsOfExperience)
                            experienceText = `${exp.yearsOfExperience} years`;
                        }

                        // Try direct experience field
                        if (!experienceText && selectedApplication.experience) {
                          experienceText = selectedApplication.experience;
                        }

                        // Try applicant snapshot
                        if (
                          !experienceText &&
                          selectedApplication.applicantSnapshot?.experience
                        ) {
                          experienceText =
                            selectedApplication.applicantSnapshot.experience;
                        }

                        // Try application data
                        if (
                          !experienceText &&
                          selectedApplication.applicationData?.experience
                        ) {
                          experienceText =
                            selectedApplication.applicationData.experience;
                        }

                        // Calculate from work experience array
                        if (
                          !experienceText &&
                          selectedApplication.workExperience &&
                          Array.isArray(selectedApplication.workExperience)
                        ) {
                          const totalExp =
                            selectedApplication.workExperience.length;
                          if (totalExp > 0)
                            experienceText = `${totalExp}+ years`;
                        }

                        // Calculate from applicationInfo work experience
                        if (
                          !experienceText &&
                          selectedApplication.applicationInfo?.workExperience &&
                          Array.isArray(
                            selectedApplication.applicationInfo.workExperience
                          )
                        ) {
                          const totalExp =
                            selectedApplication.applicationInfo.workExperience
                              .length;
                          if (totalExp > 0)
                            experienceText = `${totalExp}+ years`;
                        }

                        return experienceText || "Not specified";
                      })()}
                    </Typography>
                    <Typography>
                      <strong>Current Job:</strong>{" "}
                      {(() => {
                        let job = null;

                        // Try applicationInfo nested structure first
                        if (
                          selectedApplication.applicationInfo?.experience
                            ?.currentJob?.jobTitle
                        ) {
                          job =
                            selectedApplication.applicationInfo.experience
                              .currentJob.jobTitle;
                        }

                        // Try direct applicationInfo field
                        if (
                          !job &&
                          selectedApplication.applicationInfo?.currentJobTitle
                        ) {
                          job =
                            selectedApplication.applicationInfo.currentJobTitle;
                        }

                        // Try direct application field
                        if (!job && selectedApplication.currentJobTitle) {
                          job = selectedApplication.currentJobTitle;
                        }

                        // Try applicant snapshot
                        if (
                          !job &&
                          selectedApplication.applicantSnapshot?.currentJobTitle
                        ) {
                          job =
                            selectedApplication.applicantSnapshot
                              .currentJobTitle;
                        }

                        // Try application data
                        if (
                          !job &&
                          selectedApplication.applicationData?.currentJobTitle
                        ) {
                          job =
                            selectedApplication.applicationData.currentJobTitle;
                        }

                        // Try to get from work experience array (latest/current job)
                        if (
                          !job &&
                          selectedApplication.workExperience &&
                          Array.isArray(selectedApplication.workExperience) &&
                          selectedApplication.workExperience.length > 0
                        ) {
                          const currentJobData =
                            selectedApplication.workExperience.find(
                              (exp) => exp.isCurrent
                            ) || selectedApplication.workExperience[0];
                          job =
                            currentJobData?.jobTitle ||
                            currentJobData?.position ||
                            currentJobData?.role;
                        }

                        // Try applicationInfo work experience
                        if (
                          !job &&
                          selectedApplication.applicationInfo?.workExperience &&
                          Array.isArray(
                            selectedApplication.applicationInfo.workExperience
                          ) &&
                          selectedApplication.applicationInfo.workExperience
                            .length > 0
                        ) {
                          const currentJobData =
                            selectedApplication.applicationInfo.workExperience.find(
                              (exp) => exp.isCurrent
                            ) ||
                            selectedApplication.applicationInfo
                              .workExperience[0];
                          job =
                            currentJobData?.jobTitle ||
                            currentJobData?.position ||
                            currentJobData?.role;
                        }

                        return job && job !== "NA" && job !== ""
                          ? job
                          : "Not specified";
                      })()}
                    </Typography>
                    <Typography>
                      <strong>Current Company:</strong>{" "}
                      {(() => {
                        let company = null;

                        // Try applicationInfo nested structure
                        if (
                          selectedApplication.applicationInfo?.experience
                            ?.currentJob?.companyName
                        ) {
                          company =
                            selectedApplication.applicationInfo.experience
                              .currentJob.companyName;
                        }

                        // Try direct applicationInfo field
                        if (
                          !company &&
                          selectedApplication.applicationInfo?.currentCompany
                        ) {
                          company =
                            selectedApplication.applicationInfo.currentCompany;
                        }

                        // Try direct application field
                        if (!company && selectedApplication.currentCompany) {
                          company = selectedApplication.currentCompany;
                        }

                        // Try applicant snapshot
                        if (
                          !company &&
                          selectedApplication.applicantSnapshot?.currentCompany
                        ) {
                          company =
                            selectedApplication.applicantSnapshot
                              .currentCompany;
                        }

                        // Try application data
                        if (
                          !company &&
                          selectedApplication.applicationData?.currentCompany
                        ) {
                          company =
                            selectedApplication.applicationData.currentCompany;
                        }

                        // Try to get from work experience array (current/latest job)
                        if (
                          !company &&
                          selectedApplication.workExperience &&
                          Array.isArray(selectedApplication.workExperience) &&
                          selectedApplication.workExperience.length > 0
                        ) {
                          const currentJobData =
                            selectedApplication.workExperience.find(
                              (exp) => exp.isCurrent
                            ) || selectedApplication.workExperience[0];
                          company =
                            currentJobData?.companyName ||
                            currentJobData?.company ||
                            currentJobData?.employer;
                        }

                        // Try applicationInfo work experience
                        if (
                          !company &&
                          selectedApplication.applicationInfo?.workExperience &&
                          Array.isArray(
                            selectedApplication.applicationInfo.workExperience
                          ) &&
                          selectedApplication.applicationInfo.workExperience
                            .length > 0
                        ) {
                          const currentJobData =
                            selectedApplication.applicationInfo.workExperience.find(
                              (exp) => exp.isCurrent
                            ) ||
                            selectedApplication.applicationInfo
                              .workExperience[0];
                          company =
                            currentJobData?.companyName ||
                            currentJobData?.company ||
                            currentJobData?.employer;
                        }

                        return company && company !== "NA" && company !== ""
                          ? company
                          : "Not specified";
                      })()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      <strong>Location:</strong>{" "}
                      {(() => {
                        // Try applicationInfo first
                        if (selectedApplication.applicationInfo?.location) {
                          const loc =
                            selectedApplication.applicationInfo.location;
                          const city =
                            loc.current?.city || loc.currentLocation?.city;
                          if (city) return city;
                        }
                        // Fallback to snapshot data
                        return (
                          selectedApplication.applicantSnapshot?.location ||
                          selectedApplication.applicationData?.location ||
                          "Not specified"
                        );
                      })()}
                    </Typography>
                    <Typography>
                      <strong>Phone:</strong>{" "}
                      {selectedApplication.applicationInfo?.basicInfo?.phone ||
                        selectedApplication.applicantSnapshot?.phone ||
                        selectedApplication.applicationData?.phone ||
                        "Not specified"}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong>{" "}
                      {selectedApplication.applicationInfo?.basicInfo?.email ||
                        selectedApplication.applicantSnapshot?.email ||
                        selectedApplication.applicationData?.email ||
                        "Not specified"}
                    </Typography>
                  </Grid>

                  {/* Additional Application Info Fields */}
                  {selectedApplication.applicationInfo && (
                    <>
                      {selectedApplication.applicationInfo.expectedSalary
                        ?.displayText && (
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Expected Salary:</strong>{" "}
                            {
                              selectedApplication.applicationInfo.expectedSalary
                                .displayText
                            }
                          </Typography>
                        </Grid>
                      )}
                      {selectedApplication.applicationInfo.applicationSpecific
                        ?.noticePeriod && (
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Notice Period:</strong>{" "}
                            {
                              selectedApplication.applicationInfo
                                .applicationSpecific.noticePeriod
                            }
                          </Typography>
                        </Grid>
                      )}
                      {selectedApplication.applicationInfo.jobPreferences && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography>
                              <strong>Willing to Relocate:</strong>{" "}
                              {selectedApplication.applicationInfo
                                .jobPreferences.willingToRelocate
                                ? "Yes"
                                : "No"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography>
                              <strong>Remote Work Preference:</strong>{" "}
                              {selectedApplication.applicationInfo
                                .jobPreferences.remoteWorkPreference ===
                                "fully-remote" ||
                              selectedApplication.applicationInfo.jobPreferences
                                .remoteWorkPreference === "hybrid"
                                ? selectedApplication.applicationInfo
                                    .jobPreferences.remoteWorkPreference
                                : "No preference"}
                            </Typography>
                          </Grid>
                        </>
                      )}
                      {/* Social Links */}
                      {selectedApplication.applicationInfo?.socialLinks && (
                        <>
                          {(() => {
                            const linkedinUrl =
                              selectedApplication.applicationInfo.socialLinks
                                .linkedin?.url ||
                              selectedApplication.applicationInfo.socialLinks
                                .linkedinUrl;
                            return linkedinUrl ? (
                              <Grid item xs={12} sm={6}>
                                <Typography>
                                  <strong>LinkedIn:</strong>{" "}
                                  <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Profile
                                  </a>
                                </Typography>
                              </Grid>
                            ) : null;
                          })()}
                          {(() => {
                            const portfolioUrl =
                              selectedApplication.applicationInfo.socialLinks
                                .portfolio?.url ||
                              selectedApplication.applicationInfo.socialLinks
                                .portfolioUrl;
                            return portfolioUrl ? (
                              <Grid item xs={12} sm={6}>
                                <Typography>
                                  <strong>Portfolio:</strong>{" "}
                                  <a
                                    href={portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Portfolio
                                  </a>
                                </Typography>
                              </Grid>
                            ) : null;
                          })()}
                        </>
                      )}
                    </>
                  )}
                </Grid>

                {/* Skills */}
                {(() => {
                  // Get skills from applicationInfo or fallback to snapshot
                  const skills =
                    selectedApplication.applicationInfo?.skills?.technical ||
                    selectedApplication.applicantSnapshot?.skills ||
                    [];
                  // Extract skill names if they're objects with {skill: "name"} structure
                  const skillNames = skills
                    .map((s) => (typeof s === "string" ? s : s?.skill || s))
                    .filter(Boolean);

                  return skillNames.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Skills:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {skillNames.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  ) : null;
                })()}

                {/* Education */}
                {(selectedApplication.applicationInfo?.education?.length > 0 ||
                  selectedApplication.applicantSnapshot?.education?.length >
                    0) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Education:
                    </Typography>
                    {(
                      selectedApplication.applicationInfo?.education ||
                      selectedApplication.applicantSnapshot?.education ||
                      []
                    ).map((edu, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{edu.degree}</strong>{" "}
                          {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                        </Typography>
                        {edu.institution && (
                          <Typography variant="body2" color="text.secondary">
                            {edu.institution}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Work Experience */}
                {(selectedApplication.applicationInfo?.workExperience?.length >
                  0 ||
                  selectedApplication.applicantSnapshot?.workExperience
                    ?.length > 0) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Work Experience:
                    </Typography>
                    {(
                      selectedApplication.applicationInfo?.workExperience ||
                      selectedApplication.applicantSnapshot?.workExperience ||
                      []
                    ).map((work, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{work.jobTitle}</strong>{" "}
                          {work.companyName && `at ${work.companyName}`}
                        </Typography>
                        {work.description && (
                          <Typography variant="body2" color="text.secondary">
                            {work.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {(selectedApplication.applicationInfo?.applicationSpecific
                  ?.coverLetter ||
                  selectedApplication.applicationData?.coverLetter) &&
                  !selectedApplication.applicationData?.coverLetter?.includes(
                    "applicationService.js"
                  ) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Cover Letter:
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Typography variant="body2">
                          {selectedApplication.applicationInfo
                            ?.applicationSpecific?.coverLetter ||
                            selectedApplication.applicationData?.coverLetter}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                {selectedApplication.recruiterNotes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recruiter Feedback:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "info.light",
                        color: "info.contrastText",
                      }}
                    >
                      <Typography variant="body2">
                        {selectedApplication.recruiterNotes}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsModal(false)}>Close</Button>
          {selectedApplication &&
            selectedApplication.status !== "withdrawn" &&
            selectedApplication.status !== "rejected" &&
            selectedApplication.status !== "selected" && (
              <Button
                onClick={() =>
                  handleWithdrawApplication(selectedApplication._id)
                }
                color="error"
                variant="outlined"
                disabled={withdrawing}
              >
                {withdrawing ? "Withdrawing..." : "Withdraw Application"}
              </Button>
            )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyApplicationsTab;
