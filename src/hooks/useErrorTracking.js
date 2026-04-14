import { useEffect } from 'react';
import { logError, logApiError, logValidationError } from '@/lib/errorTracking';

/**
 * Hook to track async operation errors
 */
export function useErrorTracking() {
  const trackError = (error, context = {}) => {
    if (error.response?.status) {
      logApiError(error, context);
    } else if (error.message) {
      logError({
        type: context.type || 'error',
        message: error.message,
        stack: error.stack,
        severity: context.severity || 'error',
        metadata: context.metadata
      });
    }
  };

  return { trackError, logError, logValidationError };
}

/**
 * Hook to track React Query errors
 */
export function useTrackQueryErrors(queryKey, error) {
  useEffect(() => {
    if (error) {
      logError({
        type: 'api_error',
        message: `Query failed: ${queryKey.join('.')}`,
        stack: error.stack || '',
        severity: 'error',
        metadata: {
          queryKey,
          errorMessage: error.message
        }
      });
    }
  }, [error, queryKey]);
}