import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Zap, Play, Trash2, Copy, Edit2 } from 'lucide-react';

const TRIGGER_OPTIONS = [
  { id: 'property_created', label: 'Property Created', icon: '🏠' },
  { id: 'tenant_added', label: 'Tenant Added', icon: '👤' },
  { id: 'maintenance_requested', label: 'Maintenance Request', icon: '🔧' },
  { id: 'rent_payment_due', label: 'Rent Payment Due', icon: '💰' },
  { id: 'certificate_expiring', label: 'Certificate Expiring', icon: '📄' },
  { id: 'lease_renewal', label: 'Lease Renewal', icon: '📋' }
];

const ACTION_OPTIONS = [
  { id: 'send_email', label: 'Send Email', icon: '✉️' },
  { id: 'send_sms', label: 'Send SMS', icon: '📱' },
  { id: 'create_task', label: 'Create Task', icon: '✓' },
  { id: 'generate_document', label: 'Generate Document', icon: '📄' },
  { id: 'assign_contractor', label: 'Assign Contractor', icon: '🔨' },
  { id: 'update_status', label: 'Update Status', icon: '🔄' },
  { id: 'generate_report', label: 'Generate Report', icon: '📊' },
  { id: 'notify_team', label: 'Notify Team', icon: '🔔' }
];

export default function WorkflowAutomationBuilder() {
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: '', actions: [] });
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const workflowsQuery = useQuery({
    queryKey: ['automation-workflows'],
    queryFn: async () => {
      const res = await base44.functions.invoke('evaluateWorkflows', {});
      return res.data?.workflows || [];
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflow) => {
      const res = await base44.functions.invoke('executeWorkflow', {
        name: workflow.name,
        trigger: workflow.trigger,
        actions: workflow.actions,
        enabled: true
      });
      return res.data;
    },
    onSuccess: () => {
      workflowsQuery.refetch();
      setNewWorkflow({ name: '', trigger: '', actions: [] });
      setShowBuilder(false);
    }
  });

  const toggleAction = (actionId) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.includes(actionId)
        ? prev.actions.filter(a => a !== actionId)
        : [...prev.actions, actionId]
    }));
  };

  const handleCreate = () => {
    if (!newWorkflow.name || !newWorkflow.trigger || newWorkflow.actions.length === 0) {
      alert('Please fill in all fields');
      return;
    }
    createWorkflowMutation.mutate(newWorkflow);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Zap className="w-8 h-8 text-yellow-600" />
              Workflow Automation Builder
            </h1>
            <p className="text-lg text-slate-600">Create no-code automations to streamline operations</p>
          </div>
          <Button onClick={() => setShowBuilder(!showBuilder)} className="gap-2" size="lg">
            <Plus className="w-5 h-5" />
            Create Workflow
          </Button>
        </div>

        {/* Builder Panel */}
        {showBuilder && (
          <Card className="border-2 border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle>New Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workflow Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Workflow Name</label>
                <Input
                  placeholder="e.g., Auto-email tenants on maintenance request"
                  value={newWorkflow.name}
                  onChange={e => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Trigger Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">When this happens:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TRIGGER_OPTIONS.map(trigger => (
                    <button
                      key={trigger.id}
                      onClick={() => setNewWorkflow(prev => ({ ...prev, trigger: trigger.id }))}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        newWorkflow.trigger === trigger.id
                          ? 'border-blue-600 bg-white'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl mr-2">{trigger.icon}</span>
                      <p className="text-sm font-medium text-slate-900">{trigger.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Then do this (select one or more):</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ACTION_OPTIONS.map(action => (
                    <button
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        newWorkflow.actions.includes(action.id)
                          ? 'border-green-600 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl mr-1">{action.icon}</span>
                      <p className="text-xs font-medium text-slate-900">{action.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {newWorkflow.trigger && newWorkflow.actions.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-600">
                    <strong>When:</strong> {TRIGGER_OPTIONS.find(t => t.id === newWorkflow.trigger)?.label}
                    <br />
                    <strong>Then:</strong> {newWorkflow.actions.map(a => ACTION_OPTIONS.find(op => op.id === a)?.label).join(', ')}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBuilder(false);
                    setNewWorkflow({ name: '', trigger: '', actions: [] });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newWorkflow.name || !newWorkflow.trigger || newWorkflow.actions.length === 0}
                  className="gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflows List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {workflowsQuery.data?.filter(w => w.enabled).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  No active workflows yet. Create one to get started.
                </CardContent>
              </Card>
            ) : (
              workflowsQuery.data?.filter(w => w.enabled).map(workflow => (
                <Card key={workflow.id}>
                  <CardContent className="pt-6 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{workflow.name}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong>Trigger:</strong> {workflow.trigger_type}
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>Actions:</strong> {workflow.actions?.length || 0}
                      </p>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {workflow.actions?.map((action, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{action}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Executions: {workflow.execution_count || 0}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Play className="w-4 h-4" />
                        Test
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-3">
            {workflowsQuery.data?.filter(w => !w.enabled).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  No inactive workflows.
                </CardContent>
              </Card>
            ) : (
              workflowsQuery.data?.filter(w => !w.enabled).map(workflow => (
                <Card key={workflow.id} className="opacity-60">
                  <CardContent className="pt-6 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{workflow.name}</p>
                      <Badge className="mt-2 bg-slate-200 text-slate-700">Disabled</Badge>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-3">
            {[
              { name: 'Auto-Email on Maintenance Request', actions: 3 },
              { name: 'Certificate Expiry Alerts', actions: 2 },
              { name: 'Rent Payment Reminders', actions: 2 },
              { name: 'New Tenant Onboarding', actions: 4 }
            ].map((template, i) => (
              <Card key={i}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{template.name}</p>
                    <p className="text-sm text-slate-600">{template.actions} actions</p>
                  </div>
                  <Button className="gap-2">
                    <Copy className="w-4 h-4" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}