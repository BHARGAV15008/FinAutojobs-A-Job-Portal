#!/usr/bin/env node

/**
 * Comprehensive Debug and Fix Script for FinAutoJobs
 * This script identifies and fixes common issues in the application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}=== ${msg} ===${colors.reset}`)
};

class FinAutoJobsDebugger {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.frontendPath = path.join(__dirname, 'frontend');
    this.backendPath = path.join(__dirname, 'backend');
  }

  // Check if file exists
  fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  // Read file safely
  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  // Write file safely
  writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      log.error(`Failed to write file: ${filePath} - ${error.message}`);
      return false;
    }
  }

  // Check package.json dependencies
  checkDependencies() {
    log.section('Checking Dependencies');

    // Frontend dependencies
    const frontendPackageJson = path.join(this.frontendPath, 'package.json');
    if (this.fileExists(frontendPackageJson)) {
      const content = this.readFile(frontendPackageJson);
      if (content) {
        try {
          const pkg = JSON.parse(content);
          const requiredDeps = [
            'react',
            'react-dom',
            'framer-motion',
            'tailwindcss',
            '@mui/material',
            'axios',
            'react-router-dom'
          ];

          const missingDeps = requiredDeps.filter(dep => 
            !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
          );

          if (missingDeps.length > 0) {
            this.issues.push(`Missing frontend dependencies: ${missingDeps.join(', ')}`);
          } else {
            log.success('All required frontend dependencies are present');
          }
        } catch (error) {
          this.issues.push('Invalid frontend package.json format');
        }
      }
    } else {
      this.issues.push('Frontend package.json not found');
    }

    // Backend dependencies
    const backendPackageJson = path.join(this.backendPath, 'package.json');
    if (this.fileExists(backendPackageJson)) {
      const content = this.readFile(backendPackageJson);
      if (content) {
        try {
          const pkg = JSON.parse(content);
          const requiredDeps = [
            'express',
            'cors',
            'helmet',
            'jsonwebtoken',
            'bcryptjs',
            'mongoose',
            'dotenv'
          ];

          const missingDeps = requiredDeps.filter(dep => 
            !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
          );

          if (missingDeps.length > 0) {
            this.issues.push(`Missing backend dependencies: ${missingDeps.join(', ')}`);
          } else {
            log.success('All required backend dependencies are present');
          }
        } catch (error) {
          this.issues.push('Invalid backend package.json format');
        }
      }
    } else {
      this.issues.push('Backend package.json not found');
    }
  }

  // Check environment configuration
  checkEnvironmentConfig() {
    log.section('Checking Environment Configuration');

    // Frontend .env
    const frontendEnv = path.join(this.frontendPath, '.env');
    if (!this.fileExists(frontendEnv)) {
      this.issues.push('Frontend .env file missing');
      this.createFrontendEnv();
    } else {
      log.success('Frontend .env file exists');
    }

    // Backend .env
    const backendEnv = path.join(this.backendPath, '.env');
    if (!this.fileExists(backendEnv)) {
      this.issues.push('Backend .env file missing');
      this.createBackendEnv();
    } else {
      log.success('Backend .env file exists');
    }
  }

  // Create frontend .env file
  createFrontendEnv() {
    const envContent = `# Frontend Environment Configuration
VITE_API_URL=http://localhost:5002/api
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id

# Feature Flags
VITE_ENABLE_OAUTH=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
`;

    const envPath = path.join(this.frontendPath, '.env');
    if (this.writeFile(envPath, envContent)) {
      this.fixes.push('Created frontend .env file');
      log.success('Created frontend .env file');
    }
  }

  // Create backend .env file
  createBackendEnv() {
    const envContent = `# Backend Environment Configuration
NODE_ENV=development
PORT=5002

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/finautojobs
DB_NAME=finautojobs

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5002/api/auth/google/callback

MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_CALLBACK_URL=http://localhost:5002/api/auth/microsoft/callback

APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY_PATH=./config/apple-private-key.p8
APPLE_CALLBACK_URL=http://localhost:5002/api/auth/apple/callback

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3005

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key
`;

    const envPath = path.join(this.backendPath, '.env');
    if (this.writeFile(envPath, envContent)) {
      this.fixes.push('Created backend .env file');
      log.success('Created backend .env file');
    }
  }

  // Check for common import/export issues
  checkImportExportIssues() {
    log.section('Checking Import/Export Issues');

    const checkFile = (filePath, relativePath) => {
      const content = this.readFile(filePath);
      if (!content) return;

      // Check for common import issues
      const issues = [];

      // Check for missing default exports
      if (content.includes('export {') && !content.includes('export default')) {
        issues.push('Missing default export');
      }

      // Check for incorrect import paths
      const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          // Check if the imported file exists
          const resolvedPath = path.resolve(path.dirname(filePath), importPath);
          const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
          const exists = extensions.some(ext => 
            this.fileExists(resolvedPath + ext) || 
            this.fileExists(path.join(resolvedPath, 'index' + ext))
          );
          if (!exists) {
            issues.push(`Import path not found: ${importPath}`);
          }
        }
      }

      if (issues.length > 0) {
        this.issues.push(`${relativePath}: ${issues.join(', ')}`);
      }
    };

    // Check frontend files
    this.walkDirectory(this.frontendPath, (filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        const relativePath = path.relative(this.frontendPath, filePath);
        checkFile(filePath, relativePath);
      }
    });

    // Check backend files
    this.walkDirectory(this.backendPath, (filePath) => {
      if (filePath.endsWith('.js')) {
        const relativePath = path.relative(this.backendPath, filePath);
        checkFile(filePath, relativePath);
      }
    });
  }

  // Walk directory recursively
  walkDirectory(dir, callback) {
    if (!this.fileExists(dir)) return;

    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          this.walkDirectory(filePath, callback);
        } else if (stat.isFile()) {
          callback(filePath);
        }
      });
    } catch (error) {
      // Ignore permission errors
    }
  }

  // Check for missing index files
  checkMissingIndexFiles() {
    log.section('Checking Missing Index Files');

    const componentDirs = [
      path.join(this.frontendPath, 'src', 'components'),
      path.join(this.frontendPath, 'src', 'pages'),
      path.join(this.frontendPath, 'src', 'services'),
      path.join(this.frontendPath, 'src', 'utils')
    ];

    componentDirs.forEach(dir => {
      if (this.fileExists(dir)) {
        this.checkDirectoryForIndex(dir);
      }
    });
  }

  // Check directory for index file
  checkDirectoryForIndex(dir) {
    try {
      const files = fs.readdirSync(dir);
      const subdirs = files.filter(file => {
        const filePath = path.join(dir, file);
        return fs.statSync(filePath).isDirectory() && !file.startsWith('.');
      });

      subdirs.forEach(subdir => {
        const subdirPath = path.join(dir, subdir);
        const indexFiles = ['index.js', 'index.jsx', 'index.ts', 'index.tsx'];
        const hasIndex = indexFiles.some(indexFile => 
          this.fileExists(path.join(subdirPath, indexFile))
        );

        if (!hasIndex) {
          const jsxFiles = fs.readdirSync(subdirPath)
            .filter(file => file.endsWith('.jsx') || file.endsWith('.js'))
            .filter(file => !file.startsWith('index'));

          if (jsxFiles.length > 0) {
            this.createIndexFile(subdirPath, jsxFiles);
          }
        }

        // Recursively check subdirectories
        this.checkDirectoryForIndex(subdirPath);
      });
    } catch (error) {
      // Ignore permission errors
    }
  }

  // Create index file for directory
  createIndexFile(dir, files) {
    const exports = files.map(file => {
      const name = path.basename(file, path.extname(file));
      return `export { default as ${name} } from './${name}';`;
    }).join('\n');

    const indexPath = path.join(dir, 'index.js');
    if (this.writeFile(indexPath, exports)) {
      const relativePath = path.relative(this.frontendPath, indexPath);
      this.fixes.push(`Created index file: ${relativePath}`);
    }
  }

  // Fix common CORS issues
  fixCorsIssues() {
    log.section('Checking CORS Configuration');

    const serverPath = path.join(this.backendPath, 'server.js');
    if (this.fileExists(serverPath)) {
      const content = this.readFile(serverPath);
      if (content && !content.includes('cors')) {
        this.issues.push('CORS middleware not configured in server.js');
      } else {
        log.success('CORS middleware is configured');
      }
    }
  }

  // Check for proper error handling
  checkErrorHandling() {
    log.section('Checking Error Handling');

    // Check if error boundary exists
    const errorBoundaryPath = path.join(this.frontendPath, 'src', 'components', 'ErrorBoundary.jsx');
    if (!this.fileExists(errorBoundaryPath)) {
      this.createErrorBoundary();
    } else {
      log.success('Error boundary component exists');
    }

    // Check backend error middleware
    const errorMiddlewarePath = path.join(this.backendPath, 'middleware', 'errorHandler.js');
    if (!this.fileExists(errorMiddlewarePath)) {
      this.createErrorMiddleware();
    } else {
      log.success('Error handling middleware exists');
    }
  }

  // Create error boundary component
  createErrorBoundary() {
    const errorBoundaryContent = `import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`;

    const errorBoundaryPath = path.join(this.frontendPath, 'src', 'components', 'ErrorBoundary.jsx');
    if (this.writeFile(errorBoundaryPath, errorBoundaryContent)) {
      this.fixes.push('Created ErrorBoundary component');
      log.success('Created ErrorBoundary component');
    }
  }

  // Create error middleware
  createErrorMiddleware() {
    const middlewareDir = path.join(this.backendPath, 'middleware');
    if (!this.fileExists(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true });
    }

    const errorMiddlewareContent = `// Enhanced error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new Error(\`Not found - \${req.originalUrl}\`);
  res.status(404);
  next(error);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);`;

    const errorMiddlewarePath = path.join(middlewareDir, 'errorHandler.js');
    if (this.writeFile(errorMiddlewarePath, errorMiddlewareContent)) {
      this.fixes.push('Created error handling middleware');
      log.success('Created error handling middleware');
    }
  }

  // Run all checks
  async run() {
    log.info('Starting FinAutoJobs Debug and Fix Process...\n');

    this.checkDependencies();
    this.checkEnvironmentConfig();
    this.checkImportExportIssues();
    this.checkMissingIndexFiles();
    this.fixCorsIssues();
    this.checkErrorHandling();

    // Report results
    log.section('Debug Results');

    if (this.issues.length === 0) {
      log.success('No issues found! Your application is in good shape.');
    } else {
      log.warning(`Found ${this.issues.length} issue(s):`);
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    if (this.fixes.length > 0) {
      log.success(`Applied ${this.fixes.length} fix(es):`);
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    }

    log.section('Recommendations');
    console.log('1. Run npm install in both frontend and backend directories');
    console.log('2. Update .env files with your actual configuration values');
    console.log('3. Test the application thoroughly after applying fixes');
    console.log('4. Consider setting up automated testing and linting');
    console.log('5. Review and update dependencies regularly');

    log.info('\nDebug process completed!');
  }
}

// Run the debugger
const debugger = new FinAutoJobsDebugger();
debugger.run().catch(console.error);
