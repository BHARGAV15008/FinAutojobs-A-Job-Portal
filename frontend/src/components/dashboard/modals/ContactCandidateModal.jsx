import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Email, Message, Send } from "@mui/icons-material";
import { useAuth } from '../../../contexts/AuthContext';

const ContactCandidateModal = ({ open, onClose, candidate, relatedJobId, relatedApplicationId }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    template: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([
    {
      id: 'interview_invitation',
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {jobTitle} at {companyName}',
      content: `Dear {candidateName},\n\nWe are pleased to invite you for an interview for the {jobTitle} position at {companyName}.\n\nInterview Details:\n- Date: {interviewDate}\n- Time: {interviewTime}\n- Location: {interviewLocation}\n- Duration: Approximately {duration}\n\nPlease confirm your availability by replying to this email.\n\nWe look forward to meeting you.\n\nBest regards,\n{recruiterName}\n{companyName}`
    },
    {
      id: 'application_received',
      name: 'Application Received',
      subject: 'Application Received - {jobTitle}',
      content: `Dear {candidateName},\n\nThank you for your interest in the {jobTitle} position at {companyName}.\n\nWe have successfully received your application and our hiring team will review it carefully. We will contact you within 5-7 business days regarding the next steps.\n\nIf you have any questions, please feel free to reach out.\n\nBest regards,\n{recruiterName}\n{companyName}`
    },
    {
      id: 'job_offer',
      name: 'Job Offer',
      subject: 'Job Offer - {jobTitle} at {companyName}',
      content: `Dear {candidateName},\n\nWe are delighted to offer you the position of {jobTitle} at {companyName}.\n\nOffer Details:\n- Position: {jobTitle}\n- Department: {department}\n- Start Date: {startDate}\n- Salary: {salary}\n- Benefits: {benefits}\n\nPlease review the attached offer letter and let us know your decision by {responseDeadline}.\n\nWe are excited about the possibility of you joining our team.\n\nBest regards,\n{recruiterName}\n{companyName}`
    },
    {
      id: 'follow_up',
      name: 'Follow-up Message',
      subject: 'Following up on your application - {jobTitle}',
      content: `Dear {candidateName},\n\nI hope this message finds you well.\n\nI wanted to follow up on your application for the {jobTitle} position at {companyName}. We are currently in the process of reviewing applications and will be in touch soon with next steps.\n\nThank you for your patience and continued interest in our company.\n\nBest regards,\n{recruiterName}\n{companyName}`
    }
  ]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Load email templates from backend
  useEffect(() => {
    const loadTemplates = async () => {
      if (!open || !token) return;
      
      setLoadingTemplates(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/contact/templates`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Templates API Response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Templates data received:', data);
          if (data.success && data.data.templates && data.data.templates.length > 0) {
            // Update with backend templates if available
            setTemplates(data.data.templates);
            console.log('✅ Loaded templates from backend:', data.data.templates.length);
          } else {
            console.log('⚠️ No templates from backend, using fallback templates');
          }
        } else {
          console.error('Templates API failed:', response.status, await response.text());
          console.log('⚠️ API failed, using fallback templates');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        console.log('⚠️ Exception occurred, keeping existing fallback templates');
      } finally {
        setLoadingTemplates(false);
        console.log('📋 Final templates count:', templates.length);
      }
    };
    
    loadTemplates();
  }, [open, token]);

  const handleTemplateChange = (event) => {
    const template = templates.find((t) => t.id === event.target.value);
    if (template) {
      // Replace placeholders with actual data
      let subject = template.subject;
      let content = template.content;
      
      const replacements = {
        '{candidateName}': candidate?.fullName || candidate?.firstName + ' ' + candidate?.lastName || 'Candidate',
        '{recruiterName}': user?.firstName + ' ' + user?.lastName || 'Recruiter',
        '{companyName}': user?.companyInfo?.companyName || 'Our Company',
        '{jobTitle}': 'Position', // This could be passed from job data
        '{department}': user?.companyInfo?.department || 'Department',
        '{interviewDate}': '[Please specify date]',
        '{interviewTime}': '[Please specify time]',
        '{interviewLocation}': '[Please specify location]',
        '{duration}': '1 hour',
        '{timeframe}': '5-7 business days',
        '{startDate}': '[Please specify start date]',
        '{salary}': '[Please specify salary]',
        '{benefits}': '[Please specify benefits]',
        '{responseDeadline}': '[Please specify deadline]'
      };
      
      Object.entries(replacements).forEach(([placeholder, value]) => {
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        content = content.replace(new RegExp(placeholder, 'g'), value);
      });
      
      setFormData({
        ...formData,
        template: template.id,
        subject: subject,
        message: content,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      if (!formData.subject || !formData.message) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (!candidate?.id && !candidate?._id) {
        setError("Invalid candidate information");
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const endpoint = activeTab === 0 ? `${API_BASE_URL}/contact/send-email` : `${API_BASE_URL}/contact/send-message`;
      const payload = {
        receiverId: candidate.id || candidate._id,
        subject: formData.subject,
        message: formData.message,
        emailType: activeTab === 0 ? 'recruiter_to_applicant' : undefined,
        messageType: activeTab === 1 ? 'contact' : undefined,
        relatedJobId: relatedJobId || null,
        relatedApplicationId: relatedApplicationId || null
      };

      console.log('Sending to endpoint:', endpoint, 'with payload:', payload);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Contact API Response:', response.status, response.statusText);

      const result = await response.json();

      if (result.success) {
        setSuccess(
          activeTab === 0 
            ? "Email sent successfully! The candidate will receive it in their inbox with you in CC." 
            : "Message sent successfully through FinAutoJobs platform!"
        );
        
        // Reset form
        setFormData({ subject: "", message: "", template: "" });
        
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(result.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
                {loadingTemplates ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading templates...
                  </MenuItem>
                ) : (
                  templates.length > 0 ? (
                    templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No templates available
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Debug: {templates.length} templates loaded, Loading: {loadingTemplates ? 'Yes' : 'No'}
              </Typography>
            )}

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
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.dark">
              📧 <strong>Email Details:</strong><br/>
              • Recipient: {candidate?.email || 'candidate@email.com'}<br/>
              • CC: {user?.email} (You will receive a copy)<br/>
              • Sent via: FinAutoJobs Platform<br/>
              • The candidate can reply directly to your email
            </Typography>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" color="success.dark">
              💬 <strong>Platform Message:</strong><br/>
              • This message will be sent through FinAutoJobs internal messaging<br/>
              • The candidate will see it in their dashboard<br/>
              • They can reply through the platform
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.message || (activeTab === 0 && !formData.subject)}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
        >
          {loading ? 'Sending...' : `Send ${activeTab === 0 ? "Email" : "Message"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactCandidateModal;
