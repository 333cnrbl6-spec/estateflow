import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function InvoiceSubmission({ contractorEmail, assignedTasks }) {
  const [formData, setFormData] = useState({
    task_id: '',
    amount: '',
    description: '',
    invoice_file: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const completedTasks = assignedTasks.filter(t => t.status === 'completed' && !t.invoice_submitted);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only PDF, JPG, or PNG files accepted');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be smaller than 10MB');
      return;
    }

    setFormData(prev => ({ ...prev, invoice_file: file }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.task_id || !formData.amount || !formData.invoice_file) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload invoice file
      const uploadRes = await base44.integrations.Core.UploadFile({
        file: formData.invoice_file,
      });

      // Create invoice record
      const invoice = await base44.entities.Invoice.create({
        maintenance_request_id: formData.task_id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        document_url: uploadRes.file_url,
        status: 'pending_approval',
        submitted_by: contractorEmail,
        submitted_date: new Date().toISOString(),
      });

      // Update task
      const task = await base44.entities.MaintenanceRequest.get(formData.task_id);
      await base44.entities.MaintenanceRequest.update(formData.task_id, {
        invoice_submitted: true,
        actual_cost: parseFloat(formData.amount),
      });

      setSuccess(true);
      setFormData({ task_id: '', amount: '', description: '', invoice_file: null });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Invoice
        </CardTitle>
        <CardDescription>Submit an invoice for completed work</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">Invoice submitted for approval</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Completed Task *</label>
            <Select value={formData.task_id} onValueChange={(value) => handleInputChange('task_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task..." />
              </SelectTrigger>
              <SelectContent>
                {completedTasks.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No completed tasks available
                  </div>
                ) : (
                  completedTasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title} - £{task.estimated_cost?.toFixed(2) || '0.00'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Amount (£) *</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
            {formData.task_id && (
              <p className="text-xs text-muted-foreground">
                Estimated cost: £{assignedTasks.find(t => t.id === formData.task_id)?.estimated_cost?.toFixed(2)}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Details of work completed, materials used, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Document *</label>
            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
              <div className="text-center">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  {formData.invoice_file ? formData.invoice_file.name : 'Click to upload invoice'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={submitting || !formData.task_id} className="w-full gap-2">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Submit Invoice for Approval
              </>
            )}
          </Button>
        </form>

        {completedTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Complete a task before submitting an invoice</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}