/**
 * Dynamic API Configuration System
 * Handles localhost, network, and deployment scenarios automatically
 */

// Environment detection
const getEnvironment = () => {
    // Check for explicit environment variable
    if (import.meta.env.VITE_NODE_ENV) {
        return import.meta.env.VITE_NODE_ENV;
    }

    // Auto-detect based on hostname
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Production domains
        if (hostname.includes('.onrender.com') ||
            hostname.includes('.vercel.app') ||
            hostname.includes('.herokuapp.com') ||
            hostname.includes('finautojobs.com')) {
            return 'production';
        }

        // Staging domains
        if (hostname.includes('staging') || hostname.includes('dev-')) {
            return 'staging';
        }

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }

        // Network development (local IP)
        if (hostname.match(/^192\.168\./) ||
            hostname.match(/^10\./) ||
            hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
            return 'network';
        }
    }

    return 'development'; // Default fallback
};

// Get current host information
const getHostInfo = () => {
    if (typeof window === 'undefined') {
        return { hostname: 'localhost', port: '3000', protocol: 'http:' };
    }

    return {
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol
    };
};

// Detect backend port by trying common ports
const detectBackendPort = () => {
    // Common backend ports to try
    const commonPorts = ['5000', '5001', '5002', '5003', '3001', '8000', '8080'];
    
    // Check if we have a stored preference
    const storedPort = localStorage.getItem('backend_port');
    if (storedPort && commonPorts.includes(storedPort)) {
        return storedPort;
    }
    
    // Default to 5000 for now - this could be enhanced with actual port checking
    return '5000';
};

// Build API URL based on environment and deployment context
const buildApiUrl = () => {
    const environment = getEnvironment();
    const hostInfo = getHostInfo();

    console.log('🌐 Environment detected:', environment);
    console.log('🔍 Host info:', hostInfo);

    // 1. Explicit environment variable (highest priority)
    if (import.meta.env.VITE_API_URL) {
        console.log('✅ Using explicit VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }

    // 2. Production/deployment environment
    if (environment === 'production' || environment === 'staging') {
        // For production deployments, use relative API path or environment-specific URL
        const prodUrl = import.meta.env.VITE_PROD_API_URL || '/api';
        console.log('✅ Using production API URL:', prodUrl);
        return prodUrl;
    }

    // 3. Local development - using standardized environment variables
    if (hostInfo.hostname === 'localhost' || hostInfo.hostname === '127.0.0.1') {
        const backendPort = import.meta.env.VITE_BACKEND_PORT || 
                           import.meta.env.VITE_API_PORT || 
                           '5000'; // Default to 5000 to match backend
        const localUrl = `http://localhost:${backendPort}/api`;
        console.log('🔧 Using local backend for development:', localUrl);
        return localUrl;
    }

    // 3. Production deployment URLs
    if (environment === 'production') {
        // Common production patterns
        const productionUrls = {
            // Render.com
            'finautojobs-frontend.onrender.com': 'https://finautojobs-backend.onrender.com/api',
            'finautojobs.onrender.com': 'https://finautojobs-api.onrender.com/api',

            // Vercel + Railway
            'finautojobs.vercel.app': 'https://finautojobs-api.railway.app/api',

            // Custom domain
            'finautojobs.com': 'https://api.finautojobs.com/api',
            'www.finautojobs.com': 'https://api.finautojobs.com/api'
        };

        const apiUrl = productionUrls[hostInfo.hostname];
        if (apiUrl) {
            console.log('✅ Using production API URL:', apiUrl);
            return apiUrl;
        }

        // Fallback: same domain with /api
        const fallbackUrl = `${hostInfo.protocol}//${hostInfo.hostname}/api`;
        console.log('⚠️ Using production fallback:', fallbackUrl);
        return fallbackUrl;
    }

    // 4. Staging environment
    if (environment === 'staging') {
        const stagingUrl = `${hostInfo.protocol}//${hostInfo.hostname.replace('staging-', 'staging-api-')}/api`;
        console.log('✅ Using staging API URL:', stagingUrl);
        return stagingUrl;
    }

    // 4. Network development (same IP, different port)
    if (environment === 'network') {
        const backendPort = import.meta.env.VITE_BACKEND_PORT || 
                           import.meta.env.VITE_API_PORT || 
                           '5000';
        const networkUrl = `http://${hostInfo.hostname}:${backendPort}/api`;
        console.log('✅ Using network API URL:', networkUrl);
        return networkUrl;
    }

    // 5. Local development fallback
    const backendPort = import.meta.env.VITE_BACKEND_PORT || 
                       import.meta.env.VITE_API_PORT || 
                       '5000';
    const localUrl = `http://localhost:${backendPort}/api`;
    console.log('✅ Using local API URL:', localUrl);
    return localUrl;
};

// Build Socket.IO URL
const buildSocketUrl = (apiUrl) => {
    // Remove /api suffix for socket connection
    const socketUrl = apiUrl.replace(/\/api$/, '');
    console.log('🔌 Socket URL:', socketUrl);
    return socketUrl;
};

// Initialize configuration
const API_BASE_URL = buildApiUrl();
const SOCKET_URL_INTERNAL = buildSocketUrl(API_BASE_URL);

// Configuration object for easy access
export const apiConfig = {
    baseURL: API_BASE_URL,
    socketURL: SOCKET_URL_INTERNAL,
    environment: getEnvironment(),
    hostInfo: getHostInfo(),
    timeout: 60000,
    retries: 3
};

// Legacy exports
const getSocketURL = () => SOCKET_URL_INTERNAL;
export const SOCKET_URL = SOCKET_URL_INTERNAL;

// Enhanced logging
console.log('🔧 API Configuration Summary:', {
    environment: apiConfig.environment,
    apiUrl: API_BASE_URL,
    socketUrl: SOCKET_URL_INTERNAL,
    host: apiConfig.hostInfo.hostname,
    explicitEnv: import.meta.env.VITE_API_URL || 'auto-detected'
});

export default API_BASE_URL;
