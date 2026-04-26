import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ContractorJobCard from '@/components/contractor/ContractorJobCard';
import WorkPhotoUploader from '@/components/contractor/WorkPhotoUploader';

export default function VendorSimplifiedPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin();
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Auth error:', error);
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch jobs assigned to this contractor
  const { data: jobs = [], refetch: refetchJobs } = useQuery({
    queryKey: ['assigned-jobs', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      try {
        const allJobs = await base44.entities.MaintenanceRequest.list('-updated_date', 100);
        return allJobs.filter(job => job.assigned_to === user.email || job.contractor_email === user.email);
      } catch (error) {
        toast.error('Failed to load jobs');
        return [];
      }
    },
  });

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await base44.entities.MaintenanceRequest.update(jobId, { status: newStatus });
      toast.success(`Job updated to ${newStatus}`);
      refetchJobs();
      setSelectedJob(null);
    } catch (error) {
      toast.error('Failed to update job: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">You need to log in to access the contractor portal.</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contractor Portal</h1>
            <p className="text-slate-600 mt-1">{user.full_name}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => base44.auth.logout()}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeJobs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Your Assigned Jobs</h2>
            
            {jobs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-500">No jobs assigned yet</p>
              </Card>
            ) : (
              <>
                {/* Active Jobs */}
                {activeJobs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">Active Jobs</h3>
                    {activeJobs.map(job => (
                      <ContractorJobCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJob?.id === job.id}
                        onClick={() => setSelectedJob(job)}
                        onStatusChange={handleStatusUpdate}
                      />
                    ))}
                  </div>
                )}

                {/* Completed Jobs */}
                {completedJobs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">Completed Jobs</h3>
                    {completedJobs.map(job => (
                      <ContractorJobCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJob?.id === job.id}
                        onClick={() => setSelectedJob(job)}
                        onStatusChange={handleStatusUpdate}
                        disabled
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details Panel */}
          <div>
            {selectedJob ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm font-medium text-slate-900">{selectedJob.description}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Badge variant="outline" className="capitalize">
                      {selectedJob.priority || 'medium'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={selectedJob.status === 'in_progress' ? 'default' : 'outline'}
                        onClick={() => handleStatusUpdate(selectedJob.id, 'in_progress')}
                        className="flex-1 gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedJob.status === 'completed' ? 'default' : 'outline'}
                        onClick={() => handleStatusUpdate(selectedJob.id, 'completed')}
                        className="flex-1 gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                      </Button>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-3">Upload Work Photos</p>
                    <WorkPhotoUploader
                      jobId={selectedJob.id}
                      onPhotoUploaded={() => refetchJobs()}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center text-slate-500">
                <p>Select a job to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}