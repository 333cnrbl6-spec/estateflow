import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dissolved: 'bg-slate-100 text-slate-600 border-slate-200',
  dormant: 'bg-amber-50 text-amber-700 border-amber-200',
  occupied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  vacant: 'bg-red-50 text-red-600 border-red-200',
  under_renovation: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-600 border-red-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  partial: 'bg-blue-50 text-blue-600 border-blue-200',
  reported: 'bg-blue-50 text-blue-600 border-blue-200',
  assessed: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  quoted: 'bg-purple-50 text-purple-600 border-purple-200',
  approved: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  emergency: 'bg-red-50 text-red-600 border-red-200',
  urgent: 'bg-orange-50 text-orange-600 border-orange-200',
  standard: 'bg-blue-50 text-blue-600 border-blue-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  in_arrears: 'bg-red-50 text-red-600 border-red-200',
  notice_given: 'bg-amber-50 text-amber-700 border-amber-200',
  former: 'bg-slate-100 text-slate-600 border-slate-200',
  income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expense: 'bg-red-50 text-red-600 border-red-200',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const label = status.replace(/_/g, ' ');
  return (
    <Badge variant="outline" className={cn('capitalize text-[11px] font-medium', statusStyles[status] || 'bg-muted text-muted-foreground')}>
      {label}
    </Badge>
  );
}