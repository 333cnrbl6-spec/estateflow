import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Plus, Upload, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoiceSubmissionForm({ contactId, contactName }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    jobId: '',
    amount: '',
    description: '',
    file: null,
  });
  const [uploading, setUploading] = useState(false);

  const { data: submittedInvoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['contractor-invoices', contactId],
    queryFn: async () => {
      return await base44.entities.FinancialTransaction.filter({
        created_by: contactId,
        transaction_type: 'contractor_invoice',
      });
    },
    enabled: !!contactId,
  });

  const { data: assignedJobs = [] } = useQuery({
    queryKey: ['contractor-jobs-select', contactId],
    queryFn: async () => {
      return await base44.entities.MaintenanceRequest.filter({
        assigned_contractor_id: contactId,
        status: ['completed', 'in_progress'],
      });
    },
    enabled: !!contactId,
  });

  const submitInvoice = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let fileUrl = null;

      if (invoiceForm.file) {
        const { file_url } = await base44.integrations.Core.UploadFile({
          file: invoiceForm.file,
        });
        fileUrl = file_url;
      }

      // Create financial transaction linked to invoice
      const transaction = await base44.entities.FinancialTransaction.create({
        transaction_type: 'contractor_invoice',
        amount: parseFloat(invoiceForm.amount),
        description: `Invoice #${invoiceForm.invoiceNumber}: ${invoiceForm.description}`,
        status: 'pending_review',
        related_maintenance_id: invoiceForm.jobId,
        document_url: fileUrl,
        contact_name: contactName,
        notes: invoiceForm.description,
      });

      setUploading(false);
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-invoices', contactId] });
      setShowDialog(false);
      setInvoiceForm({
        invoiceNumber: '',
        jobId: '',
        amount: '',
        description: '',
        file: null,
      });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (invoiceId) => {
      return await base44.entities.FinancialTransaction.delete(invoiceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-invoices', contactId] });
    },
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      pending_review: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      paid: 'bg-emerald-100 text-emerald-700',
    };
    return statusMap[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Invoice Submissions
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Invoice Number *</label>
                <Input
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceForm(f => ({ ...f, invoiceNumber: e.target.value }))
                  }
                  placeholder="e.g., INV-2026-001"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Linked Job</label>
                <Select
                  value={invoiceForm.jobId}
                  onValueChange={(v) =>
                    setInvoiceForm(f => ({ ...f, jobId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedJobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amount (£) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={invoiceForm.amount}
                  onChange={(e) =>
                    setInvoiceForm(f => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  value={invoiceForm.description}
                  onChange={(e) =>
                    setInvoiceForm(f => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Work performed, materials used, etc."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Invoice Document (PDF)</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer hover:border-primary/40 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  {invoiceForm.file ? invoiceForm.file.name : 'Click to upload PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      setInvoiceForm(f => ({ ...f, file: e.target.files?.[0] }))
                    }
                  />
                </label>
              </div>

              <Button
                className="w-full"
                disabled={
                  !invoiceForm.invoiceNumber ||
                  !invoiceForm.amount ||
                  !invoiceForm.description ||
                  uploading ||
                  submitInvoice.isPending
                }
                onClick={() => submitInvoice.mutate()}
              >
                {uploading || submitInvoice.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Invoice'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {invoicesLoading ? (
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        ) : submittedInvoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No invoices submitted yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submittedInvoices.map(invoice => (
              <div key={invoice.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {invoice.description?.split(':')[0] || 'Invoice'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {format(new Date(invoice.created_date), 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-lg text-green-600">
                      £{(invoice.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge className={getStatusBadge(invoice.status)}>
                      {invoice.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                {invoice.document_url && (
                  <a
                    href={invoice.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary underline mb-2 inline-block"
                  >
                    View Document
                  </a>
                )}

                {invoice.notes && (
                  <p className="text-xs text-muted-foreground mb-2">{invoice.notes}</p>
                )}

                {invoice.status === 'pending_review' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 gap-1"
                    onClick={() => deleteInvoice.mutate(invoice.id)}
                    disabled={deleteInvoice.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                    {deleteInvoice.isPending ? 'Deleting...' : 'Withdraw'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}