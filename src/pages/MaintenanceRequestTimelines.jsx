import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Wrench, Filter, ArrowRight } from 'lucide-react';
import MaintenanceTimeline from '@/components/maintenance/MaintenanceTimeline';

export default function MaintenanceRequestTimelines() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: requests = [] } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: () => base44.entities.MaintenanceRequest.list('-created_date', 50)
  });

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
    return true;
  });

  const statusConfig = {
    pending: { color: 'bg-slate-100 text-slate-700', label: 'Pending' },
    in_progress: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
  };

  const priorityConfig = {
    low: { color: 'bg-slate-100 text-slate-700', label: 'Low' },
    medium: { color: 'bg-amber-100 text-amber-700', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' }
  };

  const getCompletionDays = (request) => {
    if (!request.completion_date || !request.created_date) return null;
    const start = new Date(request.created_date);
    const end = new Date(request.completion_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const totalCost = filteredRequests.reduce((sum, r) => sum + (r.actual_cost || 0), 0);
  const completedCount = filteredRequests.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Wrench className="w-8 h-8 text-primary" />
          Maintenance Request Timelines
        </h1>
        <p className="text-muted-foreground mt-2">
          Track maintenance requests from reporting to completion with cost and contractor insights.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
            <p className="text-3xl font-bold">{filteredRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">
              {filteredRequests.filter(r => r.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
            <p className="text-3xl font-bold">£{(totalCost / 100).toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List / Detail View */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[800px] overflow-y-auto">
            {filteredRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests found</p>
            ) : (
              filteredRequests.map(request => (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedRequest?.id === request.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{request.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {request.property_id || 'No property'}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Badge className={statusConfig[request.status]?.color} variant="outline">
                        {statusConfig[request.status]?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {priorityConfig[request.priority]?.label}
                    </Badge>
                    {request.actual_cost && (
                      <Badge variant="outline" className="text-xs">
                        £{(request.actual_cost / 100).toFixed(0)}
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Timeline Detail */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <MaintenanceTimeline request={selectedRequest} />
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a maintenance request to view its timeline</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}