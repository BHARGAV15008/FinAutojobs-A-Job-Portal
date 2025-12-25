/**
 * Cache Service
 * Provides in-memory caching with Redis-like interface
 * Can be extended to use Redis for distributed caching
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.expiryTimers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null
   */
  get(key) {
    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key);
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl = null) {
    // Clear existing expiry timer if any
    if (this.expiryTimers.has(key)) {
      clearTimeout(this.expiryTimers.get(key));
    }

    this.cache.set(key, value);
    this.stats.sets++;

    // Set expiry timer if TTL is provided
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);

      this.expiryTimers.set(key, timer);
    }

    return true;
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {boolean} - Whether the key was deleted
   */
  delete(key) {
    if (this.expiryTimers.has(key)) {
      clearTimeout(this.expiryTimers.get(key));
      this.expiryTimers.delete(key);
    }

    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    this.expiryTimers.forEach((timer) => clearTimeout(timer));
    this.expiryTimers.clear();

    // Clear cache
    this.cache.clear();
    console.log("Cache cleared");
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (
            (this.stats.hits / (this.stats.hits + this.stats.misses)) *
            100
          ).toFixed(2)
        : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get or set cache value (fetch if not exists)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch value if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - Cached or fetched value
   */
  async getOrSet(key, fetchFn, ttl = 300) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fetchFn();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      console.error(`Error fetching value for cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Key pattern (supports * wildcard)
   * @returns {number} - Number of keys deleted
   */
  deletePattern(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    let deleted = 0;

    this.cache.forEach((value, key) => {
      if (regex.test(key)) {
        this.delete(key);
        deleted++;
      }
    });

    return deleted;
  }

  /**
   * Get all keys
   * @returns {Array<string>} - Array of all cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   * @returns {number} - Number of cached items
   */
  size() {
    return this.cache.size;
  }

  /**
   * Set multiple values at once
   * @param {Object} entries - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds (optional)
   */
  setMany(entries, ttl = null) {
    Object.entries(entries).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
  }

  /**
   * Get multiple values at once
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Object} - Object with key-value pairs
   */
  getMany(keys) {
    const result = {};
    keys.forEach((key) => {
      const value = this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    });
    return result;
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Common cache key generators
export const CacheKeys = {
  user: (userId) => `user:${userId}`,
  job: (jobId) => `job:${jobId}`,
  jobs: (filters) => `jobs:${JSON.stringify(filters)}`,
  application: (appId) => `application:${appId}`,
  applications: (userId) => `applications:${userId}`,
  savedJobs: (userId) => `savedJobs:${userId}`,
  recommendations: (userId) => `recommendations:${userId}`,
  stats: (type) => `stats:${type}`,
  analytics: (period) => `analytics:${period}`,
};

export default cacheService;
