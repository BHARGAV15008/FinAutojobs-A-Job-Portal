#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get network configuration
const getNetworkInfo = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
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
    localhost: 'localhost',
    localIP: addresses[0]?.address || 'localhost',
    allAddresses: addresses
  };
};

// Create environment files for network access
const createEnvFiles = () => {
  const networkInfo = getNetworkInfo();
  
  // Backend .env
  const backendEnvPath = join(__dirname, 'backend', '.env');
  const backendEnvContent = `
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finautojobs
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Network Configuration
HOST=0.0.0.0
LOCAL_IP=${networkInfo.localIP}

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://${networkInfo.localIP}:3000,http://${networkInfo.localIP}:3001
`.trim();

  // Frontend .env
  const frontendEnvPath = join(__dirname, 'frontend', '.env');
  const frontendEnvContent = `
# API Configuration
REACT_APP_API_URL=http://${networkInfo.localIP}:5000/api
REACT_APP_SOCKET_URL=http://${networkInfo.localIP}:5000

# Development Configuration
REACT_APP_ENV=development
GENERATE_SOURCEMAP=false

# Network Configuration
HOST=0.0.0.0
PORT=3000
`.trim();

  try {
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Environment files created successfully');
  } catch (error) {
    console.error('❌ Error creating environment files:', error.message);
  }
};

// Display startup information
const displayStartupInfo = () => {
  const networkInfo = getNetworkInfo();
  
  console.log('\n🚀 FinAutoJobs Enhanced Startup');
  console.log('================================');
  console.log('🔧 Configuring for cross-device access...');
  console.log(`📡 Local IP: ${networkInfo.localIP}`);
  console.log('================================\n');
  
  console.log('📋 Access URLs:');
  console.log(`   Frontend (Local): http://localhost:3000`);
  console.log(`   Frontend (Network): http://${networkInfo.localIP}:3000`);
  console.log(`   Backend (Local): http://localhost:5000`);
  console.log(`   Backend (Network): http://${networkInfo.localIP}:5000`);
  
  console.log('\n📱 Mobile/Other Device Access:');
  console.log(`   Use: http://${networkInfo.localIP}:3000`);
  console.log('   (Make sure devices are on same WiFi network)');
  
  console.log('\n🌐 Network Interfaces:');
  networkInfo.allAddresses.forEach(addr => {
    console.log(`   • ${addr.name}: ${addr.address}`);
  });
  
  console.log('\n🔄 Starting services...\n');
};

// Start backend server
const startBackend = () => {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting Enhanced Backend Server...');
    
    const backend = spawn('node', ['server-enhanced.js'], {
      cwd: join(__dirname, 'backend'),
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    backend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      if (output.includes('Enhanced Backend Server Started')) {
        resolve(backend);
      }
    });

    backend.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    backend.on('error', (error) => {
      console.error('❌ Backend startup error:', error);
      reject(error);
    });

    backend.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Backend process exited with code ${code}`);
      }
    });
  });
};

// Start frontend server
const startFrontend = () => {
  return new Promise((resolve, reject) => {
    console.log('🎨 Starting Frontend Development Server...');
    
    const frontend = spawn('npm', ['start'], {
      cwd: join(__dirname, 'frontend'),
      stdio: 'pipe',
      env: { 
        ...process.env, 
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: '3000'
      }
    });

    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
      
      if (output.includes('webpack compiled') || output.includes('Local:')) {
        resolve(frontend);
      }
    });

    frontend.stderr.on('data', (data) => {
      const output = data.toString();
      // Filter out common webpack warnings
      if (!output.includes('WARNING') && !output.includes('deprecated')) {
        console.error(`[Frontend Error] ${output.trim()}`);
      }
    });

    frontend.on('error', (error) => {
      console.error('❌ Frontend startup error:', error);
      reject(error);
    });

    frontend.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Frontend process exited with code ${code}`);
      }
    });
  });
};

// Main startup function
const main = async () => {
  try {
    displayStartupInfo();
    createEnvFiles();
    
    // Start backend first
    const backendProcess = await startBackend();
    console.log('✅ Backend server started successfully\n');
    
    // Wait a moment for backend to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start frontend
    const frontendProcess = await startFrontend();
    console.log('✅ Frontend server started successfully\n');
    
    const networkInfo = getNetworkInfo();
    
    console.log('🎉 All services started successfully!');
    console.log('=====================================');
    console.log('📱 Ready for cross-device testing!');
    console.log(`🌐 Access from any device: http://${networkInfo.localIP}:3000`);
    console.log('=====================================\n');
    
    console.log('💡 Features Available:');
    console.log('   ✅ Real-time messaging');
    console.log('   ✅ Automatic job deadline management');
    console.log('   ✅ Cross-device access');
    console.log('   ✅ Enhanced API endpoints');
    console.log('   ✅ Dynamic data synchronization');
    console.log('   ✅ Socket.IO real-time updates\n');
    
    console.log('🛑 Press Ctrl+C to stop all services\n');
    
    // Handle graceful shutdown
    const cleanup = () => {
      console.log('\n🛑 Shutting down services...');
      backendProcess.kill('SIGTERM');
      frontendProcess.kill('SIGTERM');
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
};

// Run the startup script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
