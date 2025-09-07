import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
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
import api from '../utils/api';

const AddJobPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    location: '',
    job_type: 'Full Time',
    work_mode: 'Work from Office',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    experience_min: '',
    experience_max: '',
    english_level: 'Good English',
    description: '',
    requirements: '',
    responsibilities: '',
    skills_required: [],
    benefits: [],
    application_deadline: '',
    category: 'Technology',
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

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.getCompanies();
        const data = await response.json();
        setCompanies(data.companies || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  const handleSkillAdd = () => {
    if (selectedSkill && !formData.skills_required.includes(selectedSkill)) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, selectedSkill],
      });
      setSelectedSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter(skill => skill !== skillToRemove),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to post a job",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !formData.company_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        experience_min: formData.experience_min ? parseInt(formData.experience_min) : null,
        experience_max: formData.experience_max ? parseInt(formData.experience_max) : null,
        skills_required: JSON.stringify(formData.skills_required),
        benefits: JSON.stringify(formData.benefits),
        posted_by: user.userId
      };

      const response = await api.createJob(jobData);
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Job posted successfully!",
      });
      
      setLocation('/recruiter-dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
                <FormControl fullWidth>
                  <InputLabel>Company</InputLabel>
                  <Select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    label="Company"
                    required
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                    required
                  >
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Automotive">Automotive</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Sales">Sales</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                  </Select>
                </FormControl>
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
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    label="Job Type"
                  >
                    <MenuItem value="Full Time">Full Time</MenuItem>
                    <MenuItem value="Part Time">Part Time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                    <MenuItem value="Freelance">Freelance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    name="work_mode"
                    value={formData.work_mode}
                    onChange={handleChange}
                    label="Work Mode"
                  >
                    <MenuItem value="Work from Office">Work from Office</MenuItem>
                    <MenuItem value="Work from Home">Work from Home</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>English Level</InputLabel>
                  <Select
                    name="english_level"
                    value={formData.english_level}
                    onChange={handleChange}
                    label="English Level"
                  >
                    <MenuItem value="Basic English">Basic English</MenuItem>
                    <MenuItem value="Good English">Good English</MenuItem>
                    <MenuItem value="Advanced English">Advanced English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Experience & Salary */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Experience & Salary
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  name="experience_min"
                  label="Min Experience (years)"
                  type="number"
                  value={formData.experience_min}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  name="experience_max"
                  label="Max Experience (years)"
                  type="number"
                  value={formData.experience_max}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  name="salary_min"
                  label="Minimum Salary (₹)"
                  type="number"
                  value={formData.salary_min}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  name="salary_max"
                  label="Maximum Salary (₹)"
                  type="number"
                  value={formData.salary_max}
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