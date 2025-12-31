/**
 * Dynamic API Configuration System
 * Handles localhost, network, and deployment scenarios automatically
 */

// Note: Cannot import logger here due to circular dependency
// Using console.log directly for configuration logging

// Environment detection - simplified and consistent
const getEnvironment = () => {
    // Check for explicit environment variable first
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
    const commonPorts = ['5000', '5001', '5002', '5003', '3000', '8000', '8080'];
    
    // Check if we have a stored preference
    const storedPort = localStorage.getItem('backend_port');
    if (storedPort && commonPorts.includes(storedPort)) {
        return storedPort;
    }
    
    // Default to 5000 for now - this could be enhanced with actual port checking
    return '5000';
};

// Build API URL based on environment and deployment context - SIMPLIFIED
const buildApiUrl = () => {
    const environment = getEnvironment();
    const hostInfo = getHostInfo();

    console.log('🌐 Environment detected:', environment);
    console.log('🔍 Host info:', hostInfo);

    // 1. For development and network modes, always prioritize the current host
    // This fixes connection timeouts when IP addresses change
    if (environment === 'development' || environment === 'network') {
        const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';
        const dynamicUrl = `${hostInfo.protocol}//${hostInfo.hostname}:${backendPort}/api`;
        console.log('🔧 Using dynamic development URL:', dynamicUrl);
        return dynamicUrl;
    }

    // 2. Explicit environment variable (for production or specific overrides)
    if (import.meta.env.VITE_API_URL) {
        console.log('✅ Using explicit VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }

    // 3. Production environment mapping
    if (environment === 'production') {
        // Known production URL mappings
        const productionUrls = {
            'finautojobs-frontend.onrender.com': 'https://finautojobs-backend.onrender.com/api',
            'finautojobs.onrender.com': 'https://finautojobs-api.onrender.com/api',
            'finautojobs.vercel.app': 'https://finautojobs-api.railway.app/api',
            'finautojobs.com': 'https://api.finautojobs.com/api',
            'www.finautojobs.com': 'https://api.finautojobs.com/api'
        };

        const mappedUrl = productionUrls[hostInfo.hostname];
        if (mappedUrl) {
            console.log('✅ Using mapped production API URL:', mappedUrl);
            return mappedUrl;
        }

        // Fallback: use env var or relative path
        const prodUrl = import.meta.env.VITE_PROD_API_URL || '/api';
        console.log('✅ Using production fallback:', prodUrl);
        return prodUrl;
    }

    // 3. Local development (localhost)
    if (environment === 'development') {
        const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';
        const localUrl = `http://${hostInfo.hostname}:${backendPort}/api`;
        console.log('🔧 Using local development URL:', localUrl);
        return localUrl;
    }

    // 4. Network development (local IP)
    if (environment === 'network') {
        const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';
        const networkUrl = `http://${hostInfo.hostname}:${backendPort}/api`;
        console.log('🌐 Using network URL:', networkUrl);
        return networkUrl;
    }

    // 5. Ultimate fallback
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';
    const fallbackUrl = `http://${hostInfo.hostname || 'localhost'}:${backendPort}/api`;
    console.log('⚠️ Using ultimate fallback:', fallbackUrl);
    return fallbackUrl;
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
