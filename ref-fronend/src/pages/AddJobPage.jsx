import { useState } from 'react';
import { Link } from 'wouter';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
} from '@mui/material';
import { ArrowBack, Add, Work } from '@mui/icons-material';

const AddJobPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    department: '',
    type: 'Full-time',
    workMode: 'On-site',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: [],
    benefits: [],
  });

  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState('');

  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'PHP', 'C#', 'C++', 'SQL', 'MongoDB', 'AWS', 'Docker', 'DevOps',
    'UI/UX Design', 'Data Science', 'Machine Learning', 'Cybersecurity',
    'Mobile Development', 'Financial Analysis', 'Investment Banking',
    'Risk Management', 'Automotive Engineering', 'Mechanical Engineering',
  ];

  const benefitOptions = [
    'Health Insurance', 'Stock Options', 'Flexible Hours', 'Remote Work',
    'Learning Budget', 'Gym Membership', 'Free Meals', 'Transport',
    'Performance Bonus', 'Paid Time Off', 'Maternity/Paternity Leave',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillAdd = () => {
    if (selectedSkill && !formData.skills.includes(selectedSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, selectedSkill],
      });
      setSelectedSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleBenefitAdd = () => {
    if (selectedBenefit && !formData.benefits.includes(selectedBenefit)) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, selectedBenefit],
      });
      setSelectedBenefit('');
    }
  };

  const handleBenefitRemove = (benefitToRemove) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter(benefit => benefit !== benefitToRemove),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Job posted:', formData);
    // Handle job posting logic here
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        component={Link}
        href="/recruiter-dashboard"
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Post a New Job
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find the perfect candidate for your team
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="title"
                  label="Job Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="company"
                  label="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="department"
                  label="Department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            {/* Job Details */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Job Details
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Job Type"
                  >
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    label="Work Mode"
                  >
                    <MenuItem value="On-site">On-site</MenuItem>
                    <MenuItem value="Remote">Remote</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="experience"
                  label="Experience Required"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 3-5 years"
                  required
                />
              </Grid>
            </Grid>

            {/* Salary */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Salary Range
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="salaryMin"
                  label="Minimum Salary (₹)"
                  type="number"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="salaryMax"
                  label="Maximum Salary (₹)"
                  type="number"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            {/* Skills */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Required Skills
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Autocomplete
                fullWidth
                options={skillOptions}
                value={selectedSkill}
                onChange={(event, newValue) => setSelectedSkill(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Add Skills" />
                )}
              />
              <Button
                variant="contained"
                onClick={handleSkillAdd}
                disabled={!selectedSkill}
                startIcon={<Add />}
                sx={{ minWidth: 120 }}
              >
                Add
              </Button>
            </Box>

            {formData.skills.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleSkillRemove(skill)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            {/* Benefits */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Benefits & Perks
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Autocomplete
                fullWidth
                options={benefitOptions}
                value={selectedBenefit}
                onChange={(event, newValue) => setSelectedBenefit(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Add Benefits" />
                )}
              />
              <Button
                variant="contained"
                onClick={handleBenefitAdd}
                disabled={!selectedBenefit}
                startIcon={<Add />}
                sx={{ minWidth: 120 }}
              >
                Add
              </Button>
            </Box>

            {formData.benefits.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                {formData.benefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    onDelete={() => handleBenefitRemove(benefit)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            {/* Description */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Job Description
            </Typography>

            <TextField
              fullWidth
              name="description"
              label="Job Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              name="requirements"
              label="Requirements"
              multiline
              rows={4}
              value={formData.requirements}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              name="responsibilities"
              label="Key Responsibilities"
              multiline
              rows={4}
              value={formData.responsibilities}
              onChange={handleChange}
              required
              sx={{ mb: 4 }}
            />

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                href="/recruiter-dashboard"
                variant="outlined"
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Work />}
              >
                Post Job
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddJobPage;