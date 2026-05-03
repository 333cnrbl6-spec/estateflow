import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function PropertyDocumentsViewer({ propertyId, tenantId }) {
  // Fetch property documents
  const { data: documents = [] } = useQuery({
    queryKey: ['property-documents', propertyId],
    queryFn: () => base44.entities.Document.filter({ property_id: propertyId }, '-created_date', 50)
  });

  // Fetch safety certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', propertyId],
    queryFn: () => base44.entities.SafetyCertificate.filter({ property_id: propertyId }, '-expiry_date')
  });

  const gasChecks = certificates.filter(c => c.certificate_type === 'gas_safety');
  const electricalChecks = certificates.filter(c => c.certificate_type === 'eicr');
  const fireChecks = certificates.filter(c => c.certificate_type === 'fire_safety');

  const getCertificateStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return { label: 'EXPIRED', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (daysRemaining < 30) return { label: 'EXPIRING SOON', color: 'bg-orange-100 text-orange-800', icon: Clock };
    return { label: 'VALID', color: 'bg-green-100 text-green-800', icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Safety Certificates</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Important safety documentation for your property. These are legally required and must be kept current.
        </p>
      </div>

      {/* Gas Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔥</span> Gas Safety Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gasChecks.length === 0 ? (
            <p className="text-muted-foreground">No gas safety certificate on file.</p>
          ) : (
            gasChecks.map(cert => {
              const status = getCertificateStatus(cert.expiry_date);
              const StatusIcon = status.icon;

              return (
                <div key={cert.id} className={`p-4 rounded-lg border ${status.color === 'bg-red-100 text-red-800' ? 'bg-red-50 border-red-200' : status.color === 'bg-orange-100 text-orange-800' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Gas Safety Inspection</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Valid until: {new Date(cert.expiry_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {cert.engineer_name && (
                        <p className="text-xs text-muted-foreground mt-1">Inspector: {cert.engineer_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {cert.document_url && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="w-4 h-4" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Electrical Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>⚡</span> Electrical Installation Condition Report (EICR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {electricalChecks.length === 0 ? (
            <p className="text-muted-foreground">No electrical safety certificate on file.</p>
          ) : (
            electricalChecks.map(cert => {
              const status = getCertificateStatus(cert.expiry_date);
              const StatusIcon = status.icon;

              return (
                <div key={cert.id} className={`p-4 rounded-lg border ${status.color === 'bg-red-100 text-red-800' ? 'bg-red-50 border-red-200' : status.color === 'bg-orange-100 text-orange-800' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Electrical Safety Test</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Valid until: {new Date(cert.expiry_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {cert.engineer_name && (
                        <p className="text-xs text-muted-foreground mt-1">Inspector: {cert.engineer_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {cert.document_url && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="w-4 h-4" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Fire Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🚒</span> Fire Safety Register
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fireChecks.length === 0 ? (
            <p className="text-muted-foreground">No fire safety documentation on file.</p>
          ) : (
            fireChecks.map(cert => {
              const status = getCertificateStatus(cert.expiry_date);
              const StatusIcon = status.icon;

              return (
                <div key={cert.id} className={`p-4 rounded-lg border ${status.color === 'bg-red-100 text-red-800' ? 'bg-red-50 border-red-200' : status.color === 'bg-orange-100 text-orange-800' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Fire Safety Assessment</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last checked: {new Date(cert.created_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {cert.notes && (
                        <p className="text-xs text-muted-foreground mt-1">Notes: {cert.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {cert.document_url && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="w-4 h-4" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Additional Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{doc.name || doc.document_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {doc.file_url && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Legal Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Legal Notice:</span> Your landlord is required by law to maintain and provide current safety certificates. If any certificate is expired or missing, please contact your property manager immediately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}