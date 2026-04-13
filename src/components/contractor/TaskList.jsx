import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  assigned: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, color: 'text-blue-600', label: 'Assigned' },
  in_progress: { bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, color: 'text-amber-600', label: 'In Progress' },
  completed: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2, color: 'text-green-600', label: 'Completed' },
};

const PRIORITY_CONFIG = {
  emergency: { color: 'destructive', label: 'Emergency' },
  urgent: { color: 'default', label: 'Urgent' },
  standard: { color: 'secondary', label: 'Standard' },
  low: { color: 'outline', label: 'Low' },
};

export default function TaskList({ tasks, onSelectTask, loading }) {
  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No tasks assigned yet</p>
      </Card>
    );
  }

  // Group by status
  const grouped = {
    assigned: tasks.filter(t => t.status === 'assigned'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([status, statusTasks]) => {
        if (statusTasks.length === 0) return null;
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;

        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <h3 className="font-semibold text-slate-900">{config.label}</h3>
              <Badge variant="secondary">{statusTasks.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {statusTasks.map(task => (
                <Card
                  key={task.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${config.bg} border-l-4 ${config.border}`}
                  onClick={() => onSelectTask(task)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-slate-900 truncate">{task.title}</h4>
                          <Badge variant={PRIORITY_CONFIG[task.priority]?.color || 'secondary'}>
                            {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          {task.scheduled_date && (
                            <span>Scheduled: {new Date(task.scheduled_date).toLocaleDateString()}</span>
                          )}
                          {task.estimated_cost && (
                            <span>Est. Cost: £{task.estimated_cost.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}