/**
 * Centralized error handling for production safety
 * - Logs errors with context
 * - Masks sensitive data
 * - Implements retry logic
 * - Tracks error patterns
 */

export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, context = {}) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

// Sensitive patterns to mask
const SENSITIVE_PATTERNS = [
  /["']password["']?\s*:\s*["'][^"']*["']/gi,
  /["']email["']?\s*:\s*["'][^"']*["']/gi,
  /["']token["']?\s*:\s*["'][^"']*["']/gi,
  /["']stripe_key["']?\s*:\s*["'][^"']*["']/gi,
];

export function maskSensitiveData(data) {
  if (!data) return data;
  let str = JSON.stringify(data);
  SENSITIVE_PATTERNS.forEach(pattern => {
    str = str.replace(pattern, (match) => match.split(':')[0] + ': "[REDACTED]"');
  });
  return JSON.parse(str);
}

export async function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: error.stack,
    context: maskSensitiveData(context),
    statusCode: error.statusCode || 500,
  };

  // Log to console in development, external service in production
  if (typeof window === 'undefined') {
    // Backend logging
    console.error('[ERROR]', JSON.stringify(errorLog, null, 2));
  } else {
    // Frontend - send to monitoring service
    try {
      await fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog),
      });
    } catch (e) {
      console.error('[LOG_FAILED]', e);
    }
  }

  return errorLog;
}

export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export function validateInput(data, schema) {
  const errors = [];
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    if (rules.required && !value) errors.push(`${field} is required`);
    if (rules.type && typeof value !== rules.type) errors.push(`${field} must be ${rules.type}`);
    if (rules.maxLength && value?.length > rules.maxLength) {
      errors.push(`${field} must be less than ${rules.maxLength} characters`);
    }
    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }
  });
  return errors;
}