import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DOCUMENT_TYPES = ['ID Document', 'Proof of Residency', 'Signed Agreement', 'Bank Statement', 'Employment Letter', 'Other'];

export default function TenantDocumentUpload({ tenantId, propertyId, unitId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('Other');

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    
    selected.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File type ${file.type} not allowed. Please upload PDF, images, or Word documents.`);
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        alert('File size must be less than 5MB');
        return;
      }

      setFiles(prev => [...prev, {
        id: Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: selectedType,
        status: 'ready',
      }]);
    });
  };

  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const fileItem of files) {
        if (fileItem.status !== 'ready') continue;

        // Read file as base64
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onload = async () => {
            try {
              const uploadResponse = await base44.integrations.Core.UploadFile({
                file: reader.result,
              });

              // Trigger backend function to save document record and notify
              await base44.functions.invoke('handleTenantDocumentUpload', {
                tenant_id: tenantId,
                property_id: propertyId,
                unit_id: unitId,
                document_type: fileItem.type,
                file_name: fileItem.name,
                file_url: uploadResponse.file_url,
                file_size: fileItem.size,
              });

              setFiles(prev => prev.map(f => 
                f.id === fileItem.id ? { ...f, status: 'uploaded' } : f
              ));
            } catch (error) {
              console.error('Upload error:', error);
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id ? { ...f, status: 'error', error: error.message } : f
              ));
            }
            resolve();
          };
          
          reader.readAsArrayBuffer(fileItem.file);
        });
      }

      // Clear successfully uploaded files after 2 seconds
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'uploaded'));
      }, 2000);
    } finally {
      setUploading(false);
    }
  };

  const readyCount = files.filter(f => f.status === 'ready').length;
  const uploadedCount = files.filter(f => f.status === 'uploaded').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Securely upload identification, proof of residency, signed agreements, and other required documents.
        </p>

        {/* Document Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Type</label>
          <div className="grid grid-cols-2 gap-2">
            {DOCUMENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-2 rounded-lg border text-xs font-medium transition ${
                  selectedType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* File Input */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition cursor-pointer bg-slate-50">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            disabled={uploading}
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-medium text-sm">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, or Word (max 5MB)</p>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Files ({files.length})</label>
              {(uploadedCount > 0 || errorCount > 0) && (
                <div className="flex gap-2 text-xs">
                  {uploadedCount > 0 && <Badge variant="default" className="bg-green-600">{uploadedCount} uploaded</Badge>}
                  {errorCount > 0 && <Badge variant="destructive">{errorCount} failed</Badge>}
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{file.type}</Badge>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'ready' && (
                      <span className="text-xs text-muted-foreground">Ready</span>
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {file.status === 'uploaded' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    {file.status !== 'uploading' && (
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 hover:bg-slate-200 rounded transition"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {readyCount > 0 && (
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {readyCount} File{readyCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        {/* Success Message */}
        {uploadedCount > 0 && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">
              ✓ {uploadedCount} document{uploadedCount > 1 ? 's' : ''} uploaded successfully. Your property manager has been notified.
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorCount > 0 && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">
              {errorCount} file{errorCount > 1 ? 's' : ''} failed to upload. Please try again.
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700">
            🔒 Your documents are encrypted and securely stored. Only your property manager can access these files.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}