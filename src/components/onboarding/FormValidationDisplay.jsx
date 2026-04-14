import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FormValidationDisplay({ errors, touched, field }) {
  if (!touched || !errors) return null;

  const error = errors[field];
  if (!error) {
    return (
      <div className="flex items-center gap-2 mt-1 text-sm text-green-600">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Looks good</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 mt-1 text-sm text-red-600">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );
}