import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Wrench, X } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  submitted: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Submitted' },
  assigned: { icon: Wrench, color: 'bg-purple-100 text-purple-700', label: 'Assigned' },
  in_progress: { icon: Wrench, color: 'bg-orange-100 text-orange-700', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Completed' },
  cancelled: { icon: X, color: 'bg-red-100 text-red-700', label: 'Cancelled' }
};

const PRIORITY_CONFIG = {
  routine: { label: 'Routine', color: 'bg-green-100 text-green-700' },
  moderate: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
  urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700' }
};

export default function RequestStatusTracker({ tenant }) {
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['maintenance-requests', tenant.id],
    queryFn: async () => {
      return await base44.entities.MaintenanceRequest.filter(
        { tenant_id: tenant.id },
        '-submitted_date',
        50
      );
    },
    refetchInterval: 5000 // Poll every 5 seconds for real-time updates
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.MaintenanceRequest.subscribe((event) => {
      if (event.data?.tenant_id === tenant.id) {
        refetch();
      }
    });

    return () => unsubscribe?.();
  }, [tenant.id, refetch]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-12 bg-white text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground mb-2">No maintenance requests yet</p>
        <p className="text-sm text-muted-foreground">Submit a request from the Maintenance tab to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map(request => {
        const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.submitted;
        const priorityConfig = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.moderate;
        const StatusIcon = statusConfig.icon;

        return (
          <Card key={request.id} className="p-6 bg-white hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color.split(' ').pop()}`} />
                  <h3 className="font-semibold text-foreground text-lg">{request.title}</h3>
                </div>

                <p className="text-muted-foreground text-sm mb-3">{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={`text-xs ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </Badge>
                  <Badge className={`text-xs ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {request.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Submitted</p>
                    {format(new Date(request.submitted_date), 'dd MMM yyyy, HH:mm')}
                  </div>
                  {request.assigned_contractor && (
                    <div>
                      <p className="font-semibold text-foreground">Assigned to</p>
                      {request.assigned_contractor}
                    </div>
                  )}
                  {request.completed_date && (
                    <div>
                      <p className="font-semibold text-foreground">Completed</p>
                      {format(new Date(request.completed_date), 'dd MMM yyyy, HH:mm')}
                    </div>
                  )}
                </div>

                {/* Photo Gallery */}
                {request.photo_urls?.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {request.photo_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow"
                      >
                        <img
                          src={url}
                          alt={`Request photo ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {request.notes && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Notes from contractor:</p>
                    <p className="text-sm text-blue-900">{request.notes}</p>
                  </div>
                )}
              </div>

              {/* Request ID */}
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">ID: {request.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}