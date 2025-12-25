/**
 * Simple in-memory cache for API responses
 * Reduces database queries for frequently accessed data
 */

class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Get item from cache
     * @param {string} key - Cache key
     * @returns {any|null} - Cached value or null if expired/missing
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Set item in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
     */
    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    }

    /**
     * Invalidate a specific cache key
     * @param {string} key - Cache key to invalidate
     */
    invalidate(key) {
        this.cache.delete(key);
    }

    /**
     * Invalidate all keys matching a pattern
     * @param {string} pattern - Pattern to match (e.g., 'works' invalidates 'works', 'works:123')
     */
    invalidatePattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    stats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
const cache = new MemoryCache();

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
    SHORT: 1 * 60 * 1000,      // 1 minute - for frequently changing data
    MEDIUM: 5 * 60 * 1000,     // 5 minutes - default
    LONG: 30 * 60 * 1000,      // 30 minutes - for static content
    HOUR: 60 * 60 * 1000,      // 1 hour - for rarely changing data
};

module.exports = { cache, CACHE_TTL };
