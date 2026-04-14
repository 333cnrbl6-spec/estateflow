import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TenantDocumentViewer({ tenant }) {
  // Fetch documents
  const documentsQuery = useQuery({
    queryKey: ['tenant-documents', tenant.id],
    queryFn: async () => {
      return await base44.entities.Document.filter(
        { tenant_id: tenant.id },
        '-updated_date',
        100
      );
    },
  });

  const { data: documents = [], isLoading } = documentsQuery;

  // Group documents by type
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) acc[doc.document_type] = [];
    acc[doc.document_type].push(doc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.keys(groupedDocs).length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No documents available</p>
        </div>
      ) : (
        Object.entries(groupedDocs).map(([docType, docs]) => (
          <div key={docType}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {docType}
            </h3>
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded: {new Date(doc.uploaded_date).toLocaleDateString()}
                      {doc.status && ` • Status: ${doc.status}`}
                      {doc.expiry_date && ` • Expires: ${new Date(doc.expiry_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={doc.file_url}
                      download
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm font-semibold transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Important Notes */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Important:</strong> Keep copies of all signed documents for your records. If you need a replacement, contact your property manager.
        </p>
      </div>
    </div>
  );
}