import React from 'react';
import { toast } from 'sonner';

/**
 * Wraps async operations to automatically display errors as toasts
 * Usage: <AsyncOperation fn={() => someAsyncFunc()} onSuccess={handler} />
 */
export default function AsyncOperation({ 
  fn, 
  onSuccess, 
  onError, 
  children,
  showSuccessToast = false,
  successMessage = 'Success!',
  errorTitle = 'Error'
}) {
  const execute = async (...args) => {
    try {
      const result = await fn(...args);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
      
      toast.error(errorTitle, {
        description: message,
        duration: 5000,
      });
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  };

  return typeof children === 'function' ? children(execute) : children;
}