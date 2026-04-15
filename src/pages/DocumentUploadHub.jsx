import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import DragDropUploadZone from '@/components/documents/DragDropUploadZone';
import { useQuery } from '@tanstack/react-query';

export default function DocumentUploadHub() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [processedDocuments, setProcessedDocuments] = useState([]);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const handleFilesProcessed = async (fileData) => {
    setProcessedDocuments(prev => [...prev, fileData]);

    try {
      await base44.functions.invoke('saveDocumentCategorization', {
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        categorization: fileData.categorization,
        propertyId: selectedProperty?.id
      });

      refetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-primary" />
          Document Upload & Categorization
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload documents and let AI automatically categorize them by property, certificate type, or invoice category.
        </p>
      </div>

      {/* Property Selector */}
      {properties && properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Property (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {properties.slice(0, 8).map(prop => (
                <Button
                  key={prop.id}
                  variant={selectedProperty?.id === prop.id ? 'default' : 'outline'}
                  onClick={() => setSelectedProperty(prop)}
                  className="justify-start truncate"
                >
                  {prop.address?.split(',')[0] || `Property ${prop.id.slice(0, 4)}`}
                </Button>
              ))}
            </div>
            {selectedProperty && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                <strong>Selected:</strong> {selectedProperty.address}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Zone */}
      <DragDropUploadZone
        onFilesProcessed={handleFilesProcessed}
        acceptedFormats=".pdf,.jpg,.jpeg,.png,.gif"
      />

      {/* Processed Documents */}
      {documents && documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.slice(0, 10).map(doc => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="gap-2"
                    >
                      <Download className="w-3 h-3" />
                      View
                    </Button>
                  </div>
                  {doc.parsed_data && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {doc.parsed_data.certificateType && (
                        <p><strong>Certificate:</strong> {doc.parsed_data.certificateType}</p>
                      )}
                      {doc.parsed_data.invoiceCategory && (
                        <p><strong>Invoice Type:</strong> {doc.parsed_data.invoiceCategory}</p>
                      )}
                      {doc.parsed_data.expiryDate && (
                        <p><strong>Expires:</strong> {doc.parsed_data.expiryDate}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}