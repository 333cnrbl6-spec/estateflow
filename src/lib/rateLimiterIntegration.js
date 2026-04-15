/**
 * Rate limiter wrapper for backend functions
 * Usage: apply to detectConflictsOfInterest, seeders, demo generators
 */

const limits = new Map();

export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  let record = limits.get(key);

  if (!record || now - record.resetTime > windowMs) {
    record = { count: 0, resetTime: now };
    limits.set(key, record);
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime + windowMs - now) / 1000);
    const error = new Error(`Rate limit exceeded. Retry after ${retryAfter}s.`);
    error.status = 429;
    error.retryAfter = retryAfter;
    throw error;
  }

  record.count++;
  return true;
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of limits.entries()) {
    if (now - record.resetTime > 600000) {
      limits.delete(key);
    }
  }
}, 600000);