import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkPhotoUploader({ jobId, onPhotoUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const uploadedFile = await base44.integrations.Core.UploadFile({ file });
        return uploadedFile.file_url;
      });

      const photoUrls = await Promise.all(uploadPromises);

      // Update maintenance request with photos
      const currentJob = await base44.entities.MaintenanceRequest.get(jobId);
      const existingPhotos = currentJob.photos || [];
      
      await base44.entities.MaintenanceRequest.update(jobId, {
        photos: [...existingPhotos, ...photoUrls],
        work_photos: [...existingPhotos, ...photoUrls],
      });

      setUploadedPhotos(prev => [...prev, ...photoUrls]);
      setFiles([]);
      toast.success(`${photoUrls.length} photo(s) uploaded successfully`);
      onPhotoUploaded?.();
    } catch (error) {
      toast.error('Failed to upload photos: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <label className="block">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-slate-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-5 h-5 text-slate-400" />
            <p className="text-xs text-slate-600">Click to select photos</p>
          </div>
        </div>
      </label>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">{files.length} selected</p>
          <div className="grid grid-cols-2 gap-2">
            {files.map((file, idx) => (
              <div key={idx} className="relative bg-slate-100 rounded p-2 text-center">
                <p className="text-xs text-slate-600 truncate">{file.name}</p>
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
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
            Upload {files.length > 0 ? `(${files.length})` : ''}
          </>
        )}
      </Button>

      {/* Uploaded Photos Confirmation */}
      {uploadedPhotos.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-700">{uploadedPhotos.length} photo(s) uploaded</p>
        </div>
      )}
    </div>
  );
}