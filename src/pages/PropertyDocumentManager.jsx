import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle2, FolderOpen } from 'lucide-react';
import PropertyDocumentDropZone from '@/components/property-documents/PropertyDocumentDropZone';
import DocumentCategoryConfirm from '@/components/property-documents/DocumentCategoryConfirm';

export default function PropertyDocumentManager() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [parsedDocs, setParsedDocs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmingIndex, setConfirmingIndex] = useState(0);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: existingDocs = [], refetch: refetchDocs } = useQuery({
    queryKey: ['propertyDocs', selectedProperty?.id],
    queryFn: () => selectedProperty 
      ? base44.entities.Document.filter({ property_id: selectedProperty.id })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const handleFilesSelected = async (files) => {
    if (!selectedProperty) {
      alert('Please select a property first');
      return;
    }

    setIsProcessing(true);
    setUploadedFiles(files);
    setParsedDocs([]);
    setConfirmingIndex(0);

    try {
      const parsed = [];
      for (const file of files) {
        // Upload file
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        
        // Parse with AI
        const parseResult = await base44.functions.invoke('parsePropertyDocuments', {
          property_id: selectedProperty.id,
          file_name: file.name,
          file_url: uploadResult.file_url,
          file_type: file.type,
          is_zip: file.name.endsWith('.zip'),
        });

        if (parseResult.success) {
          parsed.push({
            file_name: file.name,
            file_url: uploadResult.file_url,
            ...parseResult,
          });
        }
      }
      setParsedDocs(parsed);
    } catch (err) {
      console.error('File processing error:', err);
      alert('Failed to process files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDoc = async (category, metadata) => {
    const doc = parsedDocs[confirmingIndex];
    
    try {
      // Save to database
      await base44.entities.Document.create({
        title: doc.file_name,
        document_type: category.toLowerCase(),
        property_id: selectedProperty.id,
        file_url: doc.file_url,
        status: 'filed',
        metadata: metadata || {},
        tags: [category.toLowerCase()],
        generated_date: new Date().toISOString().split('T')[0],
      });

      // Move to next doc or finish
      if (confirmingIndex < parsedDocs.length - 1) {
        setConfirmingIndex(confirmingIndex + 1);
      } else {
        // All done
        setParsedDocs([]);
        setUploadedFiles([]);
        refetchDocs();
        alert('All documents imported successfully!');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save document');
    }
  };

  const handleSkipDoc = () => {
    if (confirmingIndex < parsedDocs.length - 1) {
      setConfirmingIndex(confirmingIndex + 1);
    } else {
      setParsedDocs([]);
      setUploadedFiles([]);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderOpen className="w-8 h-8 text-primary" />
          Property Document Manager
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload and organize documents by property. AI extracts metadata and suggests categories.
        </p>
      </div>

      {/* Property Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {properties.map((prop) => (
              <button
                key={prop.id}
                onClick={() => setSelectedProperty(prop)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedProperty?.id === prop.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <p className="font-medium">{prop.name}</p>
                <p className="text-xs text-muted-foreground">{prop.address_line_1}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedProperty && (
        <>
          {/* Upload Zone */}
          <PropertyDocumentDropZone 
            onFilesSelected={handleFilesSelected}
            property={selectedProperty}
            isLoading={isProcessing}
          />

          {/* Document Confirmation */}
          {parsedDocs.length > 0 && confirmingIndex < parsedDocs.length && (
            <div>
              <p className="text-sm font-medium mb-2">
                Document {confirmingIndex + 1} of {parsedDocs.length}
              </p>
              <DocumentCategoryConfirm
                document={parsedDocs[confirmingIndex]}
                onConfirm={handleConfirmDoc}
                onSkip={handleSkipDoc}
                isLoading={isProcessing}
              />
            </div>
          )}

          {/* Existing Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Property Documents ({existingDocs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {existingDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents yet. Start uploading!</p>
              ) : (
                <div className="space-y-2">
                  {existingDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                      </div>
                      <Badge>{doc.document_type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}