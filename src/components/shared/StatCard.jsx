import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className={cn(
            "text-xs font-medium",
            trendUp ? "text-emerald-600" : "text-destructive"
          )}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        </div>
      )}
    </div>
  );
}