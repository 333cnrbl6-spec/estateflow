import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Uses design-system tokens, not raw Tailwind colours
const ICON_STYLES = [
  'bg-primary/10 text-primary',
  'bg-accent/15 text-accent',
  'bg-success/10 text-success',
  'bg-destructive/10 text-destructive',
  'bg-warning/10 text-warning',
  'bg-muted text-muted-foreground',
];

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, colorIndex, onClick }) {
  const iconStyle = ICON_STYLES[(colorIndex ?? 0) % ICON_STYLES.length];

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl border border-border p-5 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-sans">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums font-display">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3', iconStyle)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1">
          {trendUp
            ? <TrendingUp className="w-3.5 h-3.5 text-success" />
            : <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          }
          <span className={cn('text-xs font-semibold', trendUp ? 'text-success' : 'text-destructive')}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}