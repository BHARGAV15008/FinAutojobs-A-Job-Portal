import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupTestEnvironment() {
  try {
    console.log('Setting up test environment...');
    
    // Ensure test database exists
    const dbSetup = 'node setup-test-database.js';
    execSync(dbSetup, { stdio: 'inherit' });
    
    console.log('Test environment setup complete.');
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    process.exit(1);
  }
}

async function runTests() {
  try {
    await setupTestEnvironment();
    
    console.log('Running tests...');
    const testCommand = 'npm test';
    execSync(testCommand, { stdio: 'inherit' });
    
    console.log('Tests completed successfully.');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
