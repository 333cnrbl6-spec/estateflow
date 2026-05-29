import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * EmptyState — accepts either a Lucide icon component OR an emoji string.
 * Usage:
 *   <EmptyState icon={Users} title="No tenants" ... />
 *   <EmptyState icon="🏠" title="No properties" ... />
 */
export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction, className = '' }) {
  const isEmoji = typeof Icon === 'string';

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {isEmoji
          ? <span className="text-3xl leading-none">{Icon}</span>
          : <Icon className="w-8 h-8 text-muted-foreground" />
        }
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-0">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" size="sm">{actionLabel}</Button>
      )}
    </div>
  );
}