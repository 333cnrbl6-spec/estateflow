import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';

const TEMPLATE_TYPES = [
  'tenancy_agreement',
  'maintenance_notice',
  'service_charge_statement',
  'compliance_notice',
  'eviction_notice',
  'other'
];

const MERGE_FIELD_TEMPLATES = {
  tenancy_agreement: ['tenant_name', 'property_address', 'unit_reference', 'rent_amount', 'deposit_amount', 'start_date', 'end_date'],
  maintenance_notice: ['tenant_name', 'property_address', 'maintenance_description', 'scheduled_date', 'contractor_contact'],
  service_charge_statement: ['tenant_name', 'property_address', 'charge_amount', 'period_start', 'period_end', 'payment_due_date'],
  compliance_notice: ['tenant_name', 'property_address', 'compliance_issue', 'action_required', 'deadline_date'],
  eviction_notice: ['tenant_name', 'property_address', 'notice_type', 'notice_period_end', 'reason_for_eviction'],
  other: ['tenant_name', 'property_address', 'custom_field_1', 'custom_field_2']
};

export default function TemplateUploadDialog({ open, onOpenChange }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('other');
  const [file, setFile] = useState(null);
  const [customFields, setCustomFields] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      if (!file) throw new Error('No file selected');

      const fileResult = await base44.integrations.Core.UploadFile({ file });
      
      const mergeFields = [
        ...(MERGE_FIELD_TEMPLATES[templateType] || []),
        ...(customFields.split(',').map(f => f.trim()).filter(f => f))
      ];

      return base44.entities.DocumentTemplate.create({
        name,
        description,
        template_type: templateType,
        file_url: fileResult.file_url,
        merge_fields: mergeFields,
        company_id: user?.current_company_id || ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err.message || 'Failed to upload template');
    }
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setTemplateType('other');
    setFile(null);
    setCustomFields('');
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        setError('Only PDF and Word documents are supported');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document Template</DialogTitle>
          <DialogDescription>
            Upload PDF or Word documents with auto-merge fields
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Template Name</Label>
            <Input
              placeholder="e.g. Standard Tenancy Agreement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="What is this template used for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 h-20"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Template Type</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">PDF or Word Document</Label>
            <label className="mt-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-secondary/50 transition-colors">
              <div className="text-center">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">PDF or DOCX</p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && <p className="text-xs text-green-600 mt-2">✓ {file.name}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">
              Custom Merge Fields
              <span className="text-xs text-muted-foreground block mt-1">
                Comma-separated. Standard fields are auto-detected.
              </span>
            </Label>
            <Input
              placeholder="field_1, field_2, field_3"
              value={customFields}
              onChange={(e) => setCustomFields(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!name || !file || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}