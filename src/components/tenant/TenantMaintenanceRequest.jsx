import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload, Loader, CheckCircle } from 'lucide-react';

const MAINTENANCE_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'heating', label: 'Heating/Cooling' },
  { value: 'structural', label: 'Structural Damage' },
  { value: 'decorating', label: 'Decorating' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'fire_safety', label: 'Fire Safety' },
  { value: 'general', label: 'General Maintenance' },
  { value: 'other', label: 'Other' },
];

export default function TenantMaintenanceRequest({ unitId, propertyId, onSuccess }) {
  const [step, setStep] = useState('form'); // form, photos, review, success
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('standard');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => [...prev, {
          name: file.name,
          data: event.target.result,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload photos if any
      const photoUrls = [];
      for (const photo of photos) {
        if (photo.url) {
          photoUrls.push(photo.url);
        } else {
          // Convert data URL to file and upload
          const response = await fetch(photo.data);
          const blob = await response.blob();
          const file = new File([blob], photo.name, { type: 'image/jpeg' });
          const uploadRes = await base44.integrations.Core.UploadFile({ file });
          photoUrls.push(uploadRes.file_url);
        }
      }

      // Create maintenance request
      const res = await base44.functions.invoke('createMaintenanceFromTenant', {
        unitId,
        propertyId,
        title,
        description,
        category,
        priority,
        photoUrls,
      });

      setResult(res.data);
      setStep('success');
      onSuccess?.();

      // Reset form
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setCategory('general');
        setPriority('standard');
        setPhotos([]);
        setStep('form');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
          <div>
            <p className="font-semibold text-green-900">Request Submitted Successfully!</p>
            <p className="text-sm text-green-700 mt-1">Ticket ID: {result?.maintenanceRequestId}</p>
          </div>
          {result?.assigned && (
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-sm">
                <span className="font-medium">Contractor Assigned:</span> {result.assignedContractor}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                They'll contact you shortly to arrange a visit.
              </p>
            </div>
          )}
          {!result?.assigned && (
            <div className="bg-white p-3 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700">
                Our property manager will review and assign a contractor shortly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submit Maintenance Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Issue Title *</label>
            <input
              type="text"
              placeholder="e.g., Leaky kitchen tap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={submitting}
            >
              {MAINTENANCE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="flex gap-2">
              {['low', 'standard', 'urgent'].map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    priority === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  disabled={submitting}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photos (Optional)</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                id="photo-upload"
                disabled={submitting}
              />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB each</p>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo.data}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-medium rounded-lg"
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !title || !description}
              className="flex-1 gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your maintenance request will be reviewed by the property manager and assigned to a contractor. You'll receive updates via email and in your portal.
        </AlertDescription>
      </Alert>
    </div>
  );
}