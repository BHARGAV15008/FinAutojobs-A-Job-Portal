import { execSync } from 'child_process';

console.log('Starting test sequence...');

// Start server in background
const serverProcess = execSync('node server.js &');

// Wait for server to start
console.log('Waiting for server to start...');
setTimeout(() => {
    console.log('Running tests...');
    
    // Run tests
    try {
        execSync('node test-jobs.js', { stdio: 'inherit' });
        execSync('node test-applications.js', { stdio: 'inherit' });
        execSync('node test-notifications.js', { stdio: 'inherit' });
    } catch (error) {
        console.error('Test execution error:', error.message);
    }

    // Kill server process
    execSync('pkill -f "node server.js"');
}, 5000);
