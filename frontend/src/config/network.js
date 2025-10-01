// Network configuration for frontend
const getLocalIP = () => {
  // Try to detect local IP from hostname
  const hostname = window.location.hostname;
  
  // If already on network IP, use it
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return hostname;
  }
  
  // Default fallback
  return 'localhost';
};

// API Base URL configuration
export const API_CONFIG = {
  // Development configuration
  development: {
    baseURL: process.env.REACT_APP_API_URL || `http://${getLocalIP()}:5000/api`,
    socketURL: process.env.REACT_APP_SOCKET_URL || `http://${getLocalIP()}:5000`,
    timeout: 10000
  },
  
  // Production configuration
  production: {
    baseURL: process.env.REACT_APP_API_URL || '/api',
    socketURL: process.env.REACT_APP_SOCKET_URL || '',
    timeout: 15000
  }
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env];
};

// Network detection utilities
export const NetworkUtils = {
  // Check if running on mobile device
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Check if running on local network
  isLocalNetwork: () => {
    const hostname = window.location.hostname;
    return hostname.startsWith('192.168.') || 
           hostname.startsWith('10.') || 
           hostname.startsWith('172.') ||
           hostname === 'localhost' ||
           hostname === '127.0.0.1';
  },
  
  // Get connection type
  getConnectionType: () => {
    if (navigator.connection) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  },
  
  // Check if online
  isOnline: () => {
    return navigator.onLine;
  }
};

// Device-specific configurations
export const DeviceConfig = {
  // Mobile optimizations
  mobile: {
    requestTimeout: 15000,
    retryAttempts: 3,
    cacheStrategy: 'aggressive'
  },
  
  // Desktop optimizations
  desktop: {
    requestTimeout: 10000,
    retryAttempts: 2,
    cacheStrategy: 'normal'
  }
};

// Get device-specific configuration
export const getDeviceConfig = () => {
  return NetworkUtils.isMobile() ? DeviceConfig.mobile : DeviceConfig.desktop;
};

// Connection status monitoring
export const ConnectionMonitor = {
  listeners: new Set(),
  
  // Add connection status listener
  addListener: (callback) => {
    ConnectionMonitor.listeners.add(callback);
    
    // Return cleanup function
    return () => {
      ConnectionMonitor.listeners.delete(callback);
    };
  },
  
  // Notify all listeners of connection status
  notifyListeners: (status) => {
    ConnectionMonitor.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  },
  
  // Initialize connection monitoring
  init: () => {
    window.addEventListener('online', () => {
      ConnectionMonitor.notifyListeners({ online: true, timestamp: Date.now() });
    });
    
    window.addEventListener('offline', () => {
      ConnectionMonitor.notifyListeners({ online: false, timestamp: Date.now() });
    });
    
    // Initial status
    ConnectionMonitor.notifyListeners({ 
      online: navigator.onLine, 
      timestamp: Date.now() 
    });
  }
};

// API endpoint builder
export const buildAPIEndpoint = (path) => {
  const config = getCurrentConfig();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.baseURL}/${cleanPath}`;
};

// Socket URL builder
export const buildSocketURL = () => {
  const config = getCurrentConfig();
  return config.socketURL;
};

// Network access instructions
export const getNetworkInstructions = () => {
  const hostname = window.location.hostname;
  const port = window.location.port || '3000';
  
  return {
    currentURL: `${window.location.protocol}//${hostname}:${port}`,
    localAccess: `http://localhost:${port}`,
    networkAccess: hostname !== 'localhost' ? `http://${hostname}:${port}` : null,
    instructions: [
      '1. Ensure all devices are on the same WiFi network',
      '2. Use the network URL to access from other devices',
      '3. Make sure firewall allows connections on port ' + port,
      '4. For mobile testing, use the network IP address'
    ]
  };
};

// Export default configuration
export default {
  getCurrentConfig,
  NetworkUtils,
  DeviceConfig,
  getDeviceConfig,
  ConnectionMonitor,
  buildAPIEndpoint,
  buildSocketURL,
  getNetworkInstructions
};
