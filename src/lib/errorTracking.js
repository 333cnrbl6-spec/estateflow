import { base44 } from '@/api/base44Client';

/**
 * Frontend Error Tracking & Logging
 */

let errorBuffer = [];
const BUFFER_SIZE = 50;

export async function logError(errorData) {
  try {
    const user = await base44.auth.me().catch(() => null);
    
    const payload = {
      user_id: user?.id || null,
      user_email: user?.email || 'anonymous',
      error_type: errorData.type || 'uncaught_error',
      message: errorData.message || 'Unknown error',
      severity: errorData.severity || 'error',
      url: errorData.url || window.location.href,
      stack_trace: errorData.stack || '',
      user_agent: navigator.userAgent,
      environment: import.meta.env.MODE || 'production',
      timestamp: new Date().toISOString(),
      ...errorData.metadata
    };

    // Invoke backend function to log error
    await base44.functions.invoke('logErrorToDatabase', payload);
    
    console.log('[Error Tracker] Logged:', errorData.message);
  } catch (err) {
    console.error('[Error Tracker] Failed to log error:', err);
  }
}

/**
 * Capture unhandled errors
 */
export function initializeErrorTracking() {
  // Catch uncaught exceptions
  window.addEventListener('error', (event) => {
    logError({
      type: 'uncaught_error',
      message: event.message || 'Uncaught Error',
      stack: event.error?.stack || '',
      severity: 'error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError({
      type: 'unhandled_rejection',
      message: event.reason?.message || String(event.reason) || 'Unhandled Promise Rejection',
      stack: event.reason?.stack || '',
      severity: 'error'
    });
  });

  console.log('[Error Tracker] Initialized');
}

/**
 * Manual error logging for API/validation errors
 */
export async function logApiError(error, context = {}) {
  await logError({
    type: 'api_error',
    message: error.message || 'API Error',
    stack: error.stack || '',
    severity: error.status >= 500 ? 'critical' : 'error',
    metadata: {
      endpoint: context.endpoint,
      method: context.method,
      status: error.status,
      response: context.response
    }
  });
}

export async function logValidationError(message, fields = {}) {
  await logError({
    type: 'validation_error',
    message,
    severity: 'warning',
    metadata: { invalid_fields: fields }
  });
}

export async function logAuthError(message) {
  await logError({
    type: 'auth_error',
    message,
    severity: 'high'
  });
}