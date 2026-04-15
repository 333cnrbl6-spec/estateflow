import React, { useState, useCallback } from 'react';
import { Upload, Zap, Cloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PropertyDocumentDropZone({ onFilesSelected, property, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(f => {
      const validTypes = ['application/pdf', 'application/zip', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(f.type) || f.name.endsWith('.zip') || f.name.endsWith('.pdf');
    });

    onFilesSelected(validFiles);
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  return (
    <Card className={`transition-all ${dragActive ? 'bg-primary/5 border-primary' : 'bg-muted/30'}`}>
      <CardContent className="pt-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/10 transition-colors"
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-1">Drag documents or ZIP files here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, images, Word docs, and ZIP archives (will auto-extract)
          </p>
          
          <input
            type="file"
            id="doc-upload"
            multiple
            onChange={handleInputChange}
            accept=".pdf,.zip,.jpg,.png,.docx"
            className="hidden"
            disabled={isLoading}
          />
          
          <label htmlFor="doc-upload">
            <Button variant="outline" asChild className="cursor-pointer">
              <span>Browse Files</span>
            </Button>
          </label>

          <div className="mt-4 flex gap-2 justify-center flex-wrap">
            <Badge variant="secondary">PDF</Badge>
            <Badge variant="secondary">ZIP</Badge>
            <Badge variant="secondary">Images</Badge>
            <Badge variant="secondary">Word</Badge>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Cloud className="w-4 h-4" />
            Connect Google Drive
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Cloud className="w-4 h-4" />
            Connect OneDrive
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Cloud className="w-4 h-4" />
            Connect Dropbox
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}