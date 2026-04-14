import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Flag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TaskCard({ task, onEdit, onStatusChange }) {
  const deadline = new Date(task.deadline);
  const isOverdue = task.status !== 'completed' && isPast(deadline);
  const isDueToday = isToday(deadline);
  const isDueTomorrow = isTomorrow(deadline);

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700'
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    in_progress: <Clock className="w-4 h-4 animate-spin" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
    cancelled: <AlertCircle className="w-4 h-4" />
  };

  return (
    <Card className={cn(
      'p-4 hover:shadow-md transition-shadow',
      isOverdue && 'border-red-300 bg-red-50'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="ml-4 flex items-center gap-2">
          <Badge className={priorityColors[task.priority]} variant="outline">
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={statusColors[task.status]} variant="outline">
          {statusIcons[task.status]}
          <span className="ml-1">{task.status}</span>
        </Badge>
        {task.category && (
          <Badge variant="secondary">{task.category}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
            {isToday(deadline) ? 'Today' : isTomorrow(deadline) ? 'Tomorrow' : format(deadline, 'MMM d')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="truncate">{task.assigned_to}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onEdit(task)}
          variant="ghost"
          size="sm"
          className="flex-1"
        >
          Edit
        </Button>
        {task.status !== 'completed' && (
          <Button
            onClick={() => onStatusChange(task.id, 'completed')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Complete
          </Button>
        )}
      </div>

      {task.linked_entity_type !== 'none' && (
        <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-muted-foreground">
          Linked to: {task.linked_entity_type}
        </div>
      )}
    </Card>
  );
}