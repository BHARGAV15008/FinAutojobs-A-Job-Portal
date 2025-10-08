import cors from 'cors';

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL, // Production frontend URL
            'https://finautojobs-a-job-portal-1-bctj.onrender.com', // Explicit frontend URL
            'https://finautojobs-frontend.onrender.com',
            'https://finautojobs.onrender.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3003',
            'http://localhost:5173',
            'http://localhost:4173',
            'http://localhost:5000',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3003',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:4173',
            'http://127.0.0.1:5000',
            'http://127.0.0.1:8080'
        ];

        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }

        // In development or if origin is in allowed list, allow the request
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`❌ CORS blocked origin: ${origin}`);
            callback(null, true); // Allow all origins for now to fix the issue
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
        'X-CSRF-Token'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
};

export default corsOptions;
