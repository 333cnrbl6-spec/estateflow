import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, X, Loader2, CheckCircle } from 'lucide-react';

export default function MaintenanceRequestForm({ tenant, property, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('submitMaintenanceRequest', {
        tenant_id: tenant.id,
        property_id: property.id,
        title,
        description,
        priority,
        attachment_urls: attachments
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setAttachments([]);
        setSubmitted(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target.result;
          const result = await base44.integrations.Core.UploadFile({
            file: base64
          });
          setAttachments(prev => [...prev, result.file_url]);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    submitMutation.mutate();
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center bg-green-50 border-green-200">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">Request Submitted!</p>
        <p className="text-sm text-muted-foreground">A property manager will review and assign a contractor shortly.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Submit a Maintenance Request</h3>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Issue Title *</label>
          <input
            type="text"
            placeholder="e.g., Leaking tap in kitchen sink"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="low">Low - Can wait</option>
            <option value="medium">Medium - Soon</option>
            <option value="high">High - Urgent</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Add Photos or Videos (Optional)</label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">Max 10MB per file</p>
            </label>
          </div>

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs text-muted-foreground truncate">{url.split('/').pop()}</p>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || submitMutation.isPending || uploading}
          className="w-full"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      </div>
    </Card>
  );
}