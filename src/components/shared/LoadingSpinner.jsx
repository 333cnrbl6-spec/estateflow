import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable loading spinner.
 * Usage: <LoadingSpinner /> or <LoadingSpinner size="sm" label="Loading data..." />
 */
export default function LoadingSpinner({ size = 'md', label = 'Loading...', className = '', fullPage = false }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-muted border-t-primary animate-spin',
          sizes[size] || sizes.md
        )}
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        {spinner}
      </div>
    );
  }

  return spinner;
}