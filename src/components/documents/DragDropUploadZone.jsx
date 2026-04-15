import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, File, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DragDropUploadZone({ onFilesProcessed, acceptedFormats = '.pdf,.jpg,.jpeg,.png,.gif' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    const uploadId = Date.now();
    setUploads(prev => [...prev, {
      id: uploadId,
      name: file.name,
      status: 'uploading',
      progress: 0,
      categorization: null,
      error: null
    }]);

    try {
      // Upload file
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: file
      });

      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: 'parsing', fileUrl: uploadResponse.file_url } : u
      ));

      // Parse and categorize using AI
      const categorization = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and categorize it. Extract the following if present:
- Property address or property ID
- Certificate type (if applicable: Gas Safety, Electrical, Fire Safety, EPC, HMO License, Deposit Protection)
- Invoice category (if applicable: Maintenance, Utilities, Services, Rent, Other)
- Document title
- Issue date (if present)
- Expiry date (if applicable)

Respond in JSON format with these exact fields: { propertyAddress, certificateType, invoiceCategory, documentTitle, issueDate, expiryDate, confidence }`,
        file_urls: uploadResponse.file_url,
        response_json_schema: {
          type: 'object',
          properties: {
            propertyAddress: { type: 'string' },
            certificateType: { type: 'string' },
            invoiceCategory: { type: 'string' },
            documentTitle: { type: 'string' },
            issueDate: { type: 'string' },
            expiryDate: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 100 }
          }
        }
      });

      const processedData = {
        fileName: file.name,
        fileUrl: uploadResponse.file_url,
        categorization: categorization,
        uploadedAt: new Date().toISOString()
      };

      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: 'complete', categorization } : u
      ));

      if (onFilesProcessed) {
        onFilesProcessed(processedData);
      }
    } catch (error) {
      console.error('File processing error:', error);
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: 'error', error: error.message } : u
      ));
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        processFile(file);
      }
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => processFile(file));
  };

  const removeUpload = (id) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Drag documents here</h3>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">Supported: PDF, JPG, PNG</p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFormats}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processing Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploads.map(upload => (
              <div key={upload.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{upload.name}</p>
                      {upload.error && (
                        <p className="text-xs text-destructive">{upload.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {upload.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {upload.status === 'parsing' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {upload.status === 'complete' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {upload.status === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                    {upload.status === 'complete' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeUpload(upload.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Categorization Results */}
                {upload.categorization && (
                  <div className="bg-muted/50 rounded p-3 space-y-2">
                    {upload.categorization.documentTitle && (
                      <div>
                        <span className="text-xs text-muted-foreground">Document:</span>
                        <p className="text-sm font-medium">{upload.categorization.documentTitle}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {upload.categorization.propertyAddress && (
                        <div>
                          <span className="text-muted-foreground">Property</span>
                          <Badge variant="outline" className="block mt-1 text-xs truncate">
                            {upload.categorization.propertyAddress}
                          </Badge>
                        </div>
                      )}
                      {upload.categorization.certificateType && (
                        <div>
                          <span className="text-muted-foreground">Certificate</span>
                          <Badge className="block mt-1 text-xs bg-blue-100 text-blue-800">
                            {upload.categorization.certificateType}
                          </Badge>
                        </div>
                      )}
                      {upload.categorization.invoiceCategory && (
                        <div>
                          <span className="text-muted-foreground">Invoice Type</span>
                          <Badge className="block mt-1 text-xs bg-amber-100 text-amber-800">
                            {upload.categorization.invoiceCategory}
                          </Badge>
                        </div>
                      )}
                      {upload.categorization.issueDate && (
                        <div>
                          <span className="text-muted-foreground">Issued</span>
                          <p className="text-xs font-medium">{upload.categorization.issueDate}</p>
                        </div>
                      )}
                      {upload.categorization.expiryDate && (
                        <div>
                          <span className="text-muted-foreground">Expires</span>
                          <p className="text-xs font-medium">{upload.categorization.expiryDate}</p>
                        </div>
                      )}
                    </div>
                    {upload.categorization.confidence && (
                      <div className="text-xs text-muted-foreground">
                        Confidence: {Math.round(upload.categorization.confidence)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}