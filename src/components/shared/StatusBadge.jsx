import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  // Generic states
  active:      'bg-success/10 text-success border-success/20',
  inactive:    'bg-muted text-muted-foreground border-border',
  pending:     'bg-warning/10 text-warning border-warning/20',
  suspended:   'bg-destructive/10 text-destructive border-destructive/20',
  archived:    'bg-muted text-muted-foreground border-border',

  // Compliance / certificates
  valid:       'bg-success/10 text-success border-success/20',
  expiring:    'bg-warning/10 text-warning border-warning/20',
  expired:     'bg-destructive/10 text-destructive border-destructive/20',
  critical:    'bg-destructive/10 text-destructive border-destructive/20',
  warning:     'bg-warning/10 text-warning border-warning/20',
  upcoming:    'bg-primary/10 text-primary border-primary/20',
  compliant:   'bg-success/10 text-success border-success/20',
  overdue:     'bg-destructive/10 text-destructive border-destructive/20',

  // Maintenance
  open:        'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-warning/10 text-warning border-warning/20',
  resolved:    'bg-success/10 text-success border-success/20',
  closed:      'bg-muted text-muted-foreground border-border',
  assigned:    'bg-primary/10 text-primary border-primary/20',
  emergency:   'bg-destructive/10 text-destructive border-destructive/20',
  high:        'bg-destructive/10 text-destructive border-destructive/20',
  medium:      'bg-warning/10 text-warning border-warning/20',
  low:         'bg-success/10 text-success border-success/20',

  // Tenancy
  draft:       'bg-muted text-muted-foreground border-border',
  live:        'bg-success/10 text-success border-success/20',
  ended:       'bg-muted text-muted-foreground border-border',
  notice:      'bg-warning/10 text-warning border-warning/20',

  // Finance
  paid:        'bg-success/10 text-success border-success/20',
  unpaid:      'bg-destructive/10 text-destructive border-destructive/20',
  partial:     'bg-warning/10 text-warning border-warning/20',

  // Fallback
  default:     'bg-secondary text-secondary-foreground border-border',
};

export default function StatusBadge({ status, label, className = '' }) {
  if (!status) return null;
  const key = (status || '').toLowerCase().replace(/\s+/g, '_');
  const style = STATUS_STYLES[key] || STATUS_STYLES.default;
  const display = label || status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        style,
        className
      )}
    >
      {display}
    </span>
  );
}