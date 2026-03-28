import { useCallback } from 'react';

/**
 * Hook to handle query errors consistently across the app
 */
export function useQueryError() {
  const getErrorMessage = useCallback((error) => {
    if (!error) return 'An unknown error occurred';

    if (error.message) return error.message;
    if (error.status === 401) return 'Please log in to continue';
    if (error.status === 403) return 'You do not have permission to perform this action';
    if (error.status === 404) return 'The requested resource was not found';
    if (error.status === 500) return 'Server error - please try again later';

    return 'An error occurred - please try again';
  }, []);

  const isAuthError = useCallback((error) => {
    return error?.status === 401 || error?.status === 403;
  }, []);

  const isNetworkError = useCallback((error) => {
    return error?.message === 'Network Error' || !navigator.onLine;
  }, []);

  return {
    getErrorMessage,
    isAuthError,
    isNetworkError,
  };
}