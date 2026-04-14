import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing / Water Leak' },
  { value: 'electrical', label: 'Electrical / Power Issue' },
  { value: 'heating', label: 'Heating / Boiler' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'structural', label: 'Structural Damage' },
  { value: 'pest', label: 'Pest Control' },
  { value: 'damp', label: 'Damp / Mold' },
  { value: 'safety', label: 'Safety Issue' },
  { value: 'other', label: 'Other' }
];

export default function TenantMaintenanceSubmission({ propertyId, unitId, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
    priority: 'normal',
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [photosPreviews, setPhotosPreviews] = useState([]);

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 3) {
      setError('Maximum 3 photos allowed');
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each photo must be less than 5MB');
        return;
      }
    }

    const newPhotos = [];
    const newPreviews = [];

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === files.length) {
          setPhotosPreviews([...photosPreviews, ...newPreviews]);
          setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    setPhotosPreviews(photosPreviews.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photoUrls = [];

      // Upload photos
      for (const photo of formData.photos) {
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: photo
        });
        photoUrls.push(uploadResult.file_url);
      }

      // Create maintenance request
      const request = await base44.entities.MaintenanceRequest.create({
        property_id: propertyId,
        unit_id: unitId,
        title: `${CATEGORIES.find(c => c.value === formData.category)?.label || 'Maintenance Request'} - ${formData.location}`,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        priority: formData.priority,
        status: 'open',
        reported_by: 'tenant',
        photo_urls: photoUrls,
        created_at: new Date().toISOString()
      });

      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          category: '',
          location: '',
          description: '',
          priority: 'normal',
          photos: []
        });
        setPhotosPreviews([]);
        setSubmitted(false);
        if (onSubmitSuccess) onSubmitSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="text-lg font-semibold text-green-900 dark:text-green-100">Request Submitted Successfully</p>
        <p className="text-sm text-green-700 dark:text-green-200 mt-2">
          Our team will review your request and get in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Issue Category *</label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select issue type..." />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Location *</label>
        <Input
          placeholder="e.g., Kitchen, Master Bedroom"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Description *</label>
        <Textarea
          placeholder="Please describe the issue in detail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="min-h-28"
          required
        />
      </div>

      {/* Priority */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Priority</label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - Non-urgent</SelectItem>
            <SelectItem value="normal">Normal - Routine maintenance</SelectItem>
            <SelectItem value="high">High - Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Photos (Optional - max 3)</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            id="photo-input"
          />
          <label htmlFor="photo-input" className="cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Click to upload photos</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB each</p>
          </label>
        </div>

        {/* Photo Previews */}
        {photosPreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {photosPreviews.map((preview, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-border">
                <img src={preview} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !formData.category || !formData.location || !formData.description}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Maintenance Request'
        )}
      </Button>
    </form>
  );
}