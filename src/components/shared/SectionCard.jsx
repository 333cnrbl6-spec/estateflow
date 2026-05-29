import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Consistent card wrapper for all page sections.
 * Replaces ad-hoc div+shadow patterns throughout the app.
 * Usage: <SectionCard title="My Section" subtitle="..." actions={<Button />}>...</SectionCard>
 */
export default function SectionCard({ title, subtitle, actions, children, className = '', noPadding = false }) {
  return (
    <div className={cn('bg-card rounded-xl border border-border shadow-sm', className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border">
          <div className="min-w-0">
            {title && <h3 className="font-semibold text-foreground truncate">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'p-6')}>
        {children}
      </div>
    </div>
  );
}