import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Send,
  Support,
  Business,
  Help,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: theme.spacing(8, 0),
  textAlign: 'center',
}));

const ContactCard = styled(Card)(({ theme }) => ({
  height: '100%',
  textAlign: 'center',
  padding: theme.spacing(3),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general',
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Email,
      title: 'Email Us',
      description: 'Get in touch via email',
      value: 'hello@finautojobs.com',
      action: 'mailto:hello@finautojobs.com',
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team',
      value: '+91 98765 43210',
      action: 'tel:+919876543210',
    },
    {
      icon: LocationOn,
      title: 'Visit Us',
      description: 'Our office location',
      value: 'Mumbai, Maharashtra, India',
      action: '#',
    },
    {
      icon: AccessTime,
      title: 'Business Hours',
      description: 'When we\'re available',
      value: 'Mon-Fri: 9AM-6PM IST',
      action: '#',
    },
  ];

  const supportTypes = [
    {
      icon: Help,
      title: 'General Support',
      description: 'Questions about our platform',
      value: 'general',
    },
    {
      icon: Business,
      title: 'Business Inquiries',
      description: 'Partnership and enterprise',
      value: 'business',
    },
    {
      icon: Support,
      title: 'Technical Support',
      description: 'Technical issues and bugs',
      value: 'technical',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Get in Touch
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 600, mx: 'auto' }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Typography>
        </Container>
      </HeroSection>

      {/* Contact Info Cards */}
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ContactCard>
                <info.icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {info.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {info.description}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {info.value}
                </Typography>
              </ContactCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Form */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Send us a Message
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Fill out the form below and we'll get back to you within 24 hours.
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="subject"
                      label="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="message"
                      label="Message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                      sx={{ minWidth: 150 }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  What can we help you with?
                </Typography>
                <Stack spacing={2}>
                  {supportTypes.map((type, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <type.icon color="primary" />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {type.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Quick Links
                </Typography>
                <Stack spacing={1}>
                  <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    FAQ & Help Center
                  </Button>
                  <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Privacy Policy
                  </Button>
                  <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Terms of Service
                  </Button>
                  <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Career Opportunities
                  </Button>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Need Immediate Help?
                </Typography>
                <Typography variant="body2" paragraph>
                  For urgent technical issues or account problems, please call our support hotline.
                </Typography>
                <Button variant="contained" fullWidth startIcon={<Phone />}>
                  Call Support
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Map Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Find Us
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Visit our office in the heart of Mumbai's business district
          </Typography>
          
          <Paper sx={{ mt: 4, overflow: 'hidden', borderRadius: 2 }}>
            <iframe
              src="https://maps.google.com/maps?width=100%25&height=400&hl=en&q=Mumbai,Maharashtra,India&t=&z=14&ie=UTF8&iwloc=B&output=embed"
              width="100%"
              height="400"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default ContactPage;