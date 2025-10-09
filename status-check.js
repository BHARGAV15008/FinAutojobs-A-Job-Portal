#!/usr/bin/env node

/**
 * Comprehensive Status Check for FinAutoJobs
 * This script provides a detailed overview of the application's current state
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
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.magenta}=== ${msg} ===${colors.reset}`),
  subsection: (msg) => console.log(`\n${colors.cyan}--- ${msg} ---${colors.reset}`)
};

class FinAutoJobsStatusChecker {
  constructor() {
    this.frontendPath = path.join(__dirname, 'frontend');
    this.backendPath = path.join(__dirname, 'backend');
    this.status = {
      frontend: {},
      backend: {},
      overall: {}
    };
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

  // Count files in directory
  countFiles(dir, extensions = []) {
    if (!this.fileExists(dir)) return 0;
    
    let count = 0;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          count += this.countFiles(path.join(dir, file.name), extensions);
        } else if (file.isFile()) {
          if (extensions.length === 0 || extensions.some(ext => file.name.endsWith(ext))) {
            count++;
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    return count;
  }

  // Get directory size
  getDirectorySize(dir) {
    if (!this.fileExists(dir)) return 0;
    
    let size = 0;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          size += this.getDirectorySize(filePath);
        } else if (file.isFile()) {
          const stats = fs.statSync(filePath);
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    return size;
  }

  // Format bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check frontend status
  checkFrontendStatus() {
    log.section('Frontend Status Check');

    const packageJsonPath = path.join(this.frontendPath, 'package.json');
    if (this.fileExists(packageJsonPath)) {
      const content = this.readFile(packageJsonPath);
      if (content) {
        try {
          const pkg = JSON.parse(content);
          this.status.frontend.name = pkg.name;
          this.status.frontend.version = pkg.version;
          this.status.frontend.dependencies = Object.keys(pkg.dependencies || {}).length;
          this.status.frontend.devDependencies = Object.keys(pkg.devDependencies || {}).length;
          
          log.success(`Project: ${pkg.name} v${pkg.version}`);
          log.info(`Dependencies: ${this.status.frontend.dependencies} production, ${this.status.frontend.devDependencies} development`);
        } catch (error) {
          log.error('Invalid package.json format');
        }
      }
    } else {
      log.error('package.json not found');
    }

    // Check key directories and files
    const keyPaths = [
      { path: 'src', type: 'directory', description: 'Source directory' },
      { path: 'src/components', type: 'directory', description: 'Components directory' },
      { path: 'src/pages', type: 'directory', description: 'Pages directory' },
      { path: 'src/services', type: 'directory', description: 'Services directory' },
      { path: 'src/utils', type: 'directory', description: 'Utils directory' },
      { path: 'src/styles', type: 'directory', description: 'Styles directory' },
      { path: 'src/tests', type: 'directory', description: 'Tests directory' },
      { path: 'vite.config.js', type: 'file', description: 'Vite configuration' },
      { path: 'tailwind.config.js', type: 'file', description: 'Tailwind configuration' },
      { path: '.env', type: 'file', description: 'Environment variables' }
    ];

    log.subsection('Directory Structure');
    keyPaths.forEach(({ path: relativePath, type, description }) => {
      const fullPath = path.join(this.frontendPath, relativePath);
      if (this.fileExists(fullPath)) {
        log.success(`${description}: ✓`);
      } else {
        log.warning(`${description}: Missing`);
      }
    });

    // Count files by type
    const srcPath = path.join(this.frontendPath, 'src');
    if (this.fileExists(srcPath)) {
      const jsxFiles = this.countFiles(srcPath, ['.jsx', '.js']);
      const cssFiles = this.countFiles(srcPath, ['.css', '.scss', '.sass']);
      const testFiles = this.countFiles(srcPath, ['.test.js', '.test.jsx', '.spec.js', '.spec.jsx']);
      
      this.status.frontend.jsxFiles = jsxFiles;
      this.status.frontend.cssFiles = cssFiles;
      this.status.frontend.testFiles = testFiles;
      
      log.subsection('File Statistics');
      log.info(`React components/pages: ${jsxFiles}`);
      log.info(`Style files: ${cssFiles}`);
      log.info(`Test files: ${testFiles}`);
    }

    // Check build configuration
    const vitePath = path.join(this.frontendPath, 'vite.config.js');
    if (this.fileExists(vitePath)) {
      log.success('Vite configuration found');
    } else {
      log.warning('Vite configuration missing');
    }

    // Check if node_modules exists
    const nodeModulesPath = path.join(this.frontendPath, 'node_modules');
    if (this.fileExists(nodeModulesPath)) {
      const size = this.getDirectorySize(nodeModulesPath);
      log.success(`Dependencies installed (${this.formatBytes(size)})`);
    } else {
      log.warning('Dependencies not installed (run npm install)');
    }
  }

  // Check backend status
  checkBackendStatus() {
    log.section('Backend Status Check');

    const packageJsonPath = path.join(this.backendPath, 'package.json');
    if (this.fileExists(packageJsonPath)) {
      const content = this.readFile(packageJsonPath);
      if (content) {
        try {
          const pkg = JSON.parse(content);
          this.status.backend.name = pkg.name;
          this.status.backend.version = pkg.version;
          this.status.backend.dependencies = Object.keys(pkg.dependencies || {}).length;
          this.status.backend.devDependencies = Object.keys(pkg.devDependencies || {}).length;
          
          log.success(`Project: ${pkg.name} v${pkg.version}`);
          log.info(`Dependencies: ${this.status.backend.dependencies} production, ${this.status.backend.devDependencies} development`);
        } catch (error) {
          log.error('Invalid package.json format');
        }
      }
    } else {
      log.error('package.json not found');
    }

    // Check key directories and files
    const keyPaths = [
      { path: 'controllers', type: 'directory', description: 'Controllers directory' },
      { path: 'models', type: 'directory', description: 'Models directory' },
      { path: 'routes', type: 'directory', description: 'Routes directory' },
      { path: 'middleware', type: 'directory', description: 'Middleware directory' },
      { path: 'services', type: 'directory', description: 'Services directory' },
      { path: 'utils', type: 'directory', description: 'Utils directory' },
      { path: 'config', type: 'directory', description: 'Config directory' },
      { path: 'tests', type: 'directory', description: 'Tests directory' },
      { path: 'server.js', type: 'file', description: 'Main server file' },
      { path: '.env', type: 'file', description: 'Environment variables' }
    ];

    log.subsection('Directory Structure');
    keyPaths.forEach(({ path: relativePath, type, description }) => {
      const fullPath = path.join(this.backendPath, relativePath);
      if (this.fileExists(fullPath)) {
        log.success(`${description}: ✓`);
      } else {
        log.warning(`${description}: Missing`);
      }
    });

    // Count files by type
    const jsFiles = this.countFiles(this.backendPath, ['.js']);
    const testFiles = this.countFiles(this.backendPath, ['.test.js', '.spec.js']);
    
    this.status.backend.jsFiles = jsFiles;
    this.status.backend.testFiles = testFiles;
    
    log.subsection('File Statistics');
    log.info(`JavaScript files: ${jsFiles}`);
    log.info(`Test files: ${testFiles}`);

    // Check if node_modules exists
    const nodeModulesPath = path.join(this.backendPath, 'node_modules');
    if (this.fileExists(nodeModulesPath)) {
      const size = this.getDirectorySize(nodeModulesPath);
      log.success(`Dependencies installed (${this.formatBytes(size)})`);
    } else {
      log.warning('Dependencies not installed (run npm install)');
    }
  }

  // Check specific components
  checkSpecificComponents() {
    log.section('Component Status Check');

    // Modern UI Components
    const modernComponents = [
      'src/components/ui/ModernCard.jsx',
      'src/components/ui/ModernButton.jsx',
      'src/components/ui/ModernModal.jsx',
      'src/components/ui/ModernInput.jsx'
    ];

    log.subsection('Modern UI Components');
    modernComponents.forEach(component => {
      const fullPath = path.join(this.frontendPath, component);
      if (this.fileExists(fullPath)) {
        log.success(path.basename(component));
      } else {
        log.warning(`${path.basename(component)}: Missing`);
      }
    });

    // Dashboard Components
    const dashboardComponents = [
      'src/pages/ApplicantDashboard.jsx',
      'src/pages/RecruiterDashboard.jsx',
      'src/pages/AdminDashboard.jsx'
    ];

    log.subsection('Dashboard Components');
    dashboardComponents.forEach(component => {
      const fullPath = path.join(this.frontendPath, component);
      if (this.fileExists(fullPath)) {
        log.success(path.basename(component));
      } else {
        log.warning(`${path.basename(component)}: Missing`);
      }
    });

    // Backend Controllers
    const controllers = [
      'controllers/authController.js',
      'controllers/jobController.js',
      'controllers/oauthController.js',
      'controllers/userController.js'
    ];

    log.subsection('Backend Controllers');
    controllers.forEach(controller => {
      const fullPath = path.join(this.backendPath, controller);
      if (this.fileExists(fullPath)) {
        log.success(path.basename(controller));
      } else {
        log.warning(`${path.basename(controller)}: Missing`);
      }
    });
  }

  // Check configuration files
  checkConfiguration() {
    log.section('Configuration Check');

    // Frontend configuration
    log.subsection('Frontend Configuration');
    const frontendConfigs = [
      { file: 'vite.config.js', description: 'Vite build configuration' },
      { file: 'tailwind.config.js', description: 'Tailwind CSS configuration' },
      { file: 'postcss.config.js', description: 'PostCSS configuration' },
      { file: 'eslint.config.js', description: 'ESLint configuration' },
      { file: '.env', description: 'Environment variables' }
    ];

    frontendConfigs.forEach(({ file, description }) => {
      const fullPath = path.join(this.frontendPath, file);
      if (this.fileExists(fullPath)) {
        log.success(`${description}: ✓`);
      } else {
        log.warning(`${description}: Missing`);
      }
    });

    // Backend configuration
    log.subsection('Backend Configuration');
    const backendConfigs = [
      { file: '.env', description: 'Environment variables' },
      { file: 'config/database.js', description: 'Database configuration' },
      { file: 'config/passport.js', description: 'Passport OAuth configuration' }
    ];

    backendConfigs.forEach(({ file, description }) => {
      const fullPath = path.join(this.backendPath, file);
      if (this.fileExists(fullPath)) {
        log.success(`${description}: ✓`);
      } else {
        log.warning(`${description}: Missing`);
      }
    });
  }

  // Check testing setup
  checkTestingSetup() {
    log.section('Testing Setup Check');

    // Frontend testing
    log.subsection('Frontend Testing');
    const frontendTestFiles = [
      'src/tests/setup.js',
      'src/tests/components/ModernCard.test.jsx',
      'src/tests/components/ModernButton.test.jsx',
      'src/tests/integration/auth.test.jsx'
    ];

    frontendTestFiles.forEach(testFile => {
      const fullPath = path.join(this.frontendPath, testFile);
      if (this.fileExists(fullPath)) {
        log.success(path.basename(testFile));
      } else {
        log.warning(`${path.basename(testFile)}: Missing`);
      }
    });

    // Backend testing
    log.subsection('Backend Testing');
    const backendTestFiles = [
      'tests/auth.test.js',
      'tests/jobs.test.js',
      'tests/users.test.js'
    ];

    backendTestFiles.forEach(testFile => {
      const fullPath = path.join(this.backendPath, testFile);
      if (this.fileExists(fullPath)) {
        log.success(path.basename(testFile));
      } else {
        log.warning(`${path.basename(testFile)}: Missing`);
      }
    });
  }

  // Generate overall status
  generateOverallStatus() {
    log.section('Overall Status Summary');

    const frontendHealth = this.calculateHealthScore('frontend');
    const backendHealth = this.calculateHealthScore('backend');
    const overallHealth = Math.round((frontendHealth + backendHealth) / 2);

    this.status.overall = {
      frontendHealth,
      backendHealth,
      overallHealth
    };

    log.info(`Frontend Health: ${frontendHealth}%`);
    log.info(`Backend Health: ${backendHealth}%`);
    log.info(`Overall Health: ${overallHealth}%`);

    if (overallHealth >= 90) {
      log.success('🎉 Excellent! Your application is in great shape.');
    } else if (overallHealth >= 75) {
      log.success('👍 Good! Your application is mostly ready.');
    } else if (overallHealth >= 60) {
      log.warning('⚠️  Fair. Some components need attention.');
    } else {
      log.error('❌ Poor. Significant issues need to be addressed.');
    }

    // Recommendations
    log.subsection('Recommendations');
    if (overallHealth < 100) {
      console.log('• Install missing dependencies with npm install');
      console.log('• Create missing configuration files');
      console.log('• Add comprehensive test coverage');
      console.log('• Set up proper environment variables');
      console.log('• Review and fix any missing components');
    } else {
      console.log('• Your application is fully set up!');
      console.log('• Consider adding more tests for better coverage');
      console.log('• Keep dependencies updated');
      console.log('• Monitor performance and security');
    }
  }

  // Calculate health score
  calculateHealthScore(type) {
    let score = 0;
    let maxScore = 0;

    if (type === 'frontend') {
      // Package.json exists and valid
      if (this.status.frontend.name) score += 15;
      maxScore += 15;

      // Dependencies installed
      if (this.fileExists(path.join(this.frontendPath, 'node_modules'))) score += 15;
      maxScore += 15;

      // Key directories exist
      const keyDirs = ['src', 'src/components', 'src/pages', 'src/services'];
      keyDirs.forEach(dir => {
        if (this.fileExists(path.join(this.frontendPath, dir))) score += 5;
        maxScore += 5;
      });

      // Configuration files
      const configs = ['vite.config.js', 'tailwind.config.js', '.env'];
      configs.forEach(config => {
        if (this.fileExists(path.join(this.frontendPath, config))) score += 10;
        maxScore += 10;
      });

      // Has components
      if (this.status.frontend.jsxFiles > 0) score += 20;
      maxScore += 20;

      // Has tests
      if (this.status.frontend.testFiles > 0) score += 10;
      maxScore += 10;

    } else if (type === 'backend') {
      // Package.json exists and valid
      if (this.status.backend.name) score += 15;
      maxScore += 15;

      // Dependencies installed
      if (this.fileExists(path.join(this.backendPath, 'node_modules'))) score += 15;
      maxScore += 15;

      // Key directories exist
      const keyDirs = ['controllers', 'routes', 'models'];
      keyDirs.forEach(dir => {
        if (this.fileExists(path.join(this.backendPath, dir))) score += 10;
        maxScore += 10;
      });

      // Main server file
      if (this.fileExists(path.join(this.backendPath, 'server.js'))) score += 15;
      maxScore += 15;

      // Environment file
      if (this.fileExists(path.join(this.backendPath, '.env'))) score += 15;
      maxScore += 15;

      // Has JavaScript files
      if (this.status.backend.jsFiles > 0) score += 15;
      maxScore += 15;

      // Has tests
      if (this.status.backend.testFiles > 0) score += 5;
      maxScore += 5;
    }

    return Math.round((score / maxScore) * 100);
  }

  // Run all checks
  async run() {
    console.log(`${colors.bold}${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                    FinAutoJobs Status Check                  ║
║                                                              ║
║  Comprehensive analysis of your job portal application       ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    this.checkFrontendStatus();
    this.checkBackendStatus();
    this.checkSpecificComponents();
    this.checkConfiguration();
    this.checkTestingSetup();
    this.generateOverallStatus();

    console.log(`\n${colors.bold}${colors.green}Status check completed!${colors.reset}`);
    console.log(`${colors.blue}Run the debug-and-fix.js script to automatically resolve common issues.${colors.reset}\n`);
  }
}

// Run the status checker
const statusChecker = new FinAutoJobsStatusChecker();
statusChecker.run().catch(console.error);
