import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Clock, CheckCircle2, Camera, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  logged: 'bg-gray-100 text-gray-900',
  escalated: 'bg-orange-100 text-orange-900',
  contractor_assigned: 'bg-blue-100 text-blue-900',
  in_progress: 'bg-purple-100 text-purple-900',
  resolved: 'bg-green-100 text-green-900',
};

const SEVERITY_COLORS = {
  critical: 'text-red-600 bg-red-50',
  high: 'text-orange-600 bg-orange-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-blue-600 bg-blue-50',
};

function JobCard({ job, onSelect }) {
  return (
    <button
      onClick={() => onSelect(job)}
      className="w-full text-left"
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground line-clamp-2">{job.call_type}</h3>
              <Badge className={SEVERITY_COLORS[job.severity]}>
                {job.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{job.caller_name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{job.property_address}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {new Date(job.call_date_time).toLocaleString('en-GB', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <Badge variant="outline" className="capitalize">
                {job.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function JobDetail({ job, onBack, onStatusUpdate }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const res = await base44.integrations.Core.UploadFile({ file });
      return res;
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: (updates) =>
      base44.entities.EmergencyCallout.update(job.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractorJobs'] });
      onBack();
    },
  });

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAcceptJob = () => {
    updateJobMutation.mutate({
      status: 'in_progress',
      assigned_contractor_name: 'Current Contractor',
    });
  };

  const handleCompleteJob = async () => {
    let photoUrl = null;
    if (photoFile) {
      const uploadRes = await uploadPhotoMutation.mutateAsync(photoFile);
      photoUrl = uploadRes.file_url;
    }

    updateJobMutation.mutate({
      status: 'resolved',
      resolution_notes: notes,
      resolved_date: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      <Card>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">{job.call_type}</h2>
            <div className="flex items-center gap-2">
              <Badge className={SEVERITY_COLORS[job.severity]}>
                {job.severity}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {job.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Caller</p>
            <p className="text-sm font-medium">{job.caller_name}</p>
            <p className="text-xs text-muted-foreground">{job.caller_phone}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Location</p>
            <p className="text-sm font-medium">{job.property_address}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
              Issue Description
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Reported</p>
              <p className="text-xs font-semibold">
                {new Date(job.call_received_date).toLocaleString('en-GB', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {job.response_time_minutes && (
              <div>
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-xs font-semibold">{job.response_time_minutes}m</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {job.status === 'contractor_assigned' && (
        <Button
          onClick={handleAcceptJob}
          className="w-full"
          disabled={updateJobMutation.isPending}
        >
          Accept Job
        </Button>
      )}

      {job.status === 'in_progress' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complete Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Add Status Photo</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                >
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {photoPreview ? 'Photo Selected' : 'Take or Upload Photo'}
                  </span>
                </label>
              </div>

              {photoPreview && (
                <div className="mt-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="mt-2 text-xs text-destructive hover:underline"
                  >
                    Remove photo
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Completion Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what was done..."
                className="w-full h-24 p-3 border border-input rounded-md text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Button
              onClick={handleCompleteJob}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={updateJobMutation.isPending || uploadPhotoMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {job.status === 'resolved' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Job Completed</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ContractorMobilePortal() {
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['contractorJobs'],
    queryFn: () =>
      base44.entities.EmergencyCallout.filter(
        { assigned_contractor_name: { $exists: true } },
        '-call_received_date',
        100
      ),
  });

  const activeJobs = jobs.filter((j) => j.status !== 'resolved' && j.status !== 'cancelled');
  const completedJobs = jobs.filter((j) => j.status === 'resolved');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div className="max-w-2xl mx-auto p-4 pb-8">
        <JobDetail
          job={selectedJob}
          onBack={() => setSelectedJob(null)}
          onStatusUpdate={() => setSelectedJob(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Contractor Portal</h1>
        <p className="text-sm text-muted-foreground">Manage your assigned jobs</p>
      </div>

      {/* Active Jobs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Active Jobs ({activeJobs.length})
        </h2>
        {activeJobs.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">No active jobs</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Completed Jobs ({completedJobs.length})
          </h2>
          <div className="space-y-3">
            {completedJobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}