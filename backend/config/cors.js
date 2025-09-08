import cors from 'cors';

const corsOptions = {
    origin: (origin, callback) => {
        // In development, allow all origins
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            return callback(null, true);
        }

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:5173',
            'http://localhost:4173',
            'http://localhost:5000',
            'http://localhost:5001',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
            'http://127.0.0.1:3003',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:4173',
            'http://127.0.0.1:5000',
            'http://127.0.0.1:5001',
            'http://127.0.0.1:8080'
        ];

        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
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
