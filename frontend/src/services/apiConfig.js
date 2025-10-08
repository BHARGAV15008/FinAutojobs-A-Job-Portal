const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://finautojobs-a-job-portal-w714.onrender.com/api';

const getSocketURL = () => {
    const url = import.meta.env.VITE_API_URL || 'https://finautojobs-a-job-portal-w714.onrender.com/api';
    // Remove /api from the end of the URL for socket connection
    return url.replace("/api", ""); 
};

export const SOCKET_URL = getSocketURL();

export default API_BASE_URL;
