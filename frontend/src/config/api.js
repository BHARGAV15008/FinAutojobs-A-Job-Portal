// API Configuration for FinAutoJobs
const getApiBaseUrl = () => {
  // Check if we're in production
  if (import.meta.env.PROD) {
    // Use environment variable in production, fallback to a placeholder
    return import.meta.env.VITE_API_BASE_URL || 'https://your-backend-domain.vercel.app/api';
  }
  
  // Development environment
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Export configuration object
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Environment info for debugging
export const envInfo = {
  isDevelopment: !import.meta.env.PROD,
  isProduction: import.meta.env.PROD,
  apiBaseUrl: API_BASE_URL,
  nodeEnv: import.meta.env.MODE,
};

console.log('🔧 API Configuration:', envInfo);

export default API_BASE_URL;
