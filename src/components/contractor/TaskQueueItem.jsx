import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, ChevronRight } from 'lucide-react';
import { differenceInDays, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TaskQueueItem({ task, onClick }) {
  const deadline = new Date(task.deadline);
  const daysLeft = differenceInDays(deadline, new Date());
  const isOverdue = isPast(deadline) && task.status !== 'completed';

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer hover:shadow-md transition-shadow',
        isOverdue && 'border-red-300 bg-red-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2">{task.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{task.category}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Badge className={priorityColors[task.priority]} variant="outline" size="sm">
          <Flag className="w-3 h-3 mr-1" />
          {task.priority}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
          )}
        >
          <Calendar className="w-3 h-3 mr-1" />
          {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
        </Badge>
      </div>
    </Card>
  );
}