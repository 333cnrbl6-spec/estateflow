import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'heating', label: 'Heating & Hot Water' },
  { value: 'structural', label: 'Structural/Damage' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'safety', label: 'Safety Hazard' },
  { value: 'other', label: 'Other' }
];

const PRIORITIES = [
  { value: 'routine', label: 'Routine (can wait)' },
  { value: 'moderate', label: 'Moderate (within 2 weeks)' },
  { value: 'urgent', label: 'Urgent (within 48 hours)' },
  { value: 'emergency', label: 'Emergency (immediate)' }
];

export default function MaintenanceRequestForm({ tenant, property }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('moderate');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const queryClient = useQueryClient();

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.MaintenanceRequest.create({
        tenant_id: tenant.id,
        property_id: tenant.property_id,
        title,
        category,
        priority,
        description,
        photo_urls: photoUrls,
        status: 'submitted',
        submitted_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      // Reset form
      setTitle('');
      setCategory('');
      setPriority('moderate');
      setDescription('');
      setPhotos([]);
      setPhotoUrls([]);
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests', tenant.id] });
      
      // Show success message
      alert('Maintenance request submitted successfully!');
    }
  });

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const url = await uploadPhotoMutation.mutateAsync(file);
        setPhotoUrls(prev => [...prev, url]);
        setPhotos(prev => [...prev, file.name]);
      } catch (err) {
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !category || !description) {
      alert('Please fill in all required fields');
      return;
    }
    createRequestMutation.mutate();
  };

  const isLoading = uploadPhotoMutation.isPending || createRequestMutation.isPending;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-foreground mb-6">Submit Maintenance Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Issue Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaky tap in bathroom"
              disabled={isLoading}
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Category *</label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Priority *</label>
              <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. What exactly needs to be fixed?"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3">Upload Photos (optional)</label>
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 bg-blue-50 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isLoading}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-900">Click to upload photos</p>
                <p className="text-xs text-blue-700 mt-1">or drag and drop</p>
              </label>
            </div>

            {/* Photo List */}
            {photos.length > 0 && (
              <div className="mt-4 space-y-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-foreground">{photo}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhoto(idx)}
                      disabled={isLoading}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !title || !category || !description}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Upload clear photos from multiple angles to help our contractors understand the issue faster.
        </p>
      </Card>
    </div>
  );
}