import { errorToastStore } from '@/lib/errorToastStore';

export function useErrorHandler() {
  return {
    handleError: (error, fallbackMessage = 'An error occurred') => {
      const message = error?.message || error?.data?.error || fallbackMessage;
      errorToastStore.error(message);
      console.error('[Error Handler]', error);
    },

    handleSuccess: (message = 'Operation successful') => {
      errorToastStore.success(message);
    },

    handleWarning: (message) => {
      errorToastStore.warning(message);
    },

    handleInfo: (message) => {
      errorToastStore.info(message);
    },

    handleMutationError: (error) => {
      const message = error?.response?.data?.error || error?.message || 'Operation failed';
      errorToastStore.error(message);
    },
  };
}