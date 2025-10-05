import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('🔧 Step 1: Loading environment variables...');
dotenv.config();
console.log('✅ Environment loaded');

console.log('🔧 Step 2: Testing CORS import...');
try {
    const corsOptionsModule = await import('./config/cors.js');
    console.log('✅ CORS config imported successfully');
} catch (error) {
    console.error('❌ CORS import failed:', error.message);
    process.exit(1);
}

console.log('🔧 Step 3: Testing database import...');
try {
    const databaseModule = await import('./config/database.js');
    console.log('✅ Database config imported successfully');
} catch (error) {
    console.error('❌ Database import failed:', error.message);
    process.exit(1);
}

console.log('🔧 Step 4: Testing middleware imports...');
try {
    const errorHandlerModule = await import('./middlewares/Others/errorHandler.js');
    console.log('✅ Error handler imported successfully');
} catch (error) {
    console.error('❌ Error handler import failed:', error.message);
}

try {
    const securityModule = await import('./middlewares/Others/security.js');
    console.log('✅ Security middleware imported successfully');
} catch (error) {
    console.error('❌ Security middleware import failed:', error.message);
}

console.log('🔧 Step 5: Creating Express app...');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/test', (req, res) => {
    res.json({ 
        message: 'Debug server working!',
        env: process.env.NODE_ENV,
        port: PORT
    });
});

console.log('🔧 Step 6: Starting server...');
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Debug server running on port ${PORT}`);
    console.log(`🔗 Test URL: http://localhost:${PORT}/test`);
});