/**
 * Secure token management for contractor/tenant portals
 * - Token generation with expiry
 * - Rate limiting
 * - Token refresh strategy
 */

export function generateSecureToken(userId, expiryHours = 24) {
  const payload = {
    userId,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiryHours * 3600000).toISOString(),
    nonce: Math.random().toString(36).substring(2, 15),
  };

  // In production, use cryptographic signing (e.g., JWT with secret)
  const token = btoa(JSON.stringify(payload));
  return token;
}

export function validateToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    const now = new Date();
    
    if (new Date(payload.expiresAt) < now) {
      return { valid: false, reason: 'Token expired' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, reason: 'Invalid token format' };
  }
}

export function extractUserIdFromToken(token) {
  const validation = validateToken(token);
  if (!validation.valid) return null;
  return validation.payload.userId;
}

const RATE_LIMIT_STORE = new Map();

export function checkRateLimit(userId, maxRequests = 100, windowSeconds = 60) {
  const key = `${userId}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
  const current = RATE_LIMIT_STORE.get(key) || 0;

  if (current >= maxRequests) {
    return { allowed: false, retryAfter: windowSeconds };
  }

  RATE_LIMIT_STORE.set(key, current + 1);
  
  // Cleanup old entries every hour
  if (RATE_LIMIT_STORE.size > 10000) {
    const now = Math.floor(Date.now() / 1000 / windowSeconds);
    for (const [k] of RATE_LIMIT_STORE) {
      const keyWindow = parseInt(k.split(':')[1]);
      if (keyWindow < now - 3600) RATE_LIMIT_STORE.delete(k);
    }
  }

  return { allowed: true };
}

export function maskToken(token) {
  if (!token || token.length < 8) return '[INVALID]';
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}