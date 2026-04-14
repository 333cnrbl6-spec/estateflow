import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, ExternalLink, Loader2, FolderOpen } from 'lucide-react';

export default function TenantPropertyDocuments({ tenant, units }) {
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id || '');

  // Fetch documents for selected unit
  const documentsQuery = useQuery({
    queryKey: ['property-documents', selectedUnit, tenant.id],
    enabled: !!selectedUnit,
    queryFn: async () => {
      return await base44.entities.Document.filter(
        { tenant_id: tenant.id, unit_id: selectedUnit },
        '-updated_date',
        100
      );
    },
  });

  // Fetch inspection reports for selected unit
  const inspectionsQuery = useQuery({
    queryKey: ['inspection-reports', selectedUnit],
    enabled: !!selectedUnit,
    queryFn: async () => {
      return await base44.entities.InspectionReport.filter(
        { unit_id: selectedUnit },
        '-inspection_date',
        10
      );
    },
  });

  const { data: documents = [], isLoading: docsLoading } = documentsQuery;
  const { data: inspections = [], isLoading: inspLoading } = inspectionsQuery;

  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) acc[doc.document_type] = [];
    acc[doc.document_type].push(doc);
    return acc;
  }, {});

  const isLoading = docsLoading || inspLoading;

  return (
    <div className="space-y-8">
      {/* Unit Selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Select Unit</label>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {units.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Tenancy Documents */}
          {documents.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tenancy Documents
              </h4>
              <div className="space-y-2">
                {Object.entries(groupedDocs).map(([docType, docs]) => (
                  <div key={docType} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <h5 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{docType}</h5>
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded: {new Date(doc.uploaded_date).toLocaleDateString()}
                              {doc.expiry_date && ` • Expires: ${new Date(doc.expiry_date).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4 shrink-0">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                            <a
                              href={doc.file_url}
                              download
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-semibold transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspection Reports */}
          {inspections.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Inspection Reports
              </h4>
              <div className="space-y-2">
                {inspections.map(inspection => (
                  <div key={inspection.id} className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h5 className="font-semibold text-foreground">
                          {inspection.inspection_type.replace(/_/g, ' ').charAt(0).toUpperCase() + inspection.inspection_type.replace(/_/g, ' ').slice(1)} Inspection
                        </h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Conducted: {new Date(inspection.inspection_date).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            inspection.overall_condition === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' :
                            inspection.overall_condition === 'good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' :
                            inspection.overall_condition === 'fair' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                          }`}>
                            {inspection.overall_condition.charAt(0).toUpperCase() + inspection.overall_condition.slice(1)} Condition
                          </span>
                        </div>
                      </div>
                      {inspection.pdf_url && (
                        <a
                          href={inspection.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors shrink-0"
                        >
                          <FileText className="w-3 h-3" />
                          View Report
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length === 0 && inspections.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No documents or reports available</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}