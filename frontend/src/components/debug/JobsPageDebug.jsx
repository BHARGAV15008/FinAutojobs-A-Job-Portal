import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import api from '../../utils/api';

const JobsPageDebug = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock jobs data for fallback
  const mockJobs = [
    {
      id: 1,
      title: "Test Job",
      company: "Test Company",
      location: "Test Location",
      skills: ["Test Skill"]
    }
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('🔍 Fetching jobs from API...');
        const response = await api.getJobs({ limit: 5 });
        const data = await response.json();
        
        console.log('📊 API Response:', data);
        
        // Ensure we always set an array
        if (data && data.success && Array.isArray(data.data?.jobs)) {
          console.log('✅ Using API data');
          setJobs(data.data.jobs);
        } else if (Array.isArray(data)) {
          console.log('✅ Using direct array data');
          setJobs(data);
        } else {
          console.log('⚠️ API returned invalid data, using mock data');
          setJobs(mockJobs);
        }
      } catch (error) {
        console.error('❌ Error fetching jobs:', error);
        console.log('🔄 Using mock data as fallback');
        setJobs(mockJobs);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Jobs Page Debug Info
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          API Error: {error}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Jobs array is: {Array.isArray(jobs) ? 'valid array' : 'NOT an array'} 
        <br />
        Jobs count: {jobs.length}
        <br />
        Jobs type: {typeof jobs}
      </Alert>

      <Typography variant="h6" gutterBottom>
        Jobs Data:
      </Typography>
      
      {Array.isArray(jobs) && jobs.length > 0 ? (
        jobs.map(job => (
          <Box key={job.id} sx={{ p: 2, border: 1, borderColor: 'grey.300', mb: 1 }}>
            <Typography variant="subtitle1">{job.title}</Typography>
            <Typography variant="body2">{job.company}</Typography>
          </Box>
        ))
      ) : (
        <Typography>No jobs found</Typography>
      )}

      <Typography variant="h6" sx={{ mt: 3 }}>
        Filter Test:
      </Typography>
      
      <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
        <Typography variant="body2">
          Attempting to filter jobs...
        </Typography>
        {(() => {
          try {
            const filtered = (Array.isArray(jobs) ? jobs : []).filter(job => 
              job.title.toLowerCase().includes('test')
            );
            return (
              <Typography color="success.main">
                ✅ Filter successful! Found {filtered.length} jobs with 'test' in title
              </Typography>
            );
          } catch (err) {
            return (
              <Typography color="error.main">
                ❌ Filter failed: {err.message}
              </Typography>
            );
          }
        })()}
      </Box>
    </Box>
  );
};

export default JobsPageDebug;
