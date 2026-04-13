import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wrench, MapPin, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_COLORS = {
  assigned: 'bg-blue-100 text-blue-700 border-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
  pending_approval: 'bg-purple-100 text-purple-700 border-purple-300',
};

export default function AssignedJobsList({ contactId }) {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = React.useState(null);
  const [newStatus, setNewStatus] = React.useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['contractor-jobs', contactId],
    queryFn: async () => {
      return await base44.entities.MaintenanceRequest.filter({
        assigned_contractor_id: contactId,
      });
    },
    enabled: !!contactId,
  });

  const updateStatus = useMutation({
    mutationFn: async (jobId) => {
      return await base44.entities.MaintenanceRequest.update(jobId, {
        status: newStatus,
        ...(newStatus === 'in_progress' && { assigned_date: new Date().toISOString() }),
        ...(newStatus === 'completed' && { completion_date: new Date().toISOString() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-jobs', contactId] });
      setSelectedJobId(null);
      setNewStatus(null);
    },
  });

  const isOverdue = (scheduledDate) => {
    if (!scheduledDate) return false;
    return differenceInDays(new Date(), parseISO(scheduledDate)) > 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          Assigned Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No jobs assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="p-4 border rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{job.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.description}</p>
                  </div>
                  <Badge className={`shrink-0 ${STATUS_COLORS[job.status] || 'bg-slate-100'}`}>
                    {job.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Property {job.property_id?.slice(0, 6)}
                  </div>
                  {job.scheduled_date && (
                    <div className={`flex items-center gap-1 ${isOverdue(job.scheduled_date) ? 'text-red-600 font-medium' : ''}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {format(parseISO(job.scheduled_date), 'dd MMM yyyy')}
                      {isOverdue(job.scheduled_date) && ' ⚠️'}
                    </div>
                  )}
                </div>

                {job.description && (
                  <div className="mb-3 p-2 bg-slate-50 rounded text-xs">
                    <p className="text-muted-foreground">{job.description}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {job.status !== 'completed' && (
                    <Select value={newStatus || job.status} onValueChange={setNewStatus}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Update status..." />
                      </SelectTrigger>
                      <SelectContent>
                        {job.status === 'assigned' && (
                          <SelectItem value="in_progress">Mark In Progress</SelectItem>
                        )}
                        {job.status === 'in_progress' && (
                          <SelectItem value="completed">Mark Completed</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {job.status === 'assigned' && isOverdue(job.scheduled_date) && (
                    <div className="flex items-center gap-1 text-xs text-red-600 font-medium ml-auto">
                      <AlertCircle className="w-3.5 h-3.5" /> Overdue
                    </div>
                  )}
                  {job.status === 'completed' && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium ml-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </div>
                  )}
                </div>

                {newStatus && newStatus !== job.status && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => updateStatus.mutate(job.id)}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? 'Saving...' : 'Confirm Update'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => setNewStatus(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}