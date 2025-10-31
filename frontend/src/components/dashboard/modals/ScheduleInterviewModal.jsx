import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Schedule,
  VideoCall,
  Phone,
  Person,
  Place,
  Add,
  Edit,
  Delete,
  CalendarToday,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";

const ScheduleInterviewModal = ({
  open,
  onClose,
  candidate,
  interviews = [],
  onSchedule,
  onUpdate,
  onDelete,
}) => {
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [formData, setFormData] = useState({
    scheduledAt: new Date(),
    duration: 60,
    interviewType: "video",
    meetingLink: "",
    location: "",
    description: "",
    interviewerName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate form
      if (
        !formData.scheduledAt ||
        !formData.duration ||
        !formData.interviewType ||
        !formData.interviewerName
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (formData.interviewType === "video" && !formData.meetingLink) {
        setError("Please provide a meeting link for video interviews");
        return;
      }

      if (formData.interviewType === "in-person" && !formData.location) {
        setError("Please provide a location for in-person interviews");
        return;
      }

      // Submit data
      const result = await (selectedInterview
        ? onUpdate(selectedInterview.id, formData)
        : onSchedule(candidate.id, formData));

      if (result.success) {
        setSuccess("Interview scheduled successfully!");
        setTimeout(() => {
          onClose();
          setSelectedInterview(null);
          setFormData({
            scheduledAt: new Date(),
            duration: 60,
            interviewType: "video",
            meetingLink: "",
            location: "",
            description: "",
            interviewerName: "",
          });
        }, 2000);
      } else {
        setError("Failed to schedule interview. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setFormData({
      scheduledAt: new Date(interview.scheduledAt),
      duration: interview.duration,
      interviewType: interview.interviewType,
      meetingLink: interview.meetingLink || "",
      location: interview.location || "",
      description: interview.description,
      interviewerName: interview.interviewerName,
    });
  };

  const handleDelete = async (interviewId) => {
    try {
      await onDelete(interviewId);
      setSuccess("Interview cancelled successfully!");
      setTimeout(() => {
        setSelectedInterview(null);
      }, 2000);
    } catch (error) {
      setError("Failed to cancel interview. Please try again.");
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={typeof window !== 'undefined' && window.innerWidth < 600}
      PaperProps={{
        sx: { 
          maxHeight: { xs: '100vh', sm: '90vh' },
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {selectedInterview ? "Edit Interview" : "Schedule Interview"}
          </Typography>
          {selectedInterview && (
            <Button
              startIcon={<Add />}
              onClick={() => {
                setSelectedInterview(null);
                setFormData({
                  scheduledAt: new Date(),
                  duration: 60,
                  interviewType: "video",
                  meetingLink: "",
                  location: "",
                  description: "",
                  interviewerName: "",
                });
              }}
            >
              New Interview
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Existing Interviews */}
        {interviews.length > 0 && !selectedInterview && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Scheduled Interviews
            </Typography>
            <Grid container spacing={2}>
              {interviews.map((interview) => (
                <Grid item xs={12} key={interview.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {new Date(interview.scheduledAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {interview.interviewType === "video" ? (
                          <VideoCall />
                        ) : interview.interviewType === "phone" ? (
                          <Phone />
                        ) : (
                          <Place />
                        )}
                        {interview.interviewType.charAt(0).toUpperCase() +
                          interview.interviewType.slice(1)}{" "}
                        Interview • {interview.duration} minutes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Person sx={{ fontSize: 16, mr: 0.5 }} />
                        Interviewer: {interview.interviewerName}
                      </Typography>
                    </Box>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(interview)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel Interview">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(interview.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Interview Form */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Interview Date & Time"
                value={formData.scheduledAt}
                onChange={(newValue) =>
                  setFormData({ ...formData, scheduledAt: newValue })
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Duration (minutes)</InputLabel>
              <Select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                label="Duration (minutes)"
              >
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={45}>45 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={90}>1.5 hours</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Interview Type</InputLabel>
              <Select
                value={formData.interviewType}
                onChange={(e) =>
                  setFormData({ ...formData, interviewType: e.target.value })
                }
                label="Interview Type"
              >
                <MenuItem value="video">Video Call</MenuItem>
                <MenuItem value="phone">Phone Call</MenuItem>
                <MenuItem value="in-person">In-Person</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Interviewer Name"
              value={formData.interviewerName}
              onChange={(e) =>
                setFormData({ ...formData, interviewerName: e.target.value })
              }
            />
          </Grid>

          {formData.interviewType === "video" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Link"
                value={formData.meetingLink}
                onChange={(e) =>
                  setFormData({ ...formData, meetingLink: e.target.value })
                }
                placeholder="https://meet.google.com/..."
              />
            </Grid>
          )}

          {formData.interviewType === "in-person" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Office address or meeting room..."
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Interview Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add interview details, topics to be covered, or special instructions..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 }, flexWrap: 'wrap', gap: 1 }}>
        <Button 
          onClick={onClose}
          size="small"
          sx={{ minWidth: { xs: 'auto', sm: '80px' } }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<Schedule />}
          size="small"
          sx={{ minWidth: { xs: 'auto', sm: '140px' } }}
        >
          {selectedInterview ? "Update Interview" : "Schedule Interview"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleInterviewModal;
