import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Plus } from 'lucide-react';
import MaintenanceReportForm from '@/components/tenant/TenantMaintenanceForm';
import MaintenanceProgressTracker from '@/components/tenant/MaintenanceProgressTracker';

export default function TenantMaintenancePortal() {
  const [tenant, setTenant] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        const user = await base44.auth.me();
        setTenant(user);
      } catch (err) {
        console.error('Failed to load tenant:', err);
      }
    };
    loadTenant();
  }, []);

  const { data: requests = [], refetch } = useQuery({
    queryKey: ['tenant-maintenance-requests', tenant?.email],
    queryFn: () => base44.entities.MaintenanceRequest?.filter?.({ tenant_email: tenant?.email }) || Promise.resolve([]),
    enabled: !!tenant?.email
  });

  const activeRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <Clock className="w-12 h-12 mx-auto text-blue-500 mb-3" />
          <p className="text-muted-foreground">Loading tenant portal...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-foreground">Maintenance Requests</h1>
          <p className="text-xs text-muted-foreground mt-1">Report and track repairs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{activeRequests.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedRequests.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{requests.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedRequest ? (
        // Detail View
        <div className="p-4 pb-24 space-y-4">
          <Button
            onClick={() => setSelectedRequest(null)}
            variant="outline"
            className="w-full"
          >
            ← Back to List
          </Button>
          <MaintenanceProgressTracker request={selectedRequest} onClose={() => setSelectedRequest(null)} />
        </div>
      ) : (
        // List View
        <div className="p-4 pb-24 space-y-4">
          {showNewForm ? (
            <>
              <Button
                onClick={() => setShowNewForm(false)}
                variant="outline"
                className="w-full"
              >
                ← Cancel
              </Button>
              <MaintenanceReportForm
                tenant={tenant}
                onSuccess={() => {
                  setShowNewForm(false);
                  refetch();
                }}
              />
            </>
          ) : (
            <>
              <Button
                onClick={() => setShowNewForm(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Report Maintenance Issue
              </Button>

              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active ({activeRequests.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3 mt-4">
                  {activeRequests.length === 0 ? (
                    <Card className="p-6 text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-50" />
                      <p className="text-muted-foreground">No active requests</p>
                    </Card>
                  ) : (
                    activeRequests.map(request => (
                      <Card
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className="p-4 cursor-pointer hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-2">{request.issue_title}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{request.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {new Date(request.created_date).toLocaleDateString()}
                          </span>
                          {request.estimated_completion_date && (
                            <span className="text-muted-foreground">
                              ETA: {new Date(request.estimated_completion_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-3 mt-4">
                  {completedRequests.length === 0 ? (
                    <Card className="p-6 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-muted-foreground">No completed requests</p>
                    </Card>
                  ) : (
                    completedRequests.map(request => (
                      <Card
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className="p-4 cursor-pointer hover:shadow-md transition opacity-75"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-2">{request.issue_title}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{request.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {new Date(request.created_date).toLocaleDateString()}
                          </span>
                          {request.completion_date && (
                            <span className="text-green-600">
                              Completed: {new Date(request.completion_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      )}
    </div>
  );
}