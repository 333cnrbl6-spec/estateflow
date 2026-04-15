import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { errorToastStore } from '@/lib/errorToastStore';

const TOAST_ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

function Toast({ toast, onRemove }) {
  const Icon = TOAST_ICONS[toast.type] || AlertCircle;
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.error;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${style} animate-in fade-in slide-in-from-top-2`}
      role="alert"
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ErrorToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = errorToastStore.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            toast={toast}
            onRemove={(id) => errorToastStore.remove(id)}
          />
        </div>
      ))}
    </div>
  );
}