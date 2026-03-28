import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Settings, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import ServiceConfiguration from '@/components/outofhours/ServiceConfiguration';
import ServiceTierPricing from '@/components/outofhours/ServiceTierPricing';

export default function CallCenterConfig() {
  const { user } = useAuth();

  // Restrict access to admin users only
  if (user?.role !== 'admin') {
    return (
      <div className="p-8 max-w-[1200px] mx-auto">
        <Card className="flex flex-col items-center justify-center py-12">
          <Lock className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Developer Only</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Call Center Configuration is a developer-only feature. Only app administrators can access this module.
          </p>
        </Card>
      </div>
    );
  }
  const [selectedCompany, setSelectedCompany] = useState(null);

  const { data: companies = [] } = useQuery({
    queryKey: ['companies-for-config'],
    queryFn: async () => {
      const all = await base44.entities.Company.list();
      return all.sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0].id);
    }
  }, [companies, selectedCompany]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <PageHeader 
        title="Call Center Configuration" 
        subtitle="Setup and manage out-of-hours services for your companies"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </PageHeader>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList>
          <TabsTrigger value="pricing">Service Pricing</TabsTrigger>
          <TabsTrigger value="services">Service Configuration</TabsTrigger>
          <TabsTrigger value="company-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6">
          <ServiceTierPricing />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => setSelectedCompany(company.id)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedCompany === company.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-secondary/50'
                    }`}
                  >
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {company.category || 'No category'}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedCompany && (
            <ServiceConfiguration companyId={selectedCompany} />
          )}
        </TabsContent>

        <TabsContent value="company-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Phone Number Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Smart caller identification searches across:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                    <li>Tenant records and property info</li>
                    <li>Contact database</li>
                    <li>Landlord/company directory</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Service Coverage</h3>
                  <p className="text-sm text-muted-foreground">
                    Call handling capabilities based on subscription tier:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                    <li>Basic: Email notifications only</li>
                    <li>Standard: Maintenance order creation</li>
                    <li>Premium: Contractor dispatch included</li>
                    <li>Enterprise: Full managed service</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">GDPR Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    All calls are validated against:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                    <li>Caller identity verification</li>
                    <li>Property ownership records</li>
                    <li>Data protection agreements</li>
                    <li>Call recording consent</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Service Gaps</h3>
                  <p className="text-sm text-muted-foreground">
                    For non-covered issues:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                    <li>Alternative provider recommendations</li>
                    <li>Automatic email escalation</li>
                    <li>Call logging for audit trail</li>
                    <li>Account holder notification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}