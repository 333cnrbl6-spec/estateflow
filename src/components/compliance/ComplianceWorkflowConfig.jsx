import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, AlertTriangle, CheckCircle2, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ComplianceWorkflowConfig() {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const queryClient = useQueryClient();

  const workflowsQuery = useQuery({
    queryKey: ['compliance-workflows'],
    queryFn: async () => {
      // Fetch configured automations related to compliance
      const automations = await base44.functions.invoke('getComplianceAutomations', {});
      return automations.data || [];
    },
  });

  const rulesQuery = useQuery({
    queryKey: ['compliance-rules'],
    queryFn: () => base44.entities.ComplianceRule.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: async (workflowId) => {
      return await base44.functions.invoke('deleteComplianceWorkflow', { workflowId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-workflows'] });
    },
  });

  const { data: workflows = [] } = workflowsQuery;
  const { data: rules = [] } = rulesQuery;

  const overdueRules = rules.filter(r => r.status === 'overdue').length;
  const upcomingRules = rules.filter(r => r.alert_settings?.enable_alerts).length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-red-900 dark:text-red-100 mb-1 font-semibold">OVERDUE RULES</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{overdueRules}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-900 dark:text-blue-100 mb-1 font-semibold">WORKFLOWS ACTIVE</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{workflows.length}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-xs text-amber-900 dark:text-amber-100 mb-1 font-semibold">RULES MONITORED</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{upcomingRules}</p>
        </div>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
          <TabsTrigger value="config">Configure Triggers</TabsTrigger>
        </TabsList>

        {/* Active Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Automated Workflows</h3>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Workflow
            </Button>
          </div>

          {workflowsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-semibold">No workflows configured</p>
              <p className="text-sm text-muted-foreground mt-1">Set up automated actions for compliance rules</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map(workflow => (
                <div key={workflow.id} className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <h4 className="font-semibold text-foreground">{workflow.name}</h4>
                        {workflow.is_active && (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 text-xs font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <strong>Trigger:</strong> {workflow.trigger_condition?.field || 'N/A'} {workflow.trigger_condition?.operator || ''} {workflow.trigger_condition?.value || ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Actions:</strong> {workflow.actions?.map(a => a.type).join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setEditingWorkflow(workflow)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => deleteMutation.mutate(workflow.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Compliance Rules Tab */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold text-foreground">Compliance Rules Status</h3>

          <div className="space-y-2">
            {rulesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : rules.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No compliance rules found</p>
              </div>
            ) : (
              rules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-lg border-2 ${
                    rule.status === 'overdue' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' :
                    rule.status === 'implementing' ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' :
                    'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {rule.status === 'overdue' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {rule.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        <p className="font-semibold text-foreground">{rule.rule_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rule.rule_code}</p>
                      <p className="text-sm">{rule.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                      rule.status === 'overdue' ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100' :
                      rule.status === 'implementing' ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100' :
                      'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100'
                    }`}>
                      {rule.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Configure Triggers Tab */}
        <TabsContent value="config" className="space-y-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Automated Workflow Examples</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>✓ <strong>Overdue Detection:</strong> When ComplianceRule.status changes to 'overdue', create a high-priority task and send alert</p>
              <p>✓ <strong>Deadline Approach:</strong> 30 days before rule deadline, send reminder to assigned user</p>
              <p>✓ <strong>Evidence Required:</strong> When required_evidence is set, create document submission task</p>
              <p>✓ <strong>Penalty Risk:</strong> When penalties are attached, escalate to management</p>
              <p>✓ <strong>Auto-Briefing:</strong> When rule status changes, notify all relevant staff</p>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h4 className="font-semibold text-foreground mb-4">Current Workflow Configuration</h4>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Trigger: Compliance Rule Status Changes</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Entity: ComplianceRule</p>
                  <p>Event: Update</p>
                  <p>Condition: status field changes</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Actions Executed:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Create ComplianceTask record</li>
                  <li>✓ Send escalation email</li>
                  <li>✓ Log audit trail entry</li>
                  <li>✓ Notify responsible user</li>
                </ul>
              </div>

              <Button className="w-full gap-2">
                <Zap className="w-4 h-4" />
                Configure Custom Workflows
              </Button>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-900 dark:text-green-100">
              <strong>Status:</strong> Workflow automation is active and monitoring all ComplianceRule changes in real-time.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}