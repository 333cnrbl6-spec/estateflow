import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Lock, AlertTriangle } from 'lucide-react';
import ComplianceMetrics from '@/components/compliance/ComplianceMetrics';
import CertificateExpiryAlerts from '@/components/compliance/CertificateExpiryAlerts';
import PropertyComplianceStatus from '@/components/compliance/PropertyComplianceStatus';

export default function ComplianceHub() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: properties = [], isLoading: propsLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => base44.entities.Property.list(),
  });

  const { data: certificates = [], isLoading: certsLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const gas = await base44.entities.GasSafetyCertificate.list();
      const eicr = await base44.entities.EICRCertificate.list();
      return [...(gas || []), ...(eicr || [])];
    },
  });

  const { data: deposits = [], isLoading: depositsLoading } = useQuery({
    queryKey: ['deposits'],
    queryFn: async () => base44.entities.DepositProtection.list(),
  });

  // Memoize to prevent recreation on every render
  const propertyMap = React.useMemo(() => {
    const map = {};
    properties.forEach(p => map[p.id] = p);
    return map;
  }, [properties]);

  const isLoading = propsLoading || certsLoading || depositsLoading;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor safety certificates, redress schemes, and client money protection across your portfolio
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-muted-foreground">Loading compliance data...</p>
          </div>
        </div>
      ) : (
        <>
          <ComplianceMetrics
            certificates={certificates}
            deposits={deposits}
            properties={properties}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-2">
                <Shield className="w-4 h-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                <AlertTriangle className="w-4 h-4" /> Alerts
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2">
                <FileText className="w-4 h-4" /> Certificates
              </TabsTrigger>
              <TabsTrigger value="deposits" className="gap-2">
                <Lock className="w-4 h-4" /> Deposits
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <PropertyComplianceStatus
                properties={properties}
                certificates={certificates}
                deposits={deposits}
              />
            </TabsContent>

            <TabsContent value="alerts">
              <CertificateExpiryAlerts
                certificates={certificates}
                propertyMap={propertyMap}
              />
            </TabsContent>

            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Total Certificates: <span className="font-semibold text-foreground">{certificates.length}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {certificates.slice(0, 10).map(cert => (
                      <div key={cert.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{propertyMap[cert.property_id]?.name || 'Property'}</p>
                          <p className="text-xs text-muted-foreground">
                            {cert.certificate_number ? 'Gas Safety' : 'EICR'} • Ref: {cert.certificate_number || cert.certificate_reference}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date(cert.expiry_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                    {certificates.length > 10 && (
                      <p className="text-xs text-muted-foreground p-3">
                        +{certificates.length - 10} more certificates
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deposits">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Protection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Total Protected Deposits: <span className="font-semibold text-foreground">{deposits.length}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {deposits.slice(0, 10).map(deposit => (
                      <div key={deposit.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{propertyMap[deposit.property_id]?.name || 'Property'}</p>
                          <p className="text-xs text-muted-foreground">
                            {deposit.scheme_name.toUpperCase()} • £{deposit.deposit_amount}
                          </p>
                        </div>
                        <Badge
                          className={
                            deposit.compliance_status === 'compliant'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {deposit.compliance_status}
                        </Badge>
                      </div>
                    ))}
                    {deposits.length > 10 && (
                      <p className="text-xs text-muted-foreground p-3">
                        +{deposits.length - 10} more deposits
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}