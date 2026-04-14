import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function TenantMaintenanceForm({ tenant, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const uploadedUrls = [];

      // Upload photos if any
      for (const photo of photos) {
        const res = await base44.integrations.Core.UploadFile({ file: photo });
        uploadedUrls.push(res.file_url);
      }

      // Create maintenance request
      await base44.entities.MaintenanceRequest.create({
        issue_title: title,
        description,
        urgency,
        tenant_email: tenant.email,
        status: 'pending',
        photos: uploadedUrls,
        created_date: new Date().toISOString()
      });
    },
    onSuccess
  });

  const handleAddPhoto = (e) => {
    const selectedPhotos = Array.from(e.target.files);
    setPhotos([...photos, ...selectedPhotos]);
  };

  const handleRemovePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const isValid = title.trim() && description.trim();

  return (
    <Card className="p-4 space-y-4">
      <h2 className="font-semibold text-foreground">Report a Maintenance Issue</h2>

      <div>
        <label className="text-sm font-medium">Issue Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Leaky tap, Broken window..."
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          className="h-20 mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Urgency</label>
        <div className="flex gap-2 mt-2">
          {['low', 'normal', 'high', 'emergency'].map(level => (
            <button
              key={level}
              onClick={() => setUrgency(level)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                urgency === level
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="text-sm font-medium">Add Photos</label>
        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => cameraInputRef.current?.click()}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            <Upload className="w-4 h-4" />
            Choose File
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddPhoto}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleAddPhoto}
          className="hidden"
        />
      </div>

      {/* Photos Preview */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Photos ({photos.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!isValid || submitMutation.isPending}
          className="flex-1 gap-2"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}