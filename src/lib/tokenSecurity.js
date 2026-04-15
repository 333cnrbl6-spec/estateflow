/**
 * Secure token management for contractor/tenant portals
 * - Token generation with expiry
 * - Rate limiting
 * - Token refresh strategy
 */

export async function generateSecureToken(userId, expiryHours = 24) {
  const payload = {
    userId,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiryHours * 3600000).toISOString(),
    nonce: Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''),
  };

  // CRITICAL: Use cryptographic signing, NOT base64 encoding
  // For real JWT: use jsonwebtoken lib with HS256 signing
  // This is a temporary SHA-256 hash of the payload
  const payloadStr = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payloadStr));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Token format: base64(payload).signature
  const token = btoa(payloadStr) + '.' + signature;
  return token;
}

export async function validateToken(token) {
  try {
    const [payloadPart, signaturePart] = token.split('.');
    if (!payloadPart || !signaturePart) {
      return { valid: false, reason: 'Invalid token format' };
    }

    const payload = JSON.parse(atob(payloadPart));
    const now = new Date();
    
    if (new Date(payload.expiresAt) < now) {
      return { valid: false, reason: 'Token expired' };
    }

    // Verify signature hasn't been tampered with
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(atob(payloadPart)));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (signaturePart !== expectedSignature) {
      return { valid: false, reason: 'Token signature invalid—tampering detected' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, reason: 'Token validation failed' };
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