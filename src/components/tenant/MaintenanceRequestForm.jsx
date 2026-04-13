import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'heating', label: 'Heating/Cooling' },
  { value: 'decorating', label: 'Decorating' },
  { value: 'structural', label: 'Structural' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'general', label: 'General Maintenance' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'standard', label: 'Standard' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
];

export default function MaintenanceRequestForm({ tenantId, unitId, onSubmitSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'standard',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const submitRequest = useMutation({
    mutationFn: async (data) => {
      const request = await base44.entities.MaintenanceRequest.create({
        tenant_id: tenantId,
        unit_id: unitId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: 'reported',
      });
      return request;
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({ title: '', description: '', category: '', priority: 'standard' });
      queryClient.invalidateQueries({ queryKey: ['tenantTickets'] });
      setTimeout(() => {
        setSuccess(false);
        onSubmitSuccess?.();
      }, 2000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to submit request');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    submitRequest.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Maintenance</CardTitle>
        <CardDescription>Submit a new maintenance request for your unit</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">Request submitted successfully</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Title *</label>
            <Input
              placeholder="e.g., Leaky kitchen tap"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority *</label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(pri => (
                  <SelectItem key={pri.value} value={pri.value}>{pri.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              placeholder="Describe the issue in detail..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitRequest.isPending}
            className="w-full gap-2"
          >
            {submitRequest.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}