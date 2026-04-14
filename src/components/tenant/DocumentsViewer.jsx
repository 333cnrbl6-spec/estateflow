import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const DOCUMENT_TYPES = {
  lease_agreement: { label: 'Lease Agreement', color: 'bg-blue-100 text-blue-700' },
  tenancy_agreement: { label: 'Tenancy Agreement', color: 'bg-blue-100 text-blue-700' },
  prescribed_information: { label: 'Prescribed Info', color: 'bg-green-100 text-green-700' },
  deposit_schedule: { label: 'Deposit Schedule', color: 'bg-purple-100 text-purple-700' },
  safety_certificate: { label: 'Safety Certificate', color: 'bg-orange-100 text-orange-700' },
  epc: { label: 'Energy Certificate', color: 'bg-yellow-100 text-yellow-700' },
  other: { label: 'Document', color: 'bg-gray-100 text-gray-700' }
};

export default function DocumentsViewer({ tenant, property }) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['tenant-documents', tenant.id, property?.id],
    enabled: !!tenant && !!property,
    queryFn: async () => {
      // Fetch documents related to the tenancy
      const docs = await Promise.all([
        // Lease/Tenancy agreements
        base44.entities.GeneratedDocument.filter(
          { tenant_id: tenant.id, property_id: property.id },
          '-generated_date',
          10
        ).catch(() => []),
        // Safety certificates
        base44.entities.GasSafetyCertificate.filter(
          { property_id: property.id },
          '-assessment_date',
          10
        ).catch(() => []),
        // Energy certificates
        base44.entities.EnergyPerformanceCertificate.filter(
          { property_id: property.id },
          '-assessment_date',
          10
        ).catch(() => []),
        // Other documents
        base44.entities.Document.filter(
          { property_id: property.id },
          '-created_date',
          10
        ).catch(() => [])
      ]);

      // Combine and format
      const combined = [];
      
      docs[0]?.forEach(doc => {
        combined.push({
          ...doc,
          type: 'generated_document',
          doc_type: doc.template_code?.includes('AST') ? 'tenancy_agreement' : 'lease_agreement',
          title: doc.document_name
        });
      });

      docs[1]?.forEach(doc => {
        combined.push({
          ...doc,
          type: 'gas_safety',
          doc_type: 'safety_certificate',
          title: `Gas Safety Certificate - ${format(new Date(doc.assessment_date), 'MMM yyyy')}`
        });
      });

      docs[2]?.forEach(doc => {
        combined.push({
          ...doc,
          type: 'epc',
          doc_type: 'epc',
          title: `Energy Performance Certificate - ${doc.current_rating} Rating`
        });
      });

      docs[3]?.forEach(doc => {
        combined.push({
          ...doc,
          type: 'document',
          doc_type: 'other',
          title: doc.name || doc.title
        });
      });

      return combined.sort((a, b) => new Date(b.created_date || b.assessment_date) - new Date(a.created_date || a.assessment_date));
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="p-12 bg-white text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No documents available yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const docTypeConfig = DOCUMENT_TYPES[doc.doc_type] || DOCUMENT_TYPES.other;

        return (
          <Card key={`${doc.type}-${doc.id}`} className="p-6 bg-white hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 shrink-0">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg mb-2">{doc.title}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={`text-xs ${docTypeConfig.color}`}>
                      {docTypeConfig.label}
                    </Badge>
                    {doc.status && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          doc.status === 'valid' ? 'border-green-200 text-green-700' :
                          doc.status === 'expiring_soon' ? 'border-orange-200 text-orange-700' :
                          'border-red-200 text-red-700'
                        }`}
                      >
                        {doc.status === 'expiring_soon' && '⚠️ '}{doc.status}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {doc.assessment_date && (
                      <div>
                        <p className="font-semibold text-foreground">Assessed</p>
                        {format(new Date(doc.assessment_date), 'dd MMM yyyy')}
                      </div>
                    )}
                    {doc.expiry_date && (
                      <div>
                        <p className="font-semibold text-foreground">Expires</p>
                        {format(new Date(doc.expiry_date), 'dd MMM yyyy')}
                      </div>
                    )}
                    {doc.generated_date && (
                      <div>
                        <p className="font-semibold text-foreground">Generated</p>
                        {format(new Date(doc.generated_date), 'dd MMM yyyy')}
                      </div>
                    )}
                  </div>

                  {/* Expiry Warning */}
                  {doc.status === 'expiring_soon' && doc.expiry_date && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-700">
                        This certificate expires on {format(new Date(doc.expiry_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                {doc.document_url && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.document_url, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.document_url;
                        link.download = doc.title;
                        link.click();
                      }}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}