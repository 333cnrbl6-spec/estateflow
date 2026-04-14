import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';
import ContractorAssignmentPanel from '@/components/maintenance/ContractorAssignmentPanel';
import MaintenanceChat from '@/components/maintenance/MaintenanceChat';

export default function MaintenanceWorkflowManager() {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['all-maintenance-requests'],
    queryFn: async () => {
      return await base44.entities.MaintenanceRequest.filter(
        { status: { $in: ['pending', 'assigned', 'in_progress'] } },
        '-created_date'
      );
    },
    refetchInterval: 5000
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Maintenance Workflow</h1>
          <p className="text-muted-foreground mt-1">Manage requests, assign contractors, and communicate in real-time</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request List */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h2 className="font-semibold text-foreground">Active Requests ({requests.length})</h2>
              </div>
              <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {requests.map(req => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition ${
                      selectedRequest?.id === req.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="font-medium text-sm text-foreground truncate">{req.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs ${getStatusColor(req.status)}`}>
                        {req.status}
                      </Badge>
                      <span className={`text-xs font-medium capitalize ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Details & Chat */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="space-y-6">
                {/* Details */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">{selectedRequest.title}</h3>
                  
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className={`font-medium capitalize ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenant:</span>
                      <span className="font-medium text-foreground">{selectedRequest.tenant_id}</span>
                    </div>
                    {selectedRequest.assigned_contractor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contractor:</span>
                        <span className="font-medium text-foreground">{selectedRequest.assigned_contractor}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 p-3 bg-slate-50 rounded">
                    {selectedRequest.description}
                  </p>

                  {selectedRequest.attachment_urls && selectedRequest.attachment_urls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.attachment_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                          >
                            File {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Contractor Assignment */}
                {!selectedRequest.assigned_contractor && (
                  <ContractorAssignmentPanel maintenanceRequest={selectedRequest} />
                )}

                {/* Chat */}
                <MaintenanceChat maintenanceRequest={selectedRequest} />
              </div>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a maintenance request to view details and manage</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}