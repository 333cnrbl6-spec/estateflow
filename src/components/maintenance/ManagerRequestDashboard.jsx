import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, CheckCircle2, User, MapPin, Phone, Mail } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800'
};

const priorityColors = {
  low: 'text-blue-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  emergency: 'text-red-600'
};

const priorityEmoji = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  emergency: '🔴'
};

export default function ManagerRequestDashboard() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assigningTo, setAssigningTo] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all maintenance requests
  const { data: requests = [] } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: () => base44.entities.MaintenanceRequest.list('-created_date', 100)
  });

  // Fetch vendors for assignment
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-updated_date', 50)
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      return await base44.functions.invoke('updateMaintenanceStatus', {
        request_id: requestId,
        status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error('Update failed: ' + error.message);
    }
  });

  // Assign contractor mutation
  const assignMutation = useMutation({
    mutationFn: async ({ requestId, contractorId }) => {
      return await base44.functions.invoke('assignContractorToMaintenance', {
        request_id: requestId,
        contractor_id: contractorId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      setAssigningTo(null);
      toast.success('Contractor assigned & notified');
    },
    onError: (error) => {
      toast.error('Assignment failed: ' + error.message);
    }
  });

  const getFilteredRequests = (filterStatus) => {
    return requests.filter(r => filterStatus === 'all' || r.status === filterStatus);
  };

  const statuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Maintenance Requests</h2>
        <p className="text-muted-foreground mt-1">Manage tenant maintenance requests and contractor assignments</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {['pending', 'assigned', 'in_progress', 'resolved', 'closed'].map(status => {
          const count = requests.filter(r => r.status === status).length;
          return (
            <Card key={status} className="text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-slate-900">{count}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{status.replace('_', ' ')}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        {statuses.map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {getFilteredRequests(status).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No requests in this status
                </CardContent>
              </Card>
            ) : (
              getFilteredRequests(status).map(request => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={priorityEmoji[request.priority]}>
                            {priorityEmoji[request.priority]}
                          </span>
                          <h3 className="font-semibold text-slate-900">{request.title}</h3>
                          <Badge className={statusColors[request.status]}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Tenant Info */}
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4" />
                        <span>{request.contact_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{request.contact_phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>Unit {request.unit_id}</span>
                      </div>
                      <div className="text-slate-600">
                        Category: <span className="font-medium capitalize">{request.category}</span>
                      </div>
                    </div>

                    {/* Contractor Info */}
                    {request.assigned_contractor_name && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Assigned to:</span> {request.assigned_contractor_name}
                        </p>
                        {request.scheduled_date && (
                          <p className="text-xs text-blue-700 mt-1">
                            Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAssigningTo(request.id)}
                        >
                          Assign Contractor
                        </Button>
                      )}

                      {['pending', 'assigned'].includes(request.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({
                            requestId: request.id,
                            status: 'in_progress'
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark In Progress
                        </Button>
                      )}

                      {['assigned', 'in_progress'].includes(request.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({
                            requestId: request.id,
                            status: 'resolved'
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark Resolved
                        </Button>
                      )}

                      {request.status === 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({
                            requestId: request.id,
                            status: 'closed'
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Close
                        </Button>
                      )}
                    </div>

                    {/* Contractor Assignment Modal */}
                    {assigningTo === request.id && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3 mt-4">
                        <p className="text-sm font-semibold text-yellow-900">Select a contractor:</p>
                        {vendors.length === 0 ? (
                          <p className="text-xs text-yellow-700">No contractors available</p>
                        ) : (
                          <div className="space-y-2">
                            {vendors.map(vendor => (
                              <Button
                                key={vendor.id}
                                size="sm"
                                variant="outline"
                                onClick={() => assignMutation.mutate({
                                  requestId: request.id,
                                  contractorId: vendor.id
                                })}
                                disabled={assignMutation.isPending}
                                className="w-full justify-start"
                              >
                                {vendor.name} - {vendor.phone}
                              </Button>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAssigningTo(null)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}