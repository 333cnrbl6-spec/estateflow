import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Pencil, Trash2, Plus, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import WorkflowFormDialog, { TRIGGER_TYPES, ACTION_TYPES } from '@/components/workflows/WorkflowFormDialog';
import PendingExecutionsPanel from '@/components/workflows/PendingExecutionsPanel';

const CATEGORY_COLORS = { Tenancy: '#3b82f6', Operations: '#f59e0b', Finance: '#16a34a', Compliance: '#dc2626' };

export default function Workflows() {
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const queryClient = useQueryClient();

  // Fetch workflows
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list()
  });

  // Fetch pending executions
  const { data: pendingExecutions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['workflowExecutions', 'pending'],
    queryFn: () => base44.entities.WorkflowExecution.filter({ status: 'pending' })
  });

  // Fetch completed executions
  const { data: completedExecutions = [], isLoading: completedLoading } = useQuery({
    queryKey: ['workflowExecutions', 'completed'],
    queryFn: () => base44.entities.WorkflowExecution.filter({ status: { $in: ['executed', 'rejected', 'skipped'] } })
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: (workflow) => base44.entities.Workflow.update(workflow.id, { is_active: !workflow.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] })
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (workflowId) => base44.entities.Workflow.delete(workflowId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] })
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: (executionId) => base44.functions.invoke('executeWorkflow', { execution_id: executionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowExecutions'] });
    }
  });

  const rejectExecutionMutation = useMutation({
    mutationFn: (executionId) => base44.entities.WorkflowExecution.update(executionId, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflowExecutions'] })
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Workflow Engine" 
        subtitle="Automate maintenance and compliance tasks based on property events"
      >
        <Button onClick={() => setShowNewWorkflow(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Workflow
        </Button>
      </PageHeader>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Actions
            {pendingExecutions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                {pendingExecutions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflows">Workflow Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Pending Executions */}
        <TabsContent value="pending" className="space-y-4">
          {executionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : pendingExecutions.length === 0 ? (
            <EmptyState 
              title="No pending actions" 
              description="All workflow actions have been reviewed and executed"
            />
          ) : (
            <div className="space-y-3">
              {pendingExecutions.map(execution => (
                <PendingExecutionsPanel 
                  key={execution.id}
                  execution={execution}
                  onApprove={() => executeWorkflowMutation.mutate(execution.id)}
                  onReject={() => rejectExecutionMutation.mutate(execution.id)}
                  isExecuting={executeWorkflowMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Workflow Templates */}
        <TabsContent value="workflows" className="space-y-4">
          {workflowsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : workflows.length === 0 ? (
            <EmptyState 
              title="No workflows" 
              description="Create a workflow to automate property event-based tasks"
              actionLabel="Create Workflow"
              onAction={() => setShowNewWorkflow(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {workflows.map(workflow => {
                const triggerDef = TRIGGER_TYPES.find(t => t.value === workflow.trigger_type);
                const catColor = CATEGORY_COLORS[triggerDef?.category] || '#6b7280';
                return (
                  <Card key={workflow.id} className={`transition-opacity ${!workflow.is_active ? 'opacity-55' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base truncate">{workflow.name}</CardTitle>
                            {workflow.is_active
                              ? <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Active</Badge>
                              : <Badge variant="outline" className="text-xs">Paused</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs font-semibold rounded-full px-2 py-0.5 text-white" style={{ background: catColor }}>{triggerDef?.category || 'General'}</span>
                            <span className="text-xs text-muted-foreground">{triggerDef?.label || workflow.trigger_type.replace(/_/g,' ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleWorkflowMutation.mutate(workflow)} title={workflow.is_active ? 'Pause' : 'Activate'}>
                            {workflow.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingWorkflow(workflow)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteWorkflowMutation.mutate(workflow.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {workflow.days_before > 0 && (
                        <div className="text-xs text-muted-foreground">⏱ Runs <strong>{workflow.days_before} days</strong> before/after the event</div>
                      )}
                      {workflow.conditions?.length > 0 && (
                        <div className="text-xs">
                          <span className="text-amber-700 font-semibold">Conditions: </span>
                          {workflow.conditions.map((c, i) => (
                            <span key={i} className="bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mr-1 text-amber-800">{c.field} {c.operator} {c.value}</span>
                          ))}
                        </div>
                      )}
                      <div className="border-t pt-2 space-y-1">
                        {workflow.actions?.map((action, i) => {
                          const def = ACTION_TYPES.find(a => a.value === action.action_type);
                          return <p key={i} className="text-xs text-muted-foreground">{def?.label || action.action_type.replace(/_/g,' ')}</p>;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          {completedLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : completedExecutions.length === 0 ? (
            <EmptyState title="No history yet" description="Completed workflow actions will appear here" />
          ) : (
            <div className="space-y-2">
              {completedExecutions.map(execution => (
                <Card key={execution.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{execution.workflow_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {execution.property_address} • {execution.tenant_name}
                      </p>
                    </div>
                    <StatusBadge status={execution.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showNewWorkflow && (
        <WorkflowFormDialog
          onClose={() => setShowNewWorkflow(false)}
          onSuccess={() => { setShowNewWorkflow(false); queryClient.invalidateQueries({ queryKey: ['workflows'] }); }}
        />
      )}

      {editingWorkflow && (
        <WorkflowFormDialog
          initialData={editingWorkflow}
          onClose={() => setEditingWorkflow(null)}
          onSuccess={() => { setEditingWorkflow(null); queryClient.invalidateQueries({ queryKey: ['workflows'] }); }}
        />
      )}
    </div>
  );
}