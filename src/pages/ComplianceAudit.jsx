import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';

export default function ComplianceAudit() {
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkSettings, setBulkSettings] = useState({
    batch_name: '',
    document_type: 'eviction_notice',
    company_id: '',
    property_ids: [],
  });

  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['complianceAuditLogs'],
    queryFn: () => base44.entities.ComplianceAuditLog.list(),
  });

  const { data: bulkJobs = [] } = useQuery({
    queryKey: ['bulkDocumentJobs'],
    queryFn: () => base44.entities.BulkDocumentGeneration.list(),
  });

  const generateBulkMutation = useMutation({
    mutationFn: (data) =>
      base44.functions.invoke('generateBulkDocuments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulkDocumentJobs'] });
      setShowBulkDialog(false);
      setBulkSettings({
        batch_name: '',
        document_type: 'eviction_notice',
        company_id: '',
        property_ids: [],
      });
    },
  });

  const handleGenerateBulk = () => {
    if (!bulkSettings.batch_name || !bulkSettings.company_id) {
      alert('Please fill in all required fields');
      return;
    }

    generateBulkMutation.mutate({
      ...bulkSettings,
      property_ids: properties.slice(0, bulkSettings.property_ids.length || properties.length).map((p) => p.id),
    });
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'submission_sent':
      case 'deadline_met':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'deadline_missed':
      case 'correction_made':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Compliance Audit Trail"
        subtitle="Track all compliance submissions, deadlines, and regulatory actions"
      >
        <Button onClick={() => setShowBulkDialog(true)} className="gap-2">
          <FileText className="w-4 h-4" />
          Generate Bulk Documents
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Compliance Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.length > 0 ? (
                auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg">
                    {getActionIcon(log.action_type)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{log.action_type.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{log.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>By: {log.performed_by}</span>
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">No audit logs</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Generation Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Document Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bulkJobs.length > 0 ? (
                bulkJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{job.batch_name}</p>
                        <p className="text-sm text-muted-foreground">{job.document_type}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        job.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Total Documents</p>
                        <p className="font-semibold">{job.total_documents}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Generated</p>
                        <p className="font-semibold text-green-600">{job.generated_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failed</p>
                        <p className="font-semibold text-red-600">{job.failed_count}</p>
                      </div>
                    </div>
                    {job.export_url && (
                      <Button size="sm" variant="outline" className="gap-2" asChild>
                        <a href={job.export_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3" /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">No bulk jobs</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Generation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Bulk Documents</DialogTitle>
            <DialogDescription>
              Create multiple documents for compliance deadlines
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Batch Name</label>
              <Input
                placeholder="e.g., Q1 2026 Notices"
                value={bulkSettings.batch_name}
                onChange={(e) =>
                  setBulkSettings({ ...bulkSettings, batch_name: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Company</label>
              <Select
                value={bulkSettings.company_id}
                onValueChange={(val) =>
                  setBulkSettings({ ...bulkSettings, company_id: val })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Document Type</label>
              <Select
                value={bulkSettings.document_type}
                onValueChange={(val) =>
                  setBulkSettings({ ...bulkSettings, document_type: val })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eviction_notice">Eviction Notice</SelectItem>
                  <SelectItem value="tenancy_agreement">Tenancy Agreement</SelectItem>
                  <SelectItem value="deposit_protection_notice">Deposit Notice</SelectItem>
                  <SelectItem value="inspection_report">Inspection Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateBulk}
                disabled={generateBulkMutation.isPending}
              >
                {generateBulkMutation.isPending ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}