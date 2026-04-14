import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ComplianceNotificationCenter() {
  const [refreshing, setRefreshing] = useState(false);

  // Get vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor?.list?.('-updated_date', 200) || Promise.resolve([])
  });

  // Get properties
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property?.list?.('-updated_date', 200) || Promise.resolve([])
  });

  // Get insurance
  const { data: insurances = [] } = useQuery({
    queryKey: ['insurances'],
    queryFn: () => base44.entities.VendorInsurance?.list?.('-updated_date', 500) || Promise.resolve([])
  });

  // Get certificates
  const { data: gasCerts = [] } = useQuery({
    queryKey: ['gasCerts'],
    queryFn: () => base44.entities.GasSafetyCertificate?.list?.('-updated_date', 500) || Promise.resolve([])
  });

  // Get workflows
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow?.list?.('-updated_date', 100) || Promise.resolve([])
  });

  const handleRunScan = async () => {
    setRefreshing(true);
    try {
      const result = await base44.functions.invoke('scanExpiringComplianceItems', {});
      toast.success(`Scan complete: ${result.emails_sent} notifications sent`);
    } catch (error) {
      toast.error('Scan failed: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Analyze expiring items
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringInsurance = insurances.filter(i => {
    const expiry = new Date(i.expiry_date);
    return expiry > now && expiry <= thirtyDaysFromNow;
  });

  const expiredInsurance = insurances.filter(i => {
    const expiry = new Date(i.expiry_date);
    return expiry <= now;
  });

  const expiringCerts = gasCerts.filter(c => {
    const expiry = new Date(c.expiry_date);
    return expiry > now && expiry <= thirtyDaysFromNow;
  });

  const expiredCerts = gasCerts.filter(c => {
    const expiry = new Date(c.expiry_date);
    return expiry <= now;
  });

  const pendingWorkflows = workflows.filter(w => ['pending', 'in_progress'].includes(w.status));
  const overdueWorkflows = pendingWorkflows.filter(w => new Date(w.due_date) < now);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Compliance Notification Center</h1>
          <p className="text-muted-foreground">Monitor expiring insurance, certificates, and compliance audits</p>
        </div>

        {/* Control Panel */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground mb-1">Automated Scan</h2>
              <p className="text-sm text-muted-foreground">Runs daily at 6am to check for expiring items</p>
            </div>
            <Button
              onClick={handleRunScan}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Scan Now
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Insurance Expiring"
            value={expiringInsurance.length}
            icon={AlertTriangle}
            color="text-orange-600"
          />
          <SummaryCard
            title="Insurance Expired"
            value={expiredInsurance.length}
            icon={AlertTriangle}
            color="text-red-600"
          />
          <SummaryCard
            title="Certificates Expiring"
            value={expiringCerts.length}
            icon={Clock}
            color="text-blue-600"
          />
          <SummaryCard
            title="Overdue Workflows"
            value={overdueWorkflows.length}
            icon={AlertTriangle}
            color="text-red-600"
          />
        </div>

        {/* Detailed Views */}
        <Tabs defaultValue="insurance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
          </TabsList>

          {/* Insurance */}
          <TabsContent value="insurance" className="space-y-4">
            {expiringInsurance.length === 0 && expiredInsurance.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-muted-foreground">All insurance policies are current</p>
              </Card>
            ) : (
              <>
                {expiredInsurance.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-red-600">Expired Insurance</h3>
                    {expiredInsurance.map(insurance => (
                      <InsuranceCard key={insurance.id} insurance={insurance} vendors={vendors} status="expired" />
                    ))}
                  </div>
                )}

                {expiringInsurance.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-orange-600">Expiring Soon (30 days)</h3>
                    {expiringInsurance.map(insurance => (
                      <InsuranceCard key={insurance.id} insurance={insurance} vendors={vendors} status="expiring" />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates" className="space-y-4">
            {expiringCerts.length === 0 && expiredCerts.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-muted-foreground">All certificates are current</p>
              </Card>
            ) : (
              <>
                {expiredCerts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-red-600">Expired Certificates</h3>
                    {expiredCerts.map(cert => (
                      <CertificateCard key={cert.id} cert={cert} properties={properties} status="expired" />
                    ))}
                  </div>
                )}

                {expiringCerts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-orange-600">Expiring Soon (30 days)</h3>
                    {expiringCerts.map(cert => (
                      <CertificateCard key={cert.id} cert={cert} properties={properties} status="expiring" />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Workflows */}
          <TabsContent value="workflows" className="space-y-4">
            {overdueWorkflows.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-muted-foreground">All workflows are on schedule</p>
              </Card>
            ) : (
              <div className="space-y-3">
                <h3 className="font-bold text-red-600">Overdue Workflows</h3>
                {overdueWorkflows.map(workflow => (
                  <Card key={workflow.id} className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{workflow.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {workflow.relationship_type.replace(/_/g, ' ')} • Stage {workflow.current_stage + 1} of {workflow.total_stages}
                        </p>
                      </div>
                      <Badge className="bg-red-600">
                        {Math.abs(Math.floor((new Date() - new Date(workflow.due_date)) / (1000 * 60 * 60 * 24)))} days overdue
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color} opacity-20`} />
      </div>
    </Card>
  );
}

function InsuranceCard({ insurance, vendors, status }) {
  const vendor = vendors.find(v => v.id === insurance.vendor_id);
  const daysUntilExpiry = Math.ceil((new Date(insurance.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`p-4 border-l-4 ${status === 'expired' ? 'border-l-red-600 bg-red-50' : 'border-l-orange-600 bg-orange-50'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{vendor?.name || 'Unknown Vendor'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {insurance.insurance_type.replace(/_/g, ' ')} • Policy {insurance.policy_number}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Provider: {insurance.provider} • Coverage: £{insurance.coverage_amount?.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{new Date(insurance.expiry_date).toLocaleDateString()}</p>
          <p className={`text-xs font-semibold ${status === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
            {status === 'expired' ? 'EXPIRED' : daysUntilExpiry === 1 ? 'EXPIRES TOMORROW' : `${daysUntilExpiry} days left`}
          </p>
        </div>
      </div>
    </Card>
  );
}

function CertificateCard({ cert, properties, status }) {
  const property = properties.find(p => p.id === cert.property_id);
  const daysUntilExpiry = Math.ceil((new Date(cert.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`p-4 border-l-4 ${status === 'expired' ? 'border-l-red-600 bg-red-50' : 'border-l-orange-600 bg-orange-50'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{property?.name || property?.address || 'Unknown Property'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Certificate: {cert.certificate_number}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{new Date(cert.expiry_date).toLocaleDateString()}</p>
          <p className={`text-xs font-semibold ${status === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
            {status === 'expired' ? 'EXPIRED' : daysUntilExpiry === 1 ? 'EXPIRES TOMORROW' : `${daysUntilExpiry} days left`}
          </p>
        </div>
      </div>
    </Card>
  );
}