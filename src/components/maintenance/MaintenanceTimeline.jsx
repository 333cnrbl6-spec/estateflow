import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  DollarSign,
  User,
  MessageSquare,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function MaintenanceTimeline({ request }) {
  if (!request) return null;

  const statusColors = {
    pending: { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Wrench },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle }
  };

  const getStatusIcon = (status) => {
    const config = statusColors[status] || statusColors.pending;
    const Icon = config.icon;
    return <Icon className={`w-6 h-6 ${config.text}`} />;
  };

  const timelineEvents = [
    {
      timestamp: request.created_date,
      status: 'reported',
      label: 'Maintenance Request Reported',
      details: `Priority: ${request.priority || 'Medium'}`,
      icon: AlertCircle,
      color: 'bg-slate-200'
    },
    ...(request.assigned_to ? [{
      timestamp: request.assigned_date || request.created_date,
      status: 'assigned',
      label: 'Contractor Assigned',
      details: `Assigned to: ${request.assigned_to}`,
      icon: User,
      color: 'bg-blue-200'
    }] : []),
    ...(request.start_date ? [{
      timestamp: request.start_date,
      status: 'started',
      label: 'Work Started',
      details: `Estimated duration: ${request.estimated_duration || 'TBD'} hours`,
      icon: Wrench,
      color: 'bg-amber-200'
    }] : []),
    ...(request.completion_date ? [{
      timestamp: request.completion_date,
      status: 'completed',
      label: 'Work Completed',
      details: `Completion notes: ${request.completion_notes || 'No notes'}`,
      icon: CheckCircle2,
      color: 'bg-green-200'
    }] : [])
  ];

  const estimatedCost = request.estimated_cost || 0;
  const actualCost = request.actual_cost || 0;
  const costDifference = actualCost - estimatedCost;

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{request.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
            </div>
            <Badge className={statusColors[request.status]?.bg}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Visual Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-8">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === timelineEvents.length - 1;

              return (
                <div key={index} className="relative flex gap-4">
                  {/* Connector Line */}
                  {!isLast && (
                    <div className="absolute left-5 top-12 w-1 h-8 bg-muted-foreground/20" />
                  )}

                  {/* Timeline Node */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${event.color}`}>
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{event.label}</h4>
                      {event.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Cost Allocation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold">£{(estimatedCost / 100).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Actual Cost</p>
              <p className="text-2xl font-bold">£{(actualCost / 100).toFixed(2)}</p>
            </div>
          </div>

          {actualCost > 0 && (
            <div className={`p-4 rounded-lg ${
              costDifference > 0
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Variance</p>
                  <p className={`font-semibold ${
                    costDifference > 0 ? 'text-amber-700' : 'text-green-700'
                  }`}>
                    {costDifference > 0 ? '+' : ''}£{(costDifference / 100).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">% Variance</p>
                  <p className="font-semibold text-sm">
                    {estimatedCost > 0 ? ((costDifference / estimatedCost) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contractor Activity */}
      {request.assigned_to && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5" />
              Contractor Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">{request.assigned_to}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {request.start_date && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      Started: {format(new Date(request.start_date), 'MMM d')}
                    </Badge>
                  )}
                  {request.completion_date && (
                    <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed: {format(new Date(request.completion_date), 'MMM d')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Activity Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                {request.estimated_duration && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estimated Hours</p>
                    <p className="font-semibold">{request.estimated_duration}h</p>
                  </div>
                )}
                {request.actual_hours && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Actual Hours</p>
                    <p className="font-semibold">{request.actual_hours}h</p>
                  </div>
                )}
              </div>
            </div>

            {/* Communication */}
            {request.messages_count && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {request.messages_count} message{request.messages_count !== 1 ? 's' : ''} in thread
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              <Badge variant="outline">{request.priority || 'Medium'}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <Badge variant="outline">{request.category || 'General'}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Property</p>
              <p className="text-sm font-medium truncate">{request.property_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Unit</p>
              <p className="text-sm font-medium truncate">{request.unit_id || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}