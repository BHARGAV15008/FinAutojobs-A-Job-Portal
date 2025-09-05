import React, { useState, useEffect } from 'react'
import { useRoute } from 'wouter'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Rating,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Business,
  LocationOn,
  Language,
  People,
  Work,
  Star,
  Email,
  Phone
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import JobCard from '../components/JobCard'

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  }
}))

const CompanyHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3)
}))

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function CompanyDetailPage() {
  const [match, params] = useRoute('/company/:id')
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    if (params?.id) {
      fetchCompanyDetails(params.id)
      fetchCompanyJobs(params.id)
      fetchCompanyReviews(params.id)
    }
  }, [params?.id])

  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/companies/${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
      } else {
        setError('Failed to fetch company details')
      }
    } catch (err) {
      setError('Error fetching company details')
    }
  }

  const fetchCompanyJobs = async (companyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs?company=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (err) {
      console.error('Error fetching company jobs:', err)
    }
  }

  const fetchCompanyReviews = async (companyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/companies/${companyId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data || [])
      }
    } catch (err) {
      console.error('Error fetching company reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!company) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Company not found</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Company Header */}
      <CompanyHeader>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={company.logo}
              sx={{ width: 100, height: 100, bgcolor: 'white', color: 'primary.main' }}
            >
              <Business sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h3" component="h1" gutterBottom>
              {company.name}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              {company.industry}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {company.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">{company.location}</Typography>
                </Box>
              )}
              {company.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Language fontSize="small" />
                  <Typography variant="body2">{company.website}</Typography>
                </Box>
              )}
              {company.size && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <People fontSize="small" />
                  <Typography variant="body2">{company.size} employees</Typography>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'center' }}>
              <Rating value={company.rating || 0} readOnly precision={0.1} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {company.rating ? `${company.rating}/5` : 'No ratings'}
              </Typography>
              <Typography variant="caption" display="block">
                ({reviews.length} reviews)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CompanyHeader>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="company tabs">
          <Tab label="Overview" />
          <Tab label={`Jobs (${jobs.length})`} />
          <Tab label={`Reviews (${reviews.length})`} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  About {company.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {company.description || 'No description available.'}
                </Typography>
                
                {company.mission && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Mission
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {company.mission}
                    </Typography>
                  </>
                )}

                {company.values && company.values.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Values
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {company.values.map((value, index) => (
                        <Chip key={index} label={value} variant="outlined" />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Company Info
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Industry"
                      secondary={company.industry || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company Size"
                      secondary={company.size ? `${company.size} employees` : 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={company.location || 'Not specified'}
                    />
                  </ListItem>
                  {company.founded && (
                    <ListItem>
                      <ListItemIcon>
                        <Star />
                      </ListItemIcon>
                      <ListItemText
                        primary="Founded"
                        secondary={company.founded}
                      />
                    </ListItem>
                  )}
                </List>

                {(company.email || company.phone) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Contact
                    </Typography>
                    <List>
                      {company.email && (
                        <ListItem>
                          <ListItemIcon>
                            <Email />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary={company.email}
                          />
                        </ListItem>
                      )}
                      {company.phone && (
                        <ListItem>
                          <ListItemIcon>
                            <Phone />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone"
                            secondary={company.phone}
                          />
                        </ListItem>
                      )}
                    </List>
                  </>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {jobs.length > 0 ? (
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} md={6} key={job._id}>
                <JobCard job={job} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            No job openings available at this company currently.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {reviews.length > 0 ? (
          <Grid container spacing={3}>
            {reviews.map((review, index) => (
              <Grid item xs={12} key={index}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {review.title || 'Anonymous Review'}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {review.position} • {new Date(review.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {review.content}
                    </Typography>
                    {review.pros && (
                      <>
                        <Typography variant="subtitle2" color="success.main">
                          Pros:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {review.pros}
                        </Typography>
                      </>
                    )}
                    {review.cons && (
                      <>
                        <Typography variant="subtitle2" color="error.main">
                          Cons:
                        </Typography>
                        <Typography variant="body2">
                          {review.cons}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            No reviews available for this company yet.
          </Alert>
        )}
      </TabPanel>
    </Container>
  )
}

export default CompanyDetailPage