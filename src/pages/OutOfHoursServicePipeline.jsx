import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUSES = [
  { id: 'logged', label: 'Logged', icon: Clock, color: 'bg-gray-50' },
  { id: 'escalated', label: 'Escalated', icon: AlertCircle, color: 'bg-orange-50' },
  { id: 'contractor_assigned', label: 'Assigned', icon: Zap, color: 'bg-blue-50' },
  { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-purple-50' },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'bg-green-50' },
];

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-900',
  high: 'bg-orange-100 text-orange-900',
  medium: 'bg-yellow-100 text-yellow-900',
  low: 'bg-blue-100 text-blue-900',
};

function CallCard({ call, isDragging }) {
  return (
    <Card
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all',
        isDragging && 'shadow-lg opacity-90'
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{call.caller_name}</p>
            <p className="text-xs text-muted-foreground truncate">{call.property_address}</p>
          </div>
          <Badge className={SEVERITY_COLORS[call.severity] || 'bg-gray-100'}>
            {call.severity}
          </Badge>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground line-clamp-2">{call.call_description}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {new Date(call.call_date_time).toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {call.matched_contractor_id && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Assigned</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OutOfHoursServicePipeline() {
  const queryClient = useQueryClient();
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const { data: calls = [] } = useQuery({
    queryKey: ['outOfHoursCalls'],
    queryFn: () => base44.entities.OutOfHoursCall.list(),
  });

  const updateCallMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.OutOfHoursCall.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outOfHoursCalls'] });
    },
  });

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    updateCallMutation.mutate({
      id: draggableId,
      status: destination.droppableId,
    });
  };

  const filteredCalls =
    selectedSeverity === 'all'
      ? calls
      : calls.filter((call) => call.severity === selectedSeverity);

  const callsByStatus = STATUSES.reduce((acc, status) => {
    acc[status.id] = filteredCalls.filter((call) => call.status === status.id);
    return acc;
  }, {});

  const stats = [
    {
      label: 'Total Calls',
      value: calls.length,
      subtitle: 'All time',
    },
    {
      label: 'Awaiting Action',
      value: calls.filter((c) => ['logged', 'escalated'].includes(c.status)).length,
      subtitle: 'Logged & Escalated',
    },
    {
      label: 'In Progress',
      value: callsByStatus.in_progress?.length || 0,
      subtitle: 'Currently handling',
    },
    {
      label: 'Resolved Today',
      value: calls.filter(
        (c) =>
          c.status === 'resolved' &&
          new Date(c.call_date_time).toDateString() === new Date().toDateString()
      ).length,
      subtitle: 'This 24h',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Out-of-Hours Pipeline"
        subtitle="Track incoming calls through resolution stages"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedSeverity === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSeverity('all')}
        >
          All Severity
        </Button>
        {['critical', 'high', 'medium', 'low'].map((severity) => (
          <Button
            key={severity}
            variant={selectedSeverity === severity ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeverity(severity)}
            className="capitalize"
          >
            {severity}
          </Button>
        ))}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-6">
          {STATUSES.map((status) => {
            const Icon = status.icon;
            const statusCalls = callsByStatus[status.id] || [];

            return (
              <Droppable key={status.id} droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'rounded-lg border-2 border-dashed p-4 min-h-96 transition-colors',
                      snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">{status.label}</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {statusCalls.length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {statusCalls.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">
                          No calls in this stage
                        </p>
                      ) : (
                        statusCalls.map((call, idx) => (
                          <Draggable key={call.id} draggableId={call.id} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <CallCard call={call} isDragging={snapshot.isDragging} />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}