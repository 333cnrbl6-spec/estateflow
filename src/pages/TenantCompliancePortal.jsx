import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Download, AlertTriangle, Home, FileText, Wrench, Lock, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import MaintenanceReportForm from '@/components/tenant/MaintenanceReportForm';

export default function TenantCompliancePortal() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (err) {
      setError('Unable to load user information');
    }
  };

  // Fetch tenant by email
  const tenantQuery = useQuery({
    queryKey: ['tenant-by-email', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const tenants = await base44.entities.Tenant.filter(
        { email: user.email },
        '-created_date',
        1
      );
      return tenants[0] || null;
    }
  });

  // Fetch property by tenant ID
  const propertyQuery = useQuery({
    queryKey: ['property-by-tenant', tenantQuery.data?.id],
    enabled: !!tenantQuery.data?.id,
    queryFn: async () => {
      const units = await base44.entities.Unit.filter(
        { current_tenant: tenantQuery.data.id },
        '-created_date',
        1
      );
      
      if (units.length > 0) {
        const property = await base44.entities.Property.get(units[0].property_id);
        return { property, unit: units[0] };
      }
      return null;
    }
  });

  // Fetch compliance documents
  const complianceQuery = useQuery({
    queryKey: ['compliance-docs', propertyQuery.data?.property?.id],
    enabled: !!propertyQuery.data?.property?.id,
    queryFn: async () => {
      const propertyId = propertyQuery.data.property.id;
      
      const [gasCerts, epicCerts, fireRiskData, fireRegisterData, documents] = await Promise.all([
        base44.entities.GasSafetyCertificate.filter({ property_id: propertyId }, '-expiry_date', 5).catch(() => []),
        base44.entities.EICRCertificate.filter({ property_id: propertyId }, '-expiry_date', 5).catch(() => []),
        base44.entities.FireRiskAssessment.filter({ property_id: propertyId }, '-assessment_date', 1).catch(() => []),
        base44.entities.FireSafetyRegister.filter({ property_id: propertyId }, '-created_date', 1).catch(() => []),
        base44.entities.Document.filter({ property_id: propertyId }, '-uploaded_date', 20).catch(() => [])
      ]);

      return {
        gasSafety: gasCerts,
        electrical: epicCerts,
        fireRisk: fireRiskData,
        fireSafety: fireRegisterData,
        documents: documents
      };
    }
  });

  // Fetch tenancy agreement
  const agreementQuery = useQuery({
    queryKey: ['tenancy-agreement', tenantQuery.data?.id],
    enabled: !!tenantQuery.data?.id,
    queryFn: async () => {
      const docs = await base44.entities.Document.filter(
        { 
          tenant_id: tenantQuery.data.id,
          document_type: 'Tenancy Agreement'
        },
        '-uploaded_date',
        1
      );
      return docs[0] || null;
    }
  });

  const { data: tenant } = tenantQuery;
  const { data: propertyData } = propertyQuery;
  const { data: complianceDocs } = complianceQuery;
  const { data: agreement } = agreementQuery;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground font-semibold">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!tenant || !propertyData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center">
          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground font-semibold">No active tenancy found</p>
          <p className="text-sm text-muted-foreground mt-2">Please contact your landlord for access</p>
        </div>
      </div>
    );
  }

  const { property, unit } = propertyData;
  const gasSafetyCerts = complianceDocs?.gasSafety || [];
  const electricalCerts = complianceDocs?.electrical || [];
  const fireRisk = complianceDocs?.fireRisk?.[0];
  const fireSafety = complianceDocs?.fireSafety?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tenant Portal</h1>
              <p className="text-muted-foreground mt-1">{property.address_line_1}, {property.postcode}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Logged in as:</p>
              <p className="font-semibold text-foreground">{user.full_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Safety Overview Alert */}
        {fireSafety && (
          <div className={`rounded-lg border-2 p-4 mb-8 ${
            fireSafety.compliance_status === 'compliant'
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-start gap-3">
              {fireSafety.compliance_status === 'compliant' ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-foreground">Fire Safety Status</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {fireSafety.compliance_status === 'compliant'
                    ? 'Your property meets all fire safety requirements.'
                    : 'Action required - review outstanding safety measures below.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="compliance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compliance">Compliance Documents</TabsTrigger>
            <TabsTrigger value="agreement">Tenancy Agreement</TabsTrigger>
            <TabsTrigger value="maintenance">Report Issue</TabsTrigger>
          </TabsList>

          {/* Compliance Documents Tab */}
          <TabsContent value="compliance" className="space-y-6 mt-6">
            {/* Gas Safety */}
            {gasSafetyCerts.length > 0 ? (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Gas Safety Certificate
                </h3>
                <div className="space-y-3">
                  {gasSafetyCerts.map(cert => (
                    <div key={cert.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">CP12 Certificate</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Issued: {format(parseISO(cert.issue_date), 'dd MMM yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {format(parseISO(cert.expiry_date), 'dd MMM yyyy')}
                        </p>
                        {cert.document_url && (
                          <p className="text-xs text-primary mt-2">Reference: {cert.certificate_number}</p>
                        )}
                      </div>
                      {cert.document_url && (
                        <Button
                          size="sm"
                          className="shrink-0"
                          onClick={() => window.open(cert.document_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-6">
                <p className="text-muted-foreground text-center py-4">No gas safety certificates on file</p>
              </div>
            )}

            {/* Electrical Safety */}
            {electricalCerts.length > 0 ? (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Electrical Installation Condition Report
                </h3>
                <div className="space-y-3">
                  {electricalCerts.map(cert => (
                    <div key={cert.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">EICR Certificate</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Issued: {format(parseISO(cert.issue_date), 'dd MMM yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {format(parseISO(cert.expiry_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                      {cert.document_url && (
                        <Button
                          size="sm"
                          className="shrink-0"
                          onClick={() => window.open(cert.document_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-6">
                <p className="text-muted-foreground text-center py-4">No electrical safety certificates on file</p>
              </div>
            )}

            {/* Fire Risk */}
            {fireRisk && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Fire Risk Assessment
                </h3>
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="font-medium text-foreground">Assessment Date</p>
                  <p className="text-sm text-muted-foreground">{format(parseISO(fireRisk.assessment_date), 'dd MMM yyyy')}</p>
                  <p className="font-medium text-foreground mt-3">Risk Level</p>
                  <p className={`text-sm font-semibold ${
                    fireRisk.overall_risk_level === 'low' ? 'text-green-600' :
                    fireRisk.overall_risk_level === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {fireRisk.overall_risk_level.charAt(0).toUpperCase() + fireRisk.overall_risk_level.slice(1)}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tenancy Agreement Tab */}
          <TabsContent value="agreement" className="space-y-6 mt-6">
            {agreement ? (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Your Tenancy Agreement
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{agreement.file_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {agreement.status === 'approved' && 'Your tenancy agreement has been signed and is active.'}
                        {agreement.status === 'pending_review' && 'Your tenancy agreement is pending review.'}
                        {agreement.status === 'rejected' && 'Your tenancy agreement was rejected.'}
                      </p>
                      {agreement.expiry_date && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Valid until: {format(parseISO(agreement.expiry_date), 'dd MMM yyyy')}
                        </p>
                      )}
                    </div>
                    {agreement.file_url && (
                      <Button
                        size="sm"
                        className="shrink-0"
                        onClick={() => window.open(agreement.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-6">
                <p className="text-muted-foreground text-center py-8">No tenancy agreement on file yet</p>
              </div>
            )}
          </TabsContent>

          {/* Report Maintenance Tab */}
          <TabsContent value="maintenance" className="mt-6">
            <MaintenanceReportForm 
              propertyId={property.id}
              unitId={unit.id}
              propertyAddress={`${property.address_line_1}, ${property.postcode}`}
              fireSafetyStatus={fireSafety?.compliance_status}
              fireRiskLevel={fireRisk?.overall_risk_level}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}