import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Activity, Plus, Trash2, RotateCw } from 'lucide-react';

export default function APIIntegrationHub() {
  const [showDialog, setShowDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    service_name: '',
    api_endpoint: '',
    api_key_prefix: '',
    webhook_enabled: false,
    auto_sync: true,
    sync_interval_minutes: 60,
    data_types: [],
  });

  const queryClient = useQueryClient();

  const { data: integrations = [] } = useQuery({
    queryKey: ['apiIntegrations'],
    queryFn: () => base44.entities.APIIntegration.list(),
  });

  const { data: webhookLogs = [] } = useQuery({
    queryKey: ['webhookLogs'],
    queryFn: () => base44.entities.WebhookLog.list(),
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data) => base44.entities.APIIntegration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiIntegrations'] });
      setShowDialog(false);
      setNewIntegration({
        name: '',
        service_name: '',
        api_endpoint: '',
        api_key_prefix: '',
        webhook_enabled: false,
        auto_sync: true,
        sync_interval_minutes: 60,
        data_types: [],
      });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id) => base44.entities.APIIntegration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiIntegrations'] });
    },
  });

  const testIntegrationMutation = useMutation({
    mutationFn: (integrationId) =>
      base44.functions.invoke('testAPIIntegration', { integration_id: integrationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhookLogs'] });
    },
  });

  const handleCreateIntegration = () => {
    if (!newIntegration.name || !newIntegration.service_name || !newIntegration.api_endpoint) {
      alert('Please fill in all required fields');
      return;
    }

    createIntegrationMutation.mutate({
      ...newIntegration,
      created_date: new Date().toISOString().split('T')[0],
    });
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

  const recentLogs = webhookLogs.slice(0, 10);

  return (
    <div className="p-8">
      <PageHeader
        title="API Integration Hub"
        subtitle="Connect to external services (utilities, insurance, council systems)"
      >
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Active Integrations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Connected Services</h2>
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No integrations connected yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(integration.status)}
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{integration.service_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Endpoint</p>
                      <p className="text-sm font-mono truncate">{integration.api_endpoint}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Auto Sync</p>
                        <p className="text-sm font-semibold">{integration.auto_sync ? 'On' : 'Off'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Webhook</p>
                        <p className="text-sm font-semibold">{integration.webhook_enabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => testIntegrationMutation.mutate(integration.id)}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      disabled={testIntegrationMutation.isPending}
                    >
                      <RotateCw className="w-3 h-3" />
                      {testIntegrationMutation.isPending ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Webhook Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{log.event_type}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : log.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    {log.error_message && (
                      <p className="text-xs text-destructive">{log.error_message}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">No webhook events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add API Integration</DialogTitle>
            <DialogDescription>
              Connect external services (utilities, insurance, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Integration Name</label>
              <Input
                placeholder="e.g., Utility Provider API"
                value={newIntegration.name}
                onChange={(e) =>
                  setNewIntegration({ ...newIntegration, name: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Service Name</label>
              <Input
                placeholder="e.g., ElectricityCo"
                value={newIntegration.service_name}
                onChange={(e) =>
                  setNewIntegration({ ...newIntegration, service_name: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">API Endpoint</label>
              <Input
                placeholder="https://api.example.com/v1"
                value={newIntegration.api_endpoint}
                onChange={(e) =>
                  setNewIntegration({ ...newIntegration, api_endpoint: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">API Key (prefix)</label>
              <Input
                placeholder="key_xxxxx"
                type="password"
                value={newIntegration.api_key_prefix}
                onChange={(e) =>
                  setNewIntegration({ ...newIntegration, api_key_prefix: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div className="space-y-3 bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Sync</label>
                <Switch
                  checked={newIntegration.auto_sync}
                  onCheckedChange={(val) =>
                    setNewIntegration({ ...newIntegration, auto_sync: val })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Webhook</label>
                <Switch
                  checked={newIntegration.webhook_enabled}
                  onCheckedChange={(val) =>
                    setNewIntegration({ ...newIntegration, webhook_enabled: val })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIntegration} disabled={createIntegrationMutation.isPending}>
                {createIntegrationMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}