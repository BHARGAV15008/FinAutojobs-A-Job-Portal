import os from 'os';

// Network configuration for cross-device access
export const getNetworkConfig = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  // Get all network interfaces
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }

  return {
    192.168.41.134: 'localhost',
    localIP: addresses[0]?.address || 'localhost',
    allAddresses: addresses,
    port: process.env.PORT || 5000
  };
};

// CORS configuration for cross-device access
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost and local network IPs
    const allowedOrigins = [
      'http://192.168.41.134:3000',
      'http://192.168.41.134:3000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3000'
    ];

    // Add local network IPs
    const networkConfig = getNetworkConfig();
    networkConfig.allAddresses.forEach(addr => {
      allowedOrigins.push(`http://${addr.address}:3000`);
      allowedOrigins.push(`http://${addr.address}:3000`);
    });

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Express server configuration for network access
export const serverConfig = {
  host: '0.0.0.0', // Listen on all network interfaces
  port: process.env.PORT || 5000
};

// Display network information
export const displayNetworkInfo = () => {
  const config = getNetworkConfig();

  console.log('\n🌐 Network Access Information:');
  console.log('================================');
  console.log(`📱 Local Access: http://192.168.41.134:${config.port}`);
  console.log(`🖥️  Local IP: http://${config.localIP}:${config.port}`);

  if (config.allAddresses.length > 0) {
    console.log('\n📡 Available on network:');
    config.allAddresses.forEach(addr => {
      console.log(`   • http://${addr.address}:${config.port} (${addr.name})`);
    });
  }

  console.log('\n📋 Frontend URLs:');
  console.log(`   • Local: http://192.168.41.134:3000`);
  console.log(`   • Network: http://${config.localIP}:3000`);

  console.log('\n💡 To access from other devices:');
  console.log('   1. Connect devices to the same WiFi network');
  console.log(`   2. Use: http://${config.localIP}:3000`);
  console.log('   3. Make sure firewall allows connections on these ports');
  console.log('================================\n');
};

export default {
  getNetworkConfig,
  corsOptions,
  serverConfig,
  displayNetworkInfo
};
