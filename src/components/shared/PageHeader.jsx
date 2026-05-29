import React from 'react';

export default function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-border ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground tracking-tight truncate font-serif">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>
      )}
    </div>
  );
}