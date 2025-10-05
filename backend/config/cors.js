import cors from 'cors';
import os from 'os';

// Get local network interfaces for dynamic CORS configuration
const getNetworkInterfaces = () => {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses;
};

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // In development or test, allow all origins
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            console.log(`🌐 CORS: Allowing origin in development: ${origin}`);
            return callback(null, true);
        }

        // Base allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://localhost:4173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:4173'
        ];

        // Add network interface IPs dynamically
        const networkIPs = getNetworkInterfaces();
        networkIPs.forEach(ip => {
            allowedOrigins.push(`http://${ip}:3000`);
            allowedOrigins.push(`http://${ip}:3001`);
            allowedOrigins.push(`http://${ip}:5173`);
            allowedOrigins.push(`http://${ip}:4173`);
        });

        // Add origins from environment variable
        if (process.env.CORS_ORIGINS) {
            const envOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
            allowedOrigins.push(...envOrigins);
        }

        // Add frontend URL from environment
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }

        console.log(`🌐 CORS: Checking origin: ${origin}`);
        console.log(`🌐 CORS: Allowed origins:`, allowedOrigins);

        if (allowedOrigins.includes(origin)) {
            console.log(`✅ CORS: Origin allowed: ${origin}`);
            callback(null, true);
        } else {
            console.log(`❌ CORS: Origin blocked: ${origin}`);
            // In production, be more strict
            if (process.env.NODE_ENV === 'production') {
                callback(new Error(`CORS: Origin ${origin} not allowed`));
            } else {
                // In development, log but allow
                console.log(`⚠️ CORS: Allowing unknown origin in development: ${origin}`);
                callback(null, true);
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-Token',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
    preflightContinue: false
};

export default corsOptions;
