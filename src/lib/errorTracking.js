/**
 * Client-side error tracking integration
 * Captures runtime errors, API failures, and user actions
 * Configure with Sentry, Rollbar, or similar
 */

class ErrorTracker {
  constructor() {
    this.isProduction = window.location.hostname !== 'localhost';
    this.queue = [];
    this.maxQueueSize = 100;
  }

  initialize(config) {
    this.config = config;
    this.setupGlobalHandlers();
    this.setupAPIInterceptors();
  }

  setupGlobalHandlers() {
    // Uncaught errors
    window.addEventListener('error', (event) => {
      this.captureException({
        type: 'uncaught_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException({
        type: 'unhandled_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    });
  }

  setupAPIInterceptors() {
    // Track failed API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const duration = performance.now() - startTime;
          this.captureException({
            type: 'api_error',
            status: response.status,
            url: resource,
            duration,
            message: `API Error: ${response.status} ${response.statusText}`,
          });
        }

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.captureException({
          type: 'network_error',
          message: error.message,
          url: resource,
          duration,
          stack: error.stack,
        });
        throw error;
      }
    };
  }

  captureException(error) {
    const errorData = {
      ...error,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      environment: this.isProduction ? 'production' : 'development',
    };

    // Queue locally
    this.queue.push(errorData);
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }

    // Send to server (batch every 30 seconds or on error count > 5)
    this.flushIfNeeded();
  }

  captureMessage(message, level = 'info') {
    const messageData = {
      type: 'message',
      level,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    this.queue.push(messageData);
    this.flushIfNeeded();
  }

  async flushIfNeeded() {
    if (this.queue.length === 0) return;

    // Batch send if > 5 errors or queue growing
    if (this.queue.length >= 5 || this.queue.length > this.maxQueueSize * 0.8) {
      const batch = [...this.queue];
      this.queue = [];

      try {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ errors: batch }),
        });
      } catch (err) {
        // Silent fail - don't create recursive error loop
        console.error('[ErrorTracker] Failed to send batch:', err);
        this.queue = [...batch, ...this.queue].slice(0, this.maxQueueSize);
      }
    }
  }

  setUser(userId, email) {
    this.userId = userId;
    this.userEmail = email;
  }

  addBreadcrumb(message, category = 'user-action') {
    if (!this.breadcrumbs) this.breadcrumbs = [];
    this.breadcrumbs.push({
      timestamp: new Date().toISOString(),
      message,
      category,
    });
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs.shift();
    }
  }

  getSessionData() {
    return {
      userId: this.userId,
      userEmail: this.userEmail,
      errors: this.queue.length,
      breadcrumbs: this.breadcrumbs || [],
    };
  }
}

export const errorTracker = new ErrorTracker();