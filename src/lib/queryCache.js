/**
 * queryCache — In-memory caching layer for expensive queries
 * Reduces redundant API calls, improves page performance
 */

class QueryCache {
  constructor(defaultTTL = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.timers = new Map();
  }

  // Set cache entry
  set(key, value, ttlMs = this.defaultTTL) {
    // Clear old timer if exists
    if (this.timers.has(key)) clearTimeout(this.timers.get(key));

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    // Auto-expire after TTL
    const timer = setTimeout(() => this.delete(key), ttlMs);
    this.timers.set(key, timer);
  }

  // Get cache entry
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.value;
  }

  // Check if key exists (not expired)
  has(key) {
    return this.get(key) !== null;
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  // Clear all cache
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  // Get cache stats
  stats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
      })),
    };
  }
}

// Singleton instance
const globalCache = new QueryCache();

export { QueryCache, globalCache };