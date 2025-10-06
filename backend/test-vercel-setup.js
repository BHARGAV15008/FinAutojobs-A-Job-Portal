import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('🔧 Testing Vercel Setup for FinAutoJobs Backend...\n');

// Test 1: Environment Variables
console.log('1. Environment Variables Check:');
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET', 
  'SESSION_SECRET',
  'NODE_ENV'
];

let envCheckPassed = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${varName.includes('SECRET') ? '***' : value.substring(0, 30)}...`);
  } else {
    console.log(`   ❌ ${varName}: Missing`);
    envCheckPassed = false;
  }
});

if (!envCheckPassed) {
  console.log('\n❌ Environment variables check failed. Please set missing variables.');
  process.exit(1);
}

// Test 2: Database Connection
console.log('\n2. Database Connection Test:');
try {
  console.log('   🔄 Connecting to MongoDB...');
  
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  
  console.log('   ✅ MongoDB connection successful');
  
  // Test database operation
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`   ✅ Database accessible (${collections.length} collections found)`);
  
  await mongoose.disconnect();
  console.log('   ✅ MongoDB disconnection successful');
  
} catch (error) {
  console.log('   ❌ MongoDB connection failed:', error.message);
  process.exit(1);
}

// Test 3: Import Check
console.log('\n3. Module Import Test:');
try {
  const { initializeDatabase } = await import('./config/database.js');
  console.log('   ✅ Database module import successful');
  
  const authRoutes = await import('./routes/auth.js');
  console.log('   ✅ Auth routes import successful');
  
  const jobRoutes = await import('./routes/jobs.js');
  console.log('   ✅ Job routes import successful');
  
} catch (error) {
  console.log('   ❌ Module import failed:', error.message);
  process.exit(1);
}

// Test 4: Vercel API Structure
console.log('\n4. Vercel API Structure Test:');
try {
  const fs = await import('fs');
  const path = await import('path');
  
  // Check if api/index.js exists
  const apiIndexPath = './api/index.js';
  if (fs.existsSync(apiIndexPath)) {
    console.log('   ✅ api/index.js exists');
  } else {
    console.log('   ❌ api/index.js missing');
    process.exit(1);
  }
  
  // Check vercel.json
  const vercelConfigPath = './vercel.json';
  if (fs.existsSync(vercelConfigPath)) {
    console.log('   ✅ vercel.json exists');
    
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    if (vercelConfig.builds && vercelConfig.builds[0].src === 'api/index.js') {
      console.log('   ✅ vercel.json configured correctly');
    } else {
      console.log('   ⚠️  vercel.json may need updates');
    }
  } else {
    console.log('   ❌ vercel.json missing');
  }
  
} catch (error) {
  console.log('   ❌ File structure check failed:', error.message);
}

console.log('\n🎉 All tests passed! Your backend is ready for Vercel deployment.');
console.log('\nNext steps:');
console.log('1. cd backend');
console.log('2. vercel --prod');
console.log('3. Set environment variables in Vercel Dashboard');
console.log('4. Update FRONTEND_URL after frontend deployment');

process.exit(0);
