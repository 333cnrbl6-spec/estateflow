import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MobileNav from '@/components/mobile/MobileNav';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, MapPin, Phone, FileText, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function ContractorPortalMobile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('jobs');

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: jobs = [] } = useQuery({
    queryKey: ['contractorJobs'],
    enabled: !!user,
    queryFn: () => base44.entities.MaintenanceRequest.filter({
      assigned_contractor_email: user?.email
    }, '-created_date', 50)
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['contractorInvoices'],
    enabled: !!user,
    queryFn: () => base44.entities.Invoice.filter({
      submitted_by: user?.email
    }, '-submitted_date', 50)
  });

  const activeJobs = jobs.filter(j => !['completed', 'cancelled'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'in_progress') return <Clock className="w-4 h-4 text-blue-600" />;
    return <AlertCircle className="w-4 h-4 text-orange-600" />;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 sticky top-0 z-10">
        <p className="text-xs opacity-80 mb-1">Welcome back,</p>
        <h1 className="text-xl font-bold">{user?.full_name || 'Contractor'}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold text-primary">{activeJobs.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Jobs</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{completedJobs.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{invoices.filter(i => i.status === 'pending_approval').length}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border px-4">
        {[
          { id: 'jobs', label: 'Active Jobs' },
          { id: 'completed', label: 'Completed' },
          { id: 'invoices', label: 'Invoices' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {tab === 'jobs' && (
          <>
            {activeJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active jobs</p>
              </div>
            ) : (
              activeJobs.map(job => (
                <div key={job.id} className="bg-card rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm flex-1">{job.title}</h3>
                    {getStatusIcon(job.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{job.description}</p>
                  {job.unit_id && (
                    <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                      <MapPin className="w-3 h-3" />
                      Unit {job.unit_id}
                    </div>
                  )}
                  {job.scheduled_date && (
                    <p className="text-xs text-slate-600 mt-2">
                      Scheduled: {format(new Date(job.scheduled_date), 'dd MMM yyyy')}
                    </p>
                  )}
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    View Details <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'completed' && (
          <>
            {completedJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No completed jobs yet</p>
              </div>
            ) : (
              completedJobs.map(job => (
                <div key={job.id} className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm">{job.title}</h3>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-green-700 mb-2">
                    Completed {format(new Date(job.completion_date), 'dd MMM yyyy')}
                  </p>
                  {job.actual_cost && (
                    <p className="text-xs font-semibold text-green-800">
                      Cost: £{job.actual_cost.toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {tab === 'invoices' && (
          <>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No invoices submitted</p>
              </div>
            ) : (
              invoices.map(inv => (
                <div key={inv.id} className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-sm">£{inv.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{inv.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      inv.status === 'approved' ? 'bg-green-100 text-green-700' :
                      inv.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(inv.submitted_date), 'dd MMM yyyy')}
                  </p>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <MobileNav currentPath="/contractor-mobile" userRole="contractor" onLogout={() => base44.auth.logout()} />
    </div>
  );
}