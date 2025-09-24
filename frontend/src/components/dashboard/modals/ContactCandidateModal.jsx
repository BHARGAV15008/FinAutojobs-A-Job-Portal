import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { Email, Message } from "@mui/icons-material";

const ContactCandidateModal = ({ open, onClose, candidate, onSend }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    template: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emailTemplates = [
    {
      id: "interview",
      name: "Interview Invitation",
      subject: "Interview Invitation for [Position]",
      content: `Dear ${candidate?.fullName},\n\nWe are pleased to invite you for an interview for the [Position] role at our company...`,
    },
    {
      id: "followup",
      name: "Application Follow-up",
      subject: "Following up on your application",
      content: `Dear ${candidate?.fullName},\n\nThank you for your application. We wanted to follow up...`,
    },
    {
      id: "offer",
      name: "Job Offer",
      subject: "Job Offer - [Position]",
      content: `Dear ${candidate?.fullName},\n\nWe are delighted to offer you the position of...`,
    },
    {
      id: "rejection",
      name: "Application Status Update",
      subject: "Update on your application",
      content: `Dear ${candidate?.fullName},\n\nThank you for your interest in the position...`,
    },
  ];

  const handleTemplateChange = (event) => {
    const template = emailTemplates.find((t) => t.id === event.target.value);
    if (template) {
      setFormData({
        ...formData,
        template: template.id,
        subject: template.subject,
        message: template.content,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");

      if (!formData.subject || !formData.message) {
        setError("Please fill in all required fields");
        return;
      }

      const result = await onSend({
        type: activeTab === 0 ? "email" : "message",
        data: formData,
        candidateId: candidate.id,
      });

      if (result.success) {
        setSuccess("Message sent successfully!");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Contact {candidate?.fullName}</DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              setFormData({ subject: "", message: "", template: "" });
              setError("");
              setSuccess("");
            }}
          >
            <Tab icon={<Email />} label="Email" />
            <Tab icon={<Message />} label="Internal Message" />
          </Tabs>
        </Box>

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

        {activeTab === 0 && (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Email Template</InputLabel>
              <Select
                value={formData.template}
                onChange={handleTemplateChange}
                label="Email Template"
              >
                <MenuItem value="">
                  <em>None (Custom Message)</em>
                </MenuItem>
                {emailTemplates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              margin="normal"
            />
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          rows={6}
          label={activeTab === 0 ? "Email Content" : "Message"}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          margin="normal"
        />

        {activeTab === 0 && (
          <Typography variant="caption" color="text.secondary">
            This email will be sent to: {candidate?.email}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.message || (activeTab === 0 && !formData.subject)}
        >
          Send {activeTab === 0 ? "Email" : "Message"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactCandidateModal;
