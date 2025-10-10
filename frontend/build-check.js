#!/usr/bin/env node

// Build verification script for Render deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Build Check Starting...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check if required environment variables are set
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_APP_NAME',
  'VITE_NODE_ENV'
];

console.log('\n📋 Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`${envVar}: ${value ? '✅ Set' : '⚠️ Missing (will use defaults)'}`);
});

// Check if package.json exists and has required scripts

try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('\n📦 Package.json Check:');
  console.log(`Name: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
  
  const requiredScripts = ['build', 'dev'];
  requiredScripts.forEach(script => {
    console.log(`Script "${script}": ${packageJson.scripts[script] ? '✅ Found' : '❌ Missing'}`);
  });
  
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
}

// Check if src directory exists
const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  console.log('\n📁 Source Directory: ✅ Found');
  
  // Check for main files
  const mainFiles = ['main.jsx', 'App.jsx', 'index.jsx'];
  mainFiles.forEach(file => {
    const filePath = path.join(srcPath, file);
    console.log(`${file}: ${fs.existsSync(filePath) ? '✅ Found' : '❌ Missing'}`);
  });
} else {
  console.log('\n📁 Source Directory: ❌ Missing');
}

// Check public directory
const publicPath = path.join(process.cwd(), 'public');
if (fs.existsSync(publicPath)) {
  console.log('\n🌐 Public Directory: ✅ Found');
  
  const publicFiles = ['index.html', '_redirects'];
  publicFiles.forEach(file => {
    const filePath = path.join(publicPath, file);
    console.log(`${file}: ${fs.existsSync(filePath) ? '✅ Found' : '❌ Missing'}`);
  });
} else {
  console.log('\n🌐 Public Directory: ❌ Missing');
}

console.log('\n✅ Build check completed!');
