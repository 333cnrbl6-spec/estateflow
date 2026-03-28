import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { AlertCircle, CheckCircle2, RotateCw, Plug } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Switch,
} from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountingIntegrations() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [provider, setProvider] = useState('quickbooks');
  const [syncSettings, setSyncSettings] = useState({
    sync_transactions: true,
    sync_expenses: true,
    auto_sync_enabled: true,
    sync_interval_hours: 24,
  });

  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list(),
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['accountingIntegrations'],
    queryFn: () => base44.entities.AccountingIntegration.list(),
  });

  const { data: syncs = [] } = useQuery({
    queryKey: ['accountingSyncs'],
    queryFn: () => base44.entities.AccountingSync.list(),
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data) => base44.entities.AccountingIntegration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountingIntegrations'] });
      setShowDialog(false);
      setSelectedCompany('');
      setSyncSettings({
        sync_transactions: true,
        sync_expenses: true,
        auto_sync_enabled: true,
        sync_interval_hours: 24,
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (integrationId) =>
      base44.functions.invoke('quickbooksSync', { integration_id: integrationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountingSyncs'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (id) => base44.entities.AccountingIntegration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountingIntegrations'] });
    },
  });

  const handleConnect = async () => {
    if (!selectedCompany) {
      alert('Please select a company');
      return;
    }

    const integration = await createIntegrationMutation.mutateAsync({
      provider,
      company_id: selectedCompany,
      ...syncSettings,
    });

    // Auto-sync on connection for demo
    if (integration) {
      setTimeout(() => {
        syncMutation.mutate(integration.id);
      }, 500);
    }
  };

  const getLatestSync = (integrationId) => {
    return syncs
      .filter((s) => s.integration_id === integrationId)
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Accounting Integrations"
        subtitle="Sync rent ledgers, expenses, and service charges with QuickBooks (Demo: Using Sandbox)"
      >
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plug className="w-4 h-4" />
          Connect Account
        </Button>
      </PageHeader>

      {integrations.length === 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>Demo Mode:</strong> This integration uses QuickBooks Sandbox credentials to demonstrate syncing rent ledgers, business expenses, and service charges. No real data is affected.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {integrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Plug className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No accounting integrations yet.</p>
            </CardContent>
          </Card>
        ) : (
          integrations.map((integration) => {
            const company = companies.find((c) => c.id === integration.company_id);
            const lastSync = getLatestSync(integration.id);

            return (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(integration.status)}
                      <div>
                        <CardTitle className="text-base">
                          {integration.provider === 'quickbooks' ? 'QuickBooks' : 'Xero'} •{' '}
                          {company?.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectMutation.mutate(integration.id)}
                      className="text-destructive"
                    >
                      Disconnect
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Last Sync</p>
                      <p className="text-sm font-semibold">
                        {lastSync?.completed_at
                          ? new Date(lastSync.completed_at).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transactions Synced</p>
                      <p className="text-sm font-semibold">{lastSync?.transactions_synced || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Auto Sync</p>
                      <p className="text-sm font-semibold">
                        {integration.auto_sync_enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>

                  {lastSync?.status === 'failed' && lastSync.errors?.length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-destructive mb-2">Sync Errors:</p>
                      <ul className="text-xs text-destructive space-y-1">
                        {lastSync.errors.slice(0, 3).map((err, idx) => (
                          <li key={idx}>• {err.error_message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => syncMutation.mutate(integration.id)}
                    variant="outline"
                    className="w-full gap-2"
                    disabled={syncMutation.isPending}
                  >
                    <RotateCw className="w-4 h-4" />
                    {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Accounting Software</DialogTitle>
            <DialogDescription>
              Link your QuickBooks or Xero account to automatically sync transactions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Company</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Provider</label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quickbooks">QuickBooks Online</SelectItem>
                  <SelectItem value="xero">Xero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sync Transactions</label>
                <Switch
                  checked={syncSettings.sync_transactions}
                  onCheckedChange={(val) =>
                    setSyncSettings({ ...syncSettings, sync_transactions: val })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sync Expenses</label>
                <Switch
                  checked={syncSettings.sync_expenses}
                  onCheckedChange={(val) =>
                    setSyncSettings({ ...syncSettings, sync_expenses: val })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Sync</label>
                <Switch
                  checked={syncSettings.auto_sync_enabled}
                  onCheckedChange={(val) =>
                    setSyncSettings({ ...syncSettings, auto_sync_enabled: val })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleConnect} className="flex-1">
                Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}