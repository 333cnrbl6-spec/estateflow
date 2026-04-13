import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  reported: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'secondary', label: 'Reported' },
  assigned: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'default', label: 'Assigned' },
  in_progress: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'default', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', badge: 'outline', label: 'Completed' },
};

const PRIORITY_CONFIG = {
  emergency: 'destructive',
  urgent: 'default',
  standard: 'secondary',
  low: 'outline',
};

export default function OpenTickets({ tenantId, refreshKey }) {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tenantTickets', tenantId, refreshKey],
    queryFn: async () => {
      const result = await base44.entities.MaintenanceRequest.filter(
        {
          tenant_id: tenantId,
          status: { $in: ['reported', 'assigned', 'in_progress'] },
        },
        '-created_date',
        50
      );
      return result;
    },
  });

  const { data: completed } = useQuery({
    queryKey: ['tenantCompletedTickets', tenantId, refreshKey],
    queryFn: async () => {
      const result = await base44.entities.MaintenanceRequest.filter(
        { tenant_id: tenantId, status: 'completed' },
        '-completion_date',
        10
      );
      return result;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const openTickets = tickets || [];
  const completedTickets = completed || [];

  return (
    <div className="space-y-6">
      {/* Open Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Open Requests</CardTitle>
          <CardDescription>Maintenance requests currently being handled</CardDescription>
        </CardHeader>
        <CardContent>
          {openTickets.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No open requests</p>
          ) : (
            <div className="space-y-3">
              {openTickets.map(ticket => {
                const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.reported;
                const Icon = config.icon;
                const created = new Date(ticket.created_date);

                return (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-lg border transition-colors ${config.bg}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`w-5 h-5 ${config.color} mt-0.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900">{ticket.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>#{ticket.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{created.toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-2">
                        <Badge variant={config.badge}>{config.label}</Badge>
                        <Badge variant={PRIORITY_CONFIG[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>

                    {ticket.assigned_contractor_name && (
                      <div className="mt-3 pt-3 border-t border-current/10 text-xs">
                        <p className="text-muted-foreground">Assigned to</p>
                        <p className="font-medium text-slate-900">{ticket.assigned_contractor_name}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Completed */}
      {completedTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
            <CardDescription>Your maintenance requests that have been completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTickets.map(ticket => {
                const completed = new Date(ticket.completion_date);

                return (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg border bg-green-50/50 border-green-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{ticket.title}</h4>
                          <Badge variant="outline" className="text-green-700 border-green-200">Completed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.completion_notes}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed: {completed.toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}