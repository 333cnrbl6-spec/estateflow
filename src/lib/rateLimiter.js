/**
 * Simple in-memory rate limiter
 * Use for protecting expensive backend operations
 */

const limiterStore = new Map();

/**
 * Create a rate limiter function
 * @param {number} maxRequests - Max requests allowed in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {function} Limiter that throws if exceeded
 *
 * Usage:
 * const scanLimiter = createRateLimiter(5, 60000); // 5 scans per minute
 * scanLimiter(user.email); // Will throw if exceeded
 */
export function createRateLimiter(maxRequests = 10, windowMs = 60000) {
  return (identifier) => {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs);
    const key = `${identifier}:${windowStart}`;

    const count = limiterStore.get(key) || 0;

    if (count >= maxRequests) {
      const error = new Error(`Rate limit exceeded: ${maxRequests} requests per ${windowMs / 1000}s`);
      error.status = 429;
      throw error;
    }

    limiterStore.set(key, count + 1);

    // Cleanup old entries (prevent memory leak)
    if (limiterStore.size > 10000) {
      const oldestKey = Math.floor(now / windowMs) - 2;
      for (const [k] of limiterStore) {
        const [, window] = k.split(':');
        if (parseInt(window) < oldestKey) {
          limiterStore.delete(k);
        }
      }
    }
  };
}

/**
 * Rate limit by user ID
 */
export const byUserId = (limiter, user) => {
  if (!user?.id) throw new Error('User ID required for rate limiting');
  return limiter(user.id);
};

/**
 * Rate limit by email address
 */
export const byEmail = (limiter, user) => {
  if (!user?.email) throw new Error('User email required for rate limiting');
  return limiter(user.email);
};

/**
 * Rate limit by IP address (if available)
 */
export const byIp = (limiter, req) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';
  return limiter(ip);
};