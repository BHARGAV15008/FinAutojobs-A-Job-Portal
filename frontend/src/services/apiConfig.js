const getAPIBaseURL = () => {
  // For production, use the production backend URL
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://finautojobs-a-job-portal-w714.onrender.com/api';
  }
  // For development, use environment variable or localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getAPIBaseURL();

const getSocketURL = () => {
    // For production, use the production backend URL
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://finautojobs-a-job-portal-w714.onrender.com';
    }
    // For development, use environment variable or localhost
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove /api from the end of the URL for socket connection
    return url.replace("/api", ""); 
};

export const SOCKET_URL = getSocketURL();

export default API_BASE_URL;
