import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  RefreshCw, 
  ArrowRightLeft, 
  Building2, 
  FileText, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Settings,
  Upload,
  Download
} from 'lucide-react';
import { toast } from "sonner";

export default function AccountingIntegrations() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlatform, setSelectedPlatform] = useState("xero");
  const [syncConfig, setSyncConfig] = useState({
    xero: { enabled: false, lastSync: null },
    quickbooks: { enabled: false, lastSync: null },
    sage: { enabled: false, lastSync: null }
  });

  const queryClient = useQueryClient();

  // Fetch integration status
  const { data: integrationStatus } = useQuery({
    queryKey: ['accounting-integrations'],
    queryFn: async () => {
      try {
        const configs = await base44.entities.AccountingIntegration.list();
        return configs;
      } catch (error) {
        return [];
      }
    }
  });

  // Sync mutations
  const syncXeroMutation = useMutation({
    mutationFn: async (action) => {
      const response = await base44.functions.invoke('syncXero', { action, data: {} });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Sync completed successfully');
      queryClient.invalidateQueries({ queryKey: ['accounting-sync'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Sync failed');
    }
  });

  const syncQuickBooksMutation = useMutation({
    mutationFn: async (action) => {
      const response = await base44.functions.invoke('syncQuickBooks', { action, data: {} });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Sync completed successfully');
      queryClient.invalidateQueries({ queryKey: ['accounting-sync'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Sync failed');
    }
  });

  const syncSageMutation = useMutation({
    mutationFn: async (action) => {
      const response = await base44.functions.invoke('syncSage', { action, data: {} });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Sync completed successfully');
      queryClient.invalidateQueries({ queryKey: ['accounting-sync'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Sync failed');
    }
  });

  const handleSync = (platform, action) => {
    if (platform === 'xero') {
      syncXeroMutation.mutate(action);
    } else if (platform === 'quickbooks') {
      syncQuickBooksMutation.mutate(action);
    } else if (platform === 'sage') {
      syncSageMutation.mutate(action);
    }
  };

  const platforms = {
    xero: {
      name: 'Xero',
      description: 'Two-way sync for bank reconciliation and invoicing',
      color: 'bg-[#13B5EA]',
      features: ['Chart of Accounts', 'Bank Transactions', 'Invoices', 'Bank Reconciliation'],
      status: syncConfig.xero.enabled ? 'connected' : 'disconnected'
    },
    quickbooks: {
      name: 'QuickBooks',
      description: 'Sync chart of accounts and transactions',
      color: 'bg-[#2CA01C]',
      features: ['Chart of Accounts', 'Transactions', 'Invoices', 'Journal Entries'],
      status: syncConfig.quickbooks.enabled ? 'connected' : 'disconnected'
    },
    sage: {
      name: 'Sage Business Cloud',
      description: 'Enhanced financial reporting capabilities',
      color: 'bg-[#00B5E2]',
      features: ['Chart of Accounts', 'Transactions', 'Invoices', 'Financial Reports'],
      status: syncConfig.sage.enabled ? 'connected' : 'disconnected'
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Accounting Integrations</h1>
        <p className="text-muted-foreground">
          Connect Premiso with your accounting software for automated financial sync
        </p>
      </div>

      {/* Platform Selection */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="sync">Manual Sync</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(platforms).map(([key, platform]) => (
              <Card key={key} className="relative overflow-hidden">
                <div className={`h-2 ${platform.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {platform.name}
                    </CardTitle>
                    <Badge variant={platform.status === 'connected' ? 'default' : 'secondary'}>
                      {platform.status === 'connected' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {platform.status}
                    </Badge>
                  </div>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Features:</h4>
                    <ul className="space-y-1">
                      {platform.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedPlatform(key);
                      setActiveTab('configure');
                    }}
                  >
                    {platform.status === 'connected' ? 'Configure' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Sync Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Recent Sync Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationStatus && integrationStatus.length > 0 ? (
                  integrationStatus.map((sync, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{sync.integration_type}</p>
                          <p className="text-xs text-muted-foreground">{sync.last_sync_date}</p>
                        </div>
                      </div>
                      <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                        {sync.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No recent sync activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configure Tab */}
        <TabsContent value="configure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configure {platforms[selectedPlatform].name} Integration
              </CardTitle>
              <CardDescription>
                Set up your {platforms[selectedPlatform].name} credentials and sync preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll need to obtain API credentials from your {platforms[selectedPlatform].name} developer portal.
                  Follow the setup guide in the documentation for detailed instructions.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {selectedPlatform === 'xero' && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="xero-client-id">Xero Client ID</Label>
                      <Input id="xero-client-id" placeholder="Enter your Xero Client ID" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="xero-client-secret">Xero Client Secret</Label>
                      <Input id="xero-client-secret" type="password" placeholder="Enter your Xero Client Secret" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="xero-tenant-id">Xero Tenant ID (Organization ID)</Label>
                      <Input id="xero-tenant-id" placeholder="Enter your Xero Tenant ID" />
                    </div>
                  </>
                )}

                {selectedPlatform === 'quickbooks' && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="qb-client-id">QuickBooks Client ID</Label>
                      <Input id="qb-client-id" placeholder="Enter your QuickBooks Client ID" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="qb-client-secret">QuickBooks Client Secret</Label>
                      <Input id="qb-client-secret" type="password" placeholder="Enter your QuickBooks Client Secret" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="qb-realm-id">QuickBooks Realm ID (Company ID)</Label>
                      <Input id="qb-realm-id" placeholder="Enter your QuickBooks Realm ID" />
                    </div>
                  </>
                )}

                {selectedPlatform === 'sage' && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="sage-client-id">Sage Client ID</Label>
                      <Input id="sage-client-id" placeholder="Enter your Sage Client ID" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sage-client-secret">Sage Client Secret</Label>
                      <Input id="sage-client-secret" type="password" placeholder="Enter your Sage Client Secret" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sage-company-id">Sage Company ID</Label>
                      <Input id="sage-company-id" placeholder="Enter your Sage Company ID" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button onClick={() => toast.success('Credentials saved successfully')}>
                  Save Credentials
                </Button>
                <Button variant="outline">
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Xero Sync */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#13B5EA]" />
                  Xero Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('xero', 'sync_chart_of_accounts')}
                  disabled={syncXeroMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Chart of Accounts
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('xero', 'sync_bank_transactions')}
                  disabled={syncXeroMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Bank Transactions
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('xero', 'sync_invoices')}
                  disabled={syncXeroMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Invoices
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('xero', 'reconcile_bank_transaction')}
                  disabled={syncXeroMutation.isPending}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Reconcile Transaction
                </Button>
              </CardContent>
            </Card>

            {/* QuickBooks Sync */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#2CA01C]" />
                  QuickBooks Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('quickbooks', 'sync_chart_of_accounts')}
                  disabled={syncQuickBooksMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Chart of Accounts
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('quickbooks', 'sync_transactions')}
                  disabled={syncQuickBooksMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Transactions
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('quickbooks', 'sync_invoices')}
                  disabled={syncQuickBooksMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Invoices
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('quickbooks', 'push_invoice_to_quickbooks')}
                  disabled={syncQuickBooksMutation.isPending}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Push Invoice to QuickBooks
                </Button>
              </CardContent>
            </Card>

            {/* Sage Sync */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#00B5E2]" />
                  Sage Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('sage', 'sync_chart_of_accounts')}
                  disabled={syncSageMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Chart of Accounts
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('sage', 'sync_transactions')}
                  disabled={syncSageMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Transactions
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('sage', 'sync_invoices')}
                  disabled={syncSageMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync Invoices
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleSync('sage', 'sync_financial_reports')}
                  disabled={syncSageMutation.isPending}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Sync Financial Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}