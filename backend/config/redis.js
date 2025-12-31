
import Redis from 'ioredis';

let redisClient;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

console.log('🔄 Attempting to connect to Redis...');

// Create Redis client with lazy connection to avoid immediate crash
// and retry strategy to keep trying or fail gracefully
try {
  redisClient = new Redis(REDIS_URL, {
    retryStrategy: (times) => {
      // Retry up to 3 times, then stop to avoid log spam if service is missing
      if (times > 3) {
        console.log('⚠️ Redis connection failed after 3 retries. Switching to in-memory fallback.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 1
  });

  redisClient.on('connect', () => {
    console.log('✅ Successfully connected to Redis.');
  });

  redisClient.on('error', (err) => {
    // Only log distinct errors to avoid spam
    if (err.code === 'ECONNREFUSED') {
      // Suppress ECONNREFUSED spam after initial failure log
    } else {
      console.error('❌ Redis Client Error:', err.message);
    }
  });

} catch (error) {
  console.error('❌ Could not initialize Redis client:', error);
}

// In-memory storage for the mock client
const memoryStore = new Map();

// Create a functional mock client for fallback if Redis is not available
const mockClient = {
  get: async (key) => {
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  },
  set: async (key, value, mode, duration) => {
    let expiry = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + (duration * 1000);
    }
    memoryStore.set(key, { value, expiry });
    return 'OK';
  },
  del: async (key) => {
    return memoryStore.delete(key) ? 1 : 0;
  },
  expire: async (key, seconds) => {
    const item = memoryStore.get(key);
    if (!item) return 0;
    item.expiry = Date.now() + (seconds * 1000);
    memoryStore.set(key, item);
    return 1;
  },
  quit: async () => 'OK',
  on: () => {},
  status: 'mock'
};

// Export a proxy that uses Redis if connected, or the mock if not
const safeClient = new Proxy(redisClient || mockClient, {
  get(target, prop) {
    // If Redis is not connected (or failed), use mock implementation for methods
    if (target.status !== 'ready' && target.status !== 'connecting') {
      if (prop in mockClient) {
        return mockClient[prop];
      }
    }
    return target[prop];
  }
});

export default safeClient;
