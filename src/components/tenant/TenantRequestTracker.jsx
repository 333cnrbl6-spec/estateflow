import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
  reported: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Reported' },
  assigned: { color: 'bg-purple-100 text-purple-700', icon: Clock, label: 'Assigned' },
  in_progress: { color: 'bg-orange-100 text-orange-700', icon: Clock, label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-gray-100 text-gray-700', icon: AlertTriangle, label: 'Cancelled' },
};

export default function TenantRequestTracker({ tenantId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to real-time updates
    const unsubscribe = base44.entities.MaintenanceRequest.subscribe((event) => {
      if (event.type === 'update') {
        setRequests(prev => prev.map(r => r.id === event.id ? event.data : r));
      } else if (event.type === 'create') {
        setRequests(prev => [event.data, ...prev]);
      }
    });

    return unsubscribe;
  }, [tenantId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MaintenanceRequest.filter({
        tenant_id: tenantId,
      }, '-created_date', 50);
      setRequests(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (filter === 'active') return requests.filter(r => !['completed', 'cancelled'].includes(r.status));
    if (filter === 'completed') return requests.filter(r => r.status === 'completed');
    return requests;
  };

  const filtered = getFilteredRequests();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Loading maintenance requests...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Maintenance Requests</CardTitle>
            <div className="flex gap-2">
              {['all', 'active', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {requests.length === 0 ? (
                <>
                  <p className="font-medium">No maintenance requests yet</p>
                  <p className="text-sm mt-1">Submit a request to get started</p>
                </>
              ) : (
                <p>No {filter} requests</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(request => {
                const config = STATUS_CONFIG[request.status];
                const Icon = config.icon;
                return (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">{request.title}</p>
                          <Badge className={config.color} variant="outline">
                            {config.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{request.description}</p>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Category: {request.category}</span>
                          <span>•</span>
                          <span>Priority: {request.priority}</span>
                          <span>•</span>
                          <span>
                            {new Date(request.created_date).toLocaleDateString()}
                          </span>
                        </div>

                        {request.assigned_contractor_name && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs">
                              <span className="font-medium text-blue-900">Assigned to:</span>{' '}
                              <span className="text-blue-700">{request.assigned_contractor_name}</span>
                            </p>
                          </div>
                        )}

                        {request.completion_notes && (
                          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-700">
                              <span className="font-medium">Completed:</span> {request.completion_notes}
                            </p>
                          </div>
                        )}

                        {request.photos && request.photos.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Attached photos ({request.photos.length})
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {request.photos.map((photo, idx) => (
                                <img
                                  key={idx}
                                  src={photo}
                                  alt={`Request photo ${idx + 1}`}
                                  className="w-full h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <Icon className={`w-5 h-5 mt-1 flex-shrink-0`} style={{ color: config.color.split(' ')[1] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}