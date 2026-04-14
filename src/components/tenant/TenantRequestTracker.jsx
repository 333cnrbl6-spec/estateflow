import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const STATUS_CONFIG = {
  open: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950', label: 'Open' },
  in_progress: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950', label: 'Completed' },
  cancelled: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950', label: 'Cancelled' }
};

export default function TenantRequestTracker({ propertyId, unitId }) {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['tenant-requests', propertyId, unitId],
    queryFn: async () => {
      const allRequests = await base44.entities.MaintenanceRequest.filter(
        { property_id: propertyId, unit_id: unitId },
        '-created_at',
        50
      );
      return allRequests.filter(r => r.reported_by === 'tenant');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground font-semibold">No maintenance requests yet</p>
        <p className="text-sm text-muted-foreground mt-1">Submit a request to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map(request => {
        const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.open;
        const IconComponent = statusConfig.icon;

        return (
          <div key={request.id} className={`border border-border rounded-lg p-4 ${statusConfig.bgColor}`}>
            <div className="flex items-start gap-4">
              <IconComponent className={`w-5 h-5 shrink-0 mt-1 ${statusConfig.color}`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{request.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    request.status === 'completed' ? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100' :
                    request.status === 'in_progress' ? 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100' :
                    request.status === 'open' ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100' :
                    'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Photos */}
                {request.photo_urls && request.photo_urls.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {request.photo_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                      >
                        <img src={url} alt={`Request ${idx + 1}`} className="w-full h-20 object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Submitted: {format(parseISO(request.created_at), 'dd MMM yyyy')}</span>
                  {request.priority && (
                    <span className="capitalize px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded">
                      Priority: {request.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}