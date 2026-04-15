/**
 * Global error toast store
 * Singleton pattern to manage error/success notifications across the app
 */

let listeners = [];
let toastQueue = [];

export const errorToastStore = {
  subscribe: (callback) => {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  toast: (message, type = 'error', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type, duration };
    toastQueue.push(toast);
    listeners.forEach(cb => cb([...toastQueue]));

    if (duration > 0) {
      setTimeout(() => {
        toastQueue = toastQueue.filter(t => t.id !== id);
        listeners.forEach(cb => cb([...toastQueue]));
      }, duration);
    }

    return id;
  },

  error: (message, duration = 5000) => errorToastStore.toast(message, 'error', duration),
  success: (message, duration = 3000) => errorToastStore.toast(message, 'success', duration),
  warning: (message, duration = 4000) => errorToastStore.toast(message, 'warning', duration),
  info: (message, duration = 3000) => errorToastStore.toast(message, 'info', duration),

  remove: (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    listeners.forEach(cb => cb([...toastQueue]));
  },

  clear: () => {
    toastQueue = [];
    listeners.forEach(cb => cb([]));
  },

  getToasts: () => [...toastQueue],
};