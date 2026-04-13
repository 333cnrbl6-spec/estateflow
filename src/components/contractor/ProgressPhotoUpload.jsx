import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export default function ProgressPhotoUpload({ taskId, onPhotoUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;

    setUploading(true);
    setError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(preview);
      const blob = await response.blob();

      // Upload file
      const uploadRes = await base44.integrations.Core.UploadFile({
        file: blob,
      });

      // Update task with photo
      const task = await base44.entities.MaintenanceRequest.get(taskId);
      const photos = task.photos || [];
      photos.push({
        url: uploadRes.file_url,
        caption: caption,
        uploaded_at: new Date().toISOString(),
      });

      await base44.entities.MaintenanceRequest.update(taskId, {
        photos: photos,
      });

      setSuccess(true);
      setPreview(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setTimeout(() => {
        setSuccess(false);
        onPhotoUploaded?.();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Progress Photos</CardTitle>
        <CardDescription>Share photos of your work to track progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">Photo uploaded successfully</AlertDescription>
          </Alert>
        )}

        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Photo Caption (optional)</label>
              <Input
                placeholder="e.g., Completed plumbing repair"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
            <div className="text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium text-foreground">Click to upload a photo</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
}