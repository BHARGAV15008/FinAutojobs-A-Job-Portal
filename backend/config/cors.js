import cors from "cors";
import networkConfig from "../utils/networkConfig.js";

/**
 * Dynamic CORS Configuration for Deployment Flexibility
 * Handles development, staging, and production environments
 * No hardcoded IPs - fully dynamic based on network configuration
 */

// Get allowed origins based on environment
const getAllowedOrigins = () => {
  // Get dynamic origins from network config
  const dynamicOrigins = networkConfig.getCORSOrigins();

  const baseOrigins = [
    // Dynamic origins from network config
    ...dynamicOrigins,

    // Environment-specific URLs
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,

    // Production domains
    "https://finautojobs.com",
    "https://www.finautojobs.com",
    "https://finautojobs.vercel.app",

    // Render.com deployments
    "https://finautojobs-frontend.onrender.com",
    "https://finautojobs.onrender.com",
    "https://finautojobs-a-job-portal-1-bctj.onrender.com",
    "https://finautojobs-a-job-portal-hk5c.onrender.com",
    "https://finautojobs-a-job-portal-pivn.onrender.com",

    // Staging environments
    "https://dev-finautojobs.vercel.app",
  ];

  // Add comma-separated origins from CORS_ORIGIN env var
  if (process.env.CORS_ORIGIN) {
    const additionalOrigins = process.env.CORS_ORIGIN.split(",").map((o) =>
      o.trim()
    );
    baseOrigins.push(...additionalOrigins);
  }

  // Filter out null/undefined values and remove duplicates
  return [...new Set(baseOrigins.filter(Boolean))];
};

// Check if origin matches deployment patterns
const isDeploymentOrigin = (origin) => {
  if (!origin) return false;

  // Production deployment patterns
  const productionPatterns = [
    /^https:\/\/.*\.onrender\.com$/,
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.herokuapp\.com$/,
    /^https:\/\/.*\.railway\.app$/,
    /^https:\/\/.*finautojobs.*$/,
    /^https:\/\/finautojobs-a-job-portal-.*\.onrender\.com$/,
  ];

  return productionPatterns.some((pattern) => pattern.test(origin));
};

// Check if origin is local network
const isLocalNetworkOrigin = (origin) => {
  if (!origin) return false;

  // Local network patterns
  const localPatterns = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
    /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
    /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:\d+)?$/,
  ];

  return localPatterns.some((pattern) => pattern.test(origin));
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    console.log("🔍 CORS Check:", {
      origin,
      environment: process.env.NODE_ENV,
      allowedCount: allowedOrigins.length,
    });

    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      console.log("✅ CORS: No origin (mobile/API client)");
      return callback(null, true);
    }

    // Check explicit allowed origins first
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Explicitly allowed origin: ${origin}`);
      return callback(null, true);
    }

    // Development environment - allow local networks
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      if (isLocalNetworkOrigin(origin)) {
        console.log(`✅ CORS: Local network origin allowed: ${origin}`);
        return callback(null, true);
      }
    }

    // Production/Staging - check deployment patterns
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
    ) {
      if (isDeploymentOrigin(origin)) {
        console.log(`✅ CORS: Deployment origin allowed: ${origin}`);
        return callback(null, true);
      }
    }

    // Wildcard patterns for dynamic deployments
    if (process.env.CORS_ALLOW_PATTERNS) {
      const patterns = process.env.CORS_ALLOW_PATTERNS.split(",");
      for (const pattern of patterns) {
        if (origin.includes(pattern.trim())) {
          console.log(
            `✅ CORS: Pattern match allowed: ${origin} (pattern: ${pattern})`
          );
          return callback(null, true);
        }
      }
    }

    console.log(`❌ CORS: Blocked origin: ${origin}`);

    // In development, log but still allow for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`⚠️ Development mode: allowing for debugging`);
      return callback(null, true);
    }

    // Production: strict blocking
    callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

export default corsOptions;
