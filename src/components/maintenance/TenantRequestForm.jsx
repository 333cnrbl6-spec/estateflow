import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, CheckCircle2, Upload, X } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';
import { toast } from 'sonner';

export default function TenantRequestForm({ propertyId, unitId, tenantId, tenantEmail, tenantPhone, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    photo_urls: []
  });
  const [submitted, setSubmitted] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.functions.invoke('submitMaintenanceRequest', {
        property_id: propertyId,
        unit_id: unitId,
        tenant_id: tenantId,
        contact_email: tenantEmail,
        contact_phone: tenantPhone,
        ...data
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Maintenance request submitted. Manager will contact you soon.');
      setTimeout(() => {
        setFormData({ title: '', description: '', category: 'other', priority: 'medium', photos: [] });
        setSubmitted(false);
        onSuccess?.();
      }, 3000);
    },
    onError: (error) => {
      toast.error('Failed to submit request: ' + error.message);
    }
  });

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        setFormData(prev => ({
          ...prev,
          photo_urls: [...prev.photo_urls, response.file_url]
        }));
      }
      toast.success(`${files.length} photo(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload photo: ' + error.message);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    submitMutation.mutate(formData);
  };

  const categories = [
    { value: 'plumbing', label: '🚰 Plumbing' },
    { value: 'electrical', label: '⚡ Electrical' },
    { value: 'heating', label: '🔥 Heating/Cooling' },
    { value: 'appliance', label: '🍽️ Appliance' },
    { value: 'structural', label: '🏗️ Structural' },
    { value: 'decoration', label: '🎨 Decoration' },
    { value: 'other', label: '📋 Other' }
  ];

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-green-900">Request Submitted!</p>
          <p className="text-sm text-green-700 mt-2">A manager will review and contact you within 24 hours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔧</span> Report a Maintenance Issue
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">Describe the problem and we'll get it fixed promptly.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitMutation.isPending && (
          <ProcessingFeedback
            label="Submitting request…"
            detail="Your request is being sent to the property manager"
            tips={[
              'Manager will review your request within 24 hours.',
              'You can track status and updates from your dashboard.',
              'Emergency issues get priority attention.'
            ]}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">What needs fixing?</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    formData.category === cat.value
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-200 bg-white hover:border-primary/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brief description</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Leaky tap in kitchen"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full details</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the issue in detail. When did it start? How does it affect you?"
              rows="4"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">How urgent?</label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Not urgent', color: 'bg-blue-100 border-blue-300' },
                { value: 'medium', label: 'Normal', color: 'bg-yellow-100 border-yellow-300' },
                { value: 'high', label: 'Soon', color: 'bg-orange-100 border-orange-300' },
                { value: 'emergency', label: 'Emergency', color: 'bg-red-100 border-red-300' }
              ].map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    formData.priority === p.value
                      ? `${p.color} border-2`
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attach photos (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhotos}
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
            </Button>

            {formData.photo_urls.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">{formData.photo_urls.length} photo(s) attached</p>
                <div className="flex flex-wrap gap-2">
                  {formData.photo_urls.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitMutation.isPending || !formData.title.trim()}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
            Submit Request
          </Button>
        </form>

        {/* Help text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Need immediate help?</span> For emergencies (gas leak, flooding, electrical hazard), call your property manager directly.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}