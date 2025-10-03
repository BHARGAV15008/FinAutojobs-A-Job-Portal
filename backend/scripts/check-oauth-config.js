#!/usr/bin/env node

/**
 * OAuth Configuration Checker
 * 
 * This script checks if OAuth environment variables are properly configured
 * and provides guidance on missing configurations.
 */

import dotenv from 'dotenv';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log(chalk.blue.bold('\n🔐 OAuth Configuration Checker\n'));

const requiredConfigs = {
  google: [
    { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth Client ID' },
    { key: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth Client Secret' },
    { key: 'GOOGLE_CALLBACK_URL', description: 'Google OAuth Callback URL', optional: true }
  ],
  microsoft: [
    { key: 'MICROSOFT_CLIENT_ID', description: 'Microsoft OAuth Client ID' },
    { key: 'MICROSOFT_CLIENT_SECRET', description: 'Microsoft OAuth Client Secret' },
    { key: 'MICROSOFT_CALLBACK_URL', description: 'Microsoft OAuth Callback URL', optional: true }
  ],
  apple: [
    { key: 'APPLE_CLIENT_ID', description: 'Apple OAuth Client ID' },
    { key: 'APPLE_TEAM_ID', description: 'Apple Team ID' },
    { key: 'APPLE_KEY_ID', description: 'Apple Key ID' },
    { key: 'APPLE_PRIVATE_KEY_PATH', description: 'Apple Private Key Path', optional: true }
  ],
  session: [
    { key: 'SESSION_SECRET', description: 'Session Secret Key' },
    { key: 'JWT_SECRET', description: 'JWT Secret Key' }
  ]
};

function checkConfiguration(provider, configs) {
  console.log(chalk.yellow(`\n🔍 Checking ${provider.toUpperCase()} Configuration:`));
  
  let configured = 0;
  let total = 0;
  
  configs.forEach(config => {
    const value = process.env[config.key];
    const hasValue = value && value !== `your-${provider}-${config.key.toLowerCase().replace(/_/g, '-')}`;
    
    total++;
    
    if (hasValue) {
      configured++;
      const maskedValue = value.length > 10 ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}` : '***';
      console.log(chalk.green(`   ✅ ${config.key}: ${maskedValue}`));
    } else {
      const status = config.optional ? '⚠️ ' : '❌';
      const label = config.optional ? 'Optional' : 'Required';
      console.log(chalk.red(`   ${status} ${config.key}: Not configured (${label})`));
      console.log(chalk.gray(`      ${config.description}`));
      
      if (!config.optional) {
        configured--; // Don't count as configured if required and missing
      }
    }
  });
  
  const percentage = Math.round((configured / total) * 100);
  const status = percentage === 100 ? '✅ Complete' : percentage > 50 ? '⚠️  Partial' : '❌ Incomplete';
  
  console.log(chalk.blue(`   📊 Configuration: ${status} (${configured}/${total} configured)`));
  
  return { configured, total, percentage };
}

function generateSetupInstructions() {
  console.log(chalk.blue.bold('\n📝 Setup Instructions:\n'));
  
  console.log(chalk.yellow('1. Create a .env file in the backend directory:'));
  console.log(chalk.gray('   cp .env.example .env\n'));
  
  console.log(chalk.yellow('2. Configure OAuth providers:'));
  
  console.log(chalk.cyan('   🔵 Google OAuth:'));
  console.log(chalk.gray('   - Go to Google Cloud Console'));
  console.log(chalk.gray('   - Create OAuth 2.0 credentials'));
  console.log(chalk.gray('   - Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET\n'));
  
  console.log(chalk.cyan('   🔷 Microsoft OAuth:'));
  console.log(chalk.gray('   - Go to Azure Portal'));
  console.log(chalk.gray('   - Register a new application'));
  console.log(chalk.gray('   - Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET\n'));
  
  console.log(chalk.cyan('   🍎 Apple OAuth:'));
  console.log(chalk.gray('   - Go to Apple Developer Console'));
  console.log(chalk.gray('   - Create App ID and Service ID'));
  console.log(chalk.gray('   - Generate private key'));
  console.log(chalk.gray('   - Set APPLE_CLIENT_ID, APPLE_TEAM_ID, and APPLE_KEY_ID\n'));
  
  console.log(chalk.yellow('3. Generate secure secrets:'));
  console.log(chalk.gray('   - Set SESSION_SECRET to a random string'));
  console.log(chalk.gray('   - Set JWT_SECRET to a random string\n'));
  
  console.log(chalk.green('4. Restart the server after configuration'));
}

function checkOverallStatus() {
  console.log(chalk.blue.bold('\n📊 Overall OAuth Status:\n'));
  
  let totalConfigured = 0;
  let totalRequired = 0;
  
  Object.entries(requiredConfigs).forEach(([provider, configs]) => {
    const result = checkConfiguration(provider, configs);
    totalConfigured += result.configured;
    totalRequired += result.total;
  });
  
  const overallPercentage = Math.round((totalConfigured / totalRequired) * 100);
  
  console.log(chalk.blue.bold('\n🎯 Summary:'));
  console.log(chalk.gray(`   Total Configuration: ${totalConfigured}/${totalRequired} (${overallPercentage}%)`));
  
  if (overallPercentage === 100) {
    console.log(chalk.green.bold('\n🎉 OAuth is fully configured!'));
    console.log(chalk.green('✅ All providers are ready for use'));
    console.log(chalk.yellow('💡 Next steps:'));
    console.log(chalk.yellow('   1. Start the backend server'));
    console.log(chalk.yellow('   2. Test OAuth login on frontend'));
    console.log(chalk.yellow('   3. Verify user registration works'));
  } else if (overallPercentage > 50) {
    console.log(chalk.yellow.bold('\n⚠️  OAuth is partially configured'));
    console.log(chalk.yellow('Some providers are ready, others need configuration'));
    generateSetupInstructions();
  } else {
    console.log(chalk.red.bold('\n❌ OAuth needs configuration'));
    console.log(chalk.red('Most providers are not configured'));
    generateSetupInstructions();
  }
  
  return overallPercentage;
}

// Additional checks
async function checkFilePermissions() {
  console.log(chalk.blue.bold('\n🔒 File Permissions Check:\n'));
  
  const envFile = path.join(__dirname, '../.env');
  
  try {
    const fs = await import('fs');
    const stats = fs.statSync(envFile);
    console.log(chalk.green('✅ .env file exists'));
    
    // Check if file is readable
    fs.accessSync(envFile, fs.constants.R_OK);
    console.log(chalk.green('✅ .env file is readable'));
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(chalk.red('❌ .env file not found'));
      console.log(chalk.yellow('💡 Create .env file from .env.example'));
    } else {
      console.log(chalk.red(`❌ .env file error: ${error.message}`));
    }
  }
}

function checkDependencies() {
  console.log(chalk.blue.bold('\n📦 Dependencies Check:\n'));
  
  const requiredPackages = [
    'passport',
    'passport-google-oauth20',
    'passport-microsoft',
    'express-session',
    'connect-mongo'
  ];
  
  requiredPackages.forEach(pkg => {
    try {
      require.resolve(pkg);
      console.log(chalk.green(`✅ ${pkg}: Installed`));
    } catch (error) {
      console.log(chalk.red(`❌ ${pkg}: Not installed`));
      console.log(chalk.yellow(`   Run: npm install ${pkg}`));
    }
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(chalk.blue.bold('OAuth Configuration Checker Usage:'));
    console.log(chalk.yellow('  node check-oauth-config.js           # Check all configurations'));
    console.log(chalk.yellow('  node check-oauth-config.js --deps    # Check dependencies only'));
    console.log(chalk.yellow('  node check-oauth-config.js --files   # Check files only'));
    console.log(chalk.yellow('  node check-oauth-config.js --help    # Show this help'));
    return;
  }
  
  if (args.includes('--deps')) {
    checkDependencies();
    return;
  }
  
  if (args.includes('--files')) {
    checkFilePermissions();
    return;
  }
  
  // Run all checks
  await checkFilePermissions();
  checkDependencies();
  const percentage = checkOverallStatus();
  
  console.log(chalk.blue.bold('\n📚 Documentation:'));
  console.log(chalk.gray('   📖 Setup Guide: ./OAUTH_SETUP_GUIDE.md'));
  console.log(chalk.gray('   🧪 Test Script: npm run test:oauth'));
  console.log(chalk.gray('   🔧 Backend Routes: ./routes/oauth.js'));
  
  process.exit(percentage === 100 ? 0 : 1);
}

main().catch(error => {
  console.error(chalk.red(`\n❌ Error: ${error.message}`));
  process.exit(1);
});
