import React from 'react';
import { cn } from '@/lib/utils';

const ICON_COLOURS = [
  'bg-blue-50 text-blue-600',
  'bg-amber-50 text-amber-600',
  'bg-emerald-50 text-emerald-600',
  'bg-purple-50 text-purple-600',
  'bg-rose-50 text-rose-600',
  'bg-sky-50 text-sky-600',
];

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, colorIndex }) {
  const colourCls = ICON_COLOURS[(colorIndex ?? 0) % ICON_COLOURS.length];
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3 ${colourCls}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className={cn('text-xs font-semibold', trendUp ? 'text-emerald-600' : 'text-destructive')}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        </div>
      )}
    </div>
  );
}