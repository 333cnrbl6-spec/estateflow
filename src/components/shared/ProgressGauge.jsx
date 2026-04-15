import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProgressGauge({ progress = 0, label = 'Processing...', status = 'processing' }) {
  const statusColors = {
    processing: 'text-primary',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  const statusBgColors = {
    processing: 'bg-primary/10',
    success: 'bg-green-100',
    warning: 'bg-amber-100',
    error: 'bg-red-100',
  };

  return (
    <div className={`p-4 rounded-lg ${statusBgColors[status]} space-y-3`}>
      <div className="flex items-center gap-2">
        {status === 'processing' && <Loader2 className={`w-4 h-4 animate-spin ${statusColors[status]}`} />}
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all duration-300`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className={`text-xs ${statusColors[status]} font-semibold`}>{Math.round(progress)}% Complete</p>
    </div>
  );
}