#!/usr/bin/env node

/**
 * FinAutoJobs - Test Loop Script
 * Runs the test suite 3 consecutive times and stops when all pass
 */

import { spawn } from 'child_process';
import chalk from 'chalk';

class TestRunner {
  constructor() {
    this.maxRuns = 3;
    this.currentRun = 0;
    this.consecutiveSuccesses = 0;
    this.targetSuccesses = 3;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    switch (type) {
      case 'success':
        console.log(chalk.green(`✅ [${timestamp}] ${message}`));
        break;
      case 'error':
        console.log(chalk.red(`❌ [${timestamp}] ${message}`));
        break;
      case 'warning':
        console.log(chalk.yellow(`⚠️  [${timestamp}] ${message}`));
        break;
      case 'info':
        console.log(chalk.blue(`ℹ️  [${timestamp}] ${message}`));
        break;
      default:
        console.log(`[${timestamp}] ${message}`);
    }
  }

  async runTest() {
    return new Promise((resolve) => {
      this.currentRun++;
      this.log(`Starting test run ${this.currentRun}/${this.maxRuns}`, 'info');
      this.log('=' .repeat(60), 'info');

      const testProcess = spawn('node', ['test-automation.js'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          this.consecutiveSuccesses++;
          this.log(`Test run ${this.currentRun} PASSED ✅`, 'success');
          this.log(`Consecutive successes: ${this.consecutiveSuccesses}/${this.targetSuccesses}`, 'success');
        } else {
          this.consecutiveSuccesses = 0; // Reset counter on failure
          this.log(`Test run ${this.currentRun} FAILED ❌`, 'error');
          this.log('Consecutive successes reset to 0', 'warning');
        }
        
        resolve(code === 0);
      });

      testProcess.on('error', (error) => {
        this.log(`Test process error: ${error.message}`, 'error');
        this.consecutiveSuccesses = 0;
        resolve(false);
      });
    });
  }

  async runLoop() {
    this.log('🚀 Starting FinAutoJobs Test Loop', 'info');
    this.log(`Target: ${this.targetSuccesses} consecutive successful runs`, 'info');
    this.log('=' .repeat(60), 'info');

    while (this.currentRun < this.maxRuns && this.consecutiveSuccesses < this.targetSuccesses) {
      const success = await this.runTest();
      
      if (this.consecutiveSuccesses >= this.targetSuccesses) {
        this.log('🎉 SUCCESS! All tests passed 3 consecutive times!', 'success');
        this.log('The system is stable and ready for production.', 'success');
        return true;
      }

      if (this.currentRun < this.maxRuns) {
        this.log(`Waiting 5 seconds before next run...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (this.consecutiveSuccesses < this.targetSuccesses) {
      this.log('❌ FAILED to achieve 3 consecutive successful runs', 'error');
      this.log('Please check the errors and fix the issues before retrying.', 'error');
      return false;
    }

    return true;
  }
}

// Install dependencies first
async function installDependencies() {
  console.log(chalk.blue('📦 Installing test dependencies...'));
  
  return new Promise((resolve) => {
    const installProcess = spawn('npm', ['install', '--package-lock=false'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ Dependencies installed successfully'));
        resolve(true);
      } else {
        console.log(chalk.red('❌ Failed to install dependencies'));
        resolve(false);
      }
    });
  });
}

// Main execution
async function main() {
  // Copy package.json for dependencies
  const fs = await import('fs');
  try {
    const packageContent = fs.readFileSync('test-package.json', 'utf8');
    fs.writeFileSync('package.json', packageContent);
    console.log(chalk.blue('📄 Package.json created for testing'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to create package.json'));
    process.exit(1);
  }

  // Install dependencies
  const depsInstalled = await installDependencies();
  if (!depsInstalled) {
    console.log(chalk.red('❌ Cannot proceed without dependencies'));
    process.exit(1);
  }

  // Run the test loop
  const runner = new TestRunner();
  const success = await runner.runLoop();
  
  // Cleanup
  try {
    fs.unlinkSync('package.json');
    if (fs.existsSync('node_modules')) {
      fs.rmSync('node_modules', { recursive: true, force: true });
    }
    console.log(chalk.blue('🧹 Cleaned up test files'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not clean up all test files'));
  }

  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error(chalk.red(`💥 Test runner crashed: ${error.message}`));
  process.exit(1);
});
