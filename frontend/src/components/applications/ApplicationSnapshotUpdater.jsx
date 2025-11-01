import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Component to update applicant snapshot for an application
 * This fetches the latest user profile data and updates the snapshot
 * 
 * @param {string} applicationId - The ID of the application to update
 * @param {function} onSuccess - Callback function called after successful update
 * @param {function} onError - Callback function called on error
 */
const ApplicationSnapshotUpdater = ({ applicationId, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateClick = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth implementation
      
      const response = await fetch(`/api/applications/${applicationId}/snapshot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Applicant snapshot updated successfully!');
      console.log('✅ Updated Snapshot Data:', data.data);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data.data);
      }

    } catch (err) {
      const errorMessage = err.message || 'Failed to update snapshot';
      setError(errorMessage);
      console.error('❌ Fetch Error:', err);
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Update Applicant Snapshot
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Application ID: {applicationId}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        onClick={handleUpdateClick}
        disabled={isLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Updating...' : 'Update Snapshot Now'}
      </Button>

      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ApplicationSnapshotUpdater;

// Example usage in another component:
// <ApplicationSnapshotUpdater 
//   applicationId="69049022a9a004b9497ac864"
//   onSuccess={(data) => console.log('Success:', data)}
//   onError={(error) => console.error('Error:', error)}
// />
