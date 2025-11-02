import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  School,
  LinkedIn,
  GitHub,
  Language,
  CloudDownload,
} from "@mui/icons-material";

const ViewCandidateModal = ({ open, onClose, candidate }) => {
  if (!candidate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={candidate.avatar} sx={{ width: 56, height: 56 }}>
              {candidate.fullName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">{candidate.fullName}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {candidate.currentTitle}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Download Resume">
            <IconButton
              onClick={() => {
                // Try to construct the new filename format first
                const username = candidate.username || candidate.candidateUsername;
                if (username) {
                  const newFormatUrl = `/uploads/documents/resume_${username}.pdf`;
                  window.open(newFormatUrl, "_blank");
                } else if (candidate.resumeUrl) {
                  window.open(candidate.resumeUrl, "_blank");
                } else {
                  alert('Resume not available for this candidate');
                }
              }}
            >
              <CloudDownload />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <List dense>
              <ListItem>
                <Email sx={{ mr: 2 }} />
                <ListItemText primary="Email" secondary={candidate.email} />
              </ListItem>
              <ListItem>
                <Phone sx={{ mr: 2 }} />
                <ListItemText primary="Phone" secondary={candidate.phone} />
              </ListItem>
              <ListItem>
                <LocationOn sx={{ mr: 2 }} />
                <ListItemText
                  primary="Location"
                  secondary={candidate.location}
                />
              </ListItem>
            </List>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Professional Details
            </Typography>
            <List dense>
              <ListItem>
                <Work sx={{ mr: 2 }} />
                <ListItemText
                  primary="Experience"
                  secondary={`${candidate.experience} years${
                    candidate.currentCompany
                      ? ` | Currently at ${candidate.currentCompany}`
                      : ""
                  }`}
                />
              </ListItem>
              <ListItem>
                <School sx={{ mr: 2 }} />
                <ListItemText
                  primary="Education"
                  secondary={
                    candidate.education?.[0]?.degree || "Not specified"
                  }
                />
              </ListItem>
            </List>
          </Grid>

          {/* Skills */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {candidate.skills?.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>

          {/* Work Experience */}
          {candidate.workExperience?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Work Experience
              </Typography>
              <List>
                {candidate.workExperience.map((exp, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {exp.jobTitle || exp.title || 'Position Not Specified'} at {exp.companyName || exp.company || 'Company Not Specified'}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'Start date not specified'} -
                            {exp.isCurrentJob || exp.isCurrentRole
                              ? "Present"
                              : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'End date not specified'}
                          </Typography>
                          {exp.description && (
                            <Typography variant="body2">
                              {exp.description}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          {/* Links */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Professional Links
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              {candidate.linkedinUrl && (
                <Button
                  startIcon={<LinkedIn />}
                  variant="outlined"
                  size="small"
                  href={candidate.linkedinUrl}
                  target="_blank"
                >
                  LinkedIn
                </Button>
              )}
              {candidate.githubUrl && (
                <Button
                  startIcon={<GitHub />}
                  variant="outlined"
                  size="small"
                  href={candidate.githubUrl}
                  target="_blank"
                >
                  GitHub
                </Button>
              )}
              {candidate.portfolioUrl && (
                <Button
                  startIcon={<Language />}
                  variant="outlined"
                  size="small"
                  href={candidate.portfolioUrl}
                  target="_blank"
                >
                  Portfolio
                </Button>
              )}
            </Box>
          </Grid>

          {/* Application Status */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Application Status</Typography>
              <Chip
                label={candidate.applicationStatus}
                color={
                  candidate.applicationStatus === "hired"
                    ? "success"
                    : candidate.applicationStatus === "rejected"
                    ? "error"
                    : candidate.applicationStatus === "interviewed"
                    ? "info"
                    : "default"
                }
              />
            </Box>
            {candidate.recruiterNotes?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recruiter Notes
                </Typography>
                {candidate.recruiterNotes.map((note, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">{note.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(note.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            /* Handle quick actions */
          }}
        >
          Take Action
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCandidateModal;
