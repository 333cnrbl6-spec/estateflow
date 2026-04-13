import { useCallback } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'You are not authorized to perform this action.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists or there is a conflict.',
  422: 'The data provided is invalid.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error occurred. Please try again later.',
  502: 'Gateway error. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  networkError: 'Network error. Please check your connection and try again.',
  timeout: 'Request timed out. Please try again.',
};

const getErrorMessage = (error, defaultMessage) => {
  // Axios error with status
  if (error.response?.status) {
    const status = error.response.status;
    const customMessage = error.response?.data?.message || error.response?.data?.error;
    return customMessage || ERROR_MESSAGES[status] || ERROR_MESSAGES[500];
  }

  // Custom error message
  if (error.message) {
    return error.message;
  }

  return defaultMessage || ERROR_MESSAGES[500];
};

/**
 * Hook for invoking backend functions with automatic error handling and toast notifications
 * @returns {Function} invoke function that wraps base44.functions.invoke with error handling
 */
export function useBackendFunctionError() {
  const invoke = useCallback(async (functionName, payload, options = {}) => {
    const {
      onError,
      onSuccess,
      showSuccessToast = false,
      successMessage = 'Operation completed successfully',
      errorTitle = 'Error',
    } = options;

    try {
      const response = await base44.functions.invoke(functionName, payload);

      // Check for error status in response
      if (response?.status >= 400) {
        const error = new Error(getErrorMessage(response, 'Operation failed'));
        error.status = response.status;
        error.response = response;
        throw error;
      }

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error, ERROR_MESSAGES[500]);

      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000,
      });

      if (onError) {
        onError(error);
      }

      // Re-throw for component-level handling if needed
      throw error;
    }
  }, []);

  return invoke;
}

/**
 * Utility function to invoke a backend function with error handling (non-hook version)
 * Useful when hook cannot be used (e.g., in event handlers at module level)
 */
export async function invokeWithErrorHandling(functionName, payload, options = {}) {
  const {
    onError,
    onSuccess,
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    errorTitle = 'Error',
  } = options;

  try {
    const response = await base44.functions.invoke(functionName, payload);

    if (response?.status >= 400) {
      const error = new Error(getErrorMessage(response, 'Operation failed'));
      error.status = response.status;
      error.response = response;
      throw error;
    }

    if (showSuccessToast) {
      toast.success(successMessage);
    }

    if (onSuccess) {
      onSuccess(response);
    }

    return response;
  } catch (error) {
    const errorMessage = getErrorMessage(error, ERROR_MESSAGES[500]);

    toast.error(errorTitle, {
      description: errorMessage,
      duration: 5000,
    });

    if (onError) {
      onError(error);
    }

    throw error;
  }
}