import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProofOfWorkUpload({ task, onClose, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const uploadedUrls = [];
      
      for (const file of files) {
        const res = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(res.file_url);
      }

      // Update task with proof of work and mark as in_progress
      await base44.entities.Task.update(task.id, {
        proof_of_work: uploadedUrls,
        status: 'in_progress'
      });

      return uploadedUrls;
    },
    onSuccess: onSuccess
  });

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Upload Proof of Work</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {preview && (
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files ({files.length})</p>
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-100 rounded">
                  <p className="text-sm text-foreground truncate">{file.name}</p>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              Choose File
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={files.length === 0 || uploadMutation.isPending}
              className="flex-1 gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Upload ({files.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}