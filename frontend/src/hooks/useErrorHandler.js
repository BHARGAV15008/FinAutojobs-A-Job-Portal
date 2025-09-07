import { useCallback } from 'react';
import { useToast } from '../components/ui/use-toast';

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);

    let message = 'An unexpected error occurred';
    let title = 'Error';

    // Handle different error types
    if (error.response) {
      // API error response
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          title = 'Invalid Request';
          message = data.message || 'Please check your input and try again';
          break;
        case 401:
          title = 'Authentication Required';
          message = 'Please log in to continue';
          // Redirect to login if needed
          break;
        case 403:
          title = 'Access Denied';
          message = 'You don\'t have permission to perform this action';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found';
          break;
        case 409:
          title = 'Conflict';
          message = data.message || 'This resource already exists';
          break;
        case 422:
          title = 'Validation Error';
          message = data.message || 'Please check your input';
          break;
        case 429:
          title = 'Too Many Requests';
          message = 'Please wait a moment before trying again';
          break;
        case 500:
          title = 'Server Error';
          message = 'Something went wrong on our end. Please try again later';
          break;
        default:
          message = data.message || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Network error
      title = 'Connection Error';
      message = 'Unable to connect to the server. Please check your internet connection';
    } else if (error.message) {
      // JavaScript error
      message = error.message;
    }

    // Show toast notification
    toast({
      title,
      description: message,
      variant: 'destructive'
    });

    // Return error details for component-specific handling
    return {
      title,
      message,
      status: error.response?.status,
      context
    };
  }, [toast]);

  const handleApiError = useCallback(async (apiCall, context = '') => {
    try {
      return await apiCall();
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw for component-specific handling
    }
  }, [handleError]);

  return {
    handleError,
    handleApiError
  };
};

export default useErrorHandler;