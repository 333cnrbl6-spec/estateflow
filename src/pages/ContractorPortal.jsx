import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Loader2, AlertTriangle } from 'lucide-react';
import CertificationManager from '@/components/contractor/CertificationManager';
import AssignedJobsList from '@/components/contractor/AssignedJobsList';
import InvoiceSubmissionForm from '@/components/contractor/InvoiceSubmissionForm';

export default function ContractorPortal() {
  const [contractorId, setContractorId] = useState(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      try {
        // Decode token (format: contractorId:timestamp)
        const decoded = atob(token).split(':')[0];
        setContractorId(decoded);
      } catch {
        setAuthError(true);
      }
    }
  }, []);

  const { data: contractor, isLoading, isError } = useQuery({
    queryKey: ['contractor-portal', contractorId],
    queryFn: () => base44.entities.Contact.get(contractorId),
    enabled: !!contractorId,
  });

  if (!contractorId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 pb-10 text-center space-y-3">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Contractor Portal</h2>
            <p className="text-sm text-muted-foreground">
              Access this portal via the secure link sent by your property manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authError || isError) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 pb-10 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              Your access token is invalid or has expired. Please contact your account manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <p className="font-serif font-bold text-lg">Contractor Portal</p>
            <p className="text-xs text-muted-foreground">
              Manage certifications, jobs, and invoices
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{contractor?.company_name || contractor?.full_name}</p>
            <Badge variant="outline" className="mt-1">Active</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Status', value: contractor?.status || 'Active', icon: '✓' },
            { label: 'Phone', value: contractor?.phone || '—', icon: '📞' },
            { label: 'Email', value: contractor?.email || '—', icon: '✉️' },
            { label: 'Member Since', value: contractor?.created_date ? new Date(contractor.created_date).getFullYear() : '—', icon: '📅' },
          ].map((stat, i) => (
            <div key={i} className="bg-card border rounded-xl p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-semibold text-sm mt-1 truncate">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <CertificationManager contactId={contractorId} />
            <AssignedJobsList contactId={contractorId} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <InvoiceSubmissionForm
              contactId={contractorId}
              contactName={contractor?.full_name || contractor?.company_name}
            />

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How This Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">📋 Certifications</p>
                  <p>Upload and maintain your professional certifications. Keep them current to stay eligible for work.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">🔧 Assigned Jobs</p>
                  <p>View jobs assigned to you, check deadlines, and update status as you progress through work.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">💷 Invoices</p>
                  <p>Submit invoices linked to completed jobs. Your invoices are reviewed before payment processing.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}