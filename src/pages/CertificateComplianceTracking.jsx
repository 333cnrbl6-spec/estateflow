import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Bell, FileText } from 'lucide-react';
import CertificateStatus from '@/components/compliance/CertificateStatus';

export default function CertificateComplianceTracking() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const { data: gasCerts = [] } = useQuery({
    queryKey: ['gas-certificates'],
    queryFn: () => base44.entities.GasSafetyCertificate?.list?.() || Promise.resolve([])
  });

  const { data: electricalCerts = [] } = useQuery({
    queryKey: ['electrical-certificates'],
    queryFn: () => base44.entities.EICRCertificate?.list?.() || Promise.resolve([])
  });

  const { data: fireCerts = [] } = useQuery({
    queryKey: ['fire-certificates'],
    queryFn: () => base44.entities.FireRiskAssessment?.list?.() || Promise.resolve([])
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.ComplianceAuditLog.list()
  });

  const sendReminderMutation = useMutation({
    mutationFn: (propertyId) => base44.functions.invoke('sendComplianceReminders', { property_id: propertyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    }
  });

  const filteredProperties = properties.filter(p =>
    p.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const propertyGasCerts = selectedProperty ? gasCerts.filter(c => c.property_id === selectedProperty) : [];
  const propertyElectricalCerts = selectedProperty ? electricalCerts.filter(c => c.property_id === selectedProperty) : [];
  const propertyFireCerts = selectedProperty ? fireCerts.filter(c => c.property_id === selectedProperty) : [];

  const getExpirationStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', daysLeft };
    if (daysLeft <= 30) return { status: 'expiring_soon', daysLeft };
    return { status: 'valid', daysLeft };
  };

  const expiredCount = [
    ...propertyGasCerts,
    ...propertyElectricalCerts,
    ...propertyFireCerts
  ].filter(c => {
    const { status } = getExpirationStatus(c.expiry_date || c.valid_until || c.next_review_due);
    return status === 'expired';
  }).length;

  const expiringSoonCount = [
    ...propertyGasCerts,
    ...propertyElectricalCerts,
    ...propertyFireCerts
  ].filter(c => {
    const { status } = getExpirationStatus(c.expiry_date || c.valid_until || c.next_review_due);
    return status === 'expiring_soon';
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-foreground">Certificate Compliance Tracking</h1>
          <p className="text-muted-foreground mt-2">Monitor safety certificates and compliance status</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{expiredCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon (30 days)</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{expiringSoonCount}</p>
              </div>
              <Bell className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Properties Monitored</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{properties.length}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Property List */}
          <div className="col-span-1">
            <Card className="p-4 h-full">
              <h2 className="font-semibold text-foreground mb-4">Properties</h2>
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProperties.map(prop => (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedProperty === prop.id
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <p className="text-sm font-medium">{prop.address}</p>
                    <p className="text-xs opacity-75">{prop.postcode}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Certificates */}
          <div className="col-span-2 space-y-4">
            {selectedProperty ? (
              <>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground">Certificates & Compliance</h2>
                    <Button
                      onClick={() => sendReminderMutation.mutate(selectedProperty)}
                      disabled={sendReminderMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Send Reminders
                    </Button>
                  </div>

                  <Tabs defaultValue="all" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="all">All Certificates</TabsTrigger>
                      <TabsTrigger value="gas">Gas Safety</TabsTrigger>
                      <TabsTrigger value="electrical">Electrical</TabsTrigger>
                      <TabsTrigger value="fire">Fire Safety</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-3">
                      {propertyGasCerts.length === 0 && propertyElectricalCerts.length === 0 && propertyFireCerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No certificates found</div>
                      ) : (
                        <>
                          {propertyGasCerts.map(cert => (
                            <CertificateStatus key={cert.id} certificate={cert} certificateType="gas_safety" />
                          ))}
                          {propertyElectricalCerts.map(cert => (
                            <CertificateStatus key={cert.id} certificate={cert} certificateType="electrical" />
                          ))}
                          {propertyFireCerts.map(cert => (
                            <CertificateStatus key={cert.id} certificate={cert} certificateType="fire_safety" />
                          ))}
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="gas" className="space-y-3">
                      {propertyGasCerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No gas safety certificates</div>
                      ) : (
                        propertyGasCerts.map(cert => (
                          <CertificateStatus key={cert.id} certificate={cert} certificateType="gas_safety" />
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="electrical" className="space-y-3">
                      {propertyElectricalCerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No electrical certificates</div>
                      ) : (
                        propertyElectricalCerts.map(cert => (
                          <CertificateStatus key={cert.id} certificate={cert} certificateType="electrical" />
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="fire" className="space-y-3">
                      {propertyFireCerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No fire safety assessments</div>
                      ) : (
                        propertyFireCerts.map(cert => (
                          <CertificateStatus key={cert.id} certificate={cert} certificateType="fire_safety" />
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Audit Log */}
                <Card className="p-4">
                  <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Compliance Audit Log
                  </h2>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {auditLogs.filter(log => log.property_id === selectedProperty).length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">No audit logs</div>
                    ) : (
                      auditLogs
                        .filter(log => log.property_id === selectedProperty)
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 10)
                        .map(log => (
                          <div key={log.id} className="p-2 border border-slate-200 rounded text-sm">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-foreground">{log.action}</p>
                              <Badge
                                className={
                                  log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                  log.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }
                              >
                                {log.severity}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">{log.details}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Select a property to view certificates</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}