import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Clock, AlertCircle, Upload, Calendar } from 'lucide-react';
import WorkSlotScheduler from '@/components/contractor/WorkSlotScheduler';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800'
};

const priorityColors = {
  low: 'text-slate-600',
  medium: 'text-orange-600',
  high: 'text-red-600',
  emergency: 'text-red-800 font-bold'
};

export default function ContractorJobQueue() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const queryClient = useQueryClient();

  // Get contractor's assigned maintenance requests
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['contractor-jobs'],
    queryFn: async () => {
      const contractor = await base44.auth.me();
      if (!contractor) return [];
      
      // Get all maintenance requests assigned to this contractor
      const allJobs = await base44.entities.MaintenanceRequest.filter({
        assigned_contractor_id: contractor.id
      });
      
      return allJobs;
    },
    staleTime: 30000
  });

  // Accept job mutation
  const acceptJobMutation = useMutation({
    mutationFn: async (jobId) => {
      return await base44.entities.MaintenanceRequest.update(jobId, {
        status: 'assigned'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-jobs'] });
    }
  });

  // Decline job mutation
  const declineJobMutation = useMutation({
    mutationFn: async (jobId) => {
      return await base44.entities.MaintenanceRequest.update(jobId, {
        status: 'pending',
        assigned_contractor_id: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-jobs'] });
      setSelectedJob(null);
    }
  });

  // Complete job mutation
  const completeJobMutation = useMutation({
    mutationFn: async (jobId) => {
      return await base44.entities.MaintenanceRequest.update(jobId, {
        status: 'resolved',
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-jobs'] });
      setSelectedJob(null);
    }
  });

  // Upload invoice mutation
  const uploadInvoiceMutation = useMutation({
    mutationFn: async ({ jobId, file }) => {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: file
      });

      await base44.entities.MaintenanceRequest.update(jobId, {
        notes: (selectedJob?.notes || '') + `\n[Invoice: ${uploadResponse.file_url}]`
      });

      return uploadResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-jobs'] });
      setInvoiceFile(null);
      alert('Invoice uploaded successfully');
    }
  });

  const handleUploadInvoice = async () => {
    if (!invoiceFile || !selectedJob) return;
    await uploadInvoiceMutation.mutateAsync({
      jobId: selectedJob.id,
      file: invoiceFile
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading job queue...</p>
        </div>
      </div>
    );
  }

  const pendingJobs = jobs?.filter(j => j.status === 'pending') || [];
  const assignedJobs = jobs?.filter(j => j.status === 'assigned') || [];
  const inProgressJobs = jobs?.filter(j => j.status === 'in_progress') || [];
  const completedJobs = jobs?.filter(j => ['resolved', 'closed'].includes(j.status)) || [];

  const JobCard = ({ job, showActions }) => (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedJob?.id === job.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedJob(job)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">{job.property_id} • Unit {job.unit_id}</p>
          </div>
          <Badge className={priorityColors[job.priority]}>
            {job.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-700">{job.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-600">Category</p>
            <p className="font-medium text-slate-900">{job.category}</p>
          </div>
          <div>
            <p className="text-slate-600">Status</p>
            <Badge className={statusColors[job.status] || 'bg-slate-100'}>{job.status}</Badge>
          </div>
        </div>

        {job.contact_phone && (
          <div className="bg-slate-50 rounded p-2">
            <p className="text-xs text-slate-600">Tenant Contact</p>
            <p className="text-sm font-medium text-slate-900">{job.contact_phone}</p>
          </div>
        )}

        {showActions && selectedJob?.id === job.id && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                acceptJobMutation.mutate(job.id);
              }}
              disabled={acceptJobMutation.isPending}
              className="flex-1 gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                declineJobMutation.mutate(job.id);
              }}
              disabled={declineJobMutation.isPending}
              className="flex-1 gap-1"
            >
              <XCircle className="w-4 h-4" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Job Queue</h1>
          <p className="text-slate-600 mt-1">Manage assigned maintenance tasks and schedule work</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{pendingJobs.length}</p>
                <p className="text-xs text-slate-600 mt-1">Awaiting Response</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{assignedJobs.length}</p>
                <p className="text-xs text-slate-600 mt-1">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{inProgressJobs.length}</p>
                <p className="text-xs text-slate-600 mt-1">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{completedJobs.length}</p>
                <p className="text-xs text-slate-600 mt-1">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Job List */}
          <div className="col-span-2">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">Awaiting ({pendingJobs.length})</TabsTrigger>
                <TabsTrigger value="assigned">Accepted ({assignedJobs.length})</TabsTrigger>
                <TabsTrigger value="progress">In Progress ({inProgressJobs.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3 mt-4">
                {pendingJobs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="text-slate-600">No pending jobs</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingJobs.map(job => <JobCard key={job.id} job={job} showActions={true} />)
                )}
              </TabsContent>

              <TabsContent value="assigned" className="space-y-3 mt-4">
                {assignedJobs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="text-slate-600">No accepted jobs</p>
                    </CardContent>
                  </Card>
                ) : (
                  assignedJobs.map(job => <JobCard key={job.id} job={job} showActions={false} />)
                )}
              </TabsContent>

              <TabsContent value="progress" className="space-y-3 mt-4">
                {inProgressJobs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="text-slate-600">No jobs in progress</p>
                    </CardContent>
                  </Card>
                ) : (
                  inProgressJobs.map(job => <JobCard key={job.id} job={job} showActions={false} />)
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3 mt-4">
                {completedJobs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="text-slate-600">No completed jobs</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedJobs.map(job => <JobCard key={job.id} job={job} showActions={false} />)
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Job Details & Actions */}
          <div className="space-y-4">
            {selectedJob ? (
              <>
                {/* Job Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600">Title</p>
                      <p className="font-medium text-slate-900">{selectedJob.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Category</p>
                      <p className="font-medium text-slate-900 capitalize">{selectedJob.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Priority</p>
                      <Badge className={priorityColors[selectedJob.priority]}>{selectedJob.priority}</Badge>
                    </div>
                    {selectedJob.scheduled_date && (
                      <div>
                        <p className="text-xs text-slate-600">Scheduled</p>
                        <p className="font-medium text-slate-900">{selectedJob.scheduled_date} @ {selectedJob.scheduled_time}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Schedule Slot */}
                {['assigned', 'pending'].includes(selectedJob.status) && !selectedJob.scheduled_date && (
                  <WorkSlotScheduler
                    maintenanceId={selectedJob.id}
                    tenantEmail={selectedJob.contact_email}
                    tenantPhone={selectedJob.contact_phone}
                    onScheduleComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ['contractor-jobs'] });
                    }}
                  />
                )}

                {/* Invoice Upload */}
                {['assigned', 'in_progress', 'resolved'].includes(selectedJob.status) && (
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Upload className="w-5 h-5 text-green-600" />
                        Invoice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Upload Invoice (PDF/Image)
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                          className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                      </div>
                      {invoiceFile && (
                        <Button
                          onClick={handleUploadInvoice}
                          disabled={uploadInvoiceMutation.isPending}
                          className="w-full gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadInvoiceMutation.isPending ? 'Uploading...' : 'Upload Invoice'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Complete Job */}
                {selectedJob.status === 'assigned' && (
                  <Button
                    onClick={() => completeJobMutation.mutate(selectedJob.id)}
                    disabled={completeJobMutation.isPending}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {completeJobMutation.isPending ? 'Completing...' : 'Mark as Complete'}
                  </Button>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-8 text-center text-slate-600">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Select a job to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}